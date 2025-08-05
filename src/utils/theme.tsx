export const Theme = {
  system: "system",
  light: "light",
  dark: "dark",
} as const;

export function getEffectiveTheme(theme: string) {
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const effectiveTheme =
    theme === Theme.system
      ? systemPrefersDark
        ? Theme.dark
        : Theme.light
      : theme;
  return effectiveTheme;
}

export function applyTheme(theme: string) {
  const root = document.documentElement;
  // const body = document.body;

  const effectiveTheme = getEffectiveTheme(theme);

  // window.ipcRenderer.send(ELECTRON_EVENTS.SWITCH_THEME, effectiveTheme);
  // Gán class dark cho Tailwind
  root.classList.toggle("dark", effectiveTheme === "dark");

  // Gán data-theme cho CSS custom
  if (theme === Theme.system) {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", effectiveTheme);
  }

  // ✅ Set background cho body
  // const backgroundImage = document.getElementById("background-image");
  // if (!backgroundImage) return;
  // if (effectiveTheme === "dark") {
  //   backgroundImage.style.background =
  //     "url('https://lh3.googleusercontent.com/rhODm7jWpKv2LG798WhqbrqPuoEfonh7po2NYBUfJ8m9JPyFl_I2wzYe9GloVqln-Hwc-wtRfb1y9mrxVsCZwF0NIg=s1280-w1280-h800') center/cover";
  // } else {
  //   backgroundImage.style.background =
  //     "url('https://storage.googleapis.com/support-forums-api/attachment/thread-198679870-3857371181782048850.png') center/cover";
  // }

  // if (effectiveTheme === "dark") {
  //   setBackgroundSmoothly(
  //     "https://lh3.googleusercontent.com/rhODm7jWpKv2LG798WhqbrqPuoEfonh7po2NYBUfJ8m9JPyFl_I2wzYe9GloVqln-Hwc-wtRfb1y9mrxVsCZwF0NIg=s1280-w1280-h800"
  //   );
  // } else {
  //   setBackgroundSmoothly(
  //     "https://storage.googleapis.com/support-forums-api/attachment/thread-198679870-3857371181782048850.png"
  //   );
  // }
}
