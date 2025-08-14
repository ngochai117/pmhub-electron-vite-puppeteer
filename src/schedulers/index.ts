import * as mac from "../schedulers/scheduler.macos";
import * as win from "../schedulers/scheduler.windows";
import { ScheduleReply, UnifiedNextRun } from "./types";

const isMac = () => process.platform === "darwin";
const isWin = () => process.platform === "win32";

export function installDaily({
  hour,
  minute,
  highest,
}: {
  hour: number;
  minute: number;
  highest?: boolean;
}) {
  if (isMac()) return mac.installDaily({ hour, minute });
  if (isWin()) return win.installDaily({ hour, minute, highest });
  throw new Error("Unsupported OS");
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
  if (isMac()) return mac.installMonthly({ day: day!, hour, minute });
  if (isWin())
    return win.installMonthly({ day, hour, minute, lastDay, highest });
  throw new Error("Unsupported OS");
}

export function installOnce(atISO: string, highest?: boolean) {
  if (isMac()) return mac.installOnce(new Date(atISO));
  if (isWin()) return win.installOnce(new Date(atISO), highest);
  throw new Error("Unsupported OS");
}

export function removeSchedule() {
  if (isMac()) return mac.uninstall();
  if (isWin()) return win.uninstall();
  throw new Error("Unsupported OS");
}

export function kick() {
  if (isMac()) return mac.kickstart();
  if (isWin()) return win.kick();
  throw new Error("Unsupported OS");
}

export function status(): string {
  if (isMac()) return mac.status(); // "loaded" | "not_loaded"
  if (isWin()) return win.status(); // "ready" | "running" | ...
  return "unknown";
}

export function nextRun(): UnifiedNextRun {
  if (isMac()) {
    const r = mac.getNextRunEstimate(); // {kind,nextRunAt,intervals}
    return {
      source: "launchd",
      kind: r.kind ?? "unknown",
      nextRunAtISO: r.nextRunAt ?? null,
      lastRunAtISO: null,
    };
  }
  if (isWin()) {
    const r = win.nextRunISO(); // {nextRunAtISO,lastRunAtISO,kind}
    return {
      source: "schtasks",
      kind: r.kind ?? "unknown",
      nextRunAtISO: r.nextRunAtISO ?? null,
      lastRunAtISO: r.lastRunAtISO ?? null,
    };
  }
  return {
    source: "unknown",
    kind: "unknown",
    nextRunAtISO: null,
    lastRunAtISO: null,
  };
}

export function printDetail(): string {
  if (isMac()) return mac.printJob();
  if (isWin()) return win.printTask();
  return "unsupported";
}

// ——— Chuẩn hoá status để UI dùng chung ———
export function normalizeStatus(raw: string): ScheduleReply["status"] {
  if (isMac()) {
    if (raw === "loaded") return "loaded";
    if (raw === "not_loaded") return "not_found";
  }
  if (isWin()) {
    if (raw === "ready") return "ready";
    if (raw === "running") return "running";
    if (raw === "queued") return "queued";
    if (raw === "not_found") return "not_found";
  }
  return "unknown";
}

export function buildReply(): ScheduleReply {
  const platform: ScheduleReply["platform"] = isMac()
    ? "mac"
    : isWin()
    ? "win"
    : "win";
  const s = normalizeStatus(status());
  const n = nextRun();
  return {
    ok: true,
    platform,
    status: s,
    nextRun: n,
    // ...(detail ? { detail } : {}),
    detail: printDetail(),
  };
}
