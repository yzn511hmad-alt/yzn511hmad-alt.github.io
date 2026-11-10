import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const iceCache = new Map<number, THREE.BufferGeometry>();
const DB_NAME = 'snowy_ice_cache_v1';
const STORE_NAME = 'geometries';

function getDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise(resolve => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        try { req.result.createObjectStore(STORE_NAME); } catch {}
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function restoreFromArrays(pos: Float32Array, norm: Float32Array, idx: Uint16Array | Uint32Array): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(norm), 3));
  g.setIndex(new THREE.BufferAttribute(idx.length <= 65535 ? new Uint16Array(idx) : new Uint32Array(idx), 1));
  g.name = 'natural-hewn-ice-watertight';
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

export async function preloadIceGeometry(segments = 40): Promise<void> {
  const count = Number.isFinite(segments) ? Math.max(8, Math.min(80, Math.round(segments))) : 40;
  if (iceCache.has(count)) return;

  const db = await getDb();
  if (db) {
    try {
      const record = await new Promise<{ pos: Float32Array; norm: Float32Array; idx: Uint16Array } | null>(resolve => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(`ice_${count}`);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => resolve(null);
      });
      if (record && record.pos && record.norm && record.idx) {
        const restored = restoreFromArrays(record.pos, record.norm, record.idx);
        iceCache.set(count, restored);
        return;
      }
    } catch {}
  }

  const computed = computeMeltIceGeometry(count);
  iceCache.set(count, computed);

  if (db) {
    try {
      const pos = computed.getAttribute('position').array as Float32Array;
      const norm = computed.getAttribute('normal').array as Float32Array;
      const idx = computed.getIndex()!.array as Uint16Array;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put({ pos, norm, idx }, `ice_${count}`);
    } catch {}
  }
}

function computeMeltIceGeometry(count: number): THREE.BufferGeometry {
  const geometry = new THREE.BoxGeometry(2, 2, 2, count, count, count);
  const positions = geometry.getAttribute('position');
  const point = new THREE.Vector3(), inner = new THREE.Vector3(), normal = new THREE.Vector3();
  const clips = [
    { normal: new THREE.Vector3(.64, .62, .45).normalize(), limit: 1.37 },
    { normal: new THREE.Vector3(-.74, .49, -.46).normalize(), limit: 1.39 },
    { normal: new THREE.Vector3(.09, 1., -.045).normalize(), limit: .955 },
  ];
  const remap = (value: number) => Math.abs(value) <= .75 ? value / .75 * .85 : Math.sign(value) * (.85 + (Math.abs(value) - .75) / .25 * .15);
  for (let i = 0; i < positions.count; i++) {
    point.set(remap(positions.getX(i)), remap(positions.getY(i)), remap(positions.getZ(i)));
    inner.copy(point).clampScalar(-.85, .85); normal.copy(point).sub(inner).normalize(); point.copy(inner).addScaledVector(normal, .15);
    const h = (point.y + 1) * .5;
    point.x *= 1 - .036 * h; point.z *= 1 - .024 * h;
    const weather = .006 * Math.sin(point.x * 9. + point.y * 4.) * Math.sin(point.z * 7. - point.y * 3.) + .004 * Math.sin(point.x * 19. + point.z * 13.);
    point.addScaledVector(normal, weather * THREE.MathUtils.smoothstep(h, .04, .20));
    for (const clip of clips) { const d = point.dot(clip.normal) - clip.limit; if (d > 0) point.addScaledVector(clip.normal, -d); }
    positions.setXYZ(i, point.x, point.y, point.z);
  }
  geometry.deleteAttribute('uv'); geometry.deleteAttribute('normal');
  const welded = mergeVertices(geometry, 1e-5); geometry.dispose(); welded.computeVertexNormals();
  welded.name = 'natural-hewn-ice-watertight'; welded.computeBoundingBox(); welded.computeBoundingSphere();
  return welded;
}

/** An asymmetrical hewn ice block: level contact, shallow weathering and
 * clipped upper corners. The welded topology remains compatible with melting. */
export function createMeltIceGeometry(segments = 40): THREE.BufferGeometry {
  const count = Number.isFinite(segments) ? Math.max(8, Math.min(80, Math.round(segments))) : 40;
  const cached = iceCache.get(count);
  if (cached) {
    return cached.clone();
  }
  const computed = computeMeltIceGeometry(count);
  iceCache.set(count, computed.clone());
  return computed;
}
