import { BufferAttribute, type BufferGeometry } from 'three';

/** Deduplicate byte-identical float attribute tuples. Triangle order, seams,
 * normals, UVs and all samples stay exact; no quantization or simplification.
 * Static triangles only, before first GPU upload, without gl_VertexID shaders. */
export function indexGeometryExactly(geometry: BufferGeometry): boolean {
  if (geometry.index || Object.keys(geometry.morphAttributes).length) return false;
  const entries = Object.entries(geometry.attributes);
  if (!entries.length || entries.some(([, a]) => !(a instanceof BufferAttribute) || !(a.array instanceof Float32Array) || 'isInstancedBufferAttribute' in a)) return false;
  const count = entries[0][1].count;
  if (entries.some(([, a]) => a.count !== count)) return false;
  const attributes = entries.map(([name, attribute]) => ({ name, attribute: attribute as BufferAttribute, words: new Uint32Array(attribute.array.buffer, attribute.array.byteOffset, attribute.array.length) }));
  const unique: number[] = [], indices = new Uint32Array(count), lookup = new Map<string, number>();
  let stride = 0;
  for (const { attribute } of attributes) stride += attribute.itemSize * 4;
  for (let vertex = 0; vertex < count; vertex++) {
    let key = '';
    for (const { attribute, words } of attributes) for (let component = 0; component < attribute.itemSize; component++) {
      const word = words[vertex * attribute.itemSize + component];
      key += String.fromCharCode(word >>> 16, word & 65535);
    }
    let index = lookup.get(key);
    if (index === undefined) { index = unique.length; unique.push(vertex); lookup.set(key, index); }
    indices[vertex] = index;
  }
  const short = unique.length <= 65535;
  if (unique.length * stride + count * (short ? 2 : 4) >= count * stride) return false;
  for (const { name, attribute, words } of attributes) {
    const array = new Float32Array(unique.length * attribute.itemSize), target = new Uint32Array(array.buffer);
    for (let vertex = 0; vertex < unique.length; vertex++) target.set(words.subarray(unique[vertex] * attribute.itemSize, (unique[vertex] + 1) * attribute.itemSize), vertex * attribute.itemSize);
    const indexed = new BufferAttribute(array, attribute.itemSize, attribute.normalized);
    indexed.name = attribute.name; indexed.gpuType = attribute.gpuType; indexed.setUsage(attribute.usage);
    geometry.setAttribute(name, indexed);
  }
  geometry.setIndex(new BufferAttribute(short ? new Uint16Array(indices) : indices, 1));
  return true;
}
