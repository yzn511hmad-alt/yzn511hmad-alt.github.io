import { THAW_DURATION_MS, PASS_LIFETIME_MS, createLocalPass } from './VaultState';

export const MELT_WAIT_MS = THAW_DURATION_MS;
export const MELT_STORAGE_KEY = 'snowy:free-key:melt:v1';
export type MeltPhase = 'waiting' | 'available' | 'ready';

export interface MeltRun {
  version: 1;
  startedAt: number;
  key: string | null;
  unlockedAt: number | null;
  /** Persisted but not started: no part of the wait is spent preparing visuals. */
  pending?: true;
}

export interface MeltSnapshot {
  phase: MeltPhase;
  remaining: number;
  progress: number;
  keyVisible: boolean;
  canAct: boolean;
}

const LOCAL_PASS_PATTERN = /^SNOWY-FREE-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-\d{4}$/;
const isTime = (value: unknown): value is number => typeof value === 'number'
  && Number.isSafeInteger(value) && value >= 0 && value <= 8_640_000_000_000_000;
const validStart = (run: MeltRun, now: number): boolean => run.version === 1
  && isTime(now) && isTime(run.startedAt) && run.startedAt <= now;
const pendingRun = (run: MeltRun, now: number): boolean => validStart(run, now)
  && run.key === null && run.unlockedAt === null;
const livePass = (run: MeltRun, now: number): boolean => validStart(run, now)
  && !run.pending
  && typeof run.key === 'string' && LOCAL_PASS_PATTERN.test(run.key)
  && isTime(run.unlockedAt) && run.unlockedAt >= run.startedAt + MELT_WAIT_MS
  && run.unlockedAt <= now && now - run.unlockedAt < PASS_LIFETIME_MS;

/** A new run starts immediately; there is no idle or strike phase. */
export function startMeltRun(now: number): MeltRun {
  if (!isTime(now)) throw new RangeError('A valid timestamp is required to start the melt.');
  return { version: 1, startedAt: now, key: null, unlockedAt: null };
}

export function prepareMeltRun(now: number): MeltRun {
  return { ...startMeltRun(now), pending: true };
}

/** Idempotent; readiness/resume events cannot move an already-running deadline. */
export function beginMeltRun(run: MeltRun, now: number): MeltRun {
  return run.pending ? startMeltRun(now) : run;
}

/** The timer always follows wall-clock time, including while the page is hidden. */
export function meltSnapshot(run: MeltRun, now: number): MeltSnapshot {
  const ready = livePass(run, now);
  const elapsed = !run.pending && (ready || pendingRun(run, now)) ? now - run.startedAt : 0;
  const progress = Math.min(1, Math.max(0, elapsed / MELT_WAIT_MS));
  const phase: MeltPhase = ready ? 'ready' : progress === 1 ? 'available' : 'waiting';
  return {
    phase,
    remaining: Math.max(0, Math.ceil((MELT_WAIT_MS - elapsed) / 1000)),
    progress,
    keyVisible: phase !== 'waiting',
    canAct: phase === 'available',
  };
}

/**
 * Generates the same local demonstration pass as the previous Free Key flow.
 * This is a client-side experience, not server-issued authorization.
 */
export function collectMeltKey(run: MeltRun, now: number, generate = createLocalPass): MeltRun {
  if (run.pending || !pendingRun(run, now) || now - run.startedAt < MELT_WAIT_MS) return run;
  const key = generate();
  if (!LOCAL_PASS_PATTERN.test(key)) throw new Error('The local pass generator returned an invalid pass.');
  return { ...run, key, unlockedAt: now };
}

/** At the exact 24-hour boundary, the previous pass is no longer available. */
export function meltKeyExpired(run: MeltRun, now: number): boolean {
  return run.key !== null && !livePass(run, now);
}

/**
 * Invalid, old, expired, or future-dated storage starts a fresh full wait.
 * The dedicated storage key deliberately does not migrate hammer/strike state.
 * Storage validation catches malformed/inconsistent data, not deliberate
 * backdating of a structurally valid run; server enforcement needs a backend.
 */
export function restoreMeltRun(raw: string | null, now: number, deferFresh = false): MeltRun {
  const fresh = () => deferFresh ? prepareMeltRun(now) : startMeltRun(now);
  if (!isTime(now)) return fresh();
  if (!raw) return fresh();
  try {
    const saved: unknown = JSON.parse(raw);
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return fresh();
    const run = saved as MeltRun;
    if (run.pending !== undefined && run.pending !== true) return fresh();
    if (run.pending && (run.key !== null || run.unlockedAt !== null)) return fresh();
    if (!pendingRun(run, now) && !livePass(run, now)) return fresh();
    return { version: 1, startedAt: run.startedAt, key: run.key, unlockedAt: run.unlockedAt, ...(run.pending ? { pending: true as const } : {}) };
  } catch {
    return fresh();
  }
}
