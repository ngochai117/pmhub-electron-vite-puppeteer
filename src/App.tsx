// import reactLogo from "./assets/react.svg";
// import viteLogo from "/electron-vite.animate.svg";
import gsap from "gsap";
import "./App.css";
import { withLiquidGlassConfig } from "./components/liquid-glass/context/LiquidGlassConfigProvider";
import LiquidGlass from "./components/liquid-glass/LiquidGlass";
import { memo, useEffect, useRef, useState } from "react";
import { Draggable } from "gsap/Draggable";
import LicenseStatus from "./components/LicenseStatus";
import ProjectsGrid from "./components/ProjectsGrid";
import { ELECTRON_EVENTS } from "./constants";
import { UserData } from "./types/user";
import { LicenseResponseFE } from "./types/license";

gsap.registerPlugin(Draggable);

const AppFC: React.FC = () => {
  const [license, setLicense] = useState<LicenseResponseFE>();
  const [userData, setUserData] = useState<UserData>();

  useEffect(() => {
    window.ipcRenderer.invoke(ELECTRON_EVENTS.GET_USER_DATA).then(setLicense);
    window.ipcRenderer.invoke(ELECTRON_EVENTS.GET_LICENSE).then(setLicense);
  }, []);

  const addProjectRow = () => {
    setUserData({
      ...userData,
      projects: [
        ...(userData?.projects || []),
        { id: String(Math.random()), rate: 0 },
      ],
    });
  };

  const removeProjectRow = (index: number) => {
    setUserData({
      ...userData,
      projects: [...(userData?.projects || [])].filter((_, i) => i !== index),
    });
  };

  const save = () => {
    // Placeholder: To be implemented
    console.log("Save clicked");
  };

  const runNow = () => {
    // Placeholder: To be implemented
    console.log("Run Now clicked");
  };

  return (
    <div className="flex flex-col py-[5%] px-[10%] gap-(--gap)">
      {/* <h1 className="heading">PM Auto Login</h1> */}

      <LicenseStatus license={license} />
      <LiquidGlass className="flex flex-col p-4 gap-(--gap)">
        <div className="wrap-icon">
          <i className="fa-solid fa-user icon-left"></i>
          <input
            className="has-icon-left"
            id="username"
            placeholder="Username"
            value={userData?.username || ""}
            onChange={(e) =>
              setUserData({ ...userData, username: e.target.value })
            }
          />
        </div>

        <div className="wrap-icon">
          <i className="fa-solid fa-lock icon-left"></i>
          <input
            className="has-icon-left"
            id="password"
            placeholder="Password"
            type="password"
            value={userData?.password || ""}
            onChange={(e) =>
              setUserData({ ...userData, password: e.target.value })
            }
          />
        </div>
      </LiquidGlass>

      <ProjectsGrid
        projects={userData?.projects}
        addProjectRow={addProjectRow}
        removeProjectRow={removeProjectRow}
      />

      <div className="flex gap-4">
        <LiquidGlass className="clickable">
          <button
            id="saveBtn"
            onClick={save}
            className="wrap-icon wiggle-hover"
            disabled
          >
            <i className="fa-solid fa-floppy-disk icon-left"></i> Lưu
          </button>
        </LiquidGlass>
        <LiquidGlass className="clickable">
          <button
            id="runBtn"
            onClick={runNow}
            className="wrap-icon wiggle-hover"
          >
            <i className="fa-solid fa-rocket icon-left icon-wiggle"></i> Lưu &
            Chạy ngay
          </button>
        </LiquidGlass>
      </div>
    </div>
  );
};

const App = withLiquidGlassConfig(memo(AppFC));
export default App;
