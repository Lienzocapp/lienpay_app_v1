/**
 * greeting — the shared time-of-day greeting helper (single source).
 *
 * Produces "Good morning" / "Good afternoon" / "Good evening" from the local
 * hour, and appends the user's stored name when one is present. The name is
 * ALWAYS read from central session state by the caller and is never hard-coded
 * (Req 19.4): with no stored name the greeting degrades gracefully to the
 * time-of-day phrase alone.
 */

/** Returns the time-of-day greeting phrase for `hour` (0–23). */
export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Builds the personalised greeting line, e.g. `"Good evening, Tushar"`.
 *
 * @param userName - The name from central session state, or null/empty.
 * @param now - Injectable clock for deterministic tests (defaults to now).
 */
export function personalGreeting(
  userName: string | null | undefined,
  now: Date = new Date()
): string {
  const phrase = greetingForHour(now.getHours());
  const name = userName?.trim();
  return name ? `${phrase}, ${name}` : phrase;
}
