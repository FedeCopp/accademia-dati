"use client";

import * as React from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

/** Stessa chiave usata da src/scripts/progress.ts. */
const KEY = "accademia-dati-weeks-v1";
/** Evento emesso da progress.ts quando cambiano i progressi. */
export const PROGRESS_EVENT = "progress:change";

function readCount(): number {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n)).length : 0;
  } catch {
    return 0;
  }
}

export interface ProgressRingProps {
  /** Numero totale di settimane della fase. */
  total?: number;
  /** Diametro in px. */
  size?: number;
  className?: string;
}

/**
 * Anello di avanzamento della Fase 1. L'HTML statico mostra 0%; dopo il montaggio legge
 * i progressi dal browser e anima arco e percentuale con una molla (motion/react).
 */
export function ProgressRing({ total = 12, size = 84, className }: ProgressRingProps) {
  const reduce = useReducedMotion();
  const [count, setCount] = React.useState(0);
  const progress = useMotionValue(0);
  const pctText = useTransform(progress, (v) => `${Math.round(v * 100)}%`);
  const arcOpacity = useTransform(progress, (v) => (v > 0.001 ? 1 : 0));

  React.useEffect(() => {
    const sync = () => setCount(readCount());
    sync();
    window.addEventListener(PROGRESS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  React.useEffect(() => {
    const target = Math.min(1, count / total);
    if (reduce) {
      progress.set(target);
      return;
    }
    const controls = animate(progress, target, { type: "spring", bounce: 0.15, duration: 1.1 });
    return () => controls.stop();
  }, [count, total, reduce, progress]);

  const r = 26;
  return (
    <div
      role="progressbar"
      aria-label="Settimane della Fase 1 completate"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={count}
      aria-valuetext={`${count} su ${total}`}
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="7" style={{ stroke: "var(--color-muted)" }} />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          style={{ stroke: "var(--color-primary)", pathLength: progress, opacity: arcOpacity }}
        />
      </svg>
      <motion.span
        className="absolute inset-0 grid place-items-center font-mono text-[0.95rem] font-semibold tabular-nums"
        aria-hidden="true"
      >
        {pctText}
      </motion.span>
    </div>
  );
}

export default ProgressRing;
