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
  frost: number;
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
  bdBlur: 2,
  width: 336,
  height: 96,
  frost: 0.33,
};

const configDefault: LiquidGlassConfig = {
  ...base,
  theme: "system",
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

function applyTheme(theme: "light" | "dark" | "system") {
  const root = document.documentElement;
  const body = document.body;

  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const effectiveTheme =
    theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme;

  // Gán class dark cho Tailwind
  root.classList.toggle("dark", effectiveTheme === "dark");

  // Gán data-theme cho CSS custom
  if (theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }

  // ✅ Set background cho body
  if (effectiveTheme === "dark") {
    body.style.background =
      "url('https://lh3.googleusercontent.com/rhODm7jWpKv2LG798WhqbrqPuoEfonh7po2NYBUfJ8m9JPyFl_I2wzYe9GloVqln-Hwc-wtRfb1y9mrxVsCZwF0NIg=s1280-w1280-h800') center/cover";
  } else {
    body.style.background =
      "url('https://storage.googleapis.com/support-forums-api/attachment/thread-198679870-3857371181782048850.png')  center/cover";
  }
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
    // buildDisplacementImage();
    gsap.set(document.documentElement, {
      "--radius": config.radius,
      "--frost": config.frost,
      // "--output-blur": config.displace,
      "--saturation": config.saturation,
      "--width": config.width,
      "--height": config.height,
      "--bd-blur": config.bdBlur,
    });
    gsap.set("feDisplacementMap", {
      attr: {
        scale: config.scale,
        xChannelSelector: config.x,
        yChannelSelector: config.y,
      },
    });
    gsap.set("#redchannel", {
      attr: {
        scale: config.scale + config.r,
      },
    });
    gsap.set("#greenchannel", {
      attr: {
        scale: config.scale + config.g,
      },
    });
    gsap.set("#bluechannel", {
      attr: {
        scale: config.scale + config.b,
      },
    });
    // gsap.set("feGaussianBlur", {
    //   attr: {
    //     stdDeviation: config.displace,
    //   },
    // });

    document.documentElement.dataset.top = String(config.top);
    document.documentElement.dataset.debug = String(config.debug);
    // document.documentElement.dataset.theme = config.theme;
    applyTheme(config.theme);
  }, [config]);

  useEffect(() => {
    const ctrl = new Pane({ title: "config", expanded: false });

    const sync = () => {
      const state = ctrl.exportState();
      const newState = extractBindings(state);

      setConfig((prev) => {
        const newConfig = { ...prev, ...newState };
        localStorage.setItem("config", JSON.stringify(newConfig));
        console.info(`HAI ::: -> sync -> newConfig:`, newConfig);
        return newConfig;
      });
    };

    ctrl.on("change", sync);

    const btn = ctrl.addButton({
      title: "Reset",
      label: "Reset",
    });

    // 🔽 Dùng mảng và loop
    const basicBindings: Binding[] = [
      { key: "demo" },
      { key: "debug" },
      { key: "top" },
      {
        key: "theme",
        options: { system: "system", light: "light", dark: "dark" },
        label: "theme",
      },
    ];
    basicBindings.forEach(({ key, ...opts }) => {
      ctrl.addBinding(lastConfig, key, opts);
    });

    const settings = ctrl.addFolder({ title: "settings" });

    const settingBindings: Binding[] = [
      { key: "frost", min: 0, max: 1, step: 0.01 },
      { key: "saturation", min: 0, max: 2, step: 0.1 },
      { key: "width", min: 80, max: 1000, step: 1, label: "width (px)" },
      { key: "height", min: 35, max: 1000, step: 1, label: "height (px)" },
      { key: "radius", min: 0, max: 500, step: 1, label: "radius (px)" },
      { key: "border", min: 0, max: 1, step: 0.01 },
      { key: "alpha", min: 0, max: 1, step: 0.01 },
      { key: "lightness", min: 0, max: 100, step: 1 },
      { key: "blur", min: 0, max: 20, step: 1, label: "input blur" },
      // { key: "displace", min: 0, max: 12, step: 0.1, label: "output blur" },
      { key: "bdBlur", min: 0, max: 12, step: 0.1, label: "backdrop blur" },
      {
        key: "x",
        label: "channel x",
        options: { r: "R", g: "G", b: "B" },
      },
      {
        key: "y",
        label: "channel y",
        options: { r: "R", g: "G", b: "B" },
      },
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
    settingBindings.forEach(({ key, ...opts }) =>
      settings.addBinding(lastConfig, key, opts)
    );

    // const chromatic = settings.addFolder({ title: "chromatic" });
    // ["r", "g", "b"].forEach((k) =>
    //   chromatic.addBinding(configDefault, k as any, {
    //     min: -100,
    //     max: 100,
    //     step: 1,
    //     label: k === "r" ? "red" : k === "g" ? "green" : "blue",
    //   })
    // );

    btn.on("click", () => {
      localStorage.setItem("config", JSON.stringify(configDefault));
      setConfig({ ...configDefault });
      setLastConfig({ ...configDefault });
    });

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
