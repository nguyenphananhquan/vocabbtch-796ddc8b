// Lightweight event system for PixelCatCompanion reactions.
// Dispatch events from anywhere with `triggerCat("jump")` and the cat will react.

export type CatAction =
  | "jump" // happy — used for word_created and word_refreshed
  | "curious" // looks around
  | "look" // faces toward a target element for a moment — word_opened
  | "walk_to" // walks toward a target element
  | "confused" // small head tilt + question mark — empty_search
  | "sad_sleep"; // blinks sadly / curls up — error_loading_words

export interface CatActionDetail {
  action: CatAction;
  /** Optional CSS selector or element to walk near (used by walk_to). */
  target?: string | HTMLElement | null;
  /** Optional override duration in ms. */
  durationMs?: number;
}

export const CAT_EVENT = "cat-action";

export function triggerCat(
  action: CatAction,
  options: Omit<CatActionDetail, "action"> = {},
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<CatActionDetail>(CAT_EVENT, {
      detail: { action, ...options },
    }),
  );
}
