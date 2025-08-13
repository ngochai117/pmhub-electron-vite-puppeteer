// import reactLogo from "./assets/react.svg";
// import viteLogo from "/electron-vite.animate.svg";
import gsap from "gsap";
import "./App.css";
import {
  useLiquidGlassConfig,
  withLiquidGlassConfig,
} from "./components/liquid-glass/context/LiquidGlassConfigProvider";
import LiquidGlass from "./components/liquid-glass/LiquidGlass";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Draggable } from "gsap/Draggable";
import LicenseStatus from "./components/LicenseStatus";
import ProjectsGrid from "./components/ProjectsGrid";
import { ELECTRON_EVENTS } from "./constants";
import { Project, UserData } from "./types/user";
import { LicenseResponseFE } from "./types/license";
import { getNumber } from "./utils/data";
import { ThemeBackground } from "./utils/theme";
import InfoModal from "./components/InfoModal";
import { InfoModalOptions } from "./types/modal";
import { translate } from "./utils/localize";

gsap.registerPlugin(Draggable);

const AppFC: React.FC = () => {
  const { bgOpacity } = useLiquidGlassConfig();
  const [infoModalOptions, setInfoModalOptions] = useState<InfoModalOptions>();

  const [license, setLicense] = useState<LicenseResponseFE>();
  const [userData, setUserData] = useState<UserData>();
  const { valid } = license || {};

  const projectsValid = useMemo(
    () => userData?.projects?.filter((p) => p.id && getNumber(p.rate) > 0),
    [userData?.projects]
  );

  useEffect(() => {
    window.ipcRenderer.invoke(ELECTRON_EVENTS.GET_USER_DATA).then(setUserData);
    window.ipcRenderer.invoke(ELECTRON_EVENTS.GET_LICENSE).then(setLicense);
  }, []);

  useEffect(() => {
    const handle = (_: any, params: any) => {
      setInfoModalOptions(params ? { cta: {}, ...params } : undefined);
    };
    window.ipcRenderer.on(ELECTRON_EVENTS.SHOW_MODAL, handle);

    return () => {
      window.ipcRenderer?.removeListener(ELECTRON_EVENTS.SHOW_MODAL, handle);
    };
  }, []);

  const onActivateSuccess = useCallback(() => {
    window.ipcRenderer.invoke(ELECTRON_EVENTS.GET_LICENSE).then(setLicense);
  }, []);

  const updateProjects = (projects: Project[]) => {
    setUserData({ ...userData, projects });
  };

  const save = () => {
    window.ipcRenderer.send(ELECTRON_EVENTS.LOGIN, userData);
  };

  const logTime = () => {
    window.ipcRenderer.send(ELECTRON_EVENTS.LOGIN, {
      ...userData,
      action: "logTime",
    });
  };

  const deleteLog = () => {
    setInfoModalOptions({
      title: translate("delete_all_log"),
      desc: translate("delete_all_confirm_desc"),
      type: "warning",
      cta: {
        title: "Xoá",
        onClick: () => {
          setInfoModalOptions(undefined);
          window.ipcRenderer.send(ELECTRON_EVENTS.LOGIN, {
            ...userData,
            action: "deleteLog",
          });
        },
      },
    });
  };

  const validSave = !!(
    userData?.username &&
    userData?.password &&
    projectsValid &&
    projectsValid?.length > 0
  );
  const validRun = valid && validSave;
  const validDeleteLog = valid && !!(userData?.username && userData?.password);

  return (
    <>
      <ThemeBackground />
      <div className="flex flex-col py-[5%] px-[10%] gap-(--gap)">
        {/* <h1 className="heading">PM Auto Log Work</h1> */}

        <LicenseStatus
          license={license}
          onActivateSuccess={onActivateSuccess}
        />
        <LiquidGlass className="flex flex-col p-4 gap-(--gap)">
          <div className="wrap-icon">
            <i className="fa-solid fa-user icon-left"></i>
            <input
              className="has-icon-left"
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

        <div className="flex justify-between gap-4">
          <div className="flex gap-4">
            <LiquidGlass className={`clickable ${validSave ? "" : "disabled"}`}>
              <button
                onClick={save}
                className="wrap-icon"
                disabled={!validSave}
              >
                <i className="fa-solid fa-floppy-disk icon-left wiggle-hover"></i>
                {translate("save")}
              </button>
            </LiquidGlass>
            <LiquidGlass className={`clickable ${validRun ? "" : "disabled"}`}>
              <button
                onClick={logTime}
                className="wrap-icon"
                disabled={!validRun}
              >
                <i className="fa-solid fa-rocket icon-left icon-wiggle wiggle-hover"></i>
                {translate("save_and_log")}
              </button>
            </LiquidGlass>
          </div>
          <LiquidGlass
            className={`clickable ${validRun ? "" : "disabled"}`}
            style={
              {
                "--bg-color": "#ff0000",
                "--bg-opacity": bgOpacity + 0.3,
              } as any
            }
          >
            <button
              onClick={deleteLog}
              className="wrap-icon"
              disabled={!validDeleteLog}
            >
              <i className="fa-solid fa-trash icon-left icon-wiggle wiggle-hover"></i>
              {translate("delete_all_log")}
            </button>
          </LiquidGlass>
        </div>
      </div>
      <InfoModal
        open={!!infoModalOptions}
        requestClose={() => setInfoModalOptions(undefined)}
        options={infoModalOptions}
        zIndex={100}
      />
    </>
  );
};

const App = withLiquidGlassConfig(memo(AppFC));
export default App;
