import puppeteer from "puppeteer";
import Login from "./poms/Login";
import { UserData } from "../types/user";
import { BrowserResultCommon } from "../types/browser";
import { getConfigPath } from "../utils/file";
import { FILE_NAMES } from "../constants";
import { delay } from "../utils/puppeteer-helper";
import Dashboard from "./poms/Dashboard";

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
  action = "logTime"
): Promise<BrowserResultCommon> => {
  const { username, password, projects } = params || {};

  const browser = await runBrowser();

  const page = await browser.newPage();
  // await page.setViewport({ width: 1080, height: 1024 });

  const login = new Login(page);
  const loginSuccess = await login.checkAndLogin(username, password);

  if (!loginSuccess) {
    browser.close();
    return {
      success: false,
      msg: "Login failed",
    };
  }

  await delay();

  const dashboard = new Dashboard(page);
  const result =
    action === "deleteLog"
      ? await dashboard.deleteAllLogTime()
      : await dashboard.logTime(projects);

  // browser.close();

  return result;
};
