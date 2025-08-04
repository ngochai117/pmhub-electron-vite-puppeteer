import { useState, useEffect, RefObject } from "react";

export function useSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return size;
}

export function useEffectiveBorderRadius(
  ref: React.RefObject<HTMLElement | null>
): number {
  const el = ref?.current;

  const radius = (() => {
    if (!el) return 0;
    const style = getComputedStyle(el);
    const raw = el.classList.contains("demo")
      ? style.getPropertyValue("--radius")?.trim()
      : style.borderRadius?.trim();
    return raw ? parseFloat(raw) : 0;
  })();

  return radius;
}
