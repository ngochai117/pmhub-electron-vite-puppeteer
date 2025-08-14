import { Page } from "puppeteer";
import {
  click,
  delay,
  DELAY_VISIBLE_VIEW_TIME,
  goto,
  typing,
} from "../../utils/puppeteer-helper";
import { ELEMENTS, PATHS, URLS } from "../../constants";
import { logJson } from "../../utils/logger";

const checkLoginResult = async (page: Page, timeout = 10000) => {
  logJson({ fn: "checkLoginResult" });

  const waitForShowDashboard = page
    .waitForFunction(
      () =>
        [...document.body.querySelectorAll("*")].some((el) =>
          el.textContent?.includes("My work")
        ),
      { timeout: timeout }
    )
    .then(() => true)
    .catch(() => false);

  const waitForShowError = page
    .waitForFunction(
      () =>
        [...document.body.querySelectorAll("*")].some((el) =>
          el.textContent?.includes("Login failed")
        ),
      { timeout: timeout + 1000 }
    )
    .then(() => false)
    .catch(() => true);

  const status = await Promise.race([
    waitForShowDashboard,
    waitForShowError,
    delay(timeout).then(() => false),
  ]);

  logJson({ fn: "checkLoginResult", msg: status });
  return !!status;
};

export default class Login {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  goto() {
    return goto(this.page, URLS.DASHBOARD);
  }

  async login(username: string, password: string) {
    await delay(DELAY_VISIBLE_VIEW_TIME);
    await typing(this.page, ELEMENTS.INPUT_USERNAME, username);
    await typing(this.page, ELEMENTS.INPUT_PASSWORD, password);

    await click(this.page, ELEMENTS.BUTTON_LOGIN);
    return await checkLoginResult(this.page);
  }

  async checkAndLogin(username: string, password: string) {
    await this.goto();
    const currentUrl = this.page.url();
    if (currentUrl.includes(PATHS.LOGIN)) {
      console.log("🔐 Đang ở trang login, tiến hành đăng nhập...");
      const result = await this.login(username, password);
      return result;
    }
    console.log("✅ Đã đăng nhập sẵn, thực hiện thao tác khác...");
    return true;
  }
}
