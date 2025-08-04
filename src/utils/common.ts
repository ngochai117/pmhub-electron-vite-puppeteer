export const disableButton = (
  element: HTMLButtonElement,
  disabled: boolean
) => {
  if (!element) {
    return;
  }
  element.disabled = disabled;
  // element.style.cursor = disabled ? "not-allowed" : "pointer";
};
