import React, { memo, useEffect, useRef } from "react";
import "./styles.css";
import gsap from "gsap";

interface Props {
  width: number;
  height: number;
  config: any;
  filterId: string;
}

const LiquidGlassFilter: React.FC<Props> = (props) => {
  const { width, height, config, filterId } = props;
  const refFeImage = useRef<SVGFEImageElement>(null);
  const refDisplacement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const buildDisplacementImage = () => {
      const border = Math.min(width, height) * (config.border * 0.5);
      console.log("size", { width, height });
      const kids = `
    <svg class="displacement-image" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="red" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#0000"/>
          <stop offset="100%" stop-color="red"/>
        </linearGradient>
        <linearGradient id="blue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0000"/>
          <stop offset="100%" stop-color="blue"/>
        </linearGradient>
      </defs>
      <!-- backdrop -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="black"></rect>
      <!-- red linear -->
      <rect x="0" y="0" width="${width}" height="${height}" rx="${
        config.radius
      }" fill="url(#red)" />
      <!-- blue linear -->
      <rect x="0" y="0" width="${width}" height="${height}" rx="${
        config.radius
      }" fill="url(#blue)" style="mix-blend-mode: ${config.blend}" />
      <!-- block out distortion -->
      <rect x="${border}" y="${
        Math.min(width, height) * (config.border * 0.5)
      }" width="${width - border * 2}" height="${height - border * 2}" rx="${
        config.radius
      }" fill="hsl(0 0% ${config.lightness}% / ${
        config.alpha
      }" style="filter:blur(${config.blur}px)" />
    </svg>
    <div class="label">
      <span>displacement image</span>
      <svg viewBox="0 0 97 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M74.568 0.553803C74.0753 0.881909 73.6295 1.4678 73.3713 2.12401C73.1367 2.70991 72.3858 4.67856 71.6584 6.50658C70.9544 8.35803 69.4526 11.8031 68.3498 14.1936C66.1441 19.0214 65.839 20.2167 66.543 21.576C67.4581 23.3337 69.4527 23.9196 71.3064 22.9821C72.4797 22.3728 74.8965 19.5839 76.9615 16.4435C78.8387 13.5843 78.8387 13.6077 78.1113 18.3418C77.3369 23.4275 76.4687 26.2866 74.5915 30.0364C73.254 32.7316 71.8461 34.6299 69.218 37.3485C65.9563 40.6999 62.2254 42.9732 57.4385 44.4965C53.8718 45.6449 52.3935 45.8324 47.2546 45.8324C43.3594 45.8324 42.1158 45.7386 39.9805 45.2933C32.2604 43.7466 25.3382 40.9577 19.4015 36.9735C15.0839 34.0909 12.5028 31.7004 9.80427 27.9975C6.80073 23.9196 4.36038 17.2403 3.72682 11.475C3.37485 8.1471 3.1402 7.32683 2.43624 7.13934C0.770217 6.71749 0.183578 7.77211 0.0193217 11.5219C-0.26226 18.5996 2.55356 27.1304 7.17619 33.1066C13.8403 41.7545 25.432 48.4103 38.901 51.2696C41.6465 51.8555 42.2566 51.9023 47.4893 51.9023C52.3935 51.9023 53.426 51.832 55.5144 51.3867C62.2723 49.9337 68.5375 46.6292 72.949 42.1998C76.0464 39.1296 78.1113 36.2939 79.8946 32.7081C82.1942 28.0912 83.5317 23.3103 84.2591 17.17C84.3999 15.8576 84.6111 14.7795 84.7284 14.7795C84.8223 14.7795 85.4559 15.1311 86.1364 15.5763C88.037 16.7716 90.3835 17.8965 93.5748 19.0918C96.813 20.3339 97.3996 20.287 96.4141 18.9512C94.9123 16.9122 90.055 11.5219 87.1219 8.63926C84.0949 5.66288 83.8368 5.33477 83.5552 4.1864C83.3909 3.48332 83.0155 2.68649 82.6401 2.31151C82.0065 1.6553 80.4109 1.04595 79.9885 1.30375C79.8712 1.37406 79.2845 1.11626 78.6744 0.717845C77.2431 -0.172727 75.7413 -0.243024 74.568 0.553803Z" fill="currentColor"></path>
      </svg>
    </div>
  `;
      refDisplacement.current.innerHTML = kids;

      const svgEl = refDisplacement.current.querySelector(
        ".displacement-image"
      ); // or any other method
      console.log(
        "svg",
        svgEl?.getAttribute("width"),
        svgEl?.getAttribute("height")
      );
      const serialized = new XMLSerializer().serializeToString(svgEl);
      const encoded = encodeURIComponent(serialized);
      const dataUri = `data:image/svg+xml,${encoded}`;

      gsap.set(refFeImage.current, {
        attr: {
          href: dataUri,
        },
      });
      gsap.set("feDisplacementMap", {
        attr: {
          xChannelSelector: config.x,
          yChannelSelector: config.y,
        },
      });
    };
    buildDisplacementImage();
  }, [config, height, width]);

  return (
    <>
      <svg className="filter" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          >
            <feImage
              ref={refFeImage}
              x="0"
              y="0"
              width="100%"
              height="100%"
              result="map"
            ></feImage>

            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              id="redchannel"
              xChannelSelector="R"
              yChannelSelector="G"
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="red"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              id="greenchannel"
              xChannelSelector="R"
              yChannelSelector="G"
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="green"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              id="bluechannel"
              xChannelSelector="R"
              yChannelSelector="G"
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="blue"
            />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur in="output" stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>
      <div className="displacement-debug" ref={refDisplacement}></div>
    </>
  );
};

export default memo(LiquidGlassFilter);
