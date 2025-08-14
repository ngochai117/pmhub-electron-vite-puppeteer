export type ScheduleKind =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "once"
  | "mixed"
  | "unknown";

type ScheduleSource = "launchd" | "schtasks" | "unknown";

type ScheduleStatus =
  | "idle"
  | "loaded"
  | "ready"
  | "running"
  | "queued"
  | "not_found"
  | "unknown";

export type UnifiedNextRun = {
  source: ScheduleSource;
  kind: ScheduleKind;
  nextRunAtISO: string | null;
  lastRunAtISO: string | null;
};

export type ScheduleReply = {
  ok: boolean;
  platform: "mac" | "win";
  status: ScheduleStatus;
  nextRun: {
    source: ScheduleSource;
    kind: ScheduleKind;
    nextRunAtISO: string | null;
    lastRunAtISO: string | null;
  };
  // dump chi tiết để debug (tuỳ handler có/không)
  detail?: string;
};
