"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { claimGift, getRemainingGifts, type GiftState } from "@/app/actions";
import { FloralDecor } from "@/components/floral-decor";
import { GiftReveal } from "@/components/gift-reveal";
import { RouletteWheel } from "@/components/roulette-wheel";
import { visualGifts } from "@/lib/gifts";

type Phase = "idle" | "claiming" | "spinning" | "revealing";

function remainingLabel(count: number) {
  if (count === 1) {
    return "Ainda resta 1 presente";
  }

  return `Ainda restam ${count} presentes`;
}

export function PartyScreen({ initial }: { initial: GiftState }) {
  const [remaining, setRemaining] = useState(initial.ok ? initial.remaining : []);
  const [wheelItems, setWheelItems] = useState(initial.ok ? visualGifts(initial.remaining) : []);
  const [error, setError] = useState(initial.ok ? null : initial.error);
  const [mode, setMode] = useState(initial.ok ? initial.mode : null);
  const [preview, setPreview] = useState(initial.ok ? initial.preview : false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [wonGift, setWonGift] = useState<string | null>(null);
  const [liveName, setLiveName] = useState(initial.ok ? initial.remaining[0] ?? "" : "");
  const phaseRef = useRef<Phase>("idle");
  const nextRemainingRef = useRef<string[]>([]);
  const themeSoundRef = useRef<HTMLAudioElement | null>(null);
  const pareSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const theme = new Audio("/sounds/abertura-roda-roda-jequiti.mp3");
    const pare = new Audio("/sounds/pare.mp3");
    theme.preload = "auto";
    pare.preload = "auto";
    themeSoundRef.current = theme;
    pareSoundRef.current = pare;

    return () => {
      theme.pause();
      pare.pause();
      themeSoundRef.current = null;
      pareSoundRef.current = null;
    };
  }, []);

  function playTheme() {
    const theme = themeSoundRef.current;
    const pare = pareSoundRef.current;

    if (pare) {
      pare.pause();
      pare.currentTime = 0;
    }

    if (!theme) {
      return;
    }

    theme.currentTime = 0;
    void theme.play().catch(() => undefined);
  }

  function playPare() {
    const theme = themeSoundRef.current;
    const pare = pareSoundRef.current;

    if (theme) {
      theme.pause();
      theme.currentTime = 0;
    }

    if (!pare) {
      return;
    }

    pare.currentTime = 0;
    void pare.play().catch(() => undefined);
  }

  function stopSounds() {
    const theme = themeSoundRef.current;
    const pare = pareSoundRef.current;

    if (theme) {
      theme.pause();
      theme.currentTime = 0;
    }

    if (pare) {
      pare.pause();
      pare.currentTime = 0;
    }
  }

  const setPhaseSafe = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const handleLiveName = useCallback((name: string) => {
    setLiveName(name);
  }, []);

  const handleSpinClosing = useCallback(() => {
    if (phaseRef.current !== "spinning") {
      return;
    }

    playPare();
  }, []);

  const handleSpinEnd = useCallback(() => {
    if (phaseRef.current !== "spinning") {
      return;
    }

    setRemaining(nextRemainingRef.current);
    setPhaseSafe("revealing");
  }, [setPhaseSafe]);

  const refresh = useCallback(async () => {
    if (phaseRef.current !== "idle") {
      return;
    }

    const state = await getRemainingGifts();

    if (!state.ok) {
      setError(state.error);
      return;
    }

    setError(null);
    setMode(state.mode);
    setPreview(state.preview);
    setRemaining(state.remaining);
    setWheelItems(visualGifts(state.remaining));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refresh();
    }, 8000);

    function onVisibility() {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  async function handleSpin() {
    if (phase !== "idle" || remaining.length === 0) {
      return;
    }

    setError(null);
    playTheme();
    setPhaseSafe("claiming");

    const result = await claimGift();

    if (!result.ok) {
      stopSounds();
      setError(result.error);
      setPhaseSafe("idle");
      return;
    }

    setMode(result.mode);
    setPreview(result.preview);

    if (!result.gift) {
      stopSounds();
      setRemaining([]);
      setWheelItems([]);
      setPhaseSafe("idle");
      return;
    }

    nextRemainingRef.current = result.remaining;
    setWonGift(result.gift);
    setWheelItems(visualGifts(remaining, result.gift));
    setPhaseSafe("spinning");
  }

  function handleRevealClose() {
    setWheelItems(visualGifts(nextRemainingRef.current));
    setWonGift(null);
    setPhaseSafe("idle");
  }

  const busy = phase === "claiming" || phase === "spinning";
  const empty = remaining.length === 0 && phase === "idle";
  const configured = initial.ok || remaining.length > 0 || Boolean(mode);

  return (
    <div className="party-bg relative flex min-h-dvh flex-col overflow-x-hidden">
      <div className="party-grain absolute inset-0" />
      <FloralDecor />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-10 sm:pt-7 lg:px-8">
        <header className="mx-auto max-w-2xl px-1 text-center">
          <p className="text-[0.62rem] font-medium uppercase tracking-[0.14em] text-sage sm:text-[0.7rem] sm:tracking-[0.32em]">
            Você está convidado (a)
          </p>
          <h1 className="mt-1.5 font-display text-[2rem] leading-[1.08] text-terracotta sm:mt-2 sm:text-6xl">
            Chá de Cozinha da Sah
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-snug text-ink-soft sm:mt-3 sm:max-w-md sm:text-lg sm:leading-relaxed">
            <span className="sm:hidden">Gire a roleta e descubra o presente.</span>
            <span className="hidden sm:inline">Gire a roleta e descubra o presente que você vai levar.</span>
          </p>
        </header>

        {preview ? (
          <p className="mx-auto mt-3 max-w-xl rounded-2xl bg-blush/40 px-3 py-2 text-center text-xs font-medium leading-snug text-ink sm:mt-4 sm:px-4 sm:py-3 sm:text-sm">
            <span className="sm:hidden">Modo teste: a lista não muda.</span>
            <span className="hidden sm:inline">Modo teste: gira à vontade — nenhum presente sai da lista.</span>
          </p>
        ) : null}

        {error ? (
          <p className="mx-auto mt-3 max-w-xl rounded-2xl bg-blush/40 px-3 py-2 text-center text-xs font-semibold leading-snug text-ink sm:mt-4 sm:px-4 sm:py-3 sm:text-sm">
            {error}
          </p>
        ) : null}

        {!configured && error ? null : (
          <section className="mx-auto mt-3 flex w-full max-w-3xl flex-1 flex-col items-center sm:mt-5 lg:mt-8">
            <RouletteWheel
              items={wheelItems}
              targetGift={wonGift}
              phase={phase}
              onLiveName={handleLiveName}
              onSpinClosing={handleSpinClosing}
              onSpinEnd={handleSpinEnd}
            />

            <div className="mt-3 min-h-12 text-center sm:mt-6 sm:min-h-16">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-sage-deep sm:text-xs sm:tracking-[0.2em]">
                {busy ? "Passando na seta" : "Na seta"}
              </p>
              <p
                aria-live="polite"
                className="mt-1 px-2 font-sans text-xl font-semibold leading-tight text-ink sm:text-3xl"
              >
                {empty
                  ? "A roleta está vazia"
                  : phase === "revealing" && wonGift
                    ? wonGift
                    : liveName || "Toque para girar"}
              </p>
            </div>

            <p className="mt-1.5 text-xs font-semibold text-ink-soft sm:mt-2 sm:text-sm">
              {empty ? "Todos os presentes já foram sorteados." : remainingLabel(remaining.length)}
            </p>

            <button
              type="button"
              onClick={() => void handleSpin()}
              disabled={busy || empty}
              className={`spin-button mt-4 inline-flex min-h-14 w-full max-w-xs touch-manipulation items-center justify-center rounded-full px-8 text-lg font-extrabold text-paper transition enabled:active:scale-[0.98] disabled:cursor-not-allowed sm:mt-5 ${
                empty
                  ? "disabled:bg-cream-deep disabled:text-ink-soft disabled:shadow-none"
                  : "disabled:text-paper"
              }`}
            >
              {phase === "claiming"
                ? "Sorteando..."
                : phase === "spinning"
                  ? "Girando..."
                  : empty
                    ? "Acabou"
                    : "Girar"}
            </button>
          </section>
        )}
      </div>

      <GiftReveal
        gift={wonGift}
        open={phase === "revealing"}
        preview={preview}
        onClose={handleRevealClose}
      />
    </div>
  );
}
