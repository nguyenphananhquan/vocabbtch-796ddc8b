import React, { useEffect, useRef, useState } from "react";
import { useCatCompanion } from "@/hooks/use-cat-companion";
import { CAT_EVENT, type CatActionDetail } from "@/lib/cat-events";

type CatState = "idle" | "walk" | "sleep" | "jump";
type Dir = -1 | 1;
type Reaction =
  | null
  | "jump"
  | "curious"
  | "confused"
  | "sad_sleep"
  | "walk_to"
  | "look"
  | "tap_meow"
  | "tap_heart"
  | "tap_spin"
  | "tap_sleep"
  | "tap_jump";

const TAP_BUBBLE_MESSAGES = ["grrr", "btch?", "stop!", "really?"] as const;
type EyeMode = "normal" | "sparkle" | "closed";

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
  [0,1,2,2,2,1,1,2,2,1,1,2,2,2,1,0],
  [0,1,2,2,2,1,1,2,2,1,1,2,2,2,1,0],
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
  [0,1,2,2,2,1,1,2,2,1,1,2,2,2,1,0],
  [0,1,2,2,2,1,1,2,2,1,1,2,2,2,1,0],
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
  [0,1,2,2,2,1,1,2,2,1,1,2,2,2,1,0],
  [0,1,2,2,2,1,1,2,2,1,1,2,2,2,1,1],
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
  [0,1,2,2,2,1,1,2,2,1,1,2,2,2,1,0],
  [0,1,2,2,2,1,1,2,2,1,1,2,2,2,1,0],
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

// Eye pixel positions in the 16x16 grid (for idle/walk poses).
// Each eye is a 2x2 block.
const EYE_PIXELS = {
  left: [
    [5, 5], [6, 5],
    [5, 6], [6, 6],
  ],
  right: [
    [9, 5], [10, 5],
    [9, 6], [10, 6],
  ],
} as const;
// Sparkle highlight pixel inside each eye (top-right corner of each 2x2).
const EYE_SPARKLE = [
  [6, 5],
  [10, 5],
] as const;
// Closed-eye line (replaces eyes with a single horizontal line).
const EYE_CLOSED = [
  [5, 6], [6, 6],
  [9, 6], [10, 6],
] as const;

function CatSprite({
  state,
  frame,
  eyeMode,
}: {
  state: CatState;
  frame: 0 | 1;
  eyeMode: EyeMode;
}) {
  let grid: number[][];
  if (state === "sleep") grid = frame === 0 ? SLEEP_A : SLEEP_B;
  else if (state === "walk") grid = frame === 0 ? WALK_A : WALK_B;
  else grid = frame === 0 ? IDLE_A : IDLE_B; // idle + jump share idle frames

  // Apply eye overlay only on non-sleep poses (sleep already has closed eyes baked in).
  const overlayRects: React.ReactElement[] = [];
  if (state !== "sleep") {
    if (eyeMode === "closed") {
      // Erase eyes (paint with body fill = 2), then redraw a thin closed line.
      [...EYE_PIXELS.left, ...EYE_PIXELS.right].forEach(([x, y], i) => {
        overlayRects.push(
          <rect key={`erase-${i}`} x={x} y={y} width={1} height={1} fill={PALETTE[2]} />,
        );
      });
      EYE_CLOSED.forEach(([x, y], i) => {
        overlayRects.push(
          <rect key={`closed-${i}`} x={x} y={y} width={1} height={1} fill={PALETTE[1]} />,
        );
      });
    } else if (eyeMode === "sparkle") {
      EYE_SPARKLE.forEach(([x, y], i) => {
        overlayRects.push(
          <rect key={`spark-${i}`} x={x} y={y} width={1} height={1} fill={PALETTE[2]} />,
        );
      });
    }
  }

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
      {overlayRects}
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
  const [reaction, setReaction] = useState<Reaction>(null);
  const [eyeMode, setEyeMode] = useState<EyeMode>("normal");
  const stateTimer = useRef<number | null>(null);
  const walkTimer = useRef<number | null>(null);
  const reactionTimer = useRef<number | null>(null);
  const eyeTimer = useRef<number | null>(null);
  const pickNextRef = useRef<(() => void) | null>(null);
  const pausedRef = useRef(false);

  const [bubble, setBubble] = useState<string | null>(null);
  const bubbleTimer = useRef<number | null>(null);


  // - walk → normal alert eyes (no sparkle to keep motion readable)
  // - idle → occasional sparkle blink
  // - sleep → sprite already shows closed eyes; overlay stays "normal"
  useEffect(() => {
    if (!enabled) return;
    if (eyeTimer.current) window.clearInterval(eyeTimer.current);

    if (state !== "idle") {
      setEyeMode("normal");
      return;
    }

    // Idle: every ~2.4s do a 2-frame stepped blink: closed → sparkle → normal.
    function blink() {
      setEyeMode("closed");
      window.setTimeout(() => setEyeMode("sparkle"), 140);
      window.setTimeout(() => setEyeMode("normal"), 420);
    }
    // Initial sparkle when entering idle
    setEyeMode("sparkle");
    window.setTimeout(() => setEyeMode("normal"), 320);
    eyeTimer.current = window.setInterval(blink, 2400);
    return () => {
      if (eyeTimer.current) window.clearInterval(eyeTimer.current);
      eyeTimer.current = null;
    };
  }, [enabled, state]);

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
      if (pausedRef.current) return; // a reaction is in control
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

    pickNextRef.current = pickNext;
    pickNext();
    return () => {
      clearTimers();
      pickNextRef.current = null;
    };
  }, [enabled]);

  // ---- Reaction event system -----------------------------------------
  useEffect(() => {
    if (!enabled) return;

    function clearAutoTimers() {
      if (stateTimer.current) window.clearTimeout(stateTimer.current);
      if (walkTimer.current) window.clearInterval(walkTimer.current);
      stateTimer.current = null;
      walkTimer.current = null;
    }

    function endReaction() {
      pausedRef.current = false;
      setReaction(null);
      reactionTimer.current = null;
      pickNextRef.current?.();
    }

    function startReaction(detail: CatActionDetail) {
      // Pause autonomous behavior and override.
      pausedRef.current = true;
      clearAutoTimers();
      if (reactionTimer.current) window.clearTimeout(reactionTimer.current);

      const dur = detail.durationMs;

      switch (detail.action) {
        case "jump": {
          // Happy hop: a couple of instant teleports up + back down.
          setReaction("jump");
          setState("idle");
          const startY = pos.y;
          let hops = 0;
          const hopId = window.setInterval(() => {
            hops++;
            setPos((p) => ({ x: p.x, y: hops % 2 === 1 ? startY - 16 : startY }));
            if (hops >= 4) {
              window.clearInterval(hopId);
            }
          }, 180);
          reactionTimer.current = window.setTimeout(() => {
            window.clearInterval(hopId);
            setPos((p) => ({ x: p.x, y: startY }));
            endReaction();
          }, dur ?? 1400);
          return;
        }
        case "curious": {
          // Look around: flip direction a few times while idle.
          setReaction("curious");
          setState("idle");
          let flips = 0;
          const flipId = window.setInterval(() => {
            flips++;
            setDir((d) => (d === 1 ? -1 : 1));
            if (flips >= 4) window.clearInterval(flipId);
          }, 280);
          reactionTimer.current = window.setTimeout(() => {
            window.clearInterval(flipId);
            endReaction();
          }, dur ?? 1600);
          return;
        }
        case "confused": {
          // Tiny tilt — stay idle, show "?" bubble.
          setReaction("confused");
          setState("idle");
          reactionTimer.current = window.setTimeout(endReaction, dur ?? 1800);
          return;
        }
        case "sad_sleep": {
          // Curl up and sleep with a sad blink.
          setReaction("sad_sleep");
          setState("sleep");
          reactionTimer.current = window.setTimeout(endReaction, dur ?? 3000);
          return;
        }
        case "look": {
          // Face toward the target element for ~2s. No movement, just turn + sparkle.
          setReaction("look");
          setState("idle");
          let targetEl: HTMLElement | null = null;
          if (detail.target instanceof HTMLElement) targetEl = detail.target;
          else if (typeof detail.target === "string")
            targetEl = document.querySelector<HTMLElement>(detail.target);
          if (targetEl) {
            const r = targetEl.getBoundingClientRect();
            const targetCenterX = r.left + r.width / 2;
            const catCenterX = pos.x + getBounds().size / 2;
            setDir(targetCenterX < catCenterX ? -1 : 1);
          }
          // Sparkle blink rhythm during the look (stepped, no easing).
          setEyeMode("sparkle");
          const t1 = window.setTimeout(() => setEyeMode("closed"), 400);
          const t2 = window.setTimeout(() => setEyeMode("sparkle"), 540);
          const t3 = window.setTimeout(() => setEyeMode("normal"), 1200);
          reactionTimer.current = window.setTimeout(() => {
            window.clearTimeout(t1);
            window.clearTimeout(t2);
            window.clearTimeout(t3);
            endReaction();
          }, dur ?? 2000);
          return;
        }
        case "walk_to": {
          // Walk in discrete steps toward the target element's x.
          setReaction("walk_to");
          let targetEl: HTMLElement | null = null;
          if (detail.target instanceof HTMLElement) targetEl = detail.target;
          else if (typeof detail.target === "string")
            targetEl = document.querySelector<HTMLElement>(detail.target);

          const b = getBounds();
          let targetX = pos.x;
          if (targetEl) {
            const r = targetEl.getBoundingClientRect();
            // Land just to the right edge of the card, snapped to step grid.
            targetX = clamp(
              Math.round((r.right - b.size - 4) / STEP_PX) * STEP_PX,
              b.minX,
              b.maxX,
            );
          }
          const newDir: Dir = targetX < pos.x ? -1 : 1;
          setDir(newDir);
          setState("walk");
          walkTimer.current = window.setInterval(() => {
            setPos((p) => {
              const nx = clamp(p.x + newDir * STEP_PX, b.minX, b.maxX);
              if ((newDir === 1 && nx >= targetX) || (newDir === -1 && nx <= targetX)) {
                if (walkTimer.current) {
                  window.clearInterval(walkTimer.current);
                  walkTimer.current = null;
                }
                setState("idle");
              }
              return { x: nx, y: p.y };
            });
          }, 220);
          // Hard cap so we always release control.
          reactionTimer.current = window.setTimeout(() => {
            if (walkTimer.current) {
              window.clearInterval(walkTimer.current);
              walkTimer.current = null;
            }
            setState("idle");
            endReaction();
          }, dur ?? 4000);
          return;
        }
      }
    }

    function onCatAction(e: Event) {
      const detail = (e as CustomEvent<CatActionDetail>).detail;
      if (!detail || !detail.action) return;
      startReaction(detail);
    }

    window.addEventListener(CAT_EVENT, onCatAction);
    return () => {
      window.removeEventListener(CAT_EVENT, onCatAction);
      if (reactionTimer.current) window.clearTimeout(reactionTimer.current);
      reactionTimer.current = null;
      pausedRef.current = false;
    };
  }, [enabled, pos.y, pos.x]);

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
        <CatSprite state={state} frame={frame} eyeMode={eyeMode} />
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
      {reaction && reaction !== "walk_to" && (
        <span
          style={{
            position: "absolute",
            top: -10,
            right: -6,
            fontSize: 12,
            fontFamily: "monospace",
            fontWeight: 700,
            color:
              reaction === "jump"
                ? "#e11d48"
                : reaction === "sad_sleep"
                  ? "#1a1a1a"
                  : "#1a1a1a",
            animation: "cat-z-blink 0.6s steps(2) infinite",
          }}
        >
          {reaction === "jump"
            ? "♥"
            : reaction === "curious"
              ? "?"
              : reaction === "confused"
                ? "?!"
                : "z"}
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
