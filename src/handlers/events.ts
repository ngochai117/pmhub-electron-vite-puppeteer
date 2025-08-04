import { BrowserWindow, ipcMain } from "electron";

import { ELECTRON_EVENTS, FILE_NAMES } from "../constants";
import { writeFile } from "../utils/file";
import { encryptJson } from "../utils/encrypts";
import { getUserData } from "../utils/user";
import { logJson } from "../utils/logger";
import {
  activateKey,
  activateTrial,
  getLicenseInfoViaServer,
} from "../api/license";

export function registerEvents() {
  // action login
  ipcMain.on(
    ELECTRON_EVENTS.LOGIN,
    async (_event, { username, password, projects, runNow }) => {
      const data = { username, password, projects };
      writeFile(FILE_NAMES.USER_DATA, encryptJson(data));

      // if (runNow) runTool(data);
    }
  );

  // load user data
  ipcMain.handle(ELECTRON_EVENTS.GET_USER_DATA, async () => {
    try {
      const userData = await getUserData();
      return userData;
    } catch (err) {
      logJson({ fn: ELECTRON_EVENTS.GET_USER_DATA, level: "error", msg: err });
      return null;
    }
  });

  ipcMain.handle(ELECTRON_EVENTS.GET_LICENSE, async () => {
    try {
      const userData = await getLicenseInfoViaServer();
      return userData;
    } catch (err) {
      logJson({ fn: ELECTRON_EVENTS.GET_LICENSE, level: "error", msg: err });
      return null;
    }
  });

  ipcMain.handle(ELECTRON_EVENTS.ACTIVATE_LICENSE_KEY, async (_event, key) => {
    const res = await activateKey(key);
    return { success: res.success, msg: res?.response?.msg };
  });

  ipcMain.handle(ELECTRON_EVENTS.ACTIVATE_TRIAL, async () => {
    const res = await activateTrial();
    return { success: res.success, msg: res?.response?.msg };
  });
}
