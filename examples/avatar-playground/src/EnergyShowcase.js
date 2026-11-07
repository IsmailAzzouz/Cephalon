const phases=[
  {name:'idle',duration:1.8,emotion:'neutral',intensity:.3},
  {name:'listen',duration:2.6,emotion:'curious',intensity:.45},
  {name:'think',duration:3.2,emotion:'curious',intensity:.65},
  {name:'write',duration:3,emotion:'neutral',intensity:.4},
  {name:'summon',duration:5,emotion:'happy',intensity:.55},
  {name:'analyse',duration:3,emotion:'curious',intensity:.6},
  {name:'report',duration:4.4,emotion:'happy',intensity:.7},
];

/** An audio-free presentation of the actual reusable animation profiles. */
export class EnergyShowcase {
  constructor(controller,onChange=()=>{}){this.controller=controller;this.onChange=onChange;this.running=false;this.index=0;this.serial=0;this.actionId=null;}
  start(){
    this.stop();this.controller.animations.stopAll();
    this.previous={demo:this.controller.demo,emotion:this.controller.emotion,intensity:this.controller.emotionIntensity};
    this.controller.setDemo(true);this.running=true;this.index=0;this.serial++;this.enter();
  }
  enter(){
    const phase=phases[this.index];
    this.controller.setEmotion(phase.emotion,phase.intensity);
    this.actionId=this.controller.animations.start(phase.name,{id:'showcase:'+this.serial+':'+this.index,agentCount:phase.name==='summon'?3:1});
    this.phaseStart=this.controller.time;this.onChange();
  }
  update(){
    if(!this.running||this.controller.paused)return;
    if(this.controller.time-this.phaseStart>=phases[this.index].duration){
      this.controller.animations.finish(this.actionId);this.actionId=null;this.index++;
      if(this.index<phases.length)this.enter();else this.stop();
    }
  }
  stop(){
    if(!this.running)return;
    this.running=false;if(this.actionId)this.controller.animations.finish(this.actionId);this.actionId=null;
    this.controller.setDemo(this.previous.demo);this.controller.setEmotion(this.previous.emotion,this.previous.intensity);this.onChange();
  }
}
