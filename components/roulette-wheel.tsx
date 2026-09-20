"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

const SLICE_COLORS = ["#fffdf9", "#f6d5de"];

const SIZE = 520;
const CENTER = SIZE / 2;
const RADIUS = 248;

function polar(radius: number, angleDeg: number) {
  const angle = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: Number((CENTER + radius * Math.cos(angle)).toFixed(3)),
    y: Number((CENTER + radius * Math.sin(angle)).toFixed(3)),
  };
}

function slicePath(index: number, total: number) {
  const slice = 360 / total;
  const start = index * slice;
  const end = start + slice;
  const from = polar(RADIUS, start);
  const to = polar(RADIUS, end);
  const largeArc = slice > 180 ? 1 : 0;

  return `M ${CENTER} ${CENTER} L ${from.x} ${from.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${to.x} ${to.y} Z`;
}

function nameAtRotation(rotation: number, items: string[]) {
  if (items.length === 0) {
    return "";
  }

  const slice = 360 / items.length;
  const normalized = ((rotation % 360) + 360) % 360;
  const atTop = (360 - normalized) % 360;
  return items[Math.floor(atTop / slice) % items.length] ?? "";
}

function shortLabel(name: string, total: number) {
  const max = total <= 12 ? 22 : total <= 20 ? 18 : total <= 24 ? 15 : 12;

  if (name.length <= max) {
    return name;
  }

  return `${name.slice(0, max - 1)}…`;
}

export const SPIN_DURATION = 6.3;
export const SPIN_CLOSE_LEAD = 0.72;

function landingRotation(current: number, index: number, total: number) {
  const slice = 360 / total;
  const landing = (360 - (index + 0.5) * slice) % 360;
  const currentMod = ((current % 360) + 360) % 360;
  const completeTurn = (360 - currentMod) % 360;
  return current + completeTurn + 6 * 360 + landing;
}

type RouletteWheelProps = {
  items: string[];
  targetGift: string | null;
  phase: "idle" | "claiming" | "spinning" | "revealing";
  onLiveName: (name: string) => void;
  onSpinClosing?: () => void;
  onSpinEnd: () => void;
};

export function RouletteWheel({
  items,
  targetGift,
  phase,
  onLiveName,
  onSpinClosing,
  onSpinEnd,
}: RouletteWheelProps) {
  const rotate = useMotionValue(0);
  const pointerRotate = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const currentRef = useRef(0);
  const lastPegRef = useRef<number | null>(null);
  const endedForTarget = useRef<string | null>(null);
  const mountedRef = useRef(false);
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    setCanAnimate(true);
  }, []);

  useMotionValueEvent(rotate, "change", (value) => {
    const previous = currentRef.current;
    currentRef.current = value;

    if (mountedRef.current) {
      onLiveName(nameAtRotation(value, items));
    }

    if (!mountedRef.current || reduceMotion || items.length === 0) {
      return;
    }

    const slice = 360 / items.length;
    const peg = Math.floor((((value % 360) + 360) % 360) / slice);

    if (lastPegRef.current === null) {
      lastPegRef.current = peg;
      return;
    }

    if (peg === lastPegRef.current) {
      return;
    }

    lastPegRef.current = peg;
    const speed = Math.abs(value - previous);
    const kick = Math.min(42, 18 + speed * 2.8);

    if (speed > 3.2) {
      pointerRotate.set(kick);
      return;
    }

    pointerRotate.set(kick);
    animate(pointerRotate, [kick, -8, 0], {
      duration: 0.2,
      ease: [0.14, 0.82, 0.2, 1],
    });
  });

  useEffect(() => {
    onLiveName(nameAtRotation(currentRef.current, items));
  }, [items, onLiveName]);

  useEffect(() => {
    if (phase === "idle" || phase === "claiming") {
      endedForTarget.current = null;
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "claiming") {
      return;
    }

    const from = currentRef.current;
    const controls = animate(rotate, [from, from - 7, from + 6, from - 4, from], {
      duration: 0.85,
      ease: "easeInOut",
      repeat: Infinity,
    });

    return () => controls.stop();
  }, [phase, rotate]);

  useEffect(() => {
    if (phase !== "spinning" || !targetGift || items.length === 0) {
      return;
    }

    if (endedForTarget.current === targetGift) {
      return;
    }

    const index = Math.max(0, items.indexOf(targetGift));
    const next = landingRotation(currentRef.current, index, items.length);

    if (reduceMotion) {
      rotate.set(next);
      endedForTarget.current = targetGift;
      onSpinClosing?.();
      onSpinEnd();
      return;
    }

    const closeTimer = window.setTimeout(() => {
      onSpinClosing?.();
    }, (SPIN_DURATION - SPIN_CLOSE_LEAD) * 1000);

    const controls = animate(rotate, next, {
      duration: SPIN_DURATION,
      ease: [0.12, 0.78, 0.16, 1],
      onComplete: () => {
        endedForTarget.current = targetGift;
        animate(pointerRotate, 0, { type: "spring", stiffness: 420, damping: 16 });
        onSpinEnd();
      },
    });

    return () => {
      window.clearTimeout(closeTimer);
      controls.stop();
    };
  }, [items, onSpinClosing, onSpinEnd, phase, reduceMotion, rotate, targetGift]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[min(86vw,calc(100dvh-24.5rem))] sm:max-w-[min(94vw,42rem)]">
      <WheelFrame canAnimate={canAnimate} rotate={rotate}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full" role="img" aria-label="Roleta de presentes">
          <circle cx={CENTER} cy={CENTER} r={RADIUS + 8} fill="#e28aa0" />
          <circle cx={CENTER} cy={CENTER} r={RADIUS + 2} fill="#fffdf9" />

          {!canAnimate || items.length === 0 ? (
            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#efe6dc" />
          ) : (
            items.map((item, index) => (
              <path
                key={`${item}-${index}`}
                d={slicePath(index, items.length)}
                fill={SLICE_COLORS[index % SLICE_COLORS.length]}
              />
            ))
          )}

          {canAnimate &&
            items.map((item, index) => {
              const slice = 360 / items.length;
              const angle = (index + 0.5) * slice;
              const flipped = angle > 90 && angle < 270;
              const point = polar(RADIUS * 0.68, angle);

              return (
                <text
                  key={`${item}-label-${index}`}
                  x={point.x}
                  y={point.y}
                  fill="#4a5640"
                  fontFamily="var(--font-josefin), ui-sans-serif, system-ui, sans-serif"
                  fontSize={items.length <= 12 ? 16 : items.length <= 20 ? 13.5 : items.length <= 24 ? 12.4 : 8.6}
                  fontWeight={600}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${flipped ? angle + 90 : angle - 90}, ${point.x}, ${point.y})`}
                >
                  {shortLabel(item, items.length)}
                </text>
              );
            })}

          {canAnimate &&
            items.map((item, index) => {
              const peg = polar(RADIUS + 5, index * (360 / items.length));

              return (
                <circle
                  key={`${item}-peg-${index}`}
                  cx={peg.x}
                  cy={peg.y}
                  r={4}
                  fill="#fffdf9"
                  stroke="#e28aa0"
                  strokeWidth="1.4"
                />
              );
            })}

          <circle cx={CENTER} cy={CENTER} r={34} fill="#fffdf9" />
          <circle cx={CENTER} cy={CENTER} r={28} fill="#e28aa0" />
          <circle cx={CENTER} cy={CENTER} r={22} fill="#faf7f2" />
          <circle cx={CENTER} cy={CENTER} r={4} fill="#d46b86" />
        </svg>
      </WheelFrame>

      <div className="pointer-events-none absolute -top-2 left-1/2 z-30 -translate-x-1/2 sm:-top-3">
        <motion.div style={{ rotate: pointerRotate, transformOrigin: "22px 17px" }}>
          <svg className="h-[4.1rem] w-9 sm:h-[4.9rem] sm:w-11" viewBox="0 0 40 72" aria-hidden="true">
            <path d="M20 70 C17 60 10 30 10 20 C10 12 14 7 20 7 C26 7 30 12 30 20 C30 30 23 60 20 70 Z" fill="#e28aa0" />
            <circle cx="20" cy="16" r="8" fill="#e28aa0" />
            <circle cx="20" cy="16" r="4.2" fill="#fffdf9" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

function WheelFrame({
  canAnimate,
  rotate,
  children,
}: {
  canAnimate: boolean;
  rotate: MotionValue<number>;
  children: ReactNode;
}) {
  if (!canAnimate) {
    return <div className="wheel-shadow h-full w-full">{children}</div>;
  }

  return (
    <motion.div className="wheel-shadow h-full w-full" style={{ rotate }}>
      {children}
    </motion.div>
  );
}
