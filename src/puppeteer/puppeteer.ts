import puppeteer from "puppeteer";
import Login from "./poms/Login";
import { UserData } from "../types/user";
import { Action, BrowserResultCommon } from "../types/browser";
import { getConfigPath } from "../utils/file";
import { FILE_NAMES } from "../constants";
import { delay } from "../utils/puppeteer-helper";
import Dashboard from "./poms/Dashboard";
import { translate } from "../utils/localize";

const runBrowser = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: getConfigPath(FILE_NAMES.CACHE_BROWSER),
    // args: ['--window-size=1280,900'],
    args: ["--start-maximized"], // max cửa sổ
    defaultViewport: null, // rất quan trọng để không bị ghi đè kích thước
  });
  return browser;
};

export const runPMHub = async (
  params: Required<UserData>,
  action: Action = "logTime"
): Promise<BrowserResultCommon> => {
  const { username, password, projects } = params || {};

  const browser = await runBrowser();

  const page = await browser.newPage();
  // await page.setViewport({ width: 1080, height: 1024 });

  try {
    const login = new Login(page);
    const loginSuccess = await login.checkAndLogin(username, password);

    if (!loginSuccess) {
      browser.close();
      return {
        success: false,
        title: translate("login_fail"),
        msg: translate("login_fail_desc"),
      };
    }

    await delay();

    const dashboard = new Dashboard(page);
    const result =
      action === "deleteLog"
        ? await dashboard.deleteAllLogTime().catch((e) => {
            browser.close();
            return {
              success: false,
              title: translate("delete_log_error"),
              msg: e?.message,
            };
          })
        : await dashboard.logTime(projects).catch((e) => {
            browser.close();
            return {
              success: false,
              title: translate("log_error"),
              msg: e?.message,
            };
          });

    browser.close();
    return result;
  } catch (error: any) {
    console.log(`Log work error:`, error);
    browser.close();
    return {
      success: false,
      title: translate("excuse_error"),
      msg: error?.message || translate("excuse_error_desc"),
    };
  }
};
