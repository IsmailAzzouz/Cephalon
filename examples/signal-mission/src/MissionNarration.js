import { missionPhases } from './AgentSequence.js';

/** English mission speech, using decoded buffers so one user gesture unlocks the whole run. */
export class MissionNarration {
  constructor(avatar,onIssue=()=>{}){
    this.avatar=avatar;this.audio=avatar.audio;this.controller=avatar.controller;this.onIssue=onIssue;
    this.clips=new Map();this.buffers=new Map();this.active=null;this.source=null;this.gain=null;this.serial=0;this.enabled=false;
    this.ready=this.load();
  }
  async load(){
    this.unavailable=false;
    try{
      const response=await fetch('/audio/ordis-mission/manifest.json');
      if(response.status===404){this.unavailable=true;return false;}
      if(!response.ok)throw new Error('English mission audio is unavailable. Reload and try again.');
      const manifest=await response.json();
      if(manifest.language!=='en-US'||manifest.status!=='generated')throw new Error('The English voice pack is not ready.');
      for(const clip of manifest.clips){
        if(!/^[a-z][a-z0-9-]+$/.test(clip.id)||!/^\/audio\/ordis-mission\/[a-z0-9-]+\.mp3$/.test(clip.mp3))throw new Error('Invalid mission voice pack.');
        this.clips.set(clip.id,clip);
      }
      for(const id of ['receive','plan','search','found','analyse','verify','report','not-found','unconfirmed','report-generic'])if(!this.clips.has(id))throw new Error('The English voice pack is incomplete.');
      return true;
    }catch(error){this.loadError=error;return false;}
  }
  async prime(){
    if(this.unavailable)return null;
    if(!this.audio.context||this.audio.context.state==='closed')this.audio.context=new AudioContext();this.context=this.audio.context;
    // Resume is called synchronously from the Start button, before any fetch/decoding awaits.
    const resume=this.context.resume();
    await Promise.race([resume,new Promise(resolve=>setTimeout(resolve,350))]);
    if(this.context.state!=='running')throw new Error('Tap Start mission to enable its English voice.');
    if(!await this.ready){
      if(this.unavailable)return null;
      this.ready=this.load();
      if(!await this.ready){if(this.unavailable)return null;throw this.loadError;}
    }
    await Promise.all([...this.clips].map(async([id,clip])=>{
      if(this.buffers.has(id))return;
      const response=await fetch(clip.mp3);if(!response.ok)throw new Error('Could not load the English voice. Please try again.');
      this.buffers.set(id,await this.context.decodeAudioData(await response.arrayBuffer()));
    }));
    return Object.fromEntries(missionPhases.map(phase=>[phase.id,Math.max(phase.duration,(this.buffers.get(phase.id)?.duration||0)+.6)]));
  }
  choose(snapshot){
    const {result,phase}=snapshot;
    const expectedSource=result?.source==='Relay E-17'&&result?.sector==='Europa';
    if(phase==='found'&&!result)return 'not-found';
    if(phase==='found'&&!expectedSource)return 'report-generic';
    if(phase==='analyse'&&result?.packets!==200)return result?'report-generic':'not-found';
    if(phase==='verify'&&!this.sequence.verification?.verified)return 'unconfirmed';
    if(phase==='report'){
      if(!result)return 'not-found';
      if(!(expectedSource&&result.packets===200&&result.corrupted===4&&result.powerExcess===34&&result.integrity===98&&result.trusted&&result.risk==='moderate'&&this.sequence.verification?.verified))return 'report-generic';
    }
    return phase;
  }
  handle(snapshot,type){
    if(type==='phase'&&this.enabled){this.playPhase(snapshot).catch(error=>this.fail(error));}
    else if(type==='pause'&&this.enabled){if(snapshot.paused)this.pause();else this.resume().catch(error=>this.fail(error));}
    else if(type==='complete'||type==='cancelled'){this.stop();}
  }
  async playPhase(snapshot){
    this.releaseOutput();const serial=++this.serial;
    const id=this.choose(snapshot),clip=this.clips.get(id),buffer=this.buffers.get(id);
    if(!clip||!buffer)throw new Error('The mission voice could not be loaded.');
    this.active={id,clip,buffer,phase:snapshot.phase,offset:0,startedAt:0,playing:false,serial};
    await this.resume();
  }
  async resume(){
    const active=this.active;if(!active||active.playing||!this.enabled)return;
    const serial=this.serial;
    if(this.context.state!=='running')await this.context.resume();
    if(serial!==this.serial||this.sequence.paused||!this.sequence.running)return;
    const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=active.buffer;gain.gain.value=.9;source.connect(gain);
    await this.audio.connectOutput(gain,{audible:true,preserveState:true});
    if(serial!==this.serial||this.sequence.paused||!this.sequence.running||this.audio.output?.source!==gain){if(this.audio.output?.source===gain)this.audio.stopOutput({preserveState:true});source.disconnect();gain.disconnect();return;}
    this.source=source;this.gain=gain;active.startedAt=this.context.currentTime;active.playing=true;
    source.onended=()=>{if(this.source===source){this.releaseOutput();this.active=null;}};
    this.controller.setSpeechActive(true);source.start(0,Math.min(active.offset,active.buffer.duration));
  }
  pause(){
    const active=this.active;if(!active)return;
    if(active.playing)active.offset=Math.min(active.buffer.duration,active.offset+this.context.currentTime-active.startedAt);
    this.serial++;active.serial=this.serial;this.releaseOutput();
  }
  releaseOutput(){
    if(this.source){this.source.onended=null;try{this.source.stop();}catch{}this.source.disconnect();this.source=null;}
    if(this.gain){if(this.audio.output?.source===this.gain)this.audio.stopOutput({preserveState:true});this.gain.disconnect();this.gain=null;}
    if(this.active)this.active.playing=false;this.controller.setSpeechActive(false);
  }
  fail(error){
    this.pause();if(this.sequence.running&&!this.sequence.paused)this.sequence.setPaused(true);this.onIssue(error.message||'Voice interrupted. Resume the mission to try again.');
  }
  stop(){this.serial++;this.enabled=false;this.releaseOutput();this.active=null;}
  get position(){const active=this.active;return active?Math.min(active.buffer.duration,active.offset+(active.playing?this.context.currentTime-active.startedAt:0)):0;}
  get playing(){return Boolean(this.active?.playing);}
  get waiting(){return Boolean(this.enabled&&this.active);}
}
