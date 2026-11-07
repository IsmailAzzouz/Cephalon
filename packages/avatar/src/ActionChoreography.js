const pulse=(t,duration)=>t>=0&&t<duration?Math.sin(t/duration*Math.PI):0;

/** Authored body language shared by all profiles using a behavior. No Three.js dependency. */
export function actionPose(action,frame){
  const {profile,focus}=action,t=action.age*profile.tempo;
  const pose={gx:focus[0],gy:focus[1],roll:0,forward:0,nod:0,recoil:0,field:0,comparison:0,readProgress:0,toolPulse:0,writing:0,contact:0,contactPulse:0,contactCount:0};
  const kind=profile.behavior;
  if(kind==='idle'){
    const part=t%8.4;pose.gx=part>4.3&&part<6.3?-.25:focus[0];pose.gy=part>4.3&&part<6.3?.14:focus[1];
  }
  if(kind==='read'||kind==='search'){
    const lineTime=kind==='read'?.88:.57,line=Math.floor(t/lineTime),scan=t%lineTime/lineTime;
    const side=Math.floor(line/6)%2?-1:1;
    pose.gx=focus[0]*side+scan*.17;pose.gy=focus[1]-(line%6)*.105;
    pose.roll=-pose.gx*.13;pose.forward=.12;pose.field=1;pose.readProgress=scan;
    pose.nod=pulse(t%lineTime,.24)*.022;pose.toolPulse=pulse(t,.5);
  }
  if(kind==='write'){
    const burst=t%1.6,stroke=t%.22/.22;
    pose.gx=focus[0]+(burst<1.18?stroke*.13:-.07);pose.gy=focus[1]-.055*Math.floor((t%4.8)/1.6);
    pose.roll=.075+Math.sin(t*8)*.018;pose.forward=.2;pose.field=1;pose.readProgress=Math.min(1,burst/1.18);
    pose.writing=1;pose.nod=burst<1.18?pulse(burst%.38,.3)*.026:-.035;
    pose.toolPulse=burst<1.18?Math.pow(Math.max(0,Math.sin(t*9)),3)*.4:0;
  }
  if(kind==='listen'){
    pose.gx+=Math.sin(t*.65)*.025;pose.roll=-.075;pose.forward=.16;
    pose.nod=pulse(t,.8)*.115+frame.mic*.045;
  }
  if(kind==='think'){
    const index=Math.floor(t/1.2)%3,looks=[[0,0],[.6,-.1],[.22,-.3]];
    pose.gx+=looks[index][0];pose.gy+=looks[index][1];pose.roll=index===1?.08:-.065;pose.forward=-.04;
  }
  if(kind==='analyse'){
    const sweep=t%1.15/1.15,row=Math.floor(t/1.15)%4;
    pose.gx+=sweep*.13;pose.gy-=row*.1;pose.roll=.11;pose.forward=.24;pose.field=1;pose.readProgress=sweep;
    if(t%4.6>3.75){pose.gx=-.24;pose.gy=.34;pose.roll=-.08;pose.forward=.06;}
  }
  if(kind==='compare'){
    const side=Math.floor(t/.85)%2;pose.gx=side?-focus[0]:focus[0];pose.gy=side?-.12:focus[1];
    pose.roll=side?.07:-.065;pose.forward=.14;pose.field=1;pose.comparison=1;pose.readProgress=t%.85/.85;
  }
  if(kind==='speak'||kind==='report'){
    pose.gx+=Math.sin(t*.8)*.025;pose.roll=Math.sin(t*.7)*.025;pose.forward=kind==='report'?.2:.16;
    pose.nod=pulse(t,.8)*.12; // additional audio phrase accents are supplied by PresenceDirector
  }
  if(kind==='contact'||kind==='summon'){
    const count=Math.min(4,action.contacts),launch=kind==='summon'?1.15:.75;
    const waiting=t>=launch,cycle=(t-launch)%2.8;
    pose.gx=waiting?(Math.floor((t-launch)/1.4)%2?-.42:.48):focus[0];
    pose.gy=waiting?.12:focus[1]+.1;pose.roll=-pose.gx*.12;
    pose.forward=waiting?.04:-.07;pose.recoil=-pulse(t,.42)*.11;
    pose.nod=-pulse(t,.55)*.08;pose.contact=1;pose.contactCount=count;
    pose.contactPulse=t<launch?Math.max(pulse(t,.6),pulse(t-.33,.6)*.7):pulse(cycle,.8)*.22;
    pose.toolPulse=pose.contactPulse;
  }
  const strength=profile.intensity;
  pose.gx*=strength*profile.travel;pose.gy*=strength*profile.travel;
  pose.roll*=strength*profile.tilt;pose.nod*=strength*profile.tilt;
  pose.forward*=strength*profile.lean;pose.recoil*=strength*profile.lean;
  return pose;
}
