import moment from "moment";
import { ElementHandle, Page } from "puppeteer";
import { delay } from "../../utils/puppeteer-helper";
import { generateLogWorkByRange, parseDateRange } from "../../utils/datetime";
import { Project, WorkLog } from "../../types/user";
import { BrowserResultCommon } from "../../types/browser";
import { logJson } from "../../utils/logger";

export default class Dashboard {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  private async waitSelector(selector: string, visible = true) {
    try {
      await this.page.waitForSelector(selector, {
        timeout: 2000,
        ...(visible ? { visible: true } : { hidden: true }),
      });
    } catch (error) {
      console.log(`ℹ️ Không có ${selector} nào tồn tại`);
    }
    await delay(200);
  }

  private async clickButtonAdd() {
    const buttonAddInEmpty = this.page.locator(
      "body > div.mud-layout.mud-drawer-open-persistent-left.mud-drawer-left-clipped-never > div > div > div > div.timesheet-component > div > div > div > button"
    );

    const buttonAddInTable = this.page.locator(
      "body > div.mud-layout.mud-drawer-open-persistent-left.mud-drawer-left-clipped-never > div > div > div > div.timesheet-component > div > div > div > table > thead > tr > th.mud-table-cell.project-header-cell.sticky-header > div > div > div.mud-tooltip-root.mud-tooltip-inline > button"
    );

    const buttonAdd = await Promise.race([
      buttonAddInEmpty.waitHandle().catch(() => null),
      buttonAddInTable.waitHandle().catch(() => null),
    ]).catch(() => null);

    await buttonAdd?.click?.();
  }

  private async getRangeTime() {
    const el = await this.page.$(
      "body > div.mud-layout.mud-drawer-open-persistent-left.mud-drawer-left-clipped-never > div > div > div > div.d-flex.flex-row.align-center.gap-0.pl-0.pr-3 > div.d-flex.flex-row.gap-8.align-center > div > div.mud-paper.mud-elevation-0.d-flex.flex-row.align-center.justify-space-between > div > div > button > span"
    );

    const text = await el?.evaluate((el) => el.textContent);
    const time = text ? parseDateRange(text) : null;

    logJson({ fn: "getRangeTime", text, time });

    return time;
  }

  private async findAvailableRow(rows: ElementHandle<HTMLTableRowElement>[]) {
    for (const row of rows) {
      const hasNewLabel = await row
        .$eval(".mud-chip-content", (el) => el.textContent?.trim() === "New")
        .catch(() => false);
      if (hasNewLabel) return row;
    }
    return null;
  }

  private async getActualLogs(): Promise<Map<string, number>> {
    const actualMap = new Map<string, number>();

    await this.waitSelector("tbody.mud-table-body > tr");
    const rows = await this.page.$$("tbody.mud-table-body > tr");
    if (!rows || rows.length === 0) return actualMap;

    for (const row of rows) {
      try {
        const projectId = await row.$eval(
          "td.project-cell p.mud-text-secondary",
          (el) => el.textContent?.trim()
        );

        // const dateText = await row.$eval(
        //   "td:nth-child(2) input.mud-input-slot",
        //   (el) => (el as HTMLInputElement).value
        // );

        // const hoursText = await row.$eval(
        //   'input[type="text"][inputmode="decimal"]',
        //   (el) => (el as HTMLInputElement).value
        // );

        const dateText = await row.$eval(
          "td:nth-child(2) .mud-typography-body2",
          (el) => el.textContent?.trim()
        );

        const hoursText = await row.$eval(
          "td:nth-child(3) .mud-typography-body2",
          (el) => el.textContent?.trim()
        );

        const date = dateText
          ? moment(dateText, "MMM DD, YYYY").format("YYYY-MM-DD")
          : "";
        const hours = hoursText ? parseFloat(hoursText) : "";
        if (date && hours) {
          const key = `${projectId}_${date}`;
          actualMap.set(key, (actualMap.get(key) || 0) + hours);
        }
      } catch (err: any) {
        console.warn("⚠️ Bỏ qua 1 row:", err.message);
      }
    }

    return actualMap;
  }

  private async fillLog(log: WorkLog) {
    console.log(`➕ Logging: ${log.projectId} - ${log.date} - ${log.hours}h`);
    await delay(500);
    await this.clickButtonAdd();
    await this.waitSelector(".mud-list .mud-list-item");

    const items = await this.page.$$(".mud-list .mud-list-item");
    for (const item of items) {
      const text = await item.evaluate((el) => el.textContent);
      if (text?.includes(log.projectId)) {
        await item.click();
        await this.waitSelector(".mud-list .mud-list-item", false);
        break;
      }
    }

    await this.waitSelector("tbody.mud-table-body > tr");
    const rows = await this.page.$$("tbody.mud-table-body > tr");
    const row = await this.findAvailableRow(rows);
    if (!row) {
      console.warn(
        `❌ Không tìm thấy row để log: ${log.projectId} ${log.date}`
      );
      return;
    }

    const dateInput = await row.$(
      "td:nth-child(2) input.mud-input-slot[readonly]"
    );
    if (dateInput) {
      const formatted = moment(log.date).locale("en").format("MMM DD, YYYY");
      await dateInput.evaluate((input, dateStr) => {
        input.removeAttribute("readonly");
        input.value = dateStr;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }, formatted);
    }

    const hoursInput = await row.$('input[type="text"][inputmode="decimal"]');
    if (hoursInput) {
      // await hoursInput.click({ clickCount: 2 });
      // await this.page.keyboard.press("Backspace");
      // await this.page.keyboard.type(log.hours.toString());
      await hoursInput.evaluate((input, str) => {
        input.value = str;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }, log.hours.toString());
    }

    const saveBtn = await row.$("button.mud-button-outlined-success");
    if (saveBtn) await saveBtn.click();

    // await delay(500);

    console.log(`✅ Logged: ${log.projectId} - ${log.date} - ${log.hours}h`);
  }

  private async findMissingLogs(
    expected: WorkLog[],
    actualMap: Map<string, number>
  ) {
    const missingLogs: WorkLog[] = [];

    for (const log of expected) {
      const key = `${log.projectId}_${log.date}`;
      const actual = actualMap.get(key) || 0;
      if (actual < log.hours) {
        missingLogs.push({ ...log, hours: log.hours - actual });
      }
    }

    return missingLogs;
  }

  private async logMissingLogs(logs: WorkLog[]) {
    for (const log of logs) {
      await this.fillLog(log);
    }
  }

  async logTime(projects: Project[]): Promise<BrowserResultCommon> {
    console.log("📋 logTime:");
    // chờ trang load xong, pmhub bị nháy table với empty liên tục
    await delay(2000);

    const rangeTime = await this.getRangeTime();
    if (!rangeTime) {
      return { success: false, msg: "Không có rangeTime" };
    }

    const expectedLogs = generateLogWorkByRange(rangeTime, projects);
    console.log(
      "📌 logTime: Mong đợi:",
      expectedLogs.reduce((sum, l) => sum + l.hours, 0),
      expectedLogs.map((l) => `${l.projectId} - ${l.date} - ${l.hours}h`)
    );

    // Giai đoạn 1: log lần đầu theo kế hoạch
    console.log("----📋 Run lần đầu:----");
    const actualMap1 = await this.getActualLogs();
    const missingLogs1 = await this.findMissingLogs(expectedLogs, actualMap1);
    console.log(
      "📌 Đã có:",
      Array.from(actualMap1.values()).reduce((a, b) => a + b, 0)
    );
    console.log("📌 Cần thêm:", missingLogs1);
    await this.logMissingLogs(missingLogs1);
    console.log("----Done lần đầu----");

    // Giai đoạn 2: đọc lại sau khi log, kiểm tra còn thiếu
    await delay(1000);
    console.log("----📋 Run lần 2:----");
    const actualMap2 = await this.getActualLogs();
    const missingLogs2 = await this.findMissingLogs(expectedLogs, actualMap2);
    console.log(
      "📌 Đã có:",
      Array.from(actualMap2.values()).reduce((a, b) => a + b, 0)
    );
    console.log("📌 Cần thêm:", missingLogs2);
    await this.logMissingLogs(missingLogs2);
    console.log("----Done lần 2----");

    const actualMapFinal = await this.getActualLogs();
    const missingLogsFinal = await this.findMissingLogs(
      expectedLogs,
      actualMapFinal
    );

    return {
      success: missingLogsFinal.length === 0,
      msg:
        missingLogsFinal.length === 0
          ? ""
          : `📌 Còn thiếu: ${missingLogsFinal
              ?.map((l) => `${l.projectId} - ${l.date} - ${l.hours}h`)
              .join(", ")}`,
    };
  }

  async deleteAllLogTime(): Promise<BrowserResultCommon> {
    console.log("🗑️ deleteAllLogTime:");

    // chờ trang load xong, pmhub bị nháy table với empty liên tục
    await delay(2000);

    await this.waitSelector("tbody.mud-table-body > tr");
    const rows = await this.page.$$("tbody.mud-table-body > tr");
    if (!rows || rows.length === 0) {
      return { success: false, msg: "ℹ️ Không có log work nào để xoá." };
    }

    let hasDeleted = false;
    let iteration = 0;

    while (true) {
      iteration++;

      let found = false;

      try {
        await this.waitSelector("tbody.mud-table-body > tr");
        await delay(1000);
        const rows = await this.page.$$("tbody.mud-table-body > tr");

        for (const row of rows) {
          const deleteBtn = await row.$("button.mud-button-outlined-error");
          if (deleteBtn) {
            console.log(`🗑️ Delete row in iteration ${iteration}`);
            await deleteBtn.click();
            await this.waitSelector(
              ".mud-dialog-actions button.mud-button-outlined-error"
            );
            const confirmBtn = await this.page.$(
              ".mud-dialog-actions button.mud-button-outlined-error"
            );
            if (confirmBtn) {
              await confirmBtn.click();
              await this.waitSelector(
                ".mud-dialog-actions button.mud-button-outlined-error",
                false
              );
              found = true;
              hasDeleted = true;
              break; // reload lại sau khi xóa
            }
          }
        }
      } catch (error) {
        console.log(error);
      }

      if (!found) break; // không còn gì để xóa
    }

    if (hasDeleted) {
      console.log("✅ Đã xoá toàn bộ log work.");
    } else {
      console.log("ℹ️ Không có log work nào để xoá.");
    }

    return {
      success: hasDeleted,
      msg: hasDeleted
        ? "✅ Đã xoá toàn bộ log work."
        : "ℹ️ Không có log work nào để xoá.",
    };
  }
}
