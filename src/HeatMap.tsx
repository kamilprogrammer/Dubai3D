import h337 from "heatmap.js";
import { useEffect, useRef } from "react";

export const temps: { x: number; z: number; value: string; id: number }[] = [
  {
    id: 1,
    x: 620,
    z: 100,
    value: "25 C°",
  },
  {
    id: 2,
    x: 610,
    z: 180,
    value: "27 C°",
  },
  {
    id: 3,
    x: 700,
    z: 180,
    value: "22 C°",
  },
  {
    id: 4,
    x: 880,
    z: 2,
    value: "34 C°",
  },
  {
    id: 5,
    x: 900,
    z: 200,
    value: "34 C°",
  },
  {
    id: 6,
    x: 960,
    z: 190,
    value: "29 C°",
  },
  {
    id: 7,
    x: 960,
    z: 240,
    value: "30 C°",
  },
  {
    id: 8,
    x: 850,
    z: 220,
    value: "24 C°",
  },
  {
    id: 9,
    x: 910,
    z: 230,
    value: "28 C°",
  },
  {
    id: 10,
    x: 760,
    z: 224,
    value: "23 C°",
  },
  {
    id: 11,
    x: 830,
    z: 174,
    value: "22 C°",
  },
  {
    id: 12,
    x: 680,
    z: 224,
    value: "23 C°",
  },
  {
    id: 13,
    x: 930,
    z: 90,
    value: "27 C°",
  },
  {
    id: 14,
    x: 870,
    z: 90,
    value: "26 C°",
  },
  {
    id: 15,
    x: 778,
    z: 60,
    value: "24 C°",
  },
  {
    id: 16,
    x: 820,
    z: -10,
    value: "27 C°",
  },
  {
    id: 17,
    x: 720,
    z: -20,
    value: "23 C°",
  },
  {
    id: 18,
    x: 682,
    z: 60,
    value: "24 C°",
  },
];

export function HeatLayer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heatmap = h337.create({
      container: containerRef.current!,
      radius: 60,
      maxOpacity: 0.5,
      blur: 1,
    });

    // Optional: clear existing canvas if somehow duplicated
    const canvases = containerRef.current?.querySelectorAll("canvas");
    if (canvases && canvases.length > 1) {
      canvases.forEach((c, i) => {
        if (i !== canvases.length - 1) containerRef.current?.removeChild(c);
      });
    }

    heatmap.setData({ min: 0, max: 0, data: [] });

    heatmap.setData({
      min: 0,
      max: 30,
      data: [
        // --------------
        { x: 520, y: 140, value: 18 },
        { x: 545, y: 160, value: 16 },
        { x: 495, y: 120, value: 16 },
        { x: 545, y: 160, value: 16 },
        { x: 495, y: 120, value: 16 },

        { x: 520, y: 280, value: 18 },
        { x: 545, y: 260, value: 13 },
        { x: 495, y: 220, value: 13 },
        { x: 545, y: 260, value: 13 },
        { x: 495, y: 220, value: 13 },
        // --------------

        // --------------
        { x: 680, y: 280, value: 18 },
        { x: 680, y: 260, value: 16 },
        { x: 680, y: 220, value: 16 },
        { x: 680, y: 260, value: 16 },
        { x: 680, y: 220, value: 16 },

        { x: 680, y: 140, value: 20 },
        // --------------

        // --------------
        { x: 830, y: 140, value: 18 },
        { x: 860, y: 280, value: 18 },
        { x: 1240, y: 280, value: 18 },

        // --------------

        // --------------
        { x: 1060, y: 140, value: 18 },
        { x: 745, y: 500, value: 20 },
        { x: 600, y: 500, value: 20 },

        // --------------

        // --------------
        { x: 1250, y: 140, value: 18 },
        { x: 880, y: 800, value: 22 },
        // --------------

        // --------------
        { x: 1250, y: 600, value: 18 },
        { x: 1000, y: 600, value: 18 },
        // --------------

        // --------------
        { x: 1450, y: 500, value: 18 },
        { x: 1430, y: 300, value: 20 },
        // --------------

        // --------------
        { x: 1180, y: 840, value: 18 },

        { x: 780, y: 800, value: 30 },

        { x: 780, y: 760, value: 26 },
        { x: 740, y: 760, value: 26 },

        // --------------
      ],
    });

    return () => {
      heatmap.setData({ min: 0, max: 0, data: [] }); // Clean when component unmounts
    };
  }, []);
  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
}
