export const THAW_DURATION_MS = 30_000;
export const PASS_LIFETIME_MS = 24 * 60 * 60 * 1000;
export const VAULT_STORAGE_KEY = 'snowy:frozen-vault:v1';
export interface VaultRun { version: 1; startedAt: number | null; key: string | null; unlockedAt: number | null }
export const emptyVaultRun = (): VaultRun => ({ version: 1, startedAt: null, key: null, unlockedAt: null });
export function thawProgress(run: VaultRun, now: number): number {
  return run.startedAt === null ? 0 : Math.min(1, Math.max(0, (now - run.startedAt) / THAW_DURATION_MS));
}
export function canCollect(run: VaultRun, now: number): boolean { return run.startedAt !== null && now - run.startedAt >= THAW_DURATION_MS; }
export function restoreVaultRun(raw: string | null, now: number): VaultRun {
  if (!raw) return emptyVaultRun();
  try {
    const run = JSON.parse(raw);
    if (run.version !== 1 || !Number.isFinite(run.startedAt) || run.startedAt < 0 || run.startedAt > now) return emptyVaultRun();
    if (run.key !== null && (typeof run.key !== 'string' || !/^SNOWY-FREE-[A-Z2-9]{4}-[A-Z2-9]{4}-\d{4}$/.test(run.key))) return emptyVaultRun();
    if (run.key && (!Number.isFinite(run.unlockedAt) || run.unlockedAt < run.startedAt + THAW_DURATION_MS || now - run.unlockedAt > PASS_LIFETIME_MS || run.unlockedAt > now)) return emptyVaultRun();
    return { version: 1, startedAt: run.startedAt, key: run.key ?? null, unlockedAt: run.key ? run.unlockedAt : null };
  } catch { return emptyVaultRun(); }
}
export function createLocalPass(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const random = crypto.getRandomValues(new Uint8Array(8));
  const code = Array.from(random, value => alphabet[value % alphabet.length]).join('');
  return `SNOWY-FREE-${code.slice(0, 4)}-${code.slice(4)}-${new Date().getFullYear()}`;
}
