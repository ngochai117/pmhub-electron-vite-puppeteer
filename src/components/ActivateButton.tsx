import { useState } from "react";
import LiquidGlass from "./liquid-glass/LiquidGlass";

import React, { memo } from "react";
import { LicenseResponseFE, LicenseType } from "../types/license";
import Modal from "./Modal";

interface Props {
  license?: LicenseResponseFE;
}

const ActivateButton: React.FC<Props> = (props) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [openActivateModal, setOpenActivateModal] = useState(false);
  const { license } = props || {};
  const { valid, type } = license || {};

  const handleMenuClick = () => {
    setOpenMenu(false);
    setOpenActivateModal(true);
  };

  return (
    <>
      <div className="relative inline-block">
        {(!valid || type === LicenseType.TRIAL) && (
          <LiquidGlass className={"clickable z-11"}>
            <button
              className={`flex items-center justify-center w-10 h-10 rounded-full wiggle-infinite`}
              style={{ padding: 0 }}
              // onClick={() => {
              //   if (type === LicenseType.NEW) {
              //     showActivationModal({ type: "key" });
              //   } else if (type === LicenseType.TRIAL) {
              //     showActivationModal({ type: "trial", days });
              //   }
              // }}
              onClick={() => setOpenMenu((prev) => !prev)}
            >
              <i className="fa-solid fa-key"></i>
            </button>
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
            onClick={handleMenuClick}
            className="py-2 px-4 rounded-lg cursor-pointer hover:bg-black/10 transition"
          >
            Trial
          </div>
          <div
            onClick={handleMenuClick}
            className="py-2 px-4 rounded-lg cursor-pointer hover:bg-black/10 transition font-semibold"
          >
            Active Key
            <span className="absolute">
              <span className="relative flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-75"></span>
                <span className="relative inline-flex size-3 rounded-full bg-sky-600"></span>
              </span>
            </span>
          </div>
        </Modal>
      </div>
      <Modal
        open={openActivateModal}
        requestClose={() => setOpenActivateModal(false)}
        bodyClass="top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] backdrop-blur-md!"
        zIndex={20}
        outsideClose
        closeButton
      >
        {["Licc Key", "Delete", "Share"].map((label) => (
          <div
            key={label}
            onClick={handleMenuClick}
            className="py-2 px-4 rounded-lg cursor-pointer hover:bg-black/10 transition"
          >
            {label}
          </div>
        ))}
      </Modal>
    </>
  );
};

export default memo(ActivateButton);
