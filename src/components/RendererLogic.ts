// RendererLogic.ts
import { ipcRenderer } from "electron";
import { getCurrentWindow } from "@electron/remote";
import { ELECTRON_EVENTS } from "../constants";
import { renderLicenseStatus } from "./renderer-license";
import { showModal } from "./ModalManager";
import { disableButton } from "../utils/common";

export function updateRemoveButtons() {
  const rows = document.querySelectorAll(".project-row");
  const removeButtons = document.querySelectorAll(".remove-btn");

  const shouldDisable = rows.length <= 1;

  removeButtons.forEach((btn) => {
    if (btn instanceof HTMLButtonElement) {
      btn.style.opacity = shouldDisable ? "0.5" : "1";
      disableButton(btn, shouldDisable);
    }
  });
}

export function addProjectRow(project: { id?: string; rate?: number } = {}) {
  const card = document.createElement("glass-box");
  card.className = "project-card project-row";

  const projectId = document.createElement("input");
  projectId.placeholder = "Project ID";
  projectId.value = project.id || "";
  projectId.classList.add("project-id", "real");

  const rateLog = document.createElement("input");
  rateLog.placeholder = "Rate Log (%)";
  rateLog.type = "number";
  rateLog.min = "0";
  rateLog.max = "100";
  rateLog.value = project.rate?.toString() || "";
  rateLog.classList.add("rate-log", "real");

  const removeBtn = document.createElement("button");
  removeBtn.innerHTML = "✖";
  removeBtn.classList.add("remove-btn", "real");

  removeBtn.onclick = () => {
    card.remove();
    validateForm();
    updateRemoveButtons();
  };

  card.append(projectId, rateLog, removeBtn);
  document.getElementById("projects")?.appendChild(card);
  updateRemoveButtons();
}

export function getFormData() {
  const username = (
    document.getElementById("username") as HTMLInputElement
  ).value.trim();
  const password = (
    document.getElementById("password") as HTMLInputElement
  ).value.trim();

  const rows = document.querySelectorAll(".project-row");
  const projects = Array.from(rows)
    .map((row) => {
      const inputs = row.querySelectorAll("input");
      return {
        id: (inputs[0] as HTMLInputElement).value.trim(),
        rate: parseFloat((inputs[1] as HTMLInputElement).value),
      };
    })
    .filter((p) => p.id);

  return { username, password, projects };
}

export function validateForm() {
  const usernameEl = document.getElementById("username") as HTMLInputElement;
  const passwordEl = document.getElementById("password") as HTMLInputElement;

  const username = usernameEl.value.trim();
  const password = passwordEl.value.trim();

  usernameEl.classList.toggle("error", !username);
  passwordEl.classList.toggle("error", !password);

  const rows = document.querySelectorAll(".project-row");
  let hasProjectError = false;
  let hasAtLeastOneValid = false;

  rows.forEach((row) => {
    const projectIdInput = row.querySelector(".project-id") as HTMLInputElement;
    const rateLogInput = row.querySelector(".rate-log") as HTMLInputElement;

    const projectId = projectIdInput.value.trim();
    const rateLog = rateLogInput.value.trim();
    const rateLogEmpty = rateLog === "" || isNaN(parseFloat(rateLog));

    const isValid = !!projectId && !rateLogEmpty;
    hasAtLeastOneValid ||= isValid;

    projectIdInput.classList.toggle("error", !projectId);
    rateLogInput.classList.toggle("error", rateLogEmpty);

    if (!isValid) hasProjectError = true;
  });

  const valid = username && password && hasAtLeastOneValid && !hasProjectError;
  disableButton(
    document.getElementById("saveBtn") as HTMLButtonElement,
    !valid
  );
  disableButton(document.getElementById("runBtn") as HTMLButtonElement, !valid);
}

export function save(runNow = false) {
  const { username, password, projects } = getFormData();
  ipcRenderer.send(ELECTRON_EVENTS.LOGIN, {
    username,
    password,
    projects,
    runNow,
  });

  if (!runNow) {
    showModal("✅ Đã lưu thành công!", [
      { label: "Tiếp tục", className: "real" },
      {
        label: "Thoát",
        className: "real",
        onClick: () => getCurrentWindow().close(),
      },
    ]);
  }
}

export function runNow() {
  save(true);
}

export function initRendererLogic() {
  const usernameInput = document.getElementById("username") as HTMLInputElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;

  ipcRenderer.invoke(ELECTRON_EVENTS.LOAD_USER_DATA).then((data) => {
    if (data?.projects?.length) {
      data.projects.forEach(addProjectRow);
    } else {
      addProjectRow();
    }

    usernameInput.value = data.username || "";
    passwordInput.value = data.password || "";

    validateForm();
    renderLicenseStatus(data.license);
  });

  renderLicenseStatus();

  usernameInput?.addEventListener("input", validateForm);
  passwordInput?.addEventListener("input", validateForm);
  document.getElementById("projects")?.addEventListener("input", validateForm);

  ipcRenderer.on(ELECTRON_EVENTS.SHOW_ERROR_MODAL, (_event, message) => {
    showModal(message || "Có lỗi xảy ra", [{ label: "OK", className: "real" }]);
  });

  // For global access from HTML if needed
  (window as any).addProjectRow = addProjectRow;
  (window as any).save = save;
  (window as any).runNow = runNow;
}
