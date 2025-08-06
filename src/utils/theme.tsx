import { useEffect, useState } from "react";
import { ELECTRON_EVENTS } from "../constants";

export const Theme = {
  system: "system",
  light: "light",
  dark: "dark",
} as const;

export function useSystemTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setTheme(media.matches ? "dark" : "light");
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return theme;
}
export function applyTheme(theme: string) {
  const root = document.documentElement;
  // const body = document.body;

  window.ipcRenderer.send(ELECTRON_EVENTS.SWITCH_THEME, theme);
  // Gán class dark cho Tailwind
  // root.classList.toggle("dark", effectiveTheme === "dark");
  console.log({
    hasDarkClass: document.documentElement.classList.contains("dark"),
    htmlClass: document.documentElement.className,
    bodyClass: document.body.className,
  });
  // Gán data-theme cho CSS custom
  if (theme === Theme.system) {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
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
