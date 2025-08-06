import React, { memo } from "react";
import { InfoModalOptions } from "../types/modal";
import Modal, { ModalProps } from "./Modal";

interface Props extends Omit<ModalProps, "children"> {
  options?: InfoModalOptions;
}

const InfoModal: React.FC<Props> = (props) => {
  const { options } = props || {};
  const { title, type, cta, desc } = options || {};

  return (
    <Modal
      closeButton
      bodyClass="top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] backdrop-blur-md!"
      {...props}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {desc ? (
        <p
          className={`mt-2 text-sm ${
            type === "error"
              ? "text-red-600 dark:text-red-400"
              : type === "warning"
              ? "text-yellow-600 dark:text-yellow-400"
              : type === "info"
              ? "text-blue-600 dark:text-blue-400"
              : "text-green-600 dark:text-green-400"
          }`}
        >
          {desc}
        </p>
      ) : null}

      {!!cta && (
        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            onClick={cta?.onClick || props.requestClose}
          >
            {cta?.title || "Đóng"}
          </button>
        </div>
      )}
    </Modal>
  );
};

export default memo(InfoModal);
