"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

type GiftRevealProps = {
  gift: string | null;
  open: boolean;
  preview?: boolean;
  onClose: () => void;
};

async function fireConfetti() {
  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#e28aa0", "#f2c14b", "#f3b8c6", "#6b7a52", "#f08a5a"];

  confetti({
    particleCount: 120,
    spread: 76,
    origin: { y: 0.35 },
    colors,
  });

  window.setTimeout(() => {
    confetti({
      particleCount: 70,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 70,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });
  }, 220);
}

export function GiftReveal({ gift, open, preview = false, onClose }: GiftRevealProps) {
  useEffect(() => {
    if (!open || !gift) {
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      void fireConfetti();
    }
  }, [gift, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open && gift ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="gift-title"
            className="w-full max-w-md rounded-t-4xl border border-gold-soft/70 bg-paper px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-7 text-center shadow-2xl sm:rounded-4xl sm:px-10 sm:py-8"
            initial={{ y: 48, scale: 0.94, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-terracotta">
              Você tirou
            </p>
            <h2
              id="gift-title"
              className="mt-3 font-sans text-3xl font-semibold leading-tight text-ink sm:text-4xl"
            >
              {gift}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              {preview
                ? "Modo teste: esse presente continua na lista."
                : "Esse item saiu da lista para todo mundo."}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="spin-button mt-8 inline-flex min-h-14 w-full items-center justify-center rounded-full px-6 text-lg font-extrabold text-paper transition active:scale-[0.98] sm:w-auto sm:min-w-44"
            >
              Que delícia!
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
