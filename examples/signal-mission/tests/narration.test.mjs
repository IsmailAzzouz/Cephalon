import test from 'node:test';
import assert from 'node:assert/strict';
import { MissionNarration } from '../src/MissionNarration.js';
import { AgentSequence } from '../src/AgentSequence.js';
import { AvatarAnimationController } from '../../../packages/avatar/src/AvatarAnimationController.js';

test('A checkout without a voice pack can complete the mission without Web Audio',async t=>{
  t.mock.method(globalThis,'fetch',async()=>({status:404,ok:false}));
  const controller=new AvatarAnimationController({demo:false});
  const narration=new MissionNarration({controller,audio:{}});
  assert.equal(await narration.ready,false);
  assert.equal(await narration.prime(),null);
  assert.equal(narration.audio.context,undefined);
  const sequence=new AgentSequence(controller,{onChange:(snapshot,type)=>narration.handle(snapshot,type)});
  sequence.canAdvance=()=>!narration.waiting;
  sequence.start({demo:false});sequence.update(100);
  assert.equal(sequence.status,'complete');
  assert.equal(sequence.verification.verified,true);
  assert.match(sequence.report,/Relay E-17/);
  assert.equal(narration.enabled,false);
});

test('A failed voice service is reported as an error rather than treated as an absent optional pack',async t=>{
  t.mock.method(globalThis,'fetch',async()=>({status:500,ok:false}));
  const context={state:'running',resume:async()=>{}};
  const narration=new MissionNarration({controller:{},audio:{context}});
  assert.equal(await narration.ready,false);
  await assert.rejects(narration.prime(),/English mission audio is unavailable/);
  assert.equal(narration.unavailable,false);
});
