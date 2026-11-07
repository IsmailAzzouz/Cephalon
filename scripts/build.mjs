import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { browserFiles, browserDirectories } from './layout.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const dist=join(root,'dist');
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
for(const [target,source] of [...browserFiles,...browserDirectories]){
  await mkdir(join(dist,target,'..'),{recursive:true});
  await cp(join(root,source),join(dist,target),{recursive:true});
}
console.log('Avatar playground exported to dist/. Run npm run preview to serve it.');
