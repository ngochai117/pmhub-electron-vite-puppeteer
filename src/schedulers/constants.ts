import { app } from "electron";
// NHỚ bật resolveJsonModule trong tsconfig
import pkg from "../../package.json";
import path from "node:path";

export const APP_ID = pkg.name; // "vn.momo.pmhub.logwork"
export const APP_NAME = pkg.productName || app.getName(); // "PM Hub Auto Log Work"
export const APP_VERSION = pkg.version;

// Label cho launchd (reverse DNS + suffix), ổn định & unique cho user
export const SCHED_LABEL = `${APP_ID}.autolog`; // vd: "vn.momo.pmhub.logwork.autolog"

// Task name cho Windows: ký tự an toàn (A-Z0-9), dễ đọc & không đụng
const SAFE = APP_NAME.replace(/[^A-Za-z0-9]/g, "");
export const TASK_NAME = `${SAFE}AutoLog`; // vd: "PMHubAutoLogWorkAutoLog"

// ——— Đường dẫn/filename suy diễn từ APP_NAME (Windows .exe)
export const EXE_NAME_WIN = `${APP_NAME}.exe`; // "PM Hub Auto Log Work.exe"

// Đường dẫn bundle hiện tại (…/YourApp.app)
export const APP_BUNDLE_PATH =
  process.platform === "darwin"
    ? path.resolve(app.getPath("exe"), "../../..")
    : "";
