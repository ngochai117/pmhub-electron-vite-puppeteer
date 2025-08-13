// src/main/main.ts
import { ipcMain } from "electron";
import {
  getNextRunEstimate,
  installMonthly,
  status,
  uninstall,
} from "../schedulers/scheduler.macos";
import { ELECTRON_EVENTS } from "../constants";

function isMac() {
  return process.platform === "darwin";
}

export function registerSchedulerEvents() {
  ipcMain.handle(
    ELECTRON_EVENTS.SETTING_SCHEDULER_MONTHLY,
    async (_e, { day, hour, minute }) => {
      if (!isMac()) throw new Error("macOS only in this handler");
      installMonthly({ day, hour, minute });
      return status() === "loaded";
    }
  );

  // ipcMain.handle("schedule:daily", async (_e, { hour, minute }) => {
  //   if (!isMac()) throw new Error("macOS only in this handler");
  //   installDaily({ hour, minute });
  //   return { ok: true, status: status() };
  // });

  // ipcMain.handle("schedule:once", async (_e, iso: string) => {
  //   if (!isMac()) throw new Error("macOS only in this handler");
  //   installOnce(new Date(iso));
  //   return { ok: true, status: status() };
  // });

  ipcMain.handle(ELECTRON_EVENTS.SETTING_SCHEDULER_REMOVE, async () => {
    if (!isMac()) throw new Error("macOS only in this handler");
    uninstall();
    return true;
  });

  // ipcMain.handle(ELECTRON_EVENTS.SETTING_SCHEDULER_TEST, async () => {
  //   if (!isMac()) throw new Error("macOS only in this handler");
  //   testRunNow();
  //   return { ok: true };
  // });

  // ipcMain.handle("schedule:status", async () => {
  //   if (!isMac()) throw new Error("macOS only in this handler");
  //   return { ok: true, status: status() };
  // });

  ipcMain.handle(ELECTRON_EVENTS.SETTING_SCHEDULER_NEXT_RUN, async () => {
    if (!isMac()) throw new Error("macOS only in this handler");
    return getNextRunEstimate();
  });
}
