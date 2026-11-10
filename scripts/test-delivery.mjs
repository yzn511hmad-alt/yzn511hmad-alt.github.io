import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import * as zlib from 'node:zlib';
const { brotliDecompressSync, gunzipSync, zstdDecompressSync } = zlib;

const base = process.argv[2] || process.env.SNOWY_URL || 'http://127.0.0.1:4173';
const output = path.resolve(process.argv[3] || 'dist');
function request(file, headers = {}, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(new URL(file, base), { method, headers }, res => {
      const chunks = []; res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    }); req.on('error', reject); req.end();
  });
}
const files = await fs.readdir(path.join(output, 'assets'));
const sample = '/assets/' + files.find(name => /^vendor-three-.*\.js$/.test(name));
const expected = await fs.readFile(path.join(output, sample));
const checks = [];
for (const [encoding, decode] of [['br', brotliDecompressSync], ['gzip', gunzipSync], ['zstd', zstdDecompressSync]]) {
  if (typeof decode !== 'function') continue;
  const r = await request(sample, { 'Accept-Encoding': encoding + ', identity;q=0' });
  assert.equal(r.status, 200); assert.equal(r.headers['content-encoding'], encoding);
  assert.ok(decode(r.body).equals(expected)); assert.match(r.headers['content-type'], /javascript/);
  assert.match(r.headers.vary, /Accept-Encoding/i); assert.match(r.headers['cache-control'], /immutable/);
  assert.equal(Number(r.headers['content-length']), r.body.length);
  const head = await request(sample, { 'Accept-Encoding': encoding + ', identity;q=0' }, 'HEAD');
  assert.equal(head.body.length, 0); assert.equal(Number(head.headers['content-length']), r.body.length);
  const cached = await request(sample, { 'Accept-Encoding': encoding + ', identity;q=0', 'If-None-Match': '"other", ' + r.headers.etag });
  assert.equal(cached.status, 304); assert.equal(cached.body.length, 0);
  assert.equal((await request(sample, { 'Accept-Encoding': encoding + ', identity;q=0', 'If-None-Match': r.headers.etag.replace(/^W\//, '') })).status, 304);
  checks.push({ encoding, bytes: r.body.length, roundTripExact: true, head: true, revalidation: true });
}
for (const header of ['', 'identity', 'br;q=0,gzip;q=0,zstd;q=0', '*;q=0.5', 'unknown']) {
  const r = await request(sample, { 'Accept-Encoding': header }); assert.equal(r.status, 200);
  assert.equal(r.headers['content-encoding'], undefined); assert.ok(r.body.equals(expected));
}
assert.equal((await request(sample, { 'Accept-Encoding': '*;q=0' })).status, 406);
assert.equal((await request(sample, { 'Accept-Encoding': 'br;q=1,gzip;q=0,identity;q=0.5' })).headers['content-encoding'], 'br');
assert.equal((await request(sample, { 'Accept-Encoding': 'gzip ;q=1, identity;q=0' })).headers['content-encoding'], 'gzip');
const font = await request('/fonts/sekuya.woff2', { 'Accept-Encoding': 'identity' });
assert.equal(font.headers['content-type'], 'font/woff2');
assert.ok(font.body.equals(await fs.readFile(path.join(output, 'fonts/sekuya.woff2'))));
await assert.rejects(fs.access(path.join(output, 'rive/rive.wasm.br')));
await assert.rejects(fs.access(path.join(output, 'index.html.br')));
await assert.rejects(fs.access(path.join(output, 'snowy-logo.png.br')));
const video = '/assets/quality-v1/fire-hd-loop.mp4';
const range = await request(video, { Range: 'bytes=0-127', 'Accept-Encoding': 'br,gzip,zstd' });
assert.equal(range.status, 206); assert.equal(range.headers['content-encoding'], undefined);
assert.equal(range.body.length, 128); assert.ok(range.body.equals((await fs.readFile(path.join(output, video))).subarray(0, 128)));
const html = await request('/free-key.html', { 'Accept-Encoding': 'br' }); assert.match(html.headers['cache-control'], /must-revalidate/);
console.log(JSON.stringify({ passed: true, scope: 'Free Key only', sourceBytes: expected.length, checks, identityAndQValues: true, font: true, range: true, unrelatedAssetsUntouched: true }, null, 2));
