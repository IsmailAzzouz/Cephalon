import { ActionAnimations } from './ActionAnimations.js';

export const avatarStates=['idle','listening','thinking','speaking','glitch'];
export const avatarEmotions=['neutral','happy','curious','concerned','sad','angry','surprised'];
const unit=value=>Number.isFinite(Number(value))?Math.min(1,Math.max(0,Number(value))):0;
export function smoothLevel(current,target,delta,attack=.05,release=.17){return current+(target-current)*(1-Math.exp(-delta/(target>current?attack:release)));}

export class AvatarAnimationController {
  constructor({demo=true,reducedMotion=false}={}){
    this.state='idle';this.emotion='neutral';this.emotionIntensity=.7;
    this.outputVoiceLevel=0;this.inputMicLevel=0;this.frequencyBands=[0,0,0];this.inputFrequencyBands=[0,0,0];this.glitchIntensity=0;
    this.time=0;this.motionTime=0;this.demo=demo;this.paused=reducedMotion;this.reducedMotion=reducedMotion;
    this.onChange=()=>{};this.returnState='idle';this.glitchStart=-10;this.glitchEnd=-10;this.glitchStrength=0;this.nextAngryGlitch=0;this.surpriseStart=-10;
    this.weights=Object.fromEntries([...avatarStates,...avatarEmotions].map(key=>[key,0]));this.weights.idle=1;
    this.levels={voice:0,mic:0,bass:0,mid:0,high:0};this.previousVoice=0;
    this.speechActive=false;this.activity='none';this.activityWeights={searching:0,analysing:0};
    this.action=null;this.actionId=0;this.animations=new ActionAnimations(this);
    this.frame={time:0,energy:.68,voice:0,mic:0,bass:0,mid:0,high:0,transient:0,speaking:0,listening:0,thinking:0,happy:0,curious:0,concerned:0,sad:0,angry:0,surprise:0,glitch:0,fracture:0,pulse:0,emotionIntensity:.7,searching:0,analysing:0};
  }
  setState(state){
    if(!avatarStates.includes(state))throw new Error('Unknown avatar state: '+state);
    if(state==='glitch'){this.triggerGlitch();return;}
    if(this.state===state)return;
    this.state=state;this.glitchEnd=-10;this.onChange();
  }
  setEmotion(emotion,intensity=this.emotionIntensity){
    if(!avatarEmotions.includes(emotion))throw new Error('Unknown avatar emotion: '+emotion);
    const previous=this.emotion;
    if(previous===emotion&&this.emotionIntensity===unit(intensity))return;
    this.emotion=emotion;this.emotionIntensity=unit(intensity);
    if(emotion==='surprised'&&previous!==emotion)this.surpriseStart=this.time;
    if(emotion==='angry'&&previous!==emotion&&this.emotionIntensity>.1){this.triggerGlitch(this.emotionIntensity,.24);this.nextAngryGlitch=this.time+3.1;}
    this.onChange();
  }
  setSignals(signals={}){
    for(const key of ['outputVoiceLevel','inputMicLevel'])if(key in signals)this[key]=unit(signals[key]);
    for(const key of ['frequencyBands','inputFrequencyBands'])if(key in signals)this[key]=Array.from(signals[key]||[]).slice(0,3).map(unit);
    if('glitchIntensity'in signals){const next=unit(signals.glitchIntensity);if(next>this.glitchIntensity+.04&&this.time>=this.glitchEnd)this.triggerGlitch(next);this.glitchIntensity=next;}
  }
  triggerGlitch(intensity=1,duration=.26){
    if(this.state==='glitch'&&this.time<this.glitchEnd){this.glitchStrength=Math.max(this.glitchStrength,unit(intensity));return;}
    if(this.state!=='glitch')this.returnState=this.state;
    this.glitchStart=this.time;this.glitchEnd=this.time+Math.max(.12,Math.min(.4,duration));this.glitchStrength=unit(intensity);this.state='glitch';this.onChange();
  }
  setSpeechActive(active){const next=Boolean(active);if(next!==this.speechActive){this.speechActive=next;this.onChange();}}
  setPaused(paused){this.paused=Boolean(paused);this.onChange();}
  clearAudioLevels(){for(const key of Object.keys(this.levels))this.levels[key]=0;this.previousVoice=0;}
  setDemo(demo){
    const value=Boolean(demo);if(value===this.demo)return;
    if(!value)this.clearAudioLevels();
    this.demo=value;this.onChange();
  }
  setActivity(activity){
    if(!['none','planning','searching','analysing','reporting'].includes(activity))throw new Error('Unknown avatar activity: '+activity);
    if(activity===this.activity)return;this.activity=activity;this.onChange();
  }
  cue(type,{focus=[0,.06],duration=1,tool='',record='',matched=false}={}){
    if(!['acknowledge','consider','tool-call','read','inspect','compare','found','report','settle'].includes(type))throw new Error('Unknown avatar gesture: '+type);
    this.action={id:++this.actionId,type,at:this.time,duration:Math.max(.2,Math.min(5,duration)),focus:[Math.max(-1,Math.min(1,Number(focus[0])||0)),Math.max(-1,Math.min(1,Number(focus[1])||0))],tool,record,matched};
  }
  update(delta){
    const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
    if(!this.paused){this.time+=dt;this.motionTime+=dt*(1-this.weights.sad*.45-this.weights.concerned*.2);}
    this.animations.update();
    if(this.state==='glitch'&&this.time>=this.glitchEnd){this.state=this.returnState;this.onChange();}
    if(this.emotion==='angry'&&this.emotionIntensity>.15&&this.time>=this.nextAngryGlitch&&this.state!=='glitch'){
      this.triggerGlitch(this.emotionIntensity,.24);this.nextAngryGlitch=this.time+3.1;
    }
    let output=unit(this.outputVoiceLevel),input=unit(this.inputMicLevel),bands=this.frequencyBands;
    if(this.demo){
      const t=this.time;
      const syllable=Math.pow(Math.max(0,Math.sin(t*11.7+Math.sin(t*2.1))),.8);
      const words=(t%5.4)>4.2?.05:1;
      output=(.12+syllable*.66)*words;
      input=.12+Math.pow(.5+.5*Math.sin(t*2.7),2.)*.24;
      bands=[output*(.6+.3*Math.sin(t*2.1)),output*(.6+.3*Math.sin(t*5.1)),output*(.3+.25*Math.sin(t*13.1))];
    }
    this.levels.voice=smoothLevel(this.levels.voice,output,dt);
    this.levels.mic=smoothLevel(this.levels.mic,input,dt,.065,.2);
    ['bass','mid','high'].forEach((name,index)=>{this.levels[name]=smoothLevel(this.levels[name],unit(bands[index]||0),dt,.04,.14);});
    const transition=1-Math.exp(-dt/ .22);
    for(const state of avatarStates){const target=this.state===state||(state==='speaking'&&this.speechActive);this.weights[state]+=((target?1:0)-this.weights[state])*transition;}
    for(const emotion of avatarEmotions)this.weights[emotion]+=((this.emotion===emotion?this.emotionIntensity:0)-this.weights[emotion])*transition;
    for(const activity of Object.keys(this.activityWeights))this.activityWeights[activity]+=((this.activity===activity?1:0)-this.activityWeights[activity])*transition;
    const voice=this.levels.voice*this.weights.speaking,mic=this.levels.mic*this.weights.listening;
    const progress=(this.time-this.glitchStart)/Math.max(.12,this.glitchEnd-this.glitchStart);
    const glitch=this.state==='glitch'&&!this.paused&&!this.reducedMotion&&progress>=0&&progress<1?Math.pow(Math.sin(progress*Math.PI),.7)*this.glitchStrength:0;
    const surprise=!this.paused&&!this.reducedMotion?Math.max(0,1-(this.time-this.surpriseStart)/.6)*this.emotionIntensity:0;
    const transient=Math.max(0,(voice-this.previousVoice)*3.5);this.previousVoice=voice;
    Object.assign(this.frame,{
      time:this.time,motionTime:this.motionTime,voice,mic,bass:this.levels.bass*this.weights.speaking,mid:this.levels.mid*this.weights.speaking,high:this.levels.high*this.weights.speaking,
      listening:this.weights.listening,speaking:this.weights.speaking,thinking:this.weights.thinking,
      happy:this.weights.happy,curious:this.weights.curious,concerned:this.weights.concerned,sad:this.weights.sad,angry:this.weights.angry,
      energy:.68+voice*.22+mic*.1+this.weights.happy*.2-this.weights.sad*.19-this.weights.concerned*.1+glitch*.08,
      transient,glitch,fracture:glitch*glitch,surprise,pulse:surprise+transient*.3,emotionIntensity:this.emotionIntensity,
      searching:this.activityWeights.searching,analysing:this.activityWeights.analysing,
    });
    return this.frame;
  }
}
