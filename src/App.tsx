// import reactLogo from "./assets/react.svg";
// import viteLogo from "/electron-vite.animate.svg";
import gsap from "gsap";
import "./App.css";
import {
  LiquidGlassConfig,
  withLiquidGlassConfig,
} from "./components/liquid-glass/context/LiquidGlassConfigProvider";
import LiquidGlass from "./components/liquid-glass/LiquidGlass";
import { memo } from "react";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

const glassButtonConfig: Partial<LiquidGlassConfig> = {
  displace: 2,
};

const AppFC: React.FC = () => {
  return (
    <div className="flex flex-col py-[5%] px-[10%] gap-4">
      <h1 className="heading">PM Auto Login</h1>
      <LiquidGlass className="flex flex-col px-6 py-4 gap-3">
        <input id="username" placeholder="Username" />
        <input id="password" placeholder="Password" type="password" />
      </LiquidGlass>
      <LiquidGlass className="clickable" config={glassButtonConfig}>
        <button type="button" className="flex">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Thêm project
        </button>
      </LiquidGlass>

      <div className="flex gap-4">
        <LiquidGlass className="clickable" config={glassButtonConfig}>
          <button id="saveBtn" onclick="save()" disabled>
            💾 Lưu
          </button>
        </LiquidGlass>
        <LiquidGlass className="clickable" config={glassButtonConfig}>
          <button id="runBtn" onclick="runNow()" disabled>
            🚀 Lưu & Chạy ngay
          </button>
        </LiquidGlass>
      </div>
    </div>
  );
};

const App = withLiquidGlassConfig(memo(AppFC));
export default App;
