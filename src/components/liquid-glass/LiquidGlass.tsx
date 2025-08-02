import { Draggable } from "gsap/Draggable";
import React, {
  CSSProperties,
  memo,
  PropsWithChildren,
  useEffect,
  useId,
  useRef,
} from "react";
import LiquidGlassFilter from "./LiquidGlassFilter";
import "./liquid-glass-styles.css";
import { useEffectiveBorderRadius, useSize } from "../../hooks";
import { useLiquidGlassConfig } from "./context/LiquidGlassConfigProvider";

interface Props extends PropsWithChildren {
  className?: string;
  style?: CSSProperties;
  draggable?: boolean;
}

const LiquidGlass: React.FC<Props> = (props) => {
  const { children, className, style, draggable } = props || {};
  const ref = useRef<HTMLDivElement>(null);

  const size = useSize(ref);
  const borderRadius = useEffectiveBorderRadius(ref);
  const filterId = useId();

  const config = useLiquidGlassConfig();

  useEffect(() => {
    if (draggable) {
      Draggable.create(ref.current, { type: "x,y" });
    } else {
      Draggable.get(ref.current)?.kill?.();
    }
  }, [draggable, ref]);

  const width = size.width;
  const height = size.height;

  return (
    <div
      className={`liquid-glass ${className ? className : ""}`}
      ref={ref}
      style={
        {
          "--filter-url": `url(#${filterId}) saturate(var(--saturation, 1))`,
          ...style,
        } as any
      }
    >
      <div className="background"></div>
      {children}
      <LiquidGlassFilter
        filterId={filterId}
        config={config}
        height={height}
        width={width}
        borderRadius={borderRadius}
      />
    </div>
  );
};

export default memo(LiquidGlass);
