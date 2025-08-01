// import reactLogo from "./assets/react.svg";
// import viteLogo from "/electron-vite.animate.svg";
import "./App.css";
import { DockDisplacementEffect } from "./components/liquid-glass/DockDisplacementEffect";
import { DockTweakControls } from "./components/liquid-glass/DockTweakControls";
import LiquidGlass from "./components/liquid-glass/LiquidGlass";
import { useDockEffect } from "./components/liquid-glass/useDockEffect";

function App() {
  return (
    <div>
      <LiquidGlass />
    </div>
  );
}

export default App;
