"use server";

import {
  claimGift as claimGiftFromStore,
  isPreview,
  listRemaining,
  resetGifts as resetStore,
  StoreError,
  storeMode,
} from "@/lib/store";

const REDIS_ERROR =
  "A roleta ainda não está conectada. Peça para quem organizou configurar o Redis na Vercel.";
const GENERIC_ERROR = "Não deu para sortear agora. Tenta de novo em instantes.";

export type GiftState =
  | { ok: true; remaining: string[]; mode: "redis" | "local"; preview: boolean }
  | { ok: false; error: string };

export type ClaimState =
  | { ok: true; gift: string | null; remaining: string[]; mode: "redis" | "local"; preview: boolean }
  | { ok: false; error: string };

function sortGifts(items: string[]) {
  return [...items].sort((a, b) => (a === b ? 0 : a > b ? 1 : -1));
}

function toError(error: unknown): GiftState {
  if (error instanceof StoreError && error.code === "NOT_CONFIGURED") {
    return { ok: false, error: REDIS_ERROR };
  }

  return { ok: false, error: GENERIC_ERROR };
}

export async function getRemainingGifts(): Promise<GiftState> {
  try {
    const remaining = await listRemaining();
    const mode = storeMode();

    if (mode === "missing") {
      return { ok: false, error: REDIS_ERROR };
    }

    return { ok: true, remaining: sortGifts(remaining), mode, preview: isPreview() };
  } catch (error) {
    return toError(error);
  }
}

export async function claimGift(): Promise<ClaimState> {
  try {
    const { gift, remaining } = await claimGiftFromStore();
    const mode = storeMode();

    if (mode === "missing") {
      return { ok: false, error: REDIS_ERROR };
    }

    return { ok: true, gift, remaining: sortGifts(remaining), mode, preview: isPreview() };
  } catch (error) {
    const result = toError(error);
    return result.ok ? { ok: false, error: GENERIC_ERROR } : result;
  }
}

export async function resetGifts(secret: string): Promise<GiftState> {
  if (!process.env.RESET_SECRET || secret !== process.env.RESET_SECRET) {
    return { ok: false, error: "Não autorizado." };
  }

  try {
    const remaining = await resetStore();
    const mode = storeMode();

    if (mode === "missing") {
      return { ok: false, error: REDIS_ERROR };
    }

    return { ok: true, remaining: sortGifts(remaining), mode, preview: isPreview() };
  } catch (error) {
    return toError(error);
  }
}
