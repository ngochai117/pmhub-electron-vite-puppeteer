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
  useState,
} from "react";
import { BindingParams, Pane } from "tweakpane";

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
}

export interface LiquidGlassConfig extends BasePreset {
  theme: "system" | "light" | "dark";
  debug: boolean;
  top: boolean;
}

const base: BasePreset = {
  scale: -180,
  radius: 16,
  border: 0.07,
  lightness: 50,
  displace: 0.2,
  blend: "difference",
  x: "R",
  y: "B",
  alpha: 0.93,
  blur: 11,
  r: 0,
  g: 10,
  b: 20,
  saturation: 1,
  // these are the ones that usually change
  width: 336,
  height: 96,
  frost: 0.05,
};

// const presets: Record<string, BasePreset> = {
//   dock: {
//     ...base,
//     width: 336,
//     height: 96,
//     displace: 0.2,
//     frost: 0.05,
//   },
//   pill: {
//     ...base,
//     width: 200,
//     height: 80,
//     displace: 0,
//     frost: 0,
//     radius: 40,
//   },
//   bubble: {
//     ...base,
//     radius: 70,
//     width: 140,
//     height: 140,
//     displace: 0,
//     frost: 0,
//   },
//   free: {
//     ...base,
//     width: 140,
//     height: 280,
//     radius: 80,
//     border: 0.15,
//     alpha: 0.74,
//     lightness: 60,
//     blur: 10,
//     displace: 0,
//     scale: -300,
//   },
// };

const configDefault: LiquidGlassConfig = {
  ...base,
  theme: "system",
  debug: false,
  top: false,
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
  const [config, setConfig] = useState(configDefault);

  useEffect(() => {
    // buildDisplacementImage();
    gsap.set(document.documentElement, {
      "--radius": config.radius,
      "--frost": config.frost,
      "--output-blur": config.displace,
      "--saturation": config.saturation,
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
    gsap.set("feGaussianBlur", {
      attr: {
        stdDeviation: config.displace,
      },
    });

    document.documentElement.dataset.top = String(config.top);
    document.documentElement.dataset.debug = String(config.debug);
    document.documentElement.dataset.theme = config.theme;
  }, [config]);

  useEffect(() => {
    const ctrl = new Pane({ title: "config", expanded: true });

    const sync = () => {
      const state = ctrl.exportState();
      const newState = extractBindings(state);
      setConfig({ ...newState } as any);
    };

    ctrl.on("change", sync);

    // 🔽 Dùng mảng và loop
    const basicBindings: Binding[] = [
      { key: "debug" },
      { key: "top" },
      {
        key: "theme",
        options: { system: "system", light: "light", dark: "dark" },
        label: "theme",
      },
    ];
    basicBindings.forEach(({ key, ...opts }) => {
      ctrl.addBinding(configDefault, key, opts);
    });

    const settings = ctrl.addFolder({ title: "settings" });

    const settingBindings: Binding[] = [
      { key: "frost", min: 0, max: 1, step: 0.01 },
      { key: "saturation", min: 0, max: 2, step: 0.1 },
      { key: "width", min: 80, max: 500, step: 1, label: "width (px)" },
      { key: "height", min: 35, max: 500, step: 1, label: "height (px)" },
      { key: "radius", min: 0, max: 500, step: 1, label: "radius (px)" },
      { key: "border", min: 0, max: 1, step: 0.01 },
      { key: "alpha", min: 0, max: 1, step: 0.01 },
      { key: "lightness", min: 0, max: 100, step: 1 },
      { key: "blur", min: 0, max: 20, step: 1, label: "input blur" },
      { key: "displace", min: 0, max: 12, step: 0.1, label: "output blur" },
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
      settings.addBinding(configDefault, key, opts)
    );

    const chromatic = settings.addFolder({ title: "chromatic" });
    ["r", "g", "b"].forEach((k) =>
      chromatic.addBinding(configDefault, k as any, {
        min: -100,
        max: 100,
        step: 1,
        label: k === "r" ? "red" : k === "g" ? "green" : "blue",
      })
    );

    return () => {
      ctrl.dispose();
    };
  }, []);

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
