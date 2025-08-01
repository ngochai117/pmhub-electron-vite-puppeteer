import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import React, {
  memo,
  PropsWithChildren,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { Pane } from "tweakpane";
import LiquidGlassFilter from "./LiquidGlassFilter";
import "./styles.css";
import { useSize } from "../../hooks";
import DisplacementSVG from "./DisplacementSVG";
import { random } from "../../utils/CommonUtils";
import { useLiquidGlassConfig } from "./context/LiquidGlassConfigProvider";

interface Props extends PropsWithChildren {}

const LiquidGlass: React.FC<Props> = (props) => {
  const { children } = props || {};
  const { ref, size } = useSize<HTMLDivElement>();
  const filterId = useMemo(() => `filter-${random(1, 100)}`, []);

  const config = useLiquidGlassConfig();
  console.info(`HAI ::: -> LiquidGlass -> config:`, config);

  useEffect(() => {
    gsap.registerPlugin(Draggable);
    Draggable.create(".effect", { type: "x,y" });
  }, []);

  const width = size.width;
  const height = size.height;

  return (
    <>
      <div
        className="effect"
        ref={ref}
        style={{
          backdropFilter: `url(#${filterId}) saturate(var(--saturation, 1))`,
        }}
      >
        {children}
        <LiquidGlassFilter
          filterId={filterId}
          config={config}
          height={height}
          width={width}
        />
      </div>

      <div className="dock-placeholder"></div>
    </>
  );
};

export default memo(LiquidGlass);
