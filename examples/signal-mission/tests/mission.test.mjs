import test from 'node:test';
import assert from 'node:assert/strict';
import { AgentSequence,missionPhases } from '../src/AgentSequence.js';
import { missionBrief,transmissions,matchesSignal,analyseTransmissions,verifyAnalysis,makeReport } from '../src/SignalScenario.js';
import { AvatarAnimationController } from '../../../packages/avatar/src/AvatarAnimationController.js';

test('Local search cross-checks frequency and signature instead of returning a canned match',()=>{
  const matches=transmissions.filter(record=>matchesSignal(record));
  assert.deepEqual(matches.map(record=>record.id),['TR-004','TR-008']);
  assert.equal(matchesSignal(transmissions.find(record=>record.id==='TR-002')),false);
  assert.equal(matchesSignal(transmissions.find(record=>record.id==='TR-010')),false);
});

test('The report numbers and recommendation are derived from the examined packets',()=>{
  const result=analyseTransmissions(transmissions.filter(record=>matchesSignal(record)));
  assert.equal(result.source,'Relay E-17');assert.equal(result.sector,'Europa');assert.equal(result.packets,200);
  assert.equal(result.corrupted,4);assert.equal(result.integrity,98);assert.equal(result.powerExcess,34);assert.equal(result.risk,'moderate');
  const verification=verifyAnalysis(result);assert.equal(verification.verified,true);
  const report=makeReport(result,verification);assert.match(report,/Operator/);assert.match(report,/34%/);assert.match(report,/98%/);assert.match(report,/recommend/);
});

test('Verification requires independent observations rather than duplicated evidence',()=>{
  const record=transmissions.find(record=>record.id==='TR-004');
  const result=analyseTransmissions([record,{...record}]);assert.equal(verifyAnalysis(result).verified,false);
});

test('The search visits real batches over time and cannot discover later records prematurely',()=>{
  const controller=new AvatarAnimationController(),sequence=new AgentSequence(controller);sequence.start();
  sequence.update(6);assert.equal(sequence.phase.id,'search');assert.equal(sequence.scanned,0);assert.equal(sequence.matches.length,0);
  sequence.update(1.4);assert.equal(sequence.scanned,3);assert.equal(sequence.matches.length,0);
  sequence.update(1);assert.equal(sequence.scanned,5);assert.deepEqual(sequence.matches.map(record=>record.id),['TR-004']);
  sequence.update(2.8);assert.equal(sequence.scanned,12);assert.equal(sequence.phase.id,'found');assert.equal(sequence.matches.length,2);
});

test('The full mission follows every phase, verifies evidence and returns to a resting avatar',()=>{
  const controller=new AvatarAnimationController(),phases=[];
  const sequence=new AgentSequence(controller,{onChange:(snapshot,type)=>{if(type==='phase')phases.push(snapshot.phase);}});
  sequence.start();
  for(let i=0;i<2000&&sequence.running;i++){sequence.update(.025);controller.update(.025);assert.ok(sequence.snapshot().progress>=0&&sequence.snapshot().progress<=1);}
  assert.deepEqual(phases,missionPhases.map(phase=>phase.id));assert.equal(sequence.status,'complete');assert.equal(sequence.elapsed,sequence.duration);
  assert.equal(sequence.verification.verified,true);assert.match(sequence.snapshot().report,/Relay E-17/);assert.equal(controller.state,'idle');assert.equal(controller.activity,'none');
});

test('Pausing freezes the mission clock and cancellation prevents a later final report',()=>{
  const controller=new AvatarAnimationController({demo:false}),sequence=new AgentSequence(controller);sequence.start();sequence.update(7);
  const before=sequence.snapshot();sequence.setPaused(true);sequence.update(100);
  assert.equal(sequence.elapsed,before.elapsed);assert.equal(sequence.scanned,before.scanned);assert.equal(controller.paused,true);
  sequence.setPaused(false);sequence.update(.5);assert.ok(sequence.elapsed>before.elapsed);
  sequence.stop();const cancelled=sequence.snapshot();sequence.update(100);
  assert.equal(sequence.status,'cancelled');assert.equal(sequence.elapsed,cancelled.elapsed);assert.equal(sequence.snapshot().report,'');
  assert.equal(controller.state,'idle');assert.equal(controller.demo,false);assert.equal(controller.paused,false);
});

test('Replay resets previous results, evidence, logs and progress',()=>{
  const sequence=new AgentSequence(new AvatarAnimationController());sequence.start();sequence.update(100);sequence.start();
  assert.equal(sequence.status,'running');assert.equal(sequence.phase.id,'receive');assert.equal(sequence.elapsed,0);
  assert.equal(sequence.result,null);assert.equal(sequence.report,'');assert.equal(sequence.scanned,0);assert.equal(sequence.matches.length,0);assert.equal(sequence.log.length,1);
});

test('An unsuccessful search honestly reports uncertainty and applies no action',()=>{
  const sequence=new AgentSequence(new AvatarAnimationController(),{query:{...missionBrief,signature:'ABSENT'}});sequence.start();sequence.update(100);
  assert.equal(sequence.matches.length,0);assert.equal(sequence.result,null);assert.equal(sequence.verification.verified,false);
  assert.match(sequence.report,/no matching source/i);assert.match(sequence.report,/No changes applied/);assert.doesNotMatch(sequence.report,/source confirmed/);
});

test('Reduced motion does not prevent the narrative from completing',()=>{
  const controller=new AvatarAnimationController({reducedMotion:true}),sequence=new AgentSequence(controller);sequence.start();
  assert.equal(sequence.paused,false);assert.equal(controller.paused,true);
  sequence.update(100);assert.equal(sequence.status,'complete');assert.equal(controller.paused,true);assert.ok(sequence.snapshot().report.length>50);
});

test('Task activity is independent of speech and clears smoothly at mission end',()=>{
  const controller=new AvatarAnimationController({demo:false});controller.setState('thinking');controller.setActivity('searching');
  for(let i=0;i<120;i++)controller.update(1/60);
  assert.ok(controller.frame.searching>.99);assert.equal(controller.frame.voice,0);assert.equal(controller.frame.mic,0);
  controller.setActivity('none');for(let i=0;i<180;i++)controller.update(1/60);assert.ok(controller.frame.searching<1e-5);
});
