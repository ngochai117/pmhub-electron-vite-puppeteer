import { app, BrowserWindow } from "electron";
// import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { registerEvents } from "../src/handlers/events";
import { ELECTRON_EVENTS } from "../src/constants";
import { getArgValue } from "../src/utils/file";
import { logJson } from "../src/utils/logger";
import { checkUserDataValid, getUserData } from "../src/utils/user";
import { InfoModalOptions } from "../src/types/modal";
import { getLicenseInfoViaServer } from "../src/api/license";
import { UserData } from "../src/types/user";
import { runPMHub } from "../src/puppeteer/puppeteer";

// const require = createRequire(import.meta.url)

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

registerEvents();

async function showPopup(params: InfoModalOptions) {
  let needCreateWindow = false;
  if (app.isHidden()) app.show();
  if (!win) {
    needCreateWindow = true;
    await app.whenReady().then(createWindow);
  }
  if (needCreateWindow) {
    win?.webContents?.once("did-finish-load", () => {
      win?.webContents.send(ELECTRON_EVENTS.SHOW_MODAL, params);
    });
  } else {
    win?.webContents.send(ELECTRON_EVENTS.SHOW_MODAL, params);
  }
}

export async function runTool(userData?: UserData, action?: string) {
  if (!checkUserDataValid(userData)) {
    showPopup({
      type: "error",
      title: "Thông tin không chính xác",
      desc: "Vui lòng nhập đầy đủ thông tin user và tối thiểu một project",
    });
    return;
  }
  const license = await getLicenseInfoViaServer();
  if (!license) {
    showPopup({
      type: "error",
      title: "License",
      desc: "Vui lòng kích hoạt để sử dụng tính năng",
    });
    return;
  }

  const result = await runPMHub(userData as Required<UserData>, action);

  if (result?.success) {
    // app.quit();
  } else {
    showPopup({
      title: "Lỗi thực thi",
      type: "error",
      desc: result?.msg || "Lỗi không xác định",
    });
  }
}

async function runMain() {
  const silent = process.argv.includes("--silent");
  const action = getArgValue("--action");

  if (silent) {
    logJson({ action: "run background" });
    app.dock?.hide();

    const userData = await getUserData();

    await runTool(userData, action);
  } else {
    logJson({ action: "run force ground" });
    app.whenReady().then(createWindow);
  }
}

runMain();
