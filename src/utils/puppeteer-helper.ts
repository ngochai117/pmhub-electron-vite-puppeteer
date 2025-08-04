import { Page } from "puppeteer";

export const DELAY_ACTION_TIME = 500;
export const DELAY_VISIBLE_VIEW_TIME = 1000;

export const delay = async (ms = DELAY_ACTION_TIME) =>
  await new Promise((r) => setTimeout(r, ms));

export const goto = async (page: Page, url: string) => await page.goto(url);

export const fill = async (page: Page, selector: string, text: string) => {
  await page.locator(selector).fill(text);
};

export const typing = async (page: Page, selector: string, text: string) => {
  await page.evaluate(
    ({ selector, text }) => {
      const input = document.querySelector<HTMLInputElement>(selector);
      if (input) {
        input.value = text;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    },
    { selector, text }
  );
};

export const click = async (page: Page, selector: string) => {
  await delay();
  await page.locator(selector).click();
};
