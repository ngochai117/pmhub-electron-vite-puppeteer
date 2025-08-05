// import reactLogo from "./assets/react.svg";
// import viteLogo from "/electron-vite.animate.svg";
import gsap from "gsap";
import "./App.css";
import { withLiquidGlassConfig } from "./components/liquid-glass/context/LiquidGlassConfigProvider";
import LiquidGlass from "./components/liquid-glass/LiquidGlass";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Draggable } from "gsap/Draggable";
import LicenseStatus from "./components/LicenseStatus";
import ProjectsGrid from "./components/ProjectsGrid";
import { ELECTRON_EVENTS } from "./constants";
import { Project, UserData } from "./types/user";
import { LicenseResponseFE } from "./types/license";
import { getNumber } from "./utils/data";

gsap.registerPlugin(Draggable);

const AppFC: React.FC = () => {
  const [license, setLicense] = useState<LicenseResponseFE>();
  const [userData, setUserData] = useState<UserData>();
  const { valid } = license || {};

  const projectsValid = useMemo(
    () => userData?.projects?.filter((p) => p.id && getNumber(p.rate) > 0),
    [userData?.projects]
  );

  useEffect(() => {
    window.ipcRenderer.invoke(ELECTRON_EVENTS.GET_USER_DATA).then(setLicense);
    window.ipcRenderer.invoke(ELECTRON_EVENTS.GET_LICENSE).then(setLicense);
  }, []);

  const onActivateSuccess = useCallback(() => {
    window.ipcRenderer.invoke(ELECTRON_EVENTS.GET_LICENSE).then(setLicense);
  }, []);

  const updateProjects = (projects: Project[]) => {
    setUserData({ ...userData, projects });
  };

  const save = () => {
    // Placeholder: To be implemented
    console.log("Save clicked");
  };

  const runNow = () => {
    // Placeholder: To be implemented
    console.log("Run Now clicked");
  };

  const validSave = !!(
    userData?.username &&
    userData?.password &&
    projectsValid &&
    projectsValid?.length > 0
  );
  const validRun = validSave && valid;

  return (
    <div className="flex flex-col py-[5%] px-[10%] gap-(--gap)">
      {/* <h1 className="heading">PM Auto Login</h1> */}

      <LicenseStatus license={license} onActivateSuccess={onActivateSuccess} />
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
        updateProjects={updateProjects}
      />

      <div className="flex gap-4">
        <LiquidGlass className={`clickable ${validSave ? "" : "disabled"}`}>
          <button
            id="saveBtn"
            onClick={save}
            className="wrap-icon"
            disabled={!validSave}
          >
            <i className="fa-solid fa-floppy-disk icon-left wiggle-hover"></i>
            Lưu
          </button>
        </LiquidGlass>
        <LiquidGlass className={`clickable ${validRun ? "" : "disabled"}`}>
          <button
            id="runBtn"
            onClick={runNow}
            className="wrap-icon"
            disabled={!validRun}
          >
            <i className="fa-solid fa-rocket icon-left icon-wiggle wiggle-hover"></i>
            Lưu & Chạy ngay
          </button>
        </LiquidGlass>
      </div>
    </div>
  );
};

const App = withLiquidGlassConfig(memo(AppFC));
export default App;
