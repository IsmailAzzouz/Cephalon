const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const envelope=(age,attack,decay)=>age<0?0:(1-Math.exp(-age/attack))*Math.exp(-age/decay);
const defaults={breath:0,strain:0,charge:0,release:0,flow:0,radiance:1,accent:0,scaleX:1,scaleY:1,scaleZ:1,twist:0,events:[]};

/** A shared energy score: the body, glass, core and waves react to the same impulses. */
export class EnergyDynamics {
  constructor(){this.frame={...defaults,events:[]};this.key='';this.enteredAt=0;this.lastAge=0;this.lastBeat=-10;this.lastGlitch=-10;this.lastSurprise=-10;this.lastCue=0;this.serial=0;this.events=[];this.strain=0;this.velocity=0;}
  emit(time,strength=1,accent=0){this.events.push({id:++this.serial,at:time,strength:clamp(strength,0,1.6),accent});}
  update(delta,controller,frame,pose){
    if(controller.reducedMotion){this.events=[];this.strain=this.velocity=0;Object.assign(this.frame,neutralEnergy());return this.frame;}
    if(controller.paused)return this.frame;
    const dt=clamp(delta,0,.1),time=controller.time,action=controller.animations.sample();
    const state=controller.state==='glitch'?controller.returnState:controller.state;
    const kind=action?.profile.behavior||({listening:'listen',speaking:controller.activity==='reporting'?'report':'speak',thinking:{searching:'search',analysing:'analyse'}[controller.activity]||'think'}[state]||'idle');
    const key=action?.id||state+':'+controller.activity;
    if(key!==this.key){this.key=key;this.enteredAt=time;this.lastAge=-.001;}
    const age=action? action.age*action.profile.tempo:time-this.enteredAt;
    const pulseGain=action?.profile.pulse??1,lightGain=action?.profile.radiance??1;
    const crossing=(at,strength,accent=0)=>{if(this.lastAge<at&&age>=at)this.emit(time-(age-at)/(action?.profile.tempo||1),strength*pulseGain,accent);};
    const breathe=.5-.5*Math.cos((kind==='think'?age+.3:time)*(kind==='think'?2.4:kind==='listen'?1.7:1.2));
    let strain=.005*Math.sin(time*1.2),charge=0,flow=.14,accent=0;
    if(kind==='think') {strain+=breathe*.065-.01;charge=breathe*.28;flow=.42;accent=.38;}
    if(kind==='analyse') {strain+=Math.sin(age*2.8)*.023;charge=.13+.14*breathe;flow=.85;accent=.22;crossing(.35,.36,.2);}
    if(kind==='read'||kind==='search'){strain+=Math.sin(age*3.1)*.012;flow=kind==='search'?.74:.4;charge=.08;crossing(.28,.24);}
    if(kind==='write'){
      const burst=age%1.6;strain+=Math.sin(burst*8)*.015*(burst<1.15?1:.15);flow=.7;charge=.12;
      if(Math.floor(age/1.6)!==Math.floor(Math.max(0,this.lastAge)/1.6))this.emit(time,.32*pulseGain,.08);
    }
    if(kind==='compare'){strain+=Math.sin(age*3.7)*.021;charge=.14;flow=.62;accent=.3;}
    if(kind==='listen'){strain+=frame.mic*.024;charge=.08+frame.mic*.18;flow=.22;}
    if(kind==='speak'||kind==='report'){
      // Phrase accents, rather than a scale follower on every audio sample.
      strain+=Math.sin(time*1.2)*.008;flow=.25+frame.voice*.5;charge=frame.voice*.12;
      if(frame.transient>.045&&time-this.lastBeat>1.05){this.lastBeat=time;this.emit(time,(kind==='report'?.36:.18)*pulseGain);}
      if(kind==='report')crossing(.3,.6,.1);
    }
    if(kind==='contact'||kind==='summon'){
      const summon=kind==='summon',launch=summon?.52:.38;
      charge=age<launch?Math.sin(clamp(age/launch,0,1)*Math.PI*.5):Math.exp(-(age-launch)*3)*.45;
      strain-=charge*(summon?.085:.045);flow=.5+charge*.85;accent=summon?.58:.15;
      crossing(launch,summon?1.2:.65,accent);if(summon)crossing(.98,.8,.4);
      const currentCycle=Math.floor(Math.max(0,age-2)/3.6),previousCycle=Math.floor(Math.max(0,this.lastAge-2)/3.6);
      if(age>2&&currentCycle!==previousCycle)this.emit(time,.45*pulseGain,.25);
    }
    if(frame.glitch>.04){
      strain-=frame.glitch*.055;accent=Math.max(accent,frame.glitch*.85);flow+=frame.glitch*1.2;
      if(time-this.lastGlitch>.6){this.lastGlitch=time;this.emit(time,.5*pulseGain,.85);}
    }
    const cue=controller.action;
    if(frame.surprise>.1&&cue?.type!=='found'&&time-this.lastSurprise>1){this.lastSurprise=time;this.emit(time,.7*pulseGain,.35);}
    if(cue&&cue.id!==this.lastCue){this.lastCue=cue.id;if(cue.type==='found')this.emit(time+.16,1.05*pulseGain,.45);if(cue.type==='report')this.emit(time+.22,.55*pulseGain,.1);}
    this.lastAge=age;
    this.events=this.events.filter(event=>time-event.at<2.1);
    let release=0,surge=0;
    for(const event of this.events){const elapsed=time-event.at;release+=envelope(elapsed,.035,.28)*event.strength;surge+=envelope(elapsed,.06,.55)*event.strength;accent=Math.max(accent,event.accent*envelope(elapsed,.04,.55));}
    strain=strain*pulseGain+release*.16;
    const steps=Math.max(1,Math.ceil(dt*120)),step=dt/steps;
    for(let i=0;i<steps;i++){this.velocity+=((strain-this.strain)*190-this.velocity*18)*step;this.strain+=this.velocity*step;}
    const compression=clamp(this.strain,-.13,.17),b=clamp(release,0,1.4);
    const targetCharge=charge*pulseGain;
    this.frame.charge+=(targetCharge-this.frame.charge)*(1-Math.exp(-dt*15));
    Object.assign(this.frame,{breath:breathe,strain:compression,release:b,flow,radiance:lightGain,accent:clamp(accent,0,1),
      scaleX:1+compression,scaleY:1+compression*.9,scaleZ:1-compression*.38,
      twist:compression*.25,events:this.events,corona:clamp(surge,0,1.2)});
    return this.frame;
  }
}
export const neutralEnergy=()=>({...defaults,corona:0,events:[]});
