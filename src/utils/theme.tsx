import { MediaHTMLAttributes, useEffect, useState } from "react";
import { ELECTRON_EVENTS } from "../constants";
import darkVideo from "../assets/video-corgi-dark.mp4";
// import lightVideo from "../assets/video-corgi-light-2.mp4";

export const Theme = {
  system: "system",
  light: "light",
  dark: "dark",
} as const;

function useSystemTheme(): "light" | "dark" {
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

  //update for electron + tailwind
  window.ipcRenderer.send(ELECTRON_EVENTS.SWITCH_THEME, theme);
  // Gán class dark cho Tailwind
  // root.classList.toggle("dark", effectiveTheme === "dark");
  // Gán data-theme cho CSS custom
  if (theme === Theme.system) {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

const duration = 300;

const videoBase: Partial<MediaHTMLAttributes<HTMLVideoElement>> = {
  style: {
    width: "100vw",
    height: "100vh",
    objectFit: "fill", // you can change to 'cover' if you prefer no stretching
    display: "block",
    willChange: "opacity",
  },
  autoPlay: true,
  muted: true,
  loop: true,
  playsInline: true,
  className: "fixed inset-0 pointer-events-none",
};

export function ThemeBackground() {
  const theme = useSystemTheme();

  // const backgroundImage =
  //   theme === Theme.dark
  //     ? "https://i.pinimg.com/1200x/b8/1d/48/b81d48a7f323e4c85775f41114cb3b65.jpg"
  //     : "https://i.pinimg.com/1200x/8f/b1/38/8fb138947d35d4bf2493904484a4a77f.jpg";

  return (
    <>
      {/* fall back background color */}
      {/* <div
        className="fixed inset-0 pointer-events-none z-[-99999]"
        style={{
          background: "light-dark(#ffffff, #000000)",
          transition: `background-color ${duration}ms ease`,
        }}
      /> */}
      {/* <div
        className="z-[-999] fixed inset-0 pointer-events-none"
        style={{
          transition: `background ${duration}ms ease`,
          background: `url('${backgroundImage}') center/cover`,
        }}
      ></div> */}

      <div
        className="z-[-999] fixed inset-0 pointer-events-none"
        style={{
          transition: `opacity ${duration}ms ease`,
          background: `url('https://i.pinimg.com/1200x/8f/b1/38/8fb138947d35d4bf2493904484a4a77f.jpg') center/cover`,
          opacity: theme === Theme.light ? 1 : 0,
        }}
      ></div>

      <div
        className="z-[-999] fixed inset-0 pointer-events-none"
        style={{
          transition: `opacity ${duration}ms ease`,
          opacity: theme === Theme.dark ? 1 : 0,
        }}
      >
        <video {...videoBase} src={darkVideo}></video>
      </div>
    </>
  );
}
