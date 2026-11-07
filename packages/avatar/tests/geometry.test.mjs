import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '#three';
import { makeCrystalGeometry,crystalCorners,crystalEdges } from '../src/CrystalBody.js';
import { CrystalFractures } from '../src/CrystalFractures.js';
import { AvatarRig } from '../src/AvatarRig.js';
import { VoiceRings } from '../src/VoiceRings.js';
import { defaults,neutralFrame } from '../src/settings.js';

test('The hexahedron is a closed manifold with eight shared corners and twelve outer edges',()=>{
  const geometry=makeCrystalGeometry(),p=geometry.attributes.position;
  assert.equal(crystalCorners.length,8);assert.equal(crystalEdges.length,12);assert.equal(p.count,36);
  const vertices=new Set(),edges=new Map();let volume=0;
  const key=v=>v.toArray().map(n=>n.toFixed(5)).join(',');
  for(let i=0;i<p.count;i+=3){
    const triangle=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,i+j));
    triangle.forEach(v=>vertices.add(key(v)));
    for(let j=0;j<3;j++){const edge=[key(triangle[j]),key(triangle[(j+1)%3])].sort().join('|');edges.set(edge,(edges.get(edge)||0)+1);}
    volume+=triangle[0].dot(new THREE.Vector3().crossVectors(triangle[1],triangle[2]))/6;
  }
  assert.equal(vertices.size,8);assert.ok([...edges.values()].every(count=>count===2));assert.ok(volume>7.5&&volume<10);
  assert.ok([...p.array,...geometry.attributes.normal.array].every(Number.isFinite));geometry.dispose();
});

test('All three wave layers remain world-horizontal while the crystal rotates freely',()=>{
  const rig=new AvatarRig(),rings=new VoiceRings();rig.attachHorizontal(rings.group);rig.positionRoot.position.set(.2,.4,.1);
  for(const rotation of [[.04,.18,.78],[.65,2.3,1.1],[-.6,-4.2,2.1]]){
    rig.crystalRoot.rotation.set(...rotation);rig.positionRoot.updateMatrixWorld(true);rings.update(neutralFrame(),{...defaults},rig.crystalRoot.matrixWorld);
    const normal=new THREE.Vector3(0,1,0).transformDirection(rings.group.matrixWorld);
    assert.ok(normal.distanceTo(new THREE.Vector3(0,1,0))<1e-10);
    assert.equal(rings.group.parent,rig.positionRoot);assert.notEqual(rings.group.parent,rig.crystalRoot);
    const marker=rings.tickGeometry.attributes.position;for(let i=0;i<marker.count;i++)assert.equal(marker.getY(i),0);
    const width=rings.ribbon.attributes.position;assert.ok([...width.array].every(Number.isFinite));
  }
  assert.equal(rings.tickGeometry.attributes.position.count,96*2);
});

test('The energetic wave geometry stays bounded through all signal intensities',()=>{
  const rings=new VoiceRings();
  for(let i=0;i<200;i++){
    const frame={...neutralFrame(),time:i/30,voice:i%10/10,mic:(i%7)/7,glitch:i%3/3,high:.7,mid:.6,surprise:i%5/5,happy:.5};
    rings.update(frame,{...defaults},new THREE.Matrix4());
    const p=rings.ribbon.attributes.position;
    for(let j=0;j<p.count;j++){assert.ok(Math.abs(p.getY(j))<.05);const radius=Math.hypot(p.getX(j),p.getZ(j));assert.ok(radius>1.1&&radius<2.2);}
  }
});

test('Micro-fragments are invisible at rest and return exactly to their home positions',()=>{
  const fractures=new CrystalFractures();const config={...defaults,fractures:true,fragmentsIntensity:1};
  fractures.update(neutralFrame(),config,7);assert.equal(fractures.shards.visible,false);
  fractures.update({...neutralFrame(),glitch:.9,fracture:.8,time:.1},config,7);assert.equal(fractures.shards.visible,true);
  fractures.update(neutralFrame(),config,7);assert.equal(fractures.shards.visible,false);
  fractures.shards.children.forEach(shard=>{assert.ok(shard.position.distanceTo(shard.userData.home)<1e-10);assert.ok(Math.abs(shard.rotation.x)<1e-10);assert.ok(Math.abs(shard.rotation.y)<1e-10);});
});
