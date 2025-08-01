// import reactLogo from "./assets/react.svg";
// import viteLogo from "/electron-vite.animate.svg";
import "./App.css";
import { withLiquidGlassConfig } from "./components/liquid-glass/context/LiquidGlassConfigProvider";
import LiquidGlass from "./components/liquid-glass/LiquidGlass";
import { memo } from "react";

const AppFC: React.FC = () => {
  return (
    <div>
      <LiquidGlass>
        <div style={{}}>
          <div
            style={{
              width: 500,
              height: 200,
            }}
          >
            sdsdasdsa
          </div>
        </div>
      </LiquidGlass>
      <LiquidGlass>
        <div>sdsdsdsđs</div>
      </LiquidGlass>
    </div>
  );
};

const App = withLiquidGlassConfig(memo(AppFC));
export default App;
