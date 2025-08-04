// ModalManager.tsx
import React, { createRef, ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./styles-modal.css";
import { disableButton } from "../utils/common";
import LiquidGlass from "./liquid-glass/LiquidGlass";

interface ModalButton {
  label: string;
  className?: string;
  onClick?: () => void;
  id?: string;
  disabled?: boolean;
  closeModal?: boolean;
}

interface ModalContent {
  title?: string;
  desc?: string;
  icon?: ReactNode;
  loading?: boolean;
}

interface ModalOptions {
  preventAutoClose?: boolean;
}

interface ShowModalArgs {
  content: string | ModalContent | HTMLElement;
  buttons?: ModalButton[];
  options?: ModalOptions;
}

const modalRef = createRef<HTMLDivElement>();
const msgRef = createRef<HTMLDivElement>();
const btnRef = createRef<HTMLDivElement>();

export function showModal(content, buttons = [], options = {}) {
  const modal = document.getElementById("reusableModal");
  const msgEl = document.getElementById("modalMessage");
  const btnContainer = document.getElementById("modalButtons");

  // Reset
  msgEl.innerHTML = "";
  btnContainer.innerHTML = "";

  showModalClass();

  // Render nội dung
  if (typeof content === "object" && !(content instanceof HTMLElement)) {
    const { title, desc, icon, loading = false } = content;
    msgEl.innerHTML = `
      <div class="modal-body">
        ${icon ? `<div class="icon">${icon}</div>` : ""}
        ${title ? `<div class="title">${title}</div>` : ""}
        ${desc ? `<div class="desc">${desc}</div>` : ""}
        ${
          loading
            ? `<div class="loading-spinner" style="margin-top: 12px;"></div>`
            : ""
        }
      </div>
    `;
  } else if (content instanceof HTMLElement) {
    msgEl.appendChild(content);
  } else {
    msgEl.innerHTML = `<div class="modal-body">${content}</div>`;
  }

  // Nút đóng

  // Thêm các nút hành động
  buttons.forEach(
    ({
      label,
      className = "real",
      onClick,
      id,
      disabled = false,
      closeModal = false,
    }) => {
      const btn = document.createElement("button");
      btn.innerText = label;
      btn.className = className;
      disableButton(btn, disabled);
      if (id) btn.id = id;
      btn.onclick = () => {
        if (!options.preventAutoClose || closeModal) hideModal();
        onClick?.();
      };
      btnContainer.appendChild(btn);
    }
  );
}

function showModalClass() {
  const modal = document.getElementById("reusableModal");
  modal.style.display = "flex";
  modal.offsetHeight; // force reflow
  modal.classList.remove("hide");
  modal.classList.add("show");
}

function hideModal() {
  const modal = document.getElementById("reusableModal");
  modal.classList.remove("show");
  modal.classList.add("hide");
  setTimeout(() => {
    modal.style.display = "none";
  }, 300); // khớp thời gian transition
}

export function ModalRoot() {
  return createPortal(
    <div ref={modalRef} id="reusableModal" className="modal">
      <div className="modal-backdrop"></div>
      <LiquidGlass className="modal-content">
        <p id="modalMessage" ref={msgRef}></p>
        <div className="modal-actions" id="modalButtons" ref={btnRef}></div>
        <button
          id="buttonClose"
          className="close-btn rounded-full"
          onClick={hideModal}
        >
          <span className="spin-hover">✖</span>
        </button>
      </LiquidGlass>
    </div>,
    document.body
  );
}
