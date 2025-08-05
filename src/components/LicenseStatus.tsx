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
      <div className="loading-spinner"></div>Đang cập nhật license...
    </>
  ),
};

interface Props {
  license?: LicenseResponseFE;
  onActivateSuccess?: () => void;
}

const LicenseStatus: React.FC<Props> = (props) => {
  const { license, onActivateSuccess } = props || {};
  const { type, expiredAt, remainingTime, isExpired } = license || {};

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

        <ActivateButton
          license={license}
          onActivateSuccess={onActivateSuccess}
        />
      </div>
    </div>
  );
};

export default memo(LicenseStatus);
