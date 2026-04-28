import React, { useEffect, useRef, useState } from "react";
import { useCatCompanion } from "@/hooks/use-cat-companion";

type CatState = "idle" | "walk-left" | "walk-right" | "sleep" | "jump" | "look-at-card";

interface Pos {
  top: number; // px from top
  left: number; // px from left
  flip: boolean; // mirror horizontally
}

// 16x16 pixel-art cat. 1 = body, 2 = ear-inner / nose accent (drawn lighter)
// Minimal silhouette: ears, head, body, tail.
const CAT_PIXELS: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0],
  [0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,0,1,1,1,1,1,1,1,0,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0],
  [0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Sleeping pose (curled)
const CAT_SLEEP: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,1,1,1,2,1,1,1,1,1,1,1,1,1],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

function CatSvg({ sleeping }: { sleeping: boolean }) {
  const grid = sleeping ? CAT_SLEEP : CAT_PIXELS;
  const rects: React.ReactElement[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const v = grid[y][x];
      if (v === 0) continue;
      rects.push(
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill="currentColor"
          opacity={v === 2 ? 0.55 : 1}
        />,
      );
    }
  }
  return (
    <svg
      viewBox="0 0 16 16"
      width="100%"
      height="100%"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rects}
    </svg>
  );
}

function pickSafePosition(): Pos {
  if (typeof window === "undefined") return { top: 100, left: 100, flip: false };
  const w = window.innerWidth;
  const h = window.innerHeight;
  const size = w < 640 ? 56 : 72;
  const margin = 12;

  // Edge zones to avoid the central content column.
  const zones: Array<{ tMin: number; tMax: number; lMin: number; lMax: number }> = [
    // top-left
    { tMin: margin + 60, tMax: Math.max(margin + 60, h * 0.25), lMin: margin, lMax: Math.max(margin, w * 0.18) },
    // top-right
    { tMin: margin + 60, tMax: Math.max(margin + 60, h * 0.25), lMin: w * 0.82 - size, lMax: w - size - margin },
    // bottom-left
    { tMin: h * 0.7, tMax: h - size - margin, lMin: margin, lMax: Math.max(margin, w * 0.2) },
    // bottom-right
    { tMin: h * 0.7, tMax: h - size - margin, lMin: w * 0.8 - size, lMax: w - size - margin },
    // mid-left rail
    { tMin: h * 0.35, tMax: h * 0.6, lMin: margin, lMax: Math.max(margin, w * 0.12) },
    // mid-right rail
    { tMin: h * 0.35, tMax: h * 0.6, lMin: w * 0.88 - size, lMax: w - size - margin },
  ];
  const z = zones[Math.floor(Math.random() * zones.length)];
  const top = z.tMin + Math.random() * Math.max(0, z.tMax - z.tMin);
  const left = z.lMin + Math.random() * Math.max(0, z.lMax - z.lMin);
  return { top, left, flip: Math.random() < 0.5 };
}

function pickAnchorPosition(): Pos | null {
  if (typeof document === "undefined") return null;
  const anchors = Array.from(
    document.querySelectorAll<HTMLElement>("[data-cat-anchor]"),
  ).filter((el) => {
    const r = el.getBoundingClientRect();
    return r.top > 60 && r.bottom < window.innerHeight - 20 && r.width > 0;
  });
  if (anchors.length === 0) return null;
  const target = anchors[Math.floor(Math.random() * anchors.length)];
  const r = target.getBoundingClientRect();
  const size = window.innerWidth < 640 ? 56 : 72;
  // Place to the side of the card, looking at it.
  const onLeft = r.left > size + 16;
  const left = onLeft ? r.left - size - 6 : Math.min(window.innerWidth - size - 8, r.right + 6);
  const top = r.top + r.height / 2 - size / 2;
  return { top, left, flip: !onLeft };
}

const STATES: CatState[] = ["idle", "walk-left", "walk-right", "sleep", "jump", "look-at-card"];

export function PixelCatCompanion() {
  const { enabled } = useCatCompanion();
  const [state, setState] = useState<CatState>("idle");
  const [pos, setPos] = useState<Pos>(() => ({ top: 200, left: 24, flip: false }));
  const [bobFrame, setBobFrame] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<number | null>(null);
  const fadeRef = useRef<number | null>(null);

  // initialize position once mounted
  useEffect(() => {
    if (!enabled) return;
    setPos(pickSafePosition());
  }, [enabled]);

  // stepped bob: slower for idle/sleep, a bit quicker for walking — stays pixel-perfect
  useEffect(() => {
    if (!enabled) return;
    const period = state === "walk-left" || state === "walk-right" ? 320 : 700;
    const id = window.setInterval(() => setBobFrame((f) => (f + 1) % 2), period);
    return () => window.clearInterval(id);
  }, [enabled, state]);

  // schedule random state/position changes — slower, polished cadence
  useEffect(() => {
    if (!enabled) return;

    function schedule() {
      const delay = 12000 + Math.random() * 8000; // 12–20s
      timerRef.current = window.setTimeout(tick, delay);
    }

    function tick() {
      const next = STATES[Math.floor(Math.random() * STATES.length)];
      // Fade out, then teleport to a fresh safe spot, then fade in.
      // This avoids the unnatural sliding across the screen.
      setVisible(false);
      if (fadeRef.current) window.clearTimeout(fadeRef.current);
      fadeRef.current = window.setTimeout(() => {
        if (next === "look-at-card") {
          const p = pickAnchorPosition();
          setPos(p ?? pickSafePosition());
        } else {
          setPos(pickSafePosition());
        }
        setState(next);
        // small beat before fading back in for a calm feel
        fadeRef.current = window.setTimeout(() => setVisible(true), 120);
      }, 650);
      schedule();
    }
    schedule();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (fadeRef.current) window.clearTimeout(fadeRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  const sleeping = state === "sleep";
  const jumping = state === "jump";
  const walking = state === "walk-left" || state === "walk-right";

  const flip = state === "walk-left" ? true : state === "walk-right" ? false : pos.flip;

  // bob is a stepped 2-frame translation (1px) — pixel-art friendly, no smoothing
  const bobY = !sleeping && bobFrame === 1 ? -1 : 0;

  const baseOpacity = sleeping ? 0.75 : 0.95;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-40 text-foreground select-none"
      style={{
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        width: "var(--cat-size, 56px)",
        height: "var(--cat-size, 56px)",
        transition: "opacity 650ms ease-in-out",
        opacity: visible ? baseOpacity : 0,
      }}
    >
      <style>{`
        :root { --cat-size: 56px; }
        @media (min-width: 640px) { :root { --cat-size: 64px; } }
        @keyframes cat-jump {
          0%, 100% { transform: translateY(0); }
          45%      { transform: translateY(-10px); }
          70%      { transform: translateY(-3px); }
        }
        @keyframes cat-sleep-pulse { 0%,100% { opacity: 0.65; } 50% { opacity: 1; } }
        @keyframes cat-walk-bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-1px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cat-anim-jump, .cat-anim-sleep, .cat-anim-walk { animation: none !important; }
        }
      `}</style>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scaleX(${flip ? -1 : 1})`,
          transition: "transform 600ms ease-in-out",
        }}
      >
        <div
          className={
            jumping ? "cat-anim-jump" : walking ? "cat-anim-walk" : sleeping ? "cat-anim-sleep" : ""
          }
          style={{
            width: "100%",
            height: "100%",
            transform: !walking && !jumping && !sleeping ? `translateY(${bobY}px)` : undefined,
            // stepped (no smoothing) for non-animated states keeps the pixel feel
            transition: "none",
            animation: jumping
              ? "cat-jump 900ms ease-out"
              : walking
                ? "cat-walk-bob 320ms steps(2, end) infinite"
                : sleeping
                  ? "cat-sleep-pulse 2.8s ease-in-out infinite"
                  : undefined,
          }}
        >
          <CatSvg sleeping={sleeping} />
        </div>
      </div>
      {sleeping && (
        <span
          style={{
            position: "absolute",
            top: -6,
            right: -2,
            fontSize: 10,
            fontFamily: "monospace",
            color: "var(--color-muted-foreground)",
            animation: "cat-sleep-pulse 2.8s ease-in-out infinite",
          }}
        >
          z
        </span>
      )}
    </div>
  );
}

