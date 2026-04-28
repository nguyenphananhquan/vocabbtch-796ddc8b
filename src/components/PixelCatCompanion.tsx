import React, { useEffect, useRef, useState } from "react";
import { useCatCompanion } from "@/hooks/use-cat-companion";

type CatState = "idle" | "walk" | "sleep" | "jump";
type Dir = -1 | 1;

// ---- Pixel sprite (16x16) ----------------------------------------------
// 0 transparent, 1 outline (black), 2 fill (white)
// Two frames per state for stepped 2-frame animation.

// prettier-ignore
const IDLE_A: number[][] = [
  [0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0],
  [0,1,2,1,0,0,0,0,0,0,0,0,1,2,1,0],
  [0,1,2,2,1,1,1,1,1,1,1,1,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,1,2,2,2,2,2,2,2,2,1,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,1,2,2,1,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,1,1,2,2,1,1,1,1,2,2,1,1,1,0],
  [0,0,0,1,2,2,1,0,0,1,2,2,1,0,0,0],
  [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
];

// idle frame B: tail flicks up
// prettier-ignore
const IDLE_B: number[][] = [
  [0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1],
  [0,1,2,1,0,0,0,0,0,0,0,0,1,2,1,1],
  [0,1,2,2,1,1,1,1,1,1,1,1,2,2,1,1],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,1,2,2,2,2,2,2,2,2,1,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,1,2,2,1,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,1,1,2,2,1,1,1,1,2,2,1,1,1,0],
  [0,0,0,1,2,2,1,0,0,1,2,2,1,0,0,0],
  [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
];

// walk frame A: front legs forward, back legs back
// prettier-ignore
const WALK_A: number[][] = [
  [0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0],
  [0,1,2,1,0,0,0,0,0,0,0,0,1,2,1,0],
  [0,1,2,2,1,1,1,1,1,1,1,1,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,1,2,2,2,2,2,2,2,2,1,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,1,2,2,1,2,2,2,2,1,1],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,0,1,1,1,2,2,1,1,2,2,1,1,1,0,0],
  [0,1,2,2,1,0,1,2,2,1,0,1,2,2,1,0],
  [0,1,1,1,0,0,1,1,1,1,0,0,1,1,1,0],
];

// walk frame B: legs swapped
// prettier-ignore
const WALK_B: number[][] = [
  [0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0],
  [0,1,2,1,0,0,0,0,0,0,0,0,1,2,1,0],
  [0,1,2,2,1,1,1,1,1,1,1,1,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,1,2,2,2,2,2,2,2,2,1,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,1,2,2,1,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,1,1,2,2,1,1,2,2,1,1,1,1,0,0],
  [0,1,2,2,1,0,0,1,2,2,1,0,1,2,2,1],
  [0,1,1,1,0,0,0,1,1,1,0,0,1,1,1,1],
];

// sleep frame A: lying down, eyes closed (—  —)
// prettier-ignore
const SLEEP_A: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0],
  [0,0,1,1,0,0,0,0,0,0,0,1,1,2,2,1],
  [0,1,2,2,1,1,1,1,1,1,1,2,2,2,2,1],
  [1,2,1,1,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,2,2,2,1,1,2,2,1,1,2,2,2,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// sleep frame B: tiny breath bob
// prettier-ignore
const SLEEP_B: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0],
  [0,0,1,1,0,0,0,0,0,0,0,1,1,2,2,1],
  [0,1,2,2,1,1,1,1,1,1,1,2,2,2,2,1],
  [1,2,1,1,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,2,2,2,1,1,2,2,1,1,2,2,2,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const W = 16;
const H = 16;
const PALETTE: Record<number, string> = {
  1: "#1a1a1a",
  2: "#ffffff",
};

function gridToSvg(grid: number[][], key: string) {
  const rects: React.ReactElement[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const v = grid[y][x];
      if (v === 0) continue;
      rects.push(
        <rect
          key={`${key}-${x}-${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={PALETTE[v] ?? "#1a1a1a"}
        />,
      );
    }
  }
  return rects;
}

function CatSprite({ state, frame }: { state: CatState; frame: 0 | 1 }) {
  let grid: number[][];
  if (state === "sleep") grid = frame === 0 ? SLEEP_A : SLEEP_B;
  else if (state === "walk") grid = frame === 0 ? WALK_A : WALK_B;
  else grid = frame === 0 ? IDLE_A : IDLE_B; // idle + jump share idle frames
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ imageRendering: "pixelated" }}
    >
      {gridToSvg(grid, state + frame)}
    </svg>
  );
}

// ---- Movement helpers ---------------------------------------------------

const STEP_PX = 8; // discrete pixel step

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getBounds() {
  if (typeof window === "undefined") {
    return { minX: 0, maxX: 800, minY: 0, maxY: 600, size: 56 };
  }
  const size = window.innerWidth < 640 ? 48 : 64;
  const margin = 8;
  return {
    minX: margin,
    maxX: window.innerWidth - size - margin,
    minY: 80,
    maxY: window.innerHeight - size - margin,
    size,
  };
}

function randomEdgePos() {
  const b = getBounds();
  // Prefer edges so the cat doesn't sit in the middle of the content.
  const onLeft = Math.random() < 0.5;
  const x = onLeft
    ? b.minX + Math.random() * Math.min(120, b.maxX - b.minX)
    : b.maxX - Math.random() * Math.min(120, b.maxX - b.minX);
  const y = b.minY + Math.random() * (b.maxY - b.minY);
  // Snap to step grid for that pixel-perfect feel
  return {
    x: Math.round(x / STEP_PX) * STEP_PX,
    y: Math.round(y / STEP_PX) * STEP_PX,
  };
}

// ---- Component ----------------------------------------------------------

export function PixelCatCompanion() {
  const { enabled } = useCatCompanion();
  const [state, setState] = useState<CatState>("idle");
  const [frame, setFrame] = useState<0 | 1>(0);
  const [pos, setPos] = useState(() => randomEdgePos());
  const [dir, setDir] = useState<Dir>(1);
  const stateTimer = useRef<number | null>(null);
  const walkTimer = useRef<number | null>(null);

  // Sprite frame ticker — stepped, no smoothing.
  useEffect(() => {
    if (!enabled) return;
    const period =
      state === "walk" ? 220 : state === "sleep" ? 1400 : 700;
    const id = window.setInterval(
      () => setFrame((f) => (f === 0 ? 1 : 0)),
      period,
    );
    return () => window.clearInterval(id);
  }, [enabled, state]);

  // Behavior loop: pick a state, do it for a while, pick another.
  useEffect(() => {
    if (!enabled) return;

    function clearTimers() {
      if (stateTimer.current) window.clearTimeout(stateTimer.current);
      if (walkTimer.current) window.clearInterval(walkTimer.current);
      stateTimer.current = null;
      walkTimer.current = null;
    }

    function pickNext() {
      clearTimers();
      const roll = Math.random();
      let next: CatState;
      if (roll < 0.4) next = "idle";
      else if (roll < 0.75) next = "walk";
      else if (roll < 0.9) next = "sleep";
      else next = "jump";

      if (next === "jump") {
        // Instant teleport — no smooth movement.
        setPos(randomEdgePos());
        setDir(Math.random() < 0.5 ? -1 : 1);
        setState("idle");
        stateTimer.current = window.setTimeout(pickNext, 1500 + Math.random() * 1500);
        return;
      }

      if (next === "walk") {
        const newDir: Dir = Math.random() < 0.5 ? -1 : 1;
        setDir(newDir);
        setState("walk");
        // Discrete stepped movement: 8px every 220ms (matches frame swap).
        walkTimer.current = window.setInterval(() => {
          setPos((p) => {
            const b = getBounds();
            const nx = clamp(p.x + newDir * STEP_PX, b.minX, b.maxX);
            return { x: nx, y: p.y };
          });
        }, 220);
        // Walk 2.5–5s then stop
        stateTimer.current = window.setTimeout(() => {
          if (walkTimer.current) window.clearInterval(walkTimer.current);
          walkTimer.current = null;
          setState("idle");
          stateTimer.current = window.setTimeout(pickNext, 1500 + Math.random() * 2000);
        }, 2500 + Math.random() * 2500);
        return;
      }

      // idle or sleep
      setState(next);
      const dur =
        next === "sleep" ? 6000 + Math.random() * 4000 : 2500 + Math.random() * 2500;
      stateTimer.current = window.setTimeout(pickNext, dur);
    }

    pickNext();
    return clearTimers;
  }, [enabled]);

  // Re-clamp on resize so the cat never gets stuck off-screen.
  useEffect(() => {
    if (!enabled) return;
    function onResize() {
      const b = getBounds();
      setPos((p) => ({
        x: clamp(p.x, b.minX, b.maxX),
        y: clamp(p.y, b.minY, b.maxY),
      }));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-40 select-none"
      style={{
        // Discrete movement: NO transition.
        top: `${pos.y}px`,
        left: `${pos.x}px`,
        width: "var(--cat-size, 56px)",
        height: "var(--cat-size, 56px)",
        transition: "none",
        imageRendering: "pixelated",
      }}
    >
      <style>{`
        :root { --cat-size: 48px; }
        @media (min-width: 640px) { :root { --cat-size: 64px; } }
      `}</style>
      <div
        style={{
          width: "100%",
          height: "100%",
          // Mirror by walking direction. No transition — instant flip.
          transform: `scaleX(${dir === -1 ? -1 : 1})`,
          transition: "none",
        }}
      >
        <CatSprite state={state} frame={frame} />
      </div>
      {state === "sleep" && (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            fontSize: 10,
            fontFamily: "monospace",
            color: "#1a1a1a",
            // Stepped blink, no easing.
            animation: "cat-z-blink 1.4s steps(2) infinite",
          }}
        >
          z
        </span>
      )}
      <style>{`
        @keyframes cat-z-blink {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
