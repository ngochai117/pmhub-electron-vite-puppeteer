import React, { memo } from "react";
import { LicenseResponseFE, LicenseType } from "../types/license";
import LiquidGlass from "./liquid-glass/LiquidGlass";
import ActivateButton from "./ActivateButton";

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

        <ActivateButton license={license} />
      </div>
    </div>
  );
};

function isValidKey(key: string) {
  return (
    key.length === MODAL_TEXT.ENTER_KEY_PLACEHOLDER.length &&
    key.split("-").length === 5
  );
}

export default memo(LicenseStatus);
