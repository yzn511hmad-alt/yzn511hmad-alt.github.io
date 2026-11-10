import type { Plugin } from 'vite';
import { promises as fs, createReadStream } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { promisify } from 'node:util';
import * as zlib from 'node:zlib';
import type { IncomingMessage, ServerResponse } from 'node:http';
import assetSelection from './free-key-assets.json' with { type: 'json' };

const brotli = promisify(zlib.brotliCompress), gzip = promisify(zlib.gzip);
const zstd = typeof zlib.zstdCompress === 'function' ? promisify(zlib.zstdCompress) : undefined;
const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
const encodings = [
  { name: 'br', suffix: '.br', compress: (bytes: Buffer) => brotli(bytes, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11, [zlib.constants.BROTLI_PARAM_LGWIN]: 24, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: bytes.length } }), decode: zlib.brotliDecompressSync },
  { name: 'gzip', suffix: '.gz', compress: (bytes: Buffer) => gzip(bytes, { level: 9, memLevel: 9 }), decode: zlib.gunzipSync },
  ...(zstd ? [{ name: 'zstd', suffix: '.zst', compress: (bytes: Buffer) => zstd(bytes, { params: { [zlib.constants.ZSTD_c_compressionLevel]: 22, [zlib.constants.ZSTD_c_checksumFlag]: 1, [zlib.constants.ZSTD_c_windowLog]: Math.min(23, Math.max(10, Math.ceil(Math.log2(bytes.length)))) } }), decode: zlib.zstdDecompressSync }] : []),
];
const mime: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.riv': 'application/octet-stream', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.avif': 'image/avif', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.glb': 'model/gltf-binary', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8' };
mime['.ktx2'] = 'image/ktx2';
function zstdWindowBytes(frame: Buffer): number {
  if (frame.readUInt32LE(0) !== 0xfd2fb528) throw new Error('Invalid Zstandard frame');
  const descriptor = frame[4], single = Boolean(descriptor & 32), flag = descriptor >>> 6;
  if (!single) { const wd = frame[5], base = 2 ** (10 + (wd >>> 3)); return base + base / 8 * (wd & 7); }
  const offset = 5 + [0, 1, 2, 4][descriptor & 3], size = [1, 2, 4, 8][flag];
  return (size === 8 ? Number(frame.readBigUInt64LE(offset)) : frame.readUIntLE(offset, size)) + (flag === 1 ? 256 : 0);
}
async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const result: string[] = [];
  for (const entry of entries) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(file));
    else if (entry.isFile()) result.push(file);
  }
  return result.sort();
}

async function freeKeyEntryGraph(output: string): Promise<Set<string>> {
  const paths = new Set<string>();
  const visit = async (relative: string) => {
    if (paths.has(relative)) return;
    paths.add(relative);
    const code = await fs.readFile(path.join(output, relative), 'utf8');
    // Vite emits both relative imports and root-relative preload URL arrays.
    for (const match of code.matchAll(/["'`]([^"'`\s<>?#]+\.(?:js|css))["'`]/g)) {
      const value = match[1]; if (/^(?:https?:|data:)/.test(value)) continue;
      const candidates = value.startsWith('/') ? [value.slice(1)] : value.startsWith('assets/') ? [value] : [path.posix.join(path.posix.dirname(relative), value)];
      for (const candidate of candidates) {
        if (candidate.startsWith('../')) continue;
        try { await fs.access(path.join(output, candidate)); } catch { continue; }
        await visit(candidate);
      }
    }
  };
  await visit('free-key.html'); return paths;
}

/** Only Free Key's entry graph and owned asset families receive new sidecars.
 * Vite's normal full public copy and every other page remain intact. */
export async function prepareDelivery(project: string, output: string) {
  const publicRoot = path.join(project, 'public'), rules = assetSelection.patterns.map(value => new RegExp(value));
  const included: Array<{ path: string; bytes: number }> = [], outsideScope: Array<{ path: string; bytes: number }> = [];
  const targets = await freeKeyEntryGraph(output);
  for (const source of await walk(publicRoot)) {
    const relative = path.relative(publicRoot, source).split(path.sep).join('/');
    const keep = assetSelection.files.includes(relative) || assetSelection.directories.some(dir => relative.startsWith(dir + '/')) || rules.some(rule => rule.test(relative));
    const bytes = (await fs.stat(source)).size;
    (keep ? included : outsideScope).push({ path: relative, bytes });
    if (keep) targets.add(relative);
  }
  for (const relative of assetSelection.files) await fs.access(path.join(output, relative));
  for (const format of ['wide', 'standard', 'landscape', 'tall', 'portrait']) for (const phase of ['waiting', 'available', 'ready']) for (const version of ['tall', 'portrait'].includes(format) ? [2] : [5, 11]) {
    await fs.access(path.join(output, `assets/realistic-winter/initial-camp-${format}-${phase}-v${version}.webp`));
  }
  for (const relative of targets) if (/\.(html|js|css)$/.test(relative)) {
    const file = path.join(output, relative);
    const code = await fs.readFile(file, 'utf8');
    for (const match of code.matchAll(/\/(?:assets|fonts|rive|draco|basis)\/[A-Za-z0-9_./-]+\.(?:webp|png|avif|jpe?g|woff2|wasm|riv|mp4|glb|svg|js|css|json)\b/g)) {
      try { await fs.access(path.join(output, match[0])); }
      catch { throw new Error(`Free Key dependency missing: ${match[0]} referenced by ${relative}`); }
    }
  }
  const cache = path.join(project, 'work', 'compression-cache'); await fs.mkdir(cache, { recursive: true });
  const files = [];
  // Sequential files bound peak compression RAM; runtime browsers never perform this work.
  for (const relative of [...targets].sort()) {
    const file = path.join(output, relative);
    const source = await fs.readFile(file), sha256 = hash(source), variants: Record<string, number> = {};
    if (source.length >= 256 && path.extname(file) !== '.mp4') for (const codec of encodings) {
      const cached = path.join(cache, `${sha256}-${codec.name === 'zstd' ? 'window23-v2' : 'v1'}${codec.suffix}`);
      let packed: Buffer;
      try { packed = await fs.readFile(cached); } catch { packed = await codec.compress(source); await fs.writeFile(cached, packed); }
      if (!codec.decode(packed).equals(source)) throw new Error(`Compression round-trip differs: ${file} (${codec.name})`);
      // RFC9659: all HTTP zstd frames must fit the 8MiB decoder window limit.
      if (codec.name === 'zstd' && zstdWindowBytes(packed) > 8 * 1024 * 1024) throw new Error(`Zstandard HTTP window exceeds 8MiB: ${file}`);
      // A codec is deployed only if it really saves bytes, even for already compressed media.
      if (packed.length < source.length) { await fs.writeFile(file + codec.suffix, packed); variants[codec.name] = packed.length; }
    }
    files.push({ path: path.relative(output, file).split(path.sep).join('/'), bytes: source.length, sha256, variants });
  }
  const report = { version: 1, scope: assetSelection.scope, codecs: encodings.map(codec => codec.name), settings: 'Brotli quality11/window24; gzip9/mem9; optional Zstandard22/checksum with per-input window<=8MiB for HTTP browser compatibility', included, outsideScope, files, originalBytes: files.reduce((n, f) => n + f.bytes, 0), bestNegotiatedBytes: files.reduce((n, f) => n + Math.min(f.bytes, ...Object.values(f.variants)), 0) };
  await fs.mkdir(path.join(project, 'work'), { recursive: true });
  await fs.writeFile(path.join(project, 'work', 'free-key-delivery-report.json'), JSON.stringify(report, null, 2));
  await fs.writeFile(path.join(output, 'free-key-delivery.json'), JSON.stringify({ files: [...targets].sort(), sha256: Object.fromEntries(files.map(file => [file.path, file.sha256])) }));
  console.log(`[Free Key lossless] ${files.length} scoped files/variants; ${report.originalBytes} identity bytes / ${report.bestNegotiatedBytes} best negotiated. Not a single-page transfer total. Other pages/public files unchanged.`);
}

function acceptable(header: string, encoding: string): number {
  const entries = header.toLowerCase().split(',').map(part => part.split(';').map(value => value.trim()));
  const quality = (entry: string[]) => {
    const parameter = entry.slice(1).find(value => value.startsWith('q='));
    const q = parameter ? Number(parameter.slice(2)) : 1;
    return Number.isFinite(q) && q >= 0 && q <= 1 ? q : 0;
  };
  const explicit = entries.find(([name]) => name === encoding);
  if (explicit) return quality(explicit);
  const wildcard = entries.find(([name]) => name === '*');
  // Identity is always acceptable unless explicitly excluded, including wildcard;q=0.
  if (encoding === 'identity') return wildcard && quality(wildcard) === 0 ? 0 : 1;
  return wildcard ? quality(wildcard) : 0;
}

/** Same URLs and MIME types, negotiated exact transport streams. Range media remains seekable. */
export function deliveryMiddleware(output: string) {
  const root = path.resolve(output);
  let manifest: Promise<{ files: Set<string>; sha256: Record<string, string> }> | undefined;
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    let pathname: string;
    try { pathname = decodeURIComponent(new URL(req.url || '/', 'http://local').pathname); } catch { return next(); }
    if (pathname === '/') pathname = '/index.html';
    manifest ??= fs.readFile(path.join(root, 'free-key-delivery.json'), 'utf8').then(text => { const data = JSON.parse(text); return { files: new Set<string>(data.files), sha256: data.sha256 }; }).catch(() => ({ files: new Set<string>(), sha256: {} }));
    const scope = await manifest;
    if (!scope.files.has(pathname.slice(1))) return next();
    const original = path.resolve(root, '.' + pathname);
    if (!original.startsWith(root + path.sep) || /\.(br|gz|zst)$/.test(original)) return next();
    let stat; try { stat = await fs.stat(original); } catch { return next(); }
    if (!stat.isFile()) return next();
    // Let Vite's range-aware server handle videos and explicit range requests.
    if (req.headers.range || path.extname(original) === '.mp4') return next();
    const header = req.headers['accept-encoding'] || '';
    const candidates = [{ name: 'identity', file: original, size: stat.size, q: acceptable(header, 'identity') }];
    for (const codec of encodings) {
      const q = acceptable(header, codec.name); if (!q) continue;
      try { const info = await fs.stat(original + codec.suffix); candidates.push({ name: codec.name, file: original + codec.suffix, size: info.size, q }); } catch { /* No beneficial variant. */ }
    }
    candidates.sort((a, b) => b.q - a.q || a.size - b.size);
    const selected = candidates[0];
    if (!selected.q) { res.statusCode = 406; res.end(); return; }
    const sourceHash = scope.sha256[pathname.slice(1)];
    if (!sourceHash) return next();
    // Content validators survive byte-identical rebuilds instead of tracking copy timestamps.
    const tag = `W/"${sourceHash}-${selected.name}"`;
    res.setHeader('Vary', 'Accept-Encoding'); res.setHeader('ETag', tag);
    // Immutable hashed chunks and long-cached media assets; mutable HTML revalidates.
    const isImmutable = /^\/assets\/[^/]+-[\w-]{8}\.(js|css)$/.test(pathname);
    const isStaticAsset = /\.(webp|png|jpg|jpeg|svg|woff2|ktx2|riv|wasm|glb)$/.test(pathname);
    res.setHeader('Cache-Control', isImmutable ? 'public, max-age=31536000, immutable' : isStaticAsset ? 'public, max-age=86400, stale-while-revalidate=604800' : 'public, max-age=0, must-revalidate');
    res.setHeader('Content-Type', mime[path.extname(original)] || 'application/octet-stream');
    if (selected.name !== 'identity') res.setHeader('Content-Encoding', selected.name);
    const validators = req.headers['if-none-match']?.split(',').map(value => value.trim().replace(/^W\//, ''));
    if (validators?.includes(tag.replace(/^W\//, '')) || validators?.includes('*')) { res.statusCode = 304; res.end(); return; }
    res.setHeader('Content-Length', selected.size);
    if (req.method === 'HEAD') { res.end(); return; }
    createReadStream(selected.file).on('error', () => { if (!res.headersSent) res.statusCode = 500; res.end(); }).pipe(res);
  };
}

export function losslessDelivery(): Plugin {
  let root: string, output: string, building = false;
  return {
    name: 'snowy-lossless-delivery',
    configResolved(config) { root = config.root; output = path.resolve(root, config.build.outDir); building = config.command === 'build'; },
    async closeBundle() { if (building) await prepareDelivery(root, output); },
    configurePreviewServer(server) { server.middlewares.use(deliveryMiddleware(output)); },
  };
}
