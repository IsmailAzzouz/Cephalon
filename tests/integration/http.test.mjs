import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { requestFile, createHandler } from '../../scripts/http.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url)).replace(/\/$/,'');

test('Only application assets can be served; project and secret files stay inaccessible',()=>{
  for(const path of ['/README.md','/package.json','/.aws/credentials','/.git/config','/scripts/serve.mjs','/src/%2e%2e/package.json','/src/..%2f..%2fetc/passwd','/src/%5c..%5cpackage.json','/%00','/%ZZ','/apps/companion/host/README.md','/agents/ordis/README.md','/tooling/voice/models/ordis/Ordis.pth','/packages/avatar/package.json','/packages/contracts/src/avatar-events.d.ts','/examples/avatar-playground/package.json']){
    assert.equal(requestFile(path,root),null,path);
  }
});

test('Development and export resolve their own local fonts, modules and entry point',()=>{
  assert.equal(requestFile('/',root),root+'/examples/avatar-playground/index.html');
  assert.equal(requestFile('/src/main.js?v=1',root),root+'/examples/avatar-playground/src/main.js');
  assert.equal(requestFile('/packages/avatar/src/CephalonAvatar.js',root),root+'/packages/avatar/src/CephalonAvatar.js');
  assert.equal(requestFile('/examples/signal-mission/src/AgentSequence.js',root),root+'/examples/signal-mission/src/AgentSequence.js');
  assert.equal(requestFile('/vendor/three/three.module.js',root),root+'/packages/avatar/vendor/three/three.module.js');
  assert.equal(requestFile('/fonts/Barlow-Regular.ttf',root,true),root+'/fonts/Barlow-Regular.ttf');
});

async function request(url,method='GET'){
  const response={writeHead(status,headers){this.status=status;this.headers=headers;},end(body){this.body=body;}};
  await createHandler(root)({url,method},response);
  return response;
}

test('The entry point and both Three.js modules are served as browser-readable files',async()=>{
  for(const path of ['/','/src/main.js','/src/studio/AvatarDebug.js','/packages/avatar/src/CephalonAvatar.js','/packages/avatar/src/AvatarAnimationController.js','/examples/signal-mission/src/AgentSequence.js','/src/style.css','/vendor/three/three.module.js','/vendor/three/three.core.js','/fonts/Barlow-Regular.ttf','/fonts/BarlowCondensed-Regular.ttf']){
    const response=await request(path);
    assert.equal(response.status,200,path);
    assert.ok(response.body.length>0,path);
    assert.equal(response.headers['Content-Length'],response.body.length);
    if(path.endsWith('.js'))assert.equal(response.headers['Content-Type'],'text/javascript; charset=utf-8');
  }
});

test('HEAD returns headers without a body; unsupported methods and missing files fail cleanly',async()=>{
  const head=await request('/','HEAD');
  assert.equal(head.status,200);assert.equal(head.body,undefined);
  assert.equal((await request('/','POST')).status,405);
  assert.equal((await request('/src/missing.js')).status,404);
  assert.equal((await request('/src/')).status,404);
});

test('Voice packs and redistribution notices resolve in both development and export',async()=>{
  assert.equal(requestFile('/audio/ordis-en/manifest.json',root),root+'/examples/avatar-playground/public/audio/ordis-en/manifest.json');
  assert.equal(requestFile('/audio/ordis-en/manifest.json',root,true),root+'/audio/ordis-en/manifest.json');
  for(const path of ['/LICENSE','/THIRD_PARTY_NOTICES.md','/fonts/OFL.txt','/vendor/three/LICENSE']){
    assert.equal((await request(path)).status,200,path);
  }
});
