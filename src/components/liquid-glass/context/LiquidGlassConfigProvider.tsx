/* eslint-disable react-refresh/only-export-components */
import gsap from "gsap";
import {
  createContext,
  FC,
  FunctionComponent,
  memo,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BindingParams, Pane } from "tweakpane";
import LiquidGlass from "../LiquidGlass";
import { applyTheme, Theme } from "../../../utils/theme";

interface BasePreset {
  scale: number;
  radius: number;
  border: number;
  lightness: number;
  displace: number;
  blend: string;
  x: "R" | "G" | "B";
  y: "R" | "G" | "B";
  alpha: number;
  blur: number;
  r: number;
  g: number;
  b: number;
  saturation: number;
  width: number;
  height: number;
  bgOpacity: number;
  bdBlur: number;
}

export interface LiquidGlassConfig extends BasePreset {
  theme: "system" | "light" | "dark";
  debug: boolean;
  top: boolean;
  demo: boolean;
}

const base: BasePreset = {
  scale: -180,
  radius: 16,
  border: 0.02,
  lightness: 50,
  displace: 0,
  blend: "difference",
  x: "R",
  y: "B",
  alpha: 0.93,
  blur: 3,
  r: 0,
  g: 10,
  b: 20,
  saturation: 1,
  bdBlur: 1,
  width: 336,
  height: 96,
  bgOpacity: 0.1,
};

const configDefault: LiquidGlassConfig = {
  ...base,
  theme: Theme.system,
  debug: false,
  top: false,
  demo: false,
};

type FlatConfig = Record<string, any>;

type Binding = BindingParams & {
  key: keyof LiquidGlassConfig;
  label?: string;
};

function extractBindings(node: any): FlatConfig {
  const result: FlatConfig = {};

  const traverse = (item: any) => {
    if (item.binding && item.binding.key) {
      result[item.binding.key] = item.binding.value;
    }

    if (Array.isArray(item.children)) {
      item.children.forEach(traverse);
    }
  };

  traverse(node);

  return result;
}

const useConfig = () => {
  const savedConfig = useMemo(() => {
    const savedString = localStorage.getItem("config");
    if (savedString) return JSON.parse(savedString) as LiquidGlassConfig;
    return { ...configDefault };
  }, []);

  const [lastConfig, setLastConfig] = useState(savedConfig);

  const [config, setConfig] = useState(savedConfig);

  useEffect(() => {
    gsap.set(document.documentElement, {
      "--radius": config.radius,
      "--bg-opacity": config.bgOpacity,
      // "--output-blur": config.displace,
      "--saturation": config.saturation,
      "--width": config.width,
      "--height": config.height,
      "--bd-blur": config.bdBlur,
    });

    document.documentElement.dataset.top = String(config.top);
    document.documentElement.dataset.debug = String(config.debug);
    // document.documentElement.dataset.theme = config.theme;
    applyTheme(config.theme);
  }, [config]);

  useEffect(() => {
    const isDev = process.env.NODE_ENV === "development";

    const ctrl = new Pane({ title: "setting", expanded: false });

    const sync = () => {
      const state = ctrl.exportState();
      const newState = extractBindings(state);

      setConfig((prev) => {
        const newConfig = { ...prev, ...newState };
        localStorage.setItem("config", JSON.stringify(newConfig));
        // console.info(`HAI ::: -> sync -> newConfig:`, newConfig);
        return newConfig;
      });
    };

    ctrl.on("change", sync);

    ctrl
      .addButton({ title: "Reset", label: "Reset Config" })
      .on("click", () => {
        localStorage.setItem("config", JSON.stringify(configDefault));
        setConfig({ ...configDefault });
        setLastConfig({ ...configDefault });
      });

    // 🔽 Dùng mảng và loop
    const basicBindings: Binding[] = isDev
      ? [
          { key: "demo" },
          { key: "debug" },
          { key: "theme", options: Theme, label: "theme" },
        ]
      : [{ key: "theme", options: Theme, label: "theme" }];
    basicBindings.forEach(({ key, ...opts }) => {
      ctrl.addBinding(lastConfig, key, opts);
    });

    const settings = ctrl.addFolder({ title: "liquid glass" });

    const settingBindings: Binding[] = [
      { key: "bgOpacity", min: 0, max: 1, step: 0.01, label: "opacity" },
      { key: "saturation", min: 0, max: 2, step: 0.1 },
      { key: "blur", min: 0, max: 20, step: 1, label: "input blur" },
      { key: "bdBlur", min: 0, max: 12, step: 0.1, label: "backdrop blur" },
    ];
    settingBindings.forEach(({ key, ...opts }) =>
      settings.addBinding(lastConfig, key, opts)
    );

    if (isDev) {
      const settingDevBindings: Binding[] = [
        // { key: "displace", min: 0, max: 12, step: 0.1, label: "output blur" },
        { key: "width", min: 80, max: 1000, step: 1, label: "width (px)" },
        { key: "height", min: 35, max: 1000, step: 1, label: "height (px)" },
        { key: "radius", min: 0, max: 500, step: 1, label: "radius (px)" },
        { key: "border", min: 0, max: 1, step: 0.01 },
        { key: "alpha", min: 0, max: 1, step: 0.01 },
        { key: "lightness", min: 0, max: 100, step: 1 },
        { key: "x", label: "channel x", options: { r: "R", g: "G", b: "B" } },
        { key: "y", label: "channel y", options: { r: "R", g: "G", b: "B" } },
        {
          key: "blend",
          label: "blend",
          options: {
            normal: "normal",
            multiply: "multiply",
            screen: "screen",
            overlay: "overlay",
            darken: "darken",
            lighten: "lighten",
            "color-dodge": "color-dodge",
            "color-burn": "color-burn",
            "hard-light": "hard-light",
            "soft-light": "soft-light",
            difference: "difference",
            exclusion: "exclusion",
            hue: "hue",
            saturation: "saturation",
            color: "color",
            luminosity: "luminosity",
            "plus-darker": "plus-darker",
            "plus-lighter": "plus-lighter",
          },
        },
        { key: "scale", min: -1000, max: 1000, step: 1 },
      ];

      settingDevBindings.forEach(({ key, ...opts }) =>
        settings.addBinding(lastConfig, key, opts)
      );
    }

    // const chromatic = settings.addFolder({ title: "chromatic" });
    // ["r", "g", "b"].forEach((k) =>
    //   chromatic.addBinding(configDefault, k as any, {
    //     min: -100,
    //     max: 100,
    //     step: 1,
    //     label: k === "r" ? "red" : k === "g" ? "green" : "blue",
    //   })
    // );

    return () => {
      ctrl.dispose();
    };
  }, [lastConfig]);

  return config;
};

interface Props extends PropsWithChildren<object> {}

const LiquidGlassConfigContext =
  createContext<LiquidGlassConfig>(configDefault);

export const useLiquidGlassConfig = () => useContext(LiquidGlassConfigContext);

const LiquidGlassConfigProvider: FC<Props> = memo((props) => {
  const { children } = props || {};
  const config = useConfig();

  return (
    <LiquidGlassConfigContext.Provider value={config}>
      {children}
      {config.demo && <LiquidGlass className="demo" draggable></LiquidGlass>}
    </LiquidGlassConfigContext.Provider>
  );
});

export const withLiquidGlassConfig = (
  OriginalComponent: FunctionComponent<any>
) => {
  return function EnhancedWithLiquidGlassConfig(props: any) {
    return (
      <LiquidGlassConfigProvider>
        <OriginalComponent {...props} />
      </LiquidGlassConfigProvider>
    );
  };
};
