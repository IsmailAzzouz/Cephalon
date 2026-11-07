import { CephalonAvatar } from '/packages/avatar/src/CephalonAvatar.js';
import { AvatarDebug } from './studio/AvatarDebug.js';
import { AgentMissionView } from '/examples/signal-mission/src/AgentMissionView.js';
import { AnimationStudio } from './studio/AnimationStudio.js';
import { AgentEventBridge } from '/packages/avatar/src/AgentEventBridge.js';
import { EnergyShowcase } from './EnergyShowcase.js';
import { VoiceLibrary } from './studio/VoiceLibrary.js';

const $=selector=>document.querySelector(selector);
const states=['idle','listening','thinking','speaking'];
const names={idle:'Idle',listening:'Listening',thinking:'Thinking',speaking:'Speaking',glitch:'Signal glitch'};
let avatar,debug,mission,studio,showcase,voices,immersed=false;
function manualAction(){showcase?.stop();mission?.cancelForManual();avatar?.controller.animations.stopAll({restore:false});}
function showError(message){
  $('#error-message').textContent=message;$('#error-panel').hidden=false;
  document.querySelectorAll('.mode,#pause,#glitch').forEach(button=>{button.disabled=true;});
}
function refresh(){
  if(!avatar)return;
  const controller=avatar.controller,state=controller.state==='glitch'?controller.returnState:controller.state,active=controller.animations.current;
  $('.mode-picker').style.setProperty('--mode',Math.max(0,states.indexOf(state)));
  document.querySelectorAll('[data-state]').forEach(button=>{
    const active=button.dataset.state===state;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
  });
  $('#state-announcement').textContent=active?controller.animations.library.get(active.name).label:names[controller.state];
  const paused=mission?.sequence.running?mission.sequence.paused:controller.paused;
  const label=mission?.sequence.running?(paused?'Resume mission':'Pause mission'):(paused?'Resume motion':'Pause motion');
  $('#pause').setAttribute('aria-pressed',String(paused));$('#pause').setAttribute('aria-label',label);$('#pause').title=label;
  $('#glitch').classList.toggle('signal-break',controller.state==='glitch');
  $('#gesture-hint').textContent=(active?controller.animations.library.get(active.name).label+' · ':'')+(controller.demo?'Simulated signal':avatar.audio.output?'Audio output':avatar.audio.input?'Microphone active':'External signal')+' · Drag to rotate';
  debug?.refresh();
}
try{
  avatar=new CephalonAvatar($('#scene'),{onError:showError});
  debug=new AvatarDebug(avatar);
  mission=new AgentMissionView(avatar,refresh);
  studio=new AnimationStudio(avatar,{onPreview:()=>{showcase?.stop();mission.cancelForManual();},onStop:()=>{showcase?.stop();mission.cancelForManual();}});
  voices=new VoiceLibrary(avatar,{beforePlay:()=>manualAction(),afterPlay:()=>{setDebug(false,false);$('#scene').focus({preventScroll:true});}});
  const eventBridge=new AgentEventBridge(avatar.controller);
  showcase=new EnergyShowcase(avatar.controller,refresh);
  const missionTick=avatar.onTick;avatar.onTick=delta=>{missionTick(delta);showcase.update();voices.update();};
  avatar.controller.animations.subscribe(refresh);
  avatar.controller.animations.library.subscribe(refresh);
  avatar.onStateInteraction=manualAction;
  avatar.controller.onChange=refresh;
  avatar.audio.onChange=(state,message)=>{if(message)debug.message(message);refresh();};
  const api={
    avatar,controller:avatar.controller,config:avatar.config,
    voices,playVoice:id=>voices.play(id),
    animations:avatar.controller.animations.library,
    actions:{
      start:(name,options)=>{showcase.stop();mission.cancelForManual();return avatar.controller.animations.start(name,options);},
      play:(name,options)=>{showcase.stop();mission.cancelForManual();return avatar.controller.animations.play(name,options);},
      finish:id=>avatar.controller.animations.finish(id),cancel:id=>avatar.controller.animations.cancel(id),
      stopAll:()=>{showcase.stop();avatar.controller.animations.stopAll();},snapshot:()=>avatar.controller.animations.snapshot(),
    },
    events:{handle:event=>{showcase.stop();mission.cancelForManual();return eventBridge.handle(event);}},
    setState:state=>{manualAction();avatar.controller.setState(state);},
    setEmotion:(emotion,intensity)=>{showcase.stop();mission.cancelForManual();avatar.controller.setEmotion(emotion,intensity);},
    setActivity:activity=>{manualAction();avatar.controller.setActivity(activity);},
    setSignals:signals=>{showcase.stop();mission.cancelForManual();avatar.controller.setDemo(false);avatar.controller.setSignals(signals);},
    triggerGlitch:(intensity,duration)=>avatar.controller.triggerGlitch(intensity,duration),
    cue:(type,details)=>avatar.controller.cue(type,details),
    useDemo:()=>{manualAction();avatar.audio.stop();avatar.controller.setDemo(true);},
    connectOutput:async(source,options)=>{showcase.stop();mission.cancelForManual();await avatar.audio.connectOutput(source,options);avatar.controller.animations.start('speak',{id:'web-audio:output'});},
    connectMicrophone:async(stream,options)=>{showcase.stop();mission.cancelForManual();await avatar.audio.connectMicrophone(stream,options);avatar.controller.animations.start('listen',{id:'web-audio:input'});},
    stopAudio:()=>{showcase.stop();mission.cancelForManual();avatar.controller.animations.finish('web-audio:input');avatar.controller.animations.finish('web-audio:output');avatar.audio.stop();},
    mission:mission.sequence,missionNarration:mission.narration,startMission:()=>{showcase.stop();return mission.start();},stopMission:()=>{if(mission.starting)mission.dismiss();else mission.sequence.stop();},
    startShowcase:()=>{mission.cancelForManual();avatar.audio.stop();showcase.start();},stopShowcase:()=>showcase.stop(),showcase,
  };
  for(const key of ['state','emotion','emotionIntensity','outputVoiceLevel','inputMicLevel','frequencyBands','glitchIntensity']){
    Object.defineProperty(api,key,{get:()=>avatar.controller[key],set:value=>{
      if(key==='state')api.setState(value);
      else if(key==='emotion')api.setEmotion(value);
      else if(key==='emotionIntensity')api.setEmotion(avatar.controller.emotion,value);
      else api.setSignals({[key]:value});
    }});
  }
  Object.defineProperty(api,'time',{get:()=>avatar.controller.time});window.cephalon=api;refresh();
}catch(error){console.error(error);showError('WebGL 2 is unavailable. Try an updated Chrome or Safari with graphics acceleration enabled.');}

document.querySelectorAll('[data-state]').forEach(button=>button.addEventListener('click',()=>{manualAction();avatar?.controller.setState(button.dataset.state);}));
$('#pause').addEventListener('click',()=>{if(mission?.sequence.running)mission.setPaused(!mission.sequence.paused);else avatar?.controller.setPaused(!avatar.controller.paused);});
$('#glitch').addEventListener('click',()=>avatar?.controller.triggerGlitch(.85,.26));
for(const id of ['microphone','audio-stop','reset-optics'])$('#'+id).addEventListener('click',manualAction,{capture:true});
for(const id of ['audio-file','demo-signal'])$('#'+id).addEventListener('change',manualAction,{capture:true});
$('#mission-start').addEventListener('click',()=>showcase?.stop(),{capture:true});
$('#animation-showcase').addEventListener('click',()=>{
  mission.cancelForManual();avatar.audio.stop();showcase.start();setDebug(false,false);$('#scene').focus({preventScroll:true});
});
$('#reload').addEventListener('click',()=>location.reload());
function setDebug(open,focus=true){
  $('#debug-panel').hidden=!open;$('#debug-toggle').setAttribute('aria-expanded',String(open));
  if(focus)(open?$('#debug-close'):$('#debug-toggle')).focus();
}
$('#debug-toggle').addEventListener('click',()=>setDebug($('#debug-panel').hidden));
$('#debug-close').addEventListener('click',()=>setDebug(false));
$('#animations-open').addEventListener('click',()=>{
  setDebug(true,false);$('#animation-controls').open=true;
  $('#animation-controls').scrollIntoView({block:'start'});$('#animation-set').focus({preventScroll:true});
});
function setImmersion(value){
  immersed=value;if(value)setDebug(false,false);
  document.body.classList.toggle('immersed',value);document.querySelectorAll('.interface').forEach(element=>{element.inert=value;});
  $('#exit-immersive').hidden=!value;(value?$('#exit-immersive'):$('#immersive')).focus();
}
$('#immersive').addEventListener('click',()=>setImmersion(true));
$('#exit-immersive').addEventListener('click',()=>setImmersion(false));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){if(!$('#debug-panel').hidden)setDebug(false);else if(immersed)setImmersion(false);else if(mission?.visible)mission.dismiss(true);}
  if(['BUTTON','INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;
  if(event.code==='Space'){event.preventDefault();if(mission?.sequence.running)mission.setPaused(!mission.sequence.paused);else{const next=avatar.controller.state==='speaking'?'idle':'speaking';manualAction();avatar.controller.setState(next);}}
  if(event.key.toLowerCase()==='g')avatar?.controller.triggerGlitch();
});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{
  if(avatar){avatar.controller.reducedMotion=event.matches;avatar.controller.setPaused(event.matches||Boolean(mission?.sequence.running&&mission.sequence.paused));}
});
window.addEventListener('pagehide',()=>{if(mission?.sequence.running)mission.sequence.stop('Mission interrupted.');avatar?.audio.stop();});
if(new URLSearchParams(location.search).has('debug'))setDebug(true,false);
if(new URLSearchParams(location.search).has('mission'))mission?.prepare();
const previewSet=new URLSearchParams(location.search).get('animation');
if(previewSet&&avatar){try{avatar.controller.animations.play(previewSet,{agentCount:previewSet==='summon'?3:1});}catch(error){studio.message(error.message);setDebug(true,false);}}

if(new URLSearchParams(location.search).has('showcase')&&avatar){mission.cancelForManual();showcase.start();}

if(new URLSearchParams(location.search).has('voice')&&avatar){setDebug(true,false);$('#voice-controls').open=true;$('#voice-controls').scrollIntoView({block:'start'});}
