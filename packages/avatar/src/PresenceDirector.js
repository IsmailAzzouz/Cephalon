import { actionPose } from './ActionChoreography.js';

const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
const channel=()=>({value:0,velocity:0});
function spring(current,target,delta,stiffness=125,damping=18){
  const steps=Math.max(1,Math.ceil(delta*120)),dt=delta/steps;
  for(let i=0;i<steps;i++){
    current.velocity+=((target-current.value)*stiffness-current.velocity*damping)*dt;
    current.value+=current.velocity*dt;
  }
  return current.value;
}
const pulse=(time,duration)=>time>=0&&time<duration?Math.sin(time/duration*Math.PI):0;

/** Directed attention and body language, independent of the optical materials. */
export class PresenceDirector {
  constructor(){
    this.channels=Object.fromEntries(['yaw','pitch','roll','x','y','z','focusX','focusY'].map(name=>[name,channel()]));
    this.pose={yaw:0,pitch:0,roll:0,x:0,y:0,z:0,focusX:0,focusY:0,field:0,fieldSide:-1,readProgress:0,toolPulse:0,comparison:0,writing:0,contact:0,contactPulse:0,contactCount:0};
    this.mode='';this.modeAge=0;this.lastAction=0;this.speechBeat=-10;this.previousVoice=0;this.manualWeight=1;
  }
  update(delta,controller,frame,orbit){
    if(controller.paused)return this.pose;
    const dt=clamp(delta,0,.1),time=frame.time;
    const state=controller.state==='glitch'?controller.returnState:controller.state;
    const mode=controller.activity+'/'+state;
    if(mode!==this.mode){this.mode=mode;this.modeAge=0;}else this.modeAge+=dt;
    const age=this.modeAge;
    let gx=0,gy=.06,roll=0,forward=0,field=0,comparison=0,readProgress=0;
    let nod=0,recoil=0,toolPulse=0,writing=0,contact=0,contactPulse=0,contactCount=0;

    if(state==='idle'){
      const cycle=age%8.4;
      if(cycle>4.3&&cycle<6.3){gx=-.25;gy=.14;roll=-.025;}
      else if(cycle>=6.3&&cycle<7.1){gx=.12;gy=.03;}
    }else if(state==='listening'){
      gx=.035*Math.sin(time*.7);gy=.06;roll=-.07;forward=.14;
      nod=pulse(age,.75)*.095;
    }else if(state==='thinking'){
      const part=Math.floor(age/1.25)%3;
      [gx,gy]=[[-.4,.36],[.2,.23],[-.2,.08]][part];roll=-.035;forward=-.025;
    }

    if(controller.activity==='planning'){
      const part=Math.floor(age/1.15)%3;
      [gx,gy]=[[-.43,.4],[.23,.28],[-.16,.07]][part];roll=part===1?.085:-.045;
    }
    if(controller.activity==='searching'){
      const page=Math.floor(age/2.6)%2,scan=age%.8/.8,row=Math.floor(age/.8)%4;
      gx=(page? .55:-.75)+scan*.2;gy=.32-row*.15;roll=page?.06:-.07;
      forward=.09;field=1;readProgress=scan;
    }
    if(controller.activity==='analysing'){
      const scan=age%.95/.95,row=Math.floor(age/.95)%4;
      gx=.48+scan*.14;gy=.22-row*.12;roll=.1;forward=.2;field=1;readProgress=scan;
    }
    if(state==='speaking'){
      gx=.04*Math.sin(age*.9);gy=.04;roll=Math.sin(age*.75)*.025;forward=.16;
      if(((frame.voice>.25&&this.previousVoice<.19)||frame.transient>.018)&&time-this.speechBeat>.4)this.speechBeat=time;
      const beat=time-this.speechBeat;
      nod+=pulse(beat,.42)*.105;
      nod+=pulse(age,.8)*.09;
      forward+=pulse(beat,.42)*.045;
    }
    if(controller.speechActive&&state!=='speaking'){
      if(frame.transient>.025&&time-this.speechBeat>.55)this.speechBeat=time;
      nod+=pulse(time-this.speechBeat,.4)*.045;
    }
    this.previousVoice=frame.voice;

    const playback=controller.animations.sample();
    if(playback){
      const directed=actionPose(playback,frame);
      const speechAccent=['speak','report'].includes(playback.profile.behavior)?nod:0;
      ({gx,gy,roll,forward,nod,recoil,field,comparison,readProgress,toolPulse,writing,contact,contactPulse,contactCount}=directed);
      nod+=speechAccent*playback.profile.intensity*playback.profile.tilt;
    }

    const action=playback?null:controller.action,actionAge=action?time-action.at:10;
    if(action&&actionAge>=0&&actionAge<action.duration){
      if(action.id!==this.lastAction)this.lastAction=action.id;
      const target=action.focus;
      if(['tool-call','read','inspect'].includes(action.type)){
        gx=target[0];gy=target[1];field=1;
        roll=-gx*.12;forward=action.type==='inspect'?.23:.1;
        readProgress=clamp(actionAge/action.duration,0,1);
        if(action.type==='tool-call'){
          recoil=-pulse(actionAge,.22)*.08;toolPulse=pulse(actionAge,.45);
          roll+=pulse(actionAge,.22)*(gx<0?-.055:.055);
        }
        if(action.type==='read'){
          gx+=readProgress*.11;gy-=readProgress*.025;
          if(action.matched){toolPulse=pulse(actionAge,.35)*.55;nod+=pulse(actionAge,.35)*.045;}
        }
      }else if(action.type==='compare'){
        comparison=1;field=1;forward=.12;
        const side=Math.floor(actionAge/.72)%2;
        gx=side?.62:-.62;gy=side?-.08:.22;roll=side?.065:-.045;
        readProgress=actionAge%.72/.72;
        if(actionAge>action.duration-.45){gx=0;gy=.05;field=.4;}
      }else if(action.type==='found'){
        const towardSource=actionAge<.8;
        gx=towardSource?target[0]:0;gy=towardSource?target[1]+.16:.08;
        roll=pulse(actionAge,.65)*-.1;recoil=-pulse(actionAge,.36)*.16;
        forward=actionAge>.35?.2:0;nod=-pulse(actionAge,.45)*.12;
        field=1-clamp(actionAge/action.duration,0,1);toolPulse=pulse(actionAge,.6);
      }else if(action.type==='consider'){
        gx=target[0];gy=target[1];roll=-.09;forward=-.045;
      }else if(action.type==='acknowledge'){
        gx=0;gy=.06;roll=-.075;forward=.15;nod=pulse(actionAge,.7)*.12;
      }else if(action.type==='report'){
        gx=.025*Math.sin(actionAge);gy=.045;roll=0;forward=.2;
        nod+=pulse(actionAge,.8)*.12;field=0;
      }else if(action.type==='settle'){
        gx=0;gy=.06;roll=0;forward=.05;nod=pulse(actionAge,.65)*.065;field=0;
      }
    }

    const manual=orbit.interacted&&(orbit.dragging||orbit.elapsed-orbit.lastInteraction<1.2);
    this.manualWeight+=(Number(!manual)-this.manualWeight)*(1-Math.exp(-dt*10));
    const weight=this.manualWeight*(controller.reducedMotion?.55:1);
    const yaw=gx*.78,pitch=-gy*.48+nod;
    const z=forward+recoil;
    const hover=Math.sin(time*.8)*.026+Math.sin(time*.31)*.012;
    const c=this.channels,p=this.pose;
    p.focusX=spring(c.focusX,gx,dt,340,28)*weight;p.focusY=spring(c.focusY,gy,dt,340,28)*weight;
    p.yaw=spring(c.yaw,yaw,dt,135,18)*weight;
    p.pitch=spring(c.pitch,pitch,dt,145,19)*weight;
    p.roll=spring(c.roll,roll-gx*.045+frame.happy*Math.sin(time*1.7)*.018,dt,110,16)*weight;
    p.x=spring(c.x,gx*.12,dt,65,13)*weight;
    p.y=spring(c.y,gy*.075+hover+frame.happy*.025,dt,70,14)*weight;
    p.z=spring(c.z,z,dt,85,15)*weight;
    p.field+=(field-p.field)*(1-Math.exp(-dt*7));if(Math.abs(gx)>.15)p.fieldSide=gx>=0?1:-1;
    p.readProgress=readProgress;p.toolPulse=toolPulse;p.comparison=comparison;p.writing=writing;
    p.contact+=(contact-p.contact)*(1-Math.exp(-dt*7));p.contactPulse=contactPulse;
    if(contactCount)p.contactCount=contactCount;
    return p;
  }
}
