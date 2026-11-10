import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { getBounds } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { MeshoptDecoder } from 'meshoptimizer';

const root=fileURLToPath(new URL('../',import.meta.url));
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder':await draco3d.createDecoderModule(),'meshopt.decoder':MeshoptDecoder,
});
const source=await io.read(path.join(root,'public/assets/snowy_hub.glb'));
const sourceScene=source.getRoot().listScenes().find(s=>s.getName()==='Snowy Hub · WEB · auto_farm');
const originalBounds=getBounds(sourceScene);
const originalNames=sourceScene.listChildren().map(n=>n.getName()).sort();
const report=[];
for(const [codec,extension] of [['draco','KHR_draco_mesh_compression'],['meshopt','EXT_meshopt_compression']]){
  const file=path.join(root,`public/assets/models/snowy_hub.${codec}.glb`);
  const bytes=await fs.readFile(file);
  assert.equal(bytes.toString('utf8',0,4),'glTF');
  const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
  assert.ok(json.extensionsRequired.includes(extension));
  assert.ok(json.extensionsRequired.includes('KHR_texture_basisu'));
  assert.equal(json.scenes.length,1);
  assert.equal(json.meshes.length,4);
  assert.deepEqual(json.images.map(image=>image.mimeType),['image/ktx2']);
  // This actually decodes both codecs, then compares scene bounds and node names
  // to the original authoring scene. It catches corruption and framing regressions.
  const decoded=await io.read(file);
  const scene=decoded.getRoot().getDefaultScene();
  assert.deepEqual(scene.listChildren().map(node=>node.getName()).sort(),originalNames);
  const bounds=getBounds(scene);
  for(const axis of [0,1,2])for(const edge of ['min','max']){
    assert.ok(Math.abs(bounds[edge][axis]-originalBounds[edge][axis])<.005,`${codec}: ${edge}[${axis}] moved`);
  }
  for(const texture of decoded.getRoot().listTextures()){
    assert.equal(texture.getMimeType(),'image/ktx2');
    assert.deepEqual(Array.from(texture.getImage().slice(0,12)),[171,75,84,88,32,50,48,187,13,10,26,10]);
  }
  report.push({codec,bytes:bytes.length,bounds,nodes:originalNames.length});
}
console.log(JSON.stringify({passed:true,variants:report},null,2));
