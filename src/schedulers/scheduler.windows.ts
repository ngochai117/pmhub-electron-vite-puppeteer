import { app } from "electron";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { ScheduleKind } from "./types";
import { TASK_NAME, EXE_NAME_WIN } from "./constants";

// —— Chiều lòng Win64 (kể cả app 32-bit): dùng Sysnative khi arch=ia32
function sysBinPath(...sub: string[]) {
  const root = process.env.SystemRoot || "C:\\Windows";
  const base = process.arch === "ia32" ? "Sysnative" : "System32";
  return join(root, base, ...sub);
}
const SCHTASKS = sysBinPath("schtasks.exe");
const POWERSHELL = sysBinPath("WindowsPowerShell", "v1.0", "powershell.exe");

const USER_DATA_DIR = app.getPath("userData");
const SCRIPT_DIR = join(USER_DATA_DIR, "scripts");
const SCRIPT_PATH = join(SCRIPT_DIR, "pmhub-autolog.cmd");

function ensureScript() {
  mkdirSync(SCRIPT_DIR, { recursive: true });
  const exeFull = process.execPath; // đường dẫn .exe thực tế sau đóng gói

  const cmd = `@echo off
setlocal

set "APP_EXE=${exeFull}"
if not exist "%APP_EXE%" (
  rem App không tồn tại -> xoá task và dọn script để tránh spam
  schtasks /Delete /TN ${TASK_NAME} /F >NUL 2>&1
  del "%~f0" >NUL 2>&1
  exit /b 0
)

rem Kill theo tên exe hiển thị (từ productName)
taskkill /IM "${EXE_NAME_WIN}" /F >NUL 2>&1

rem Start lại app (im lặng)
start "" "%APP_EXE%" --silent
`;
  writeFileSync(SCRIPT_PATH, cmd, "utf8");
}

function run(exe: string, args: string[]) {
  return execFileSync(exe, args, { encoding: "utf8" });
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const fmtTime = (h: number, m: number) => `${pad2(h)}:${pad2(m)}`;
const fmtDateMMDDYYYY = (d: Date) =>
  `${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}/${d.getFullYear()}`;

export function installDaily({
  hour,
  minute,
  highest,
}: {
  hour: number;
  minute: number;
  highest?: boolean;
}) {
  ensureScript();
  const args = [
    "/Create",
    "/TN",
    TASK_NAME,
    "/TR",
    SCRIPT_PATH,
    "/SC",
    "DAILY",
    "/ST",
    fmtTime(hour, minute),
    "/F",
  ];
  if (highest) args.push("/RL", "HIGHEST");
  run(SCHTASKS, args);
}

export function installMonthly({
  day,
  hour,
  minute,
  lastDay,
  highest,
}: {
  day?: number;
  hour: number;
  minute: number;
  lastDay?: boolean;
  highest?: boolean;
}) {
  ensureScript();
  const args = [
    "/Create",
    "/TN",
    TASK_NAME,
    "/TR",
    SCRIPT_PATH,
    "/SC",
    "MONTHLY",
    "/ST",
    fmtTime(hour, minute),
    "/F",
  ];
  if (highest) args.push("/RL", "HIGHEST");
  if (lastDay) {
    args.push("/MO", "LASTDAY", "/M", "*");
  } else {
    if (!day || day < 1 || day > 31)
      throw new Error("day phải 1..31 (hoặc dùng lastDay=true)");
    args.push("/D", String(day));
  }
  run(SCHTASKS, args);
}

export function installOnce(at: Date, highest?: boolean) {
  ensureScript();
  const args = [
    "/Create",
    "/TN",
    TASK_NAME,
    "/TR",
    SCRIPT_PATH,
    "/SC",
    "ONCE",
    "/ST",
    fmtTime(at.getHours(), at.getMinutes()),
    "/SD",
    fmtDateMMDDYYYY(at),
    "/F",
  ];
  if (highest) args.push("/RL", "HIGHEST");
  run(SCHTASKS, args);
}

export function uninstall() {
  try {
    run(SCHTASKS, ["/Delete", "/TN", TASK_NAME, "/F"]);
  } catch {
    //
  }
  if (existsSync(SCRIPT_PATH)) rmSync(SCRIPT_PATH);
}

export function kick() {
  run(SCHTASKS, ["/Run", "/TN", TASK_NAME]);
}

export function status():
  | "ready"
  | "running"
  | "queued"
  | "not_found"
  | "unknown" {
  try {
    const out = run(SCHTASKS, [
      "/Query",
      "/TN",
      TASK_NAME,
      "/V",
      "/FO",
      "LIST",
    ]);
    const m = out.match(/^\s*Status:\s*(.+)$/im);
    if (!m) return "unknown";
    const s = m[1].trim().toLowerCase();
    if (s.includes("ready")) return "ready";
    if (s.includes("running")) return "running";
    if (s.includes("queued")) return "queued";
    return "unknown";
  } catch {
    return "not_found";
  }
}

export function printTask(): string {
  try {
    return run(SCHTASKS, ["/Query", "/TN", TASK_NAME, "/V", "/FO", "LIST"]);
  } catch {
    return "not_found";
  }
}

// ✅ Trả về ISO 8601 nhờ PowerShell (không phụ thuộc locale)
export function nextRunISO(): {
  nextRunAtISO: string | null;
  lastRunAtISO: string | null;
  kind?: ScheduleKind;
} {
  try {
    const ps = `$i=Get-ScheduledTask -TaskName '${TASK_NAME}' -ErrorAction SilentlyContinue;
if(!$i){ '{}' | Write-Output; exit }
$info = Get-ScheduledTaskInfo -TaskName '${TASK_NAME}';
$trigs = ($i.Triggers | Select-Object -First 1);
$kind = if ($trigs -and $trigs.TriggerType) { $trigs.TriggerType.ToString().ToLower() } else { '' };
$o = @{
  next = $info.NextRunTime
  last = $info.LastRunTime
  kind = $kind
}
$o | ConvertTo-Json -Compress`;

    const json = run(POWERSHELL, [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      ps,
    ]);
    const data = JSON.parse(json || "{}");
    // PowerShell date sẽ thành string kiểu "2025-08-15T09:00:00.0000000+07:00"
    const toISO = (v: any) => {
      if (!v) return null;
      const d = new Date(v); // parse ISO/Zulu/offset ok
      return isNaN(d.getTime()) ? null : d.toISOString();
    };
    return {
      nextRunAtISO: toISO(data?.next),
      lastRunAtISO: toISO(data?.last),
      kind: data?.kind === "onetime" ? "once" : data?.kind || "",
    };
  } catch {
    return { nextRunAtISO: null, lastRunAtISO: null, kind: "unknown" };
  }
}
