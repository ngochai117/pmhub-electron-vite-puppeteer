// src/main/scheduler.macos.ts
import { app } from "electron";
import { execFileSync, spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const LABEL = "com.pmhub.autolog";
const UID = process.getuid?.() ?? 501; // fallback
const GUI_DOMAIN = `gui/${UID}`;
const LAUNCH_AGENTS_DIR = join(homedir(), "Library/LaunchAgents");
const USER_DATA_DIR = app.getPath("userData"); // ~/Library/Application Support/<AppName>
const SCRIPT_DIR = join(USER_DATA_DIR, "scripts");
const SCRIPT_PATH = join(SCRIPT_DIR, "pmhub-autolog.sh");
const PLIST_PATH = join(LAUNCH_AGENTS_DIR, `${LABEL}.plist`);

const BASE_CMD = `osascript -e 'quit app "PM Hub Auto Log Work"' && open -n -a "PM Hub Auto Log Work" --args --silent`;
const LOG_OUT = "/tmp/pmhub-autolog.out";
const LOG_ERR = "/tmp/pmhub-autolog.err";

// ————— helpers —————
function ensureDirs() {
  mkdirSync(LAUNCH_AGENTS_DIR, { recursive: true });
  mkdirSync(SCRIPT_DIR, { recursive: true });
}

function writeScript({ oneshot }: { oneshot: boolean }) {
  // Tự gỡ agent sau khi chạy nếu là one-shot
  const removeAfter = oneshot
    ? `
/bin/launchctl bootout ${GUI_DOMAIN} ${LABEL} >/dev/null 2>&1 || true
/bin/rm -f "${PLIST_PATH}" || true
`
    : "";

  const content = `#!/bin/zsh
set -euo pipefail
${BASE_CMD}
${removeAfter}
`;
  writeFileSync(SCRIPT_PATH, content, { encoding: "utf8" });
  chmodSync(SCRIPT_PATH, 0o755);
}

function bootoutIfLoaded() {
  // Gỡ nếu đang tồn tại (tránh “already bootstrapped”)
  spawnSync("/bin/launchctl", ["bootout", `${GUI_DOMAIN}/${LABEL}`], {
    stdio: "ignore",
  });
}

function bootstrapPlist() {
  execFileSync("/bin/launchctl", ["bootstrap", GUI_DOMAIN, PLIST_PATH]);
  // Bật service và đảm bảo sẵn sàng
  spawnSync("/bin/launchctl", ["enable", `${GUI_DOMAIN}/${LABEL}`], {
    stdio: "ignore",
  });
}

function buildPlistXML(startBlocks: string, runAtLoad = false) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>${LABEL}</string>

  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>-lc</string>
    <string>"${SCRIPT_PATH.replace(/"/g, '\\"')}"</string>
  </array>

  <key>StandardOutPath</key><string>${LOG_OUT}</string>
  <key>StandardErrorPath</key><string>${LOG_ERR}</string>
  ${runAtLoad ? "<key>RunAtLoad</key><true/>" : ""}

  ${startBlocks}
</dict></plist>`;
}

// ————— public APIs —————

// src/main/scheduler.macos.ts (bổ sung)

export function installMonthly({
  day,
  hour,
  minute,
}: {
  day: number;
  hour: number;
  minute: number;
}) {
  if (!day || day < 1 || day > 31) throw new Error("day phải 1..31");
  if (!hour || hour < 0 || hour > 23 || !minute || minute < 0 || minute > 59)
    throw new Error("Giờ/phút không hợp lệ");

  ensureDirs();
  writeScript({ oneshot: false }); // monthly = tái diễn, KHÔNG tự xóa

  const start = `
  <key>StartCalendarInterval</key>
  <dict>
    <key>Day</key><integer>${day}</integer>
    <key>Hour</key><integer>${hour}</integer>
    <key>Minute</key><integer>${minute}</integer>
  </dict>`;

  const plist = buildPlistXML(start, false);
  writeFileSync(PLIST_PATH, plist, "utf8");

  bootoutIfLoaded();
  bootstrapPlist();
}

/** Lịch chạy HÀNG NGÀY tại giờ/phút cố định (local time). */
export function installDaily({
  hour,
  minute,
}: {
  hour: number;
  minute: number;
}) {
  ensureDirs();
  writeScript({ oneshot: false });

  const start = `
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key><integer>${hour}</integer>
    <key>Minute</key><integer>${minute}</integer>
  </dict>`;

  const plist = buildPlistXML(start, false);
  writeFileSync(PLIST_PATH, plist, "utf8");

  bootoutIfLoaded();
  bootstrapPlist();
}

/** Lịch chạy MỘT LẦN tại thời điểm cụ thể. (script tự gỡ agent sau lần chạy đầu) */
export function installOnce(at: Date) {
  // Nếu người dùng chọn thời điểm đã qua, đẩy sang +1 ngày
  const now = new Date();
  if (at.getTime() <= now.getTime())
    at = new Date(now.getTime() + 24 * 3600 * 1000);

  ensureDirs();
  writeScript({ oneshot: true });

  const month = at.getMonth() + 1;
  const day = at.getDate();
  const hour = at.getHours();
  const minute = at.getMinutes();

  // StartCalendarInterval không có "Year", nên sẽ khớp mỗi năm.
  // Script ở trên sẽ tự bootout + xóa plist sau lần chạy đầu.
  const start = `
  <key>StartCalendarInterval</key>
  <dict>
    <key>Month</key><integer>${month}</integer>
    <key>Day</key><integer>${day}</integer>
    <key>Hour</key><integer>${hour}</integer>
    <key>Minute</key><integer>${minute}</integer>
  </dict>`;

  const plist = buildPlistXML(start, false);
  writeFileSync(PLIST_PATH, plist, "utf8");

  bootoutIfLoaded();
  bootstrapPlist();
}

/** Gỡ lịch (daily hay one-shot đều dùng được). */
export function uninstall() {
  bootoutIfLoaded();
  if (existsSync(PLIST_PATH)) rmSync(PLIST_PATH);
}

/** Chạy thử ngay (không đợi lịch) để test lệnh Automator. */
export function testRunNow() {
  // Không cần launchctl: gọi thẳng script cho đúng môi trường
  ensureDirs();
  writeScript({ oneshot: false });
  execFileSync("/bin/zsh", ["-lc", `"${SCRIPT_PATH}"`], { stdio: "ignore" });
}

/** Trạng thái nhanh */
export function status(): "loaded" | "not_loaded" {
  try {
    execFileSync("/bin/launchctl", ["print", `${GUI_DOMAIN}/${LABEL}`], {
      stdio: "ignore",
    });
    return "loaded";
  } catch {
    return "not_loaded";
  }
}

// READ SCHEDULER
type SCI = {
  Minute?: number;
  Hour?: number;
  Day?: number;
  Month?: number;
  Weekday?: number;
};
type NextRunKind = "daily" | "weekly" | "monthly" | "yearly" | "unknown";

export interface NextRunEstimate {
  kind: NextRunKind | "mixed";
  nextRunAt: string | null; // ISO string local time
  intervals: SCI[];
}

function daysInMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function classifySCI(sci: SCI): NextRunKind {
  if (sci?.Month != null && sci?.Day != null) return "yearly"; // launchd sẽ lặp hằng năm
  if (sci?.Day != null) return "monthly";
  if (sci?.Weekday != null) return "weekly";
  if (sci?.Hour != null && sci?.Minute != null) return "daily";
  return "unknown";
}

// Weekday của launchd: 0 hoặc 7 = Chủ nhật; 1=Thứ 2 ... 6=Thứ 7
function estimateNextRunWeekly(
  weekdayLaunchd: number,
  hour: number,
  minute: number,
  now = new Date()
) {
  const targetDow0Sun =
    weekdayLaunchd === 0 || weekdayLaunchd === 7 ? 0 : weekdayLaunchd; // 1..6 giữ nguyên
  // map về 0..6 với 0 = Chủ nhật
  const targetDow = targetDow0Sun % 7;
  const cand = new Date(now);
  cand.setHours(hour, minute, 0, 0);

  const nowDow = cand.getDay(); // 0=Sun..6=Sat
  let delta = (targetDow - nowDow + 7) % 7;
  if (delta === 0 && cand <= now) delta = 7;
  cand.setDate(cand.getDate() + delta);
  return cand;
}

function estimateNextRunDaily(hour: number, minute: number, now = new Date()) {
  const cand = new Date(now);
  cand.setHours(hour, minute, 0, 0);
  if (cand > now) return cand;
  cand.setDate(cand.getDate() + 1);
  return cand;
}

// Bạn đã có bản đơn giản; bản này bổ sung check tháng không có "day"
function estimateNextRunMonthly(
  day: number,
  hour: number,
  minute: number,
  now = new Date()
) {
  let y = now.getFullYear();
  let m = now.getMonth(); // 0..11
  for (let i = 0; i < 24; i++) {
    // tối đa lùi 24 tháng là dư
    const dim = daysInMonth(y, m);
    if (day <= dim) {
      const cand = new Date(y, m, day, hour, minute, 0, 0);
      if (cand > now) return cand;
    }
    // sang tháng sau
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return null;
}

function estimateNextRunYearly(
  month1: number,
  day: number,
  hour: number,
  minute: number,
  now = new Date()
) {
  // month1: 1..12 trong plist → JS cần 0..11
  const m0 = month1 - 1;
  // nếu day không hợp lệ cho tháng (29/30/31), coi như tháng đó skip; tìm năm tiếp theo hợp lệ
  for (let addYear = 0; addYear < 5; addYear++) {
    const y = now.getFullYear() + addYear;
    const dim = daysInMonth(y, m0);
    if (day <= dim) {
      const cand = new Date(y, m0, day, hour, minute, 0, 0);
      if (cand > now) return cand;
    }
  }
  return null;
}

// ——— đọc plist → JSON
function readPlistJSON(): {
  StartCalendarInterval?: SCI | SCI[];
} | null {
  if (!existsSync(PLIST_PATH)) return null;
  try {
    const out = execFileSync(
      "/usr/bin/plutil",
      ["-convert", "json", "-o", "-", PLIST_PATH],
      { encoding: "utf8" }
    );
    return JSON.parse(out);
  } catch {
    return null;
  }
}

// ——— tính next run từ StartCalendarInterval (dict hoặc array)
export function getNextRunEstimate(): NextRunEstimate {
  const plist = readPlistJSON();
  if (!plist?.StartCalendarInterval)
    return { kind: "unknown", nextRunAt: null, intervals: [] };

  const sciList: SCI[] = Array.isArray(plist.StartCalendarInterval)
    ? plist.StartCalendarInterval
    : [plist.StartCalendarInterval];

  let best: Date | null = null;
  const kinds = new Set<NextRunKind>();

  for (const sci of sciList) {
    const kind = classifySCI(sci);
    kinds.add(kind);

    let cand: Date | null = null;
    if (kind === "daily") {
      if (sci.Hour == null || sci.Minute == null) continue;
      cand = estimateNextRunDaily(sci.Hour, sci.Minute);
    } else if (kind === "weekly") {
      if (sci.Weekday == null || sci.Hour == null || sci.Minute == null)
        continue;
      cand = estimateNextRunWeekly(sci.Weekday, sci.Hour, sci.Minute);
    } else if (kind === "monthly") {
      if (sci.Day == null || sci.Hour == null || sci.Minute == null) continue;
      cand = estimateNextRunMonthly(sci.Day, sci.Hour, sci.Minute);
    } else if (kind === "yearly") {
      if (
        sci.Month == null ||
        sci.Day == null ||
        sci.Hour == null ||
        sci.Minute == null
      )
        continue;
      cand = estimateNextRunYearly(sci.Month, sci.Day, sci.Hour, sci.Minute);
    }

    if (cand && (!best || cand < best)) best = cand;
  }

  const kind = kinds.size === 1 ? [...kinds][0] : "mixed";
  return {
    kind,
    nextRunAt: best ? best.toISOString() : null,
    intervals: sciList,
  };
}
