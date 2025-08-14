// src/main/main.ts
import { ipcMain } from "electron";
import { ELECTRON_EVENTS } from "../constants";
import * as scheduler from "../schedulers";

export function registerSchedulerEvents() {
  ipcMain.handle(
    "schedule:daily",
    (_e, { hour, minute, highest }) => (
      scheduler.installDaily({ hour, minute, highest }), scheduler.buildReply()
    )
  );

  ipcMain.handle(
    ELECTRON_EVENTS.SCHEDULER_MONTHLY,
    (_e, { day, hour, minute, lastDay, highest }) => (
      scheduler.installMonthly({ day, hour, minute, lastDay, highest }),
      scheduler.buildReply()
    )
  );

  ipcMain.handle(
    "schedule:once",
    (_e, iso: string) => (scheduler.installOnce(iso), scheduler.buildReply())
  );

  ipcMain.handle(
    ELECTRON_EVENTS.SCHEDULER_REMOVE,
    () => (scheduler.removeSchedule(), scheduler.buildReply())
  );

  ipcMain.handle("schedule:kick", () => (scheduler.kick(), { ok: true }));

  ipcMain.handle(ELECTRON_EVENTS.SCHEDULER_STATUS, () =>
    scheduler.buildReply()
  );

  ipcMain.handle(
    "schedule:nextRun",
    () => scheduler.nextRun() // ✅ trả UnifiedNextRun
  );

  ipcMain.handle("schedule:print", () => ({ text: scheduler.printDetail() }));
}
