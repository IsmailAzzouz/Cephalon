import test from 'node:test';
import assert from 'node:assert/strict';
import { AvatarAnimationController,smoothLevel,avatarStates,avatarEmotions } from '../src/AvatarAnimationController.js';
import { OrbitInteraction } from '../src/OrbitInteraction.js';

function advance(controller,seconds,hz=60){for(let i=0;i<Math.round(seconds*hz);i++)controller.update(1/hz);return {...controller.frame};}

test('Audio smoothing has a 50 ms attack and 170 ms release at different display frequencies',()=>{
  assert.ok(Math.abs(smoothLevel(0,1,.05)-(1-Math.exp(-1)))<1e-10);
  assert.ok(Math.abs(smoothLevel(1,0,.17)-Math.exp(-1))<1e-10);
  const values=[30,60,120].map(hz=>{let value=0;for(let i=0;i<hz;i++)value=smoothLevel(value,1,1/hz);return value;});
  assert.ok(Math.max(...values)-Math.min(...values)<1e-10);
});

test('Microphone activity and playback activity remain separate',()=>{
  const controller=new AvatarAnimationController({demo:false});
  controller.setSignals({inputMicLevel:1,outputVoiceLevel:0,frequencyBands:[1,.5,.2]});controller.setState('listening');
  let frame=advance(controller,2);assert.ok(frame.mic>.98);assert.equal(frame.voice,0);assert.equal(frame.bass,0);
  controller.setState('speaking');frame=advance(controller,3);assert.equal(frame.voice,0);assert.ok(frame.mic<1e-5);
  controller.setSignals({outputVoiceLevel:.7,inputMicLevel:0,frequencyBands:[.2,.4,.8]});frame=advance(controller,2);
  assert.ok(frame.voice>.69);assert.ok(frame.mic<1e-5);assert.ok(frame.high>frame.mid&&frame.mid>frame.bass);
});

test('Volume never determines emotion and external silence is not replaced by fake speech',()=>{
  const controller=new AvatarAnimationController({demo:false});controller.setState('speaking');controller.setSignals({outputVoiceLevel:1});
  let frame=advance(controller,2);assert.equal(controller.emotion,'neutral');assert.equal(frame.angry,0);assert.equal(frame.happy,0);
  controller.setSignals({outputVoiceLevel:0});frame=advance(controller,3);assert.ok(frame.voice<1e-6);
  controller.setDemo(true);frame=advance(controller,1);assert.ok(frame.voice>.01);
});

test('All state and emotion combinations produce finite, coherent outputs',()=>{
  for(const state of avatarStates)for(const emotion of avatarEmotions){
    const controller=new AvatarAnimationController();controller.setState(state);controller.setEmotion(emotion,.8);
    for(let i=0;i<120;i++){
      const frame=controller.update(1/60);assert.ok(Object.values(frame).every(Number.isFinite),state+'/'+emotion);
      assert.ok(frame.energy>.3&&frame.energy<1.5);assert.ok(frame.fracture>=0&&frame.fracture<=1);
    }
  }
});

test('A short glitch returns to the previous state and restores structural coherence',()=>{
  const controller=new AvatarAnimationController({demo:false});controller.setState('speaking');controller.triggerGlitch(1,.3);
  let frame=advance(controller,.12);assert.equal(controller.state,'glitch');assert.ok(frame.fracture>.5);
  frame=advance(controller,.4);assert.equal(controller.state,'speaking');assert.equal(frame.glitch,0);assert.equal(frame.fracture,0);
  controller.triggerGlitch();controller.setState('idle');assert.equal(controller.update(.016).glitch,0);
});

test('Anger causes spaced transient fractures, never a permanently exploded body',()=>{
  const controller=new AvatarAnimationController();controller.setEmotion('angry',1);
  let total=0,longest=0,run=0;
  for(let i=0;i<600;i++){
    const frame=controller.update(1/60);
    if(frame.fracture>.001){total++;run++;longest=Math.max(longest,run);}else run=0;
  }
  assert.ok(total>20&&total<100);assert.ok(longest/60<=.4);
});

test('Repeated external emotion updates cannot keep one glitch open indefinitely',()=>{
  const controller=new AvatarAnimationController();controller.setEmotion('angry',.8);
  const end=controller.glitchEnd;
  for(let i=0;i<25;i++){controller.setEmotion('angry',.8);controller.triggerGlitch(.8,.3);controller.update(.005);}
  assert.equal(controller.glitchEnd,end);advance(controller,.5);assert.equal(controller.frame.fracture,0);
});

test('Sadness keeps the avatar lit while slowing ambient motion',()=>{
  const controller=new AvatarAnimationController();controller.setEmotion('sad',1);
  const frame=advance(controller,5);assert.ok(frame.energy>.4&&frame.energy<.55);assert.ok(frame.motionTime<frame.time*.7);
});

test('Reduced motion and pause suppress glitches and surprise flashes',()=>{
  const controller=new AvatarAnimationController({reducedMotion:true});controller.setEmotion('surprised',1);controller.triggerGlitch();
  const time=controller.time;let frame=advance(controller,1);assert.equal(frame.time,time);assert.equal(frame.glitch,0);assert.equal(frame.surprise,0);
  controller.setPaused(false);controller.setEmotion('angry',1);for(let i=0;i<240;i++)assert.equal(controller.update(1/60).glitch,0);
});

test('Signal inputs are bounded and invalid states do not damage the controller',()=>{
  const controller=new AvatarAnimationController({demo:false});controller.setSignals({outputVoiceLevel:8,inputMicLevel:-2,frequencyBands:[NaN,Infinity,.7]});
  assert.equal(controller.outputVoiceLevel,1);assert.equal(controller.inputMicLevel,0);assert.deepEqual(controller.frequencyBands,[0,0,.7]);
  assert.throws(()=>controller.setState('invalid'));assert.throws(()=>controller.setEmotion('invalid'));assert.equal(controller.state,'idle');
  assert.ok(Object.values(controller.update(NaN)).every(Number.isFinite));
});

test('Orbit inertia settles along the shortest angular path and pinch zoom is bounded',()=>{
  const orbit=new OrbitInteraction();orbit.begin();orbit.drag((Math.PI*4+.4)/.0035,30,1);
  for(let i=0;i<120;i++)orbit.update(1/60);orbit.end(true);
  for(let i=0;i<1200;i++)orbit.update(1/60);
  assert.ok(Math.abs(orbit.y-Math.PI*4)<.001);assert.ok(Math.abs(orbit.x)<.001);
  orbit.zoomBy(100);assert.equal(orbit.targetZoom,1.45);orbit.zoomBy(.0001);assert.equal(orbit.targetZoom,.78);
});
