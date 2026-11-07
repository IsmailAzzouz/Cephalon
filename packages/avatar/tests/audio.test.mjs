import test from 'node:test';
import assert from 'node:assert/strict';
import { rmsLevel,frequencyLevels,AvatarAudio } from '../src/AvatarAudio.js';
import { AvatarAnimationController } from '../src/AvatarAnimationController.js';

test('RMS is calculated from PCM samples and silence stays silent',()=>{
  assert.equal(rmsLevel(new Float32Array(1024)),0);assert.equal(rmsLevel([]),0);
  const pcm=Float32Array.from({length:1024},(_,i)=>Math.sin(i/1024*Math.PI*32)*.25);
  assert.ok(Math.abs(rmsLevel(pcm)-Math.SQRT1_2)<1e-6);
  assert.equal(rmsLevel(new Float32Array(100).fill(1)),1);
});

test('Frequency analysis separates bass, mids and treble using the actual sample rate',()=>{
  for(const sampleRate of [44100,48000]){
    const bins=new Uint8Array(512);const index=Math.round(100*1024/sampleRate);bins[index]=255;
    let bands=frequencyLevels(bins,sampleRate,1024);assert.ok(bands[0]>0);assert.equal(bands[1],0);assert.equal(bands[2],0);
    bins.fill(0);bins[Math.round(4000*1024/sampleRate)]=255;
    bands=frequencyLevels(bins,sampleRate,1024);assert.equal(bands[0],0);assert.equal(bands[1],0);assert.ok(bands[2]>0);
  }
});

function context(){
  const nodes=[];
  const makeNode=()=>{const node={connections:[],connect(target){this.connections.push(target);},disconnect(){this.disconnected=true;}};nodes.push(node);return node;};
  const ctx={destination:{},sampleRate:48000,resume:async()=>{},createAnalyser(){return Object.assign(makeNode(),{frequencyBinCount:512,getFloatTimeDomainData(array){array.fill(.1);},getByteFrequencyData(array){array.fill(40);}});},createMediaStreamSource(){return makeNode();}};
  return {ctx,nodes,makeNode};
}

test('Microphone and playback use distinct analysers and microphone never reaches speakers',async()=>{
  const controller=new AvatarAnimationController({demo:false}),audio=new AvatarAudio(controller),mock=context();audio.context=mock.ctx;
  const stream={getTracks:()=>[{stop(){}}]};await audio.connectMicrophone(stream);
  const input=audio.input.node;assert.equal(input.connections.length,0);
  const source=Object.assign(mock.makeNode(),{context:mock.ctx});await audio.connectOutput(source,{audible:true});
  assert.notEqual(audio.input.node,audio.output.node);assert.ok(audio.output.node.connections.includes(mock.ctx.destination));
  audio.update();assert.ok(controller.inputMicLevel>0);assert.ok(controller.outputVoiceLevel>0);
  audio.stop();assert.equal(controller.inputMicLevel,0);assert.equal(controller.outputVoiceLevel,0);assert.ok(input.disconnected);
});

test('Cancelling a pending microphone connection releases the late stream',async()=>{
  const controller=new AvatarAnimationController(),audio=new AvatarAudio(controller),mock=context();
  let resume;mock.ctx.resume=()=>new Promise(resolve=>{resume=resolve;});audio.context=mock.ctx;
  let stopped=false;const stream={getTracks:()=>[{stop(){stopped=true;}}]};
  const pending=audio.connectMicrophone(stream,{ownsStream:true});audio.stopInput();resume();await pending;
  assert.equal(stopped,true);assert.equal(audio.input,null);
});

test('Disconnecting an external STT stream does not stop tracks owned by the caller',async()=>{
  const controller=new AvatarAnimationController(),audio=new AvatarAudio(controller),mock=context();audio.context=mock.ctx;
  let stopped=false;const stream={getTracks:()=>[{stop(){stopped=true;}}]};
  await audio.connectMicrophone(stream);audio.stopInput();assert.equal(stopped,false);
});
