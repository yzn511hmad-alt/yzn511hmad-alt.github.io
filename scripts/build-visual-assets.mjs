import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRTextureBasisu } from '@gltf-transform/extensions';
import { prune, dedup, weld, draco, meshopt } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const destination = path.join(root, 'public/assets/models');
const scratch = path.join(root, 'work/visual-assets');
await fs.mkdir(destination, {recursive:true});
await fs.mkdir(scratch, {recursive:true});

// Subtle brushed housing normal map. Dynamic UI textures remain canvases so the
// panel can update immediately; only the static material uses GPU compression.
const size = 128;
const pixels = Buffer.alloc(size * size * 3);
for (let y=0; y<size; y++) for (let x=0; x<size; x++) {
  const i = (y * size + x) * 3;
  pixels[i] = 128 + Math.round(Math.sin(y * 1.8) * 7);
  pixels[i+1] = 128 + Math.round(Math.sin(x * .12) * 3);
  pixels[i+2] = 255;
}
const png = path.join(scratch, 'housing-normal.png');
const ktx = path.join(scratch, 'housing-normal.ktx2');
await sharp(pixels, {raw:{width:size,height:size,channels:3}}).png().toFile(png);
const basisPackage = path.dirname(require.resolve('@gpu-tex-enc/basis/package.json'));
const binary = process.platform === 'win32' ? 'bin/win32-x64/basisu.exe'
  : `bin/${process.platform}-${process.arch}/basisu`;
execFileSync(path.join(basisPackage, binary), [
  '-file',png,'-output_file',ktx,'-ktx2','-uastc','-uastc_level','2',
  '-ktx2_no_zstandard','-linear','-mipmap',
], {stdio:'inherit'});

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.encoder': await draco3d.createEncoderModule(),
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder,
});
const source = path.join(root, 'public/assets/snowy_hub.glb');
const normalBytes = new Uint8Array(await fs.readFile(ktx));
const report = {sourceBytes:(await fs.stat(source)).size,variants:[]};
for (const codec of ['draco', 'meshopt']) {
  const document = await io.read(source);
  const selected = document.getRoot().listScenes().find(scene => scene.getName() === 'Snowy Hub · WEB · auto_farm');
  if (!selected) throw new Error('The original web scene is missing.');
  document.getRoot().setDefaultScene(selected);
  for (const scene of document.getRoot().listScenes()) if (scene !== selected) scene.dispose();
  // The source also contains authoring scenes and animations. Scene.dispose()
  // detaches a scene; remove its orphan nodes explicitly before pruning.
  const liveNodes = new Set();
  selected.traverse(node => liveNodes.add(node));
  document.getRoot().listAnimations().forEach(animation => animation.dispose());
  document.getRoot().listNodes().filter(node => !liveNodes.has(node)).forEach(node => node.dispose());
  await document.transform(prune({keepAttributes:true}));
  document.createExtension(KHRTextureBasisu).setRequired(true);
  const normal = document.createTexture('Brushed housing normal').setMimeType('image/ktx2').setImage(normalBytes);
  const housing = document.createMaterial('Graphite housing').setBaseColorFactor([.006,.008,.01,1])
    .setMetallicFactor(.35).setRoughnessFactor(.42).setNormalTexture(normal).setNormalScale(.12);
  const screen = document.createMaterial('Dynamic UI placeholder').setBaseColorFactor([0,0,0,1]);
  for (const node of selected.listChildren()) {
    const mesh = node.getMesh();
    if (mesh && node.getName().toLowerCase().includes('housing')) {
      mesh.listPrimitives().forEach(primitive => primitive.setMaterial(housing));
    } else if (mesh) mesh.listPrimitives().forEach(primitive => primitive.setMaterial(screen));
  }
  await document.transform(prune({keepAttributes:true}), dedup(), weld());
  if (codec === 'draco') await document.transform(draco({method:'edgebreaker',quantizePosition:16,quantizeNormal:12,quantizeTexcoord:14}));
  else await document.transform(meshopt({encoder:MeshoptEncoder,level:'high'}));
  const filename = `snowy_hub.${codec}.glb`;
  await io.write(path.join(destination, filename),document);
  const result = await io.readAsJSON(path.join(destination, filename));
  report.variants.push({filename,bytes:(await fs.stat(path.join(destination,filename))).size,
    extensions:result.json.extensionsUsed,scenes:result.json.scenes.length,meshes:result.json.meshes.length,
    images:result.json.images.map(image=>image.mimeType)});
}

// Ship matching official decoders and self-hosted Rive runtimes.
for(const [sourceDir,targetDir,names] of [
  ['node_modules/three/examples/jsm/libs/draco/gltf','public/draco',['draco_decoder.js','draco_decoder.wasm','draco_wasm_wrapper.js']],
  ['node_modules/three/examples/jsm/libs/basis','public/basis',['basis_transcoder.js','basis_transcoder.wasm']],
  ['node_modules/@rive-app/canvas','public/rive',['rive.wasm','rive_fallback.wasm']],
]) {
  await fs.mkdir(path.join(root,targetDir),{recursive:true});
  for(const name of names) await fs.copyFile(path.join(root,sourceDir,name),path.join(root,targetDir,name));
}
await fs.writeFile(path.join(destination,'manifest.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
