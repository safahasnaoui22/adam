// app/lib/loyalty-rules.ts
// Shared business rules for the loyalty program (used by the owner UI AND the API).

/** First reward: must be between 1 and 200 points. */
export const FIRST_REWARD_MIN = 1;
export const FIRST_REWARD_MAX = 200;

/** Every following reward: previous (highest active) reward + [100 … 300] points. */
export const REWARD_GAP_MIN = 100;
export const REWARD_GAP_MAX = 300;

/** Welcome points given for free at sign-up: 0 … 50. */
export const WELCOME_BONUS_MAX = 50;

/**
 * Returns the allowed [min, max] for the NEXT reward, given the points
 * of the currently ACTIVE rewards.
 */
export function getNextRewardRange(activePoints: number[]): [number, number] {
  if (activePoints.length === 0) return [FIRST_REWARD_MIN, FIRST_REWARD_MAX];
  const highest = Math.max(...activePoints);
  return [highest + REWARD_GAP_MIN, highest + REWARD_GAP_MAX];
}

/** Validate the welcome bonus. Returns null when invalid. */
export function parseWelcomeBonus(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : (value as number);
  if (!Number.isInteger(n) || n < 0 || n > WELCOME_BONUS_MAX) return null;
  return n;
}