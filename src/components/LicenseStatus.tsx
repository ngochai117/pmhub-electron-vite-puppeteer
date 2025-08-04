import React, { memo } from "react";
import { LicenseResponseFE, LicenseType } from "../types/license";
import LiquidGlass from "./liquid-glass/LiquidGlass";
import { disableButton } from "../utils/common";
import { showModal } from "./ModalManager";
import { ELECTRON_EVENTS } from "../constants";

const LICENSE_LABELS = {
  [LicenseType.NEW]: (
    <>
      <i className="fa-solid fa-lock mr-2"></i>Bạn cần kích hoạt để sử dụng
    </>
  ),
  [LicenseType.TRIAL]: "Bản dùng thử",
  [LicenseType.ULTIMATE]: `Thành viên Siêu Cấp Vip Pro`,
  [LicenseType.LIMIT]: "Bản giới hạn",
  LOADING: (
    <>
      <div className="loading-spinner"></div> Đang cập nhật license...
    </>
  ),
};

const MODAL_TEXT = {
  ENTER_KEY_TITLE: "🔐 Nhập license key",
  ENTER_KEY_PLACEHOLDER: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
  TRY_TITLE: "🚀 Kích hoạt dùng thử",
  TRY_DESC: "Bạn sẽ được dùng thử đầy đủ tính năng trong vòng {{days}} ngày.",
  ACTIVATING: `<div class="active-license"><div class="loading-spinner"></div>Đang kích hoạt...</div>`,
  SUCCESS: `<div class="active-license success">✅ Kích hoạt thành công!</div>`,
  FAILED: `<div class="active-license failed">❌ Kích hoạt thất bại: {{msg}}</div>`,
  EMPTY: "⚠️ Vui lòng nhập key",
};

const BTN_TEXT = {
  ACTIVATE: "🔑 Kích hoạt",
  TRY: "🚀 Trải nghiệm ngay",
};

const DATA_NEW: LicenseResponseFE = { type: LicenseType.NEW, valid: false };
const DATA_TRIAL: LicenseResponseFE = { type: LicenseType.TRIAL, valid: true };
const DATA_TRIAL_EXPIRED: LicenseResponseFE = {
  type: LicenseType.TRIAL,
  valid: false,
  expiredAt: new Date(),
};
const DATA_TRIAL_ULTIMATE: LicenseResponseFE = {
  type: LicenseType.ULTIMATE,
  valid: true,
};

interface Props {
  license?: LicenseResponseFE;
}

const LicenseStatus: React.FC<Props> = (props) => {
  const { license } = props || {};
  const { type, expiredAt, remainingTime, isExpired, valid } = DATA_NEW || {};

  const days = Math.floor((remainingTime || 0) / (1000 * 60 * 60 * 24));
  const expiredText = expiredAt ? new Date(expiredAt).toLocaleDateString() : "";
  const timeText = isExpired
    ? ` hết hạn ngày ${expiredText}`
    : expiredText
    ? ` còn lại ${days} ngày`
    : "";

  const label = type ? LICENSE_LABELS[type] : LICENSE_LABELS.LOADING;

  return (
    <div className="flex flex-col gap-(--gap-inside) items-center transition-all">
      <div className="flex flex-row gap-2">
        <LiquidGlass
          className="flex flex-row items-center text-center px-3 py-2 font-bold"
          style={{ "--bd-blur": 8 } as any}
        >
          {label}
          {timeText}
        </LiquidGlass>
        {(!valid || type === LicenseType.TRIAL) && (
          <LiquidGlass className="clickable flex items-center justify-center">
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full wiggle-hover"
              style={{ padding: 0 }}
              onClick={() => {
                if (type === LicenseType.NEW) {
                  showActivationModal({ type: "key" });
                } else if (type === LicenseType.TRIAL) {
                  showActivationModal({ type: "trial", days });
                }
              }}
            >
              <i className="fa-solid fa-key"></i>
            </button>
          </LiquidGlass>
        )}
      </div>
    </div>
  );
};

export function showActivationModal({
  type,
  days,
}: {
  type: "key" | "trial";
  days?: number;
}) {
  const wrapper = document.createElement("div");
  const loading = document.createElement("div");
  let input: HTMLInputElement | null = null;

  loading.style.display = "none";

  if (type === "trial") {
    wrapper.innerHTML = `
      <div class="title">${MODAL_TEXT.TRY_TITLE}</div>
      <div class="description">${MODAL_TEXT.TRY_DESC.replace(
        "{{days}}",
        days?.toString() || ""
      )}</div>`;
  } else {
    wrapper.innerHTML = `<div class="title">${MODAL_TEXT.ENTER_KEY_TITLE}</div>`;
    input = document.createElement("input");
    input.type = "text";
    input.placeholder = MODAL_TEXT.ENTER_KEY_PLACEHOLDER;
    input.maxLength = MODAL_TEXT.ENTER_KEY_PLACEHOLDER.length;
    input.classList.add("real");
    input.style.cssText = "width: 100%; margin-top: 12px;";
    wrapper.appendChild(input);

    input.addEventListener("input", () => {
      const value = input!.value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 25);
      const parts = value.match(/.{1,5}/g) || [];
      input!.value = parts.join("-");
      const btn = document.getElementById("activateBtn") as HTMLButtonElement;
      disableButton(btn, !isValidKey(input!.value));
    });
  }

  wrapper.appendChild(loading);

  showModal(
    wrapper,
    [
      {
        label: BTN_TEXT.ACTIVATE,
        id: "activateBtn",
        disabled: type === "key",
        className: "real",
        onClick: async () => {
          const btn = document.getElementById(
            "activateBtn"
          ) as HTMLButtonElement;
          disableButton(btn, true);
          loading.innerHTML = MODAL_TEXT.ACTIVATING;
          loading.style.display = "block";

          try {
            const payload = type === "key" ? input?.value.trim() : undefined;
            if (type === "key" && !isValidKey(payload!)) {
              input!.classList.add("error");
              input!.focus();
              disableButton(btn, false);
              return;
            }

            // const result = await ipcRenderer.invoke(
            //   type === "key"
            //     ? ELECTRON_EVENTS.ACTIVATE_LICENSE_KEY
            //     : ELECTRON_EVENTS.ACTIVATE_TRIAL,
            //   ...(type === "key" ? [payload] : [])
            // );

            // if (result.success) {
            //   loading.innerHTML = MODAL_TEXT.SUCCESS;
            //   setTimeout(() => {
            //     const modal = document.getElementById("reusableModal")!;
            //     modal.style.display = "none";
            //     ipcRenderer
            //       .invoke(ELECTRON_EVENTS.LOAD_USER_DATA)
            //       .then((data) => {
            //         const status = document.getElementById("licenseStatus")!;
            //         status.innerHTML = "";
            //         const e = new Event("licenseUpdated", { bubbles: true });
            //         status.dispatchEvent(e);
            //       });
            //   }, 1000);
            // } else {
            //   loading.innerHTML = MODAL_TEXT.FAILED.replace(
            //     "{{msg}}",
            //     result?.msg || "Lỗi không xác định"
            //   );
            //   disableButton(btn, false);
            // }
          } catch (e: any) {
            loading.innerHTML = MODAL_TEXT.FAILED.replace(
              "{{msg}}",
              e?.msg || "Lỗi không xác định"
            );
            disableButton(btn, false);
          }
        },
      },
    ],
    { preventAutoClose: true }
  );
}

function isValidKey(key: string) {
  return (
    key.length === MODAL_TEXT.ENTER_KEY_PLACEHOLDER.length &&
    key.split("-").length === 5
  );
}

export default memo(LicenseStatus);
