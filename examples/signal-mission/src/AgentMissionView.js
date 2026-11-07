import { AgentSequence,missionPhases } from './AgentSequence.js';
import { MissionNarration } from './MissionNarration.js';

export class AgentMissionView {
  constructor(avatar,onStatusChange=()=>{}){
    this.avatar=avatar;this.onStatusChange=onStatusChange;this.visible=false;this.previousLogLength=-1;this.starting=false;this.startSerial=0;
    this.panel=document.querySelector('#mission-panel');this.button=document.querySelector('#mission-start');
    this.narration=new MissionNarration(avatar,message=>this.voiceNotice(message));
    this.sequence=new AgentSequence(avatar.controller,{onChange:(snapshot,type)=>{this.narration.handle(snapshot,type);this.render(snapshot,type);}});
    this.narration.sequence=this.sequence;this.sequence.canAdvance=()=>!this.narration.waiting;
    avatar.onTick=delta=>this.sequence.update(delta);
    avatar.onStateInteraction=()=>this.cancelForManual();
    this.button.addEventListener('click',()=>{if(this.sequence.running)this.sequence.stop();else this.start();});
    document.querySelector('#mission-dismiss').addEventListener('click',()=>this.dismiss(true));
    window.addEventListener('resize',()=>this.layout());
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.sequence.running&&!this.sequence.paused)this.setPaused(true);});
    document.querySelector('#debug-panel').addEventListener('change',event=>{
      if(['emotion','emotion-intensity','demo-signal','audio-file','debug-stage'].includes(event.target.id))this.cancelForManual();
    },{capture:true});
    document.querySelector('#emotion-intensity').addEventListener('input',()=>this.cancelForManual(),{capture:true});
    for(const id of ['microphone','audio-stop','reset-optics'])document.querySelector('#'+id).addEventListener('click',()=>this.cancelForManual(),{capture:true});
  }
  present(){
    if(!this.visible)this.previousStage=this.avatar.stage;
    this.visible=true;this.panel.hidden=false;document.body.classList.add('mission-visible');this.avatar.stage=7;this.layout();
  }
  prepare(){
    this.present();this.panel.dataset.status='ready';this.panel.dataset.phase='receive';
    document.querySelector('#mission-title').textContent='Ready for your orders';document.querySelector('#mission-step').textContent='Ready';
    document.querySelector('#mission-message').textContent=this.sequence.query.instruction;
    document.querySelector('#mission-meter').setAttribute('aria-valuenow','0');document.querySelector('#mission-progress').style.transform='scaleX(0)';
    document.querySelector('#mission-history').open=false;document.querySelector('#mission-log').replaceChildren();document.querySelector('#mission-log-count').textContent='0';
    document.querySelector('#mission-dismiss').hidden=false;this.button.querySelector('span').textContent='Start mission';this.button.classList.remove('mission-running');
    this.voiceNotice('Tap Start mission to enable Ordis’s English voice.');this.onStatusChange();
  }
  async start(){
    if(this.starting||this.sequence.running)return false;
    const serial=++this.startSerial;this.starting=true;
    this.avatar.controller.animations.stopAll();this.avatar.audio.stop();
    // Prime starts/resumes Web Audio within this click, before the asynchronous decoding work.
    const priming=this.narration.prime();this.prepare();this.button.disabled=true;this.voiceNotice('Preparing English voice…');
    try{
      const durations=await priming;if(serial!==this.startSerial)return false;
      this.sequence.configureDurations(durations);this.previousLogLength=-1;this.voiceNotice('');
      document.querySelector('#mission-dismiss').hidden=true;this.narration.enabled=true;this.sequence.start({demo:false});if(document.hidden)this.sequence.setPaused(true);return true;
    }catch(error){if(serial===this.startSerial)this.voiceNotice(error.message||'Voice unavailable. Please try again.');return false;}
    finally{if(serial===this.startSerial){this.starting=false;this.button.disabled=false;}}
  }
  voiceNotice(message){document.querySelector('#mission-voice-note').textContent=message;}
  cancelForManual(){if(this.sequence.running)this.sequence.stop('Switching to manual control.');if(this.visible)this.dismiss();}
  dismiss(focus=false){
    this.startSerial++;this.starting=false;this.button.disabled=false;
    if(this.sequence.running)this.sequence.stop();this.narration.stop();this.visible=false;this.panel.hidden=true;
    document.body.classList.remove('mission-visible');this.button.querySelector('span').textContent='Start mission';
    this.button.classList.remove('mission-running');
    if(this.previousStage!==undefined)this.avatar.stage=this.previousStage;
    this.layout();this.onStatusChange();if(focus)this.button.focus();
  }
  setPaused(paused){this.sequence.setPaused(paused);}
  layout(){
    const width=innerWidth,height=innerHeight;
    this.avatar.presentationTarget.x=this.visible&&(width>=900||height<550)?(width<1250?-1.05:0):0;
    this.avatar.presentationTarget.y=this.visible&&width<900&&height>=550?(height<720?1.1:.9):0;
  }
  render(snapshot,type){
    if(!this.visible)return;
    this.button.querySelector('span').textContent=snapshot.status==='running'?'Stop mission':'Replay mission';
    this.button.classList.toggle('mission-running',snapshot.status==='running');
    document.querySelector('#mission-title').textContent=snapshot.paused?'Mission paused':snapshot.label;
    document.querySelector('#mission-step').textContent=snapshot.status==='complete'?'Complete':snapshot.status==='cancelled'?'Stopped':(snapshot.phaseIndex+1)+' / '+missionPhases.length;
    const spoken=this.narration.active?.clip;
    document.querySelector('#mission-message').textContent=snapshot.status==='running'&&snapshot.phase!=='report'&&spoken?spoken.text:snapshot.message;
    const progress=document.querySelector('#mission-progress');progress.style.transform='scaleX('+snapshot.progress+')';
    document.querySelector('#mission-meter').setAttribute('aria-valuenow',String(Math.round(snapshot.progress*100)));
    document.querySelector('#mission-dismiss').hidden=snapshot.status==='running';
    this.panel.dataset.phase=snapshot.phase;this.panel.dataset.status=snapshot.status;
    if(type==='pause'&&!snapshot.paused)this.voiceNotice('');
    if(this.previousLogLength!==snapshot.log.length){
      this.previousLogLength=snapshot.log.length;
      const fragment=document.createDocumentFragment();
      for(const entry of snapshot.log){
        const item=document.createElement('li'),name=document.createElement('strong'),text=document.createElement('span');
        name.textContent=entry.tool;text.textContent=entry.message;item.append(name,text);fragment.append(item);
      }
      document.querySelector('#mission-log').replaceChildren(fragment);
      document.querySelector('#mission-log-count').textContent=String(snapshot.log.length);
    }
    if(type!=='progress'){
      document.querySelector('#mission-announcement').textContent=snapshot.status==='complete'?snapshot.message:snapshot.paused?'Mission paused':snapshot.label;
      this.onStatusChange();
    }
  }
}
