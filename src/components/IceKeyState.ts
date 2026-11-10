import { THAW_DURATION_MS, PASS_LIFETIME_MS, createLocalPass } from './VaultState';

export const ICE_WAIT_MS = THAW_DURATION_MS;
export const ICE_REQUIRED_STRIKES = 5;
export const ICE_SETTLE_MS = 800;
export const ICE_STRIKE_INTERVAL_MS = 260;
export const ICE_STORAGE_KEY = 'snowy:free-key:v2';
export type IceVaultPhase = 'idle' | 'waiting' | 'breakable' | 'opened' | 'ready';
export interface IceKeyRun {
  version: 2;
  startedAt: number | null;
  strikes: number;
  openedAt: number | null;
  key: string | null;
  unlockedAt: number | null;
}
export interface IceVaultSnapshot {
  phase: IceVaultPhase;
  remaining: number;
  progress: number;
  strikes: number;
  requiredStrikes: 5;
  keyVisible: boolean;
  canAct: boolean;
  settling: boolean;
}
export const emptyIceKeyRun = (): IceKeyRun => ({version:2,startedAt:null,strikes:0,openedAt:null,key:null,unlockedAt:null});
export const startIceKeyRun = (now: number): IceKeyRun => ({...emptyIceKeyRun(),startedAt:now});
export function icePhase(run: IceKeyRun, now: number): IceVaultPhase {
  if (run.key) return 'ready';
  if (run.startedAt === null) return 'idle';
  if (now - run.startedAt < ICE_WAIT_MS) return 'waiting';
  return run.strikes >= ICE_REQUIRED_STRIKES ? 'opened' : 'breakable';
}
export function iceSnapshot(run: IceKeyRun, now: number): IceVaultSnapshot {
  const phase=icePhase(run,now);
  const elapsed=run.startedAt===null?0:Math.max(0,now-run.startedAt);
  const settling=phase==='opened'&&(run.openedAt===null||now-run.openedAt<ICE_SETTLE_MS);
  return {phase,remaining:Math.min(30,Math.max(0,Math.ceil((ICE_WAIT_MS-elapsed)/1000))),
    progress:Math.min(1,elapsed/ICE_WAIT_MS),strikes:run.strikes,requiredStrikes:5,
    keyVisible:phase==='ready',canAct:phase==='breakable'||(phase==='opened'&&!settling),settling};
}
export function strikeIce(run: IceKeyRun, now: number): IceKeyRun {
  if (icePhase(run,now)!=='breakable') return run;
  const strikes=Math.min(ICE_REQUIRED_STRIKES,run.strikes+1);
  return {...run,strikes,openedAt:strikes===ICE_REQUIRED_STRIKES?now:null};
}
export function extractIceKey(run: IceKeyRun, now: number, generate=createLocalPass): IceKeyRun {
  const state=iceSnapshot(run,now);
  if (state.phase!=='opened'||!state.canAct) return run;
  return {...run,key:generate(),unlockedAt:now};
}
export function iceKeyExpired(run: IceKeyRun, now: number): boolean {
  return !!run.key&&(run.unlockedAt===null||now-run.unlockedAt>=PASS_LIFETIME_MS);
}
export function restoreIceKeyRun(raw: string|null, now: number): IceKeyRun {
  if (!raw) return emptyIceKeyRun();
  try {
    const saved=JSON.parse(raw);
    if (!saved||![1,2].includes(saved.version)||!Number.isFinite(saved.startedAt)||saved.startedAt<0||saved.startedAt>now) return emptyIceKeyRun();
    const key=saved.key??null;
    if (key!==null&&(typeof key!=='string'||!/^SNOWY-FREE-[A-Z2-9]{4}-[A-Z2-9]{4}-\d{4}$/.test(key))) return emptyIceKeyRun();
    if (key&&(!Number.isFinite(saved.unlockedAt)||saved.unlockedAt<saved.startedAt+ICE_WAIT_MS||saved.unlockedAt>now||now-saved.unlockedAt>=PASS_LIFETIME_MS)) return emptyIceKeyRun();
    if (saved.version===1) return {version:2,startedAt:saved.startedAt,strikes:key?5:0,openedAt:key?saved.unlockedAt:null,key,unlockedAt:key?saved.unlockedAt:null};
    if (!Number.isInteger(saved.strikes)||saved.strikes<0||saved.strikes>ICE_REQUIRED_STRIKES) return emptyIceKeyRun();
    if (saved.strikes>0&&now-saved.startedAt<ICE_WAIT_MS) return emptyIceKeyRun();
    if (key&&saved.strikes!==ICE_REQUIRED_STRIKES) return emptyIceKeyRun();
    let openedAt: number|null=null;
    if (saved.strikes===ICE_REQUIRED_STRIKES) {
      openedAt=saved.openedAt??(key?saved.unlockedAt:now);
      if (typeof openedAt!=='number'||!Number.isFinite(openedAt)||openedAt<saved.startedAt+ICE_WAIT_MS||openedAt>now) return emptyIceKeyRun();
      // Legacy grants existed before the staged extraction animation. Preserve
      // their original grant time after migration; new live extraction still waits800ms.
      if (key&&saved.unlockedAt<openedAt) return emptyIceKeyRun();
    }
    return {version:2,startedAt:saved.startedAt,strikes:saved.strikes,openedAt,key,unlockedAt:key?saved.unlockedAt:null};
  } catch {return emptyIceKeyRun();}
}
