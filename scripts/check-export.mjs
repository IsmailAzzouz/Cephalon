// Run after the build to verify the browser surface and redistribution notices.
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

const root=fileURLToPath(new URL('../dist/',import.meta.url));
for(const path of ['index.html','src/main.js','packages/avatar/src/CephalonAvatar.js',
  'examples/signal-mission/src/AgentSequence.js','vendor/three/three.module.js',
  'vendor/three/LICENSE','fonts/Barlow-Regular.ttf','fonts/OFL.txt',
  'LICENSE','THIRD_PARTY_NOTICES.md','audio/README.md']){
  assert.ok((await readFile(join(root,path))).length>0,path);
}
const files=[];
async function walk(directory){
  for(const item of await readdir(directory,{withFileTypes:true})){
    const path=join(directory,item.name);
    if(item.isDirectory())await walk(path);else files.push(relative(root,path).replaceAll('\\','/'));
  }
}
await walk(root);
for(const path of files){
  assert.ok(!/^(apps|agents|tooling|node_modules|\.git|\.aws|\.codex)\//.test(path),path);
  assert.ok(!/\.(pth|onnx|pt|index)$/.test(path),`Model weight exported: ${path}`);
}
for(const collection of ['ordis','ordis-en','ordis-mission','ordis-official']){
  await readFile(join(root,'audio',collection,'NOTICE.md'));
  const manifest=JSON.parse(await readFile(join(root,'audio',collection,'manifest.json'),'utf8'));
  for(const clip of manifest.clips){
    for(const format of ['mp3','wav','ogg'])if(clip[format]){
      assert.ok(clip[format].startsWith(`/audio/${collection}/`),clip[format]);
      await readFile(join(root,clip[format].slice(1)));
    }
  }
}
console.log(`Static export checked: ${files.length} files, licenses and voice notices present, model weights excluded.`);
