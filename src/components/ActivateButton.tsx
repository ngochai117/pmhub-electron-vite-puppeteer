import { ReactNode, useState } from "react";
import LiquidGlass from "./liquid-glass/LiquidGlass";

import React, { memo } from "react";
import { LicenseResponseFE, LicenseType } from "../types/license";
import Modal from "./Modal";
import { ELECTRON_EVENTS } from "../constants";
import InfoModal from "./InfoModal";
import { InfoModalOptions } from "../types/modal";
import { translate } from "../utils/localize";

interface Props {
  license?: LicenseResponseFE;
  onActivateSuccess?: () => void;
}

type MODAL_TYPE = "TRIAL" | "LICENSE";

const MODAL_TEXT: Record<
  MODAL_TYPE,
  { title: ReactNode; desc: string; cta?: string }
> = {
  TRIAL: {
    title: "🚀 Kích hoạt dùng thử",
    desc: "Dùng thử full tính năng trong {{days}} ngày.",
  },
  LICENSE: {
    title: (
      <>
        <i className="fa-solid fa-lock-open mr-2"></i>Nhập key
      </>
    ),
    desc: "",
  },
};

const TEXT = {
  LOADING: (
    <>
      <div className="loading-spinner"></div>Đang kích hoạt
    </>
  ),
  ACTIVATE: "Kích hoạt",
  TRY: "Trải nghiệm ngay",
  PLACE_HOLDER_INPUT: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
  ACTIVATE_SUCCESS: "Kích hoạt thành công!",
  TRIAL: "Trial",
  ACTIVE_KEY: "Active Key",
};

interface ActivateModal {
  type?: MODAL_TYPE;
  title?: ReactNode;
  desc?: string;
  error?: string;
  loading?: boolean;
  key?: string;
}

function isValidKey(key?: string) {
  return (
    key &&
    key.length === TEXT.PLACE_HOLDER_INPUT.length &&
    key.split("-").length === 5
  );
}

const ActivateButton: React.FC<Props> = (props) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [licenseModal, setLicenseModal] = useState<ActivateModal>();
  const [successModalOptions, setSuccessModal] = useState<InfoModalOptions>();
  const { license, onActivateSuccess } = props || {};
  const { valid, type, durationMilliseconds } = license || {};
  const trialDays = Math.floor(
    (durationMilliseconds || 0) / (1000 * 60 * 60 * 24)
  );

  const handleMenuClick = (type: MODAL_TYPE) => {
    setOpenMenu(false);
    setLicenseModal({ ...MODAL_TEXT[type], type });
  };

  const activate = () => {
    if (licenseModal) {
      setLicenseModal({ ...licenseModal, loading: true, error: "" });
      window.ipcRenderer
        .invoke(ELECTRON_EVENTS.ACTIVATE_LICENSE, licenseModal.key)
        .then((result) => {
          if (result.success) {
            setLicenseModal(undefined);
            setSuccessModal({
              type: "success",
              title: licenseModal.title,
              desc: TEXT.ACTIVATE_SUCCESS,
              cta: {},
            });
            onActivateSuccess?.();
          } else {
            setLicenseModal((prev) => ({
              ...prev,
              error: result?.msg || translate("excuse_error_desc"),
              loading: false,
            }));
          }
        });
    }
  };

  const activateButtonDisabled =
    licenseModal?.loading ||
    (licenseModal?.type === "LICENSE" && !isValidKey(licenseModal?.key));

  const classNameButtonMenu =
    "py-2 px-4 rounded-lg cursor-pointer hover:bg-black/10 transition duration-200 ease-in-out hover:scale-105 active:scale-100 ho";

  const renderPing = (className = "") => (
    <span className={`absolute ${className} pointer-events-none`}>
      <span className="relative flex size-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-75"></span>
        <span className="relative inline-flex size-3 rounded-full bg-sky-600"></span>
      </span>
    </span>
  );

  return (
    <>
      <div className="relative inline-block">
        {type && (!valid || type === LicenseType.TRIAL) && (
          <LiquidGlass className={"clickable z-11"}>
            <button
              className={`flex items-center justify-center w-10 h-10 rounded-full wiggle-infinite`}
              style={{ padding: 0 }}
              onClick={() => {
                if (openMenu) {
                  setOpenMenu(false);
                  return;
                }
                if (type === LicenseType.NEW) {
                  setOpenMenu(true);
                } else {
                  handleMenuClick("LICENSE");
                }
              }}
            >
              <i className="fa-solid fa-key fa-bounce"></i>
            </button>
            {openMenu || licenseModal ? null : renderPing("top-0 right-0")}
          </LiquidGlass>
        )}

        <Modal
          open={openMenu}
          requestClose={() => setOpenMenu(false)}
          bodyClass="absolute! right-0! mt-2 min-w-[180px]! origin-top-right!"
          zIndex={10}
          outsideClose
        >
          <div
            onClick={() => handleMenuClick("TRIAL")}
            className={`${classNameButtonMenu}`}
          >
            {TEXT.TRIAL}
          </div>
          <div
            onClick={() => handleMenuClick("LICENSE")}
            className={`${classNameButtonMenu} font-semibold`}
          >
            {TEXT.ACTIVE_KEY}
            {renderPing()}
          </div>
        </Modal>
      </div>
      <Modal
        open={!!licenseModal}
        requestClose={() => setLicenseModal(undefined)}
        bodyClass="top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] backdrop-blur-md!"
        zIndex={20}
        closeButton
      >
        <h2 className="text-lg font-semibold">{licenseModal?.title}</h2>
        {licenseModal?.desc ? (
          <p className="mt-2 text-sm">
            {licenseModal.desc?.replace(
              "{{days}}",
              trialDays?.toString() || ""
            )}
          </p>
        ) : null}

        {licenseModal?.type === "LICENSE" ? (
          <input
            type="text"
            className="w-full p-2 border rounded mt-4"
            placeholder={TEXT.PLACE_HOLDER_INPUT}
            value={licenseModal?.key}
            onChange={(e) => {
              const value = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")
                .slice(0, 25);
              const parts = value.match(/.{1,5}/g) || [];
              setLicenseModal({
                ...licenseModal,
                key: parts.join("-"),
              });
            }}
          />
        ) : null}

        {!!licenseModal?.error && (
          <p className="mt-2 text-sm text-red-500">{licenseModal.error}</p>
        )}

        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            disabled={activateButtonDisabled}
            onClick={activate}
          >
            {licenseModal?.loading
              ? TEXT.LOADING
              : licenseModal?.type === "TRIAL"
              ? TEXT.TRY
              : TEXT.ACTIVATE}
          </button>
        </div>
      </Modal>
      <InfoModal
        open={!!successModalOptions}
        requestClose={() => setSuccessModal(undefined)}
        options={successModalOptions}
        zIndex={30}
      />
    </>
  );
};

export default memo(ActivateButton);
