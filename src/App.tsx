// import reactLogo from "./assets/react.svg";
// import viteLogo from "/electron-vite.animate.svg";
import gsap from "gsap";
import "./App.css";
import { withLiquidGlassConfig } from "./components/liquid-glass/context/LiquidGlassConfigProvider";
import LiquidGlass from "./components/liquid-glass/LiquidGlass";
import { memo } from "react";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

const AppFC: React.FC = () => {
  return (
    <>
      <h1 className="heading">PM Auto Login</h1>
      <input id="username" placeholder="Username" />
      <LiquidGlass className="flex-column border-2">
        <div style={{ width: "100%", minHeight: 50, padding: 20 }}>
          <input id="username" placeholder="Username" />
        </div>
      </LiquidGlass>
      {/* <LiquidGlass style={{}} className="flex-column">
        <input id="password" placeholder="Password" type="password" />
      </LiquidGlass>
      <LiquidGlass style={{ padding: 12 }} className="flex-column">
        <input id="username" placeholder="Username" />
        <input id="password" placeholder="Password" type="password" />
      </LiquidGlass> */}
    </>
  );
};

const App = withLiquidGlassConfig(memo(AppFC));
export default App;
