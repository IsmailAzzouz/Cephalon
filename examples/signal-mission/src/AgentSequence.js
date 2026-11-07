import { missionBrief,transmissions,matchesSignal,analyseTransmissions,verifyAnalysis,makeReport } from './SignalScenario.js';

export const missionPhases=[
  {id:'receive',label:'Mission received',duration:2.6,state:'listening',emotion:'neutral',intensity:.3,activity:'none'},
  {id:'plan',label:'Planning',duration:3.4,state:'thinking',emotion:'curious',intensity:.55,activity:'planning'},
  {id:'search',label:'Searching the transmissions',duration:5.2,state:'thinking',emotion:'curious',intensity:.7,activity:'searching'},
  {id:'found',label:'Source located',duration:2.8,state:'speaking',emotion:'surprised',intensity:.6,activity:'none'},
  {id:'analyse',label:'Analysing the signal',duration:4.4,state:'thinking',emotion:'concerned',intensity:.4,activity:'analysing'},
  {id:'verify',label:'Cross-checking the evidence',duration:3.4,state:'thinking',emotion:'neutral',intensity:.35,activity:'analysing'},
  {id:'report',label:'Report to the Operator',duration:7.8,state:'speaking',emotion:'happy',intensity:.45,activity:'reporting'},
];

export class AgentSequence {
  constructor(controller,{records=transmissions,query=missionBrief,onChange=()=>{}}={}){
    this.controller=controller;this.records=records;this.query=query;this.onChange=onChange;
    this.phaseDurations={};this.canAdvance=()=>true;
    this.duration=missionPhases.reduce((sum,phase)=>sum+phase.duration,0);
    this.status='ready';this.paused=false;this.elapsed=0;this.phaseTime=0;this.phaseIndex=-1;this.log=[];
    this.result=null;this.verification=null;this.report='';this.matches=[];this.scanned=0;this.lastEmit=-1;this.milestones=new Set();
  }
  get running(){return this.status==='running';}
  get phase(){return missionPhases[this.phaseIndex]||null;}
  get phaseDuration(){return this.phaseDurations[this.phase?.id]??this.phase?.duration??0;}
  configureDurations(durations){
    if(this.running)throw new Error('Stop the mission before changing its timing.');
    for(const [id,duration]of Object.entries(durations))if(!missionPhases.some(phase=>phase.id===id)||!Number.isFinite(duration)||duration<=0)throw new Error('Invalid mission phase duration.');
    this.phaseDurations={...durations};this.duration=missionPhases.reduce((total,phase)=>total+(this.phaseDurations[phase.id]??phase.duration),0);
  }
  start({demo=true}={}){
    if(this.running)this.stop();
    this.previous={demo:this.controller.demo,paused:this.controller.paused};
    this.status='running';this.paused=false;this.elapsed=0;this.phaseTime=0;this.phaseIndex=-1;this.log=[];this.matches=[];this.scanned=0;
    this.result=null;this.verification=null;this.report='';this.lastEmit=-1;this.milestones.clear();
    this.currentRecord=null;this.lastMatchFocus=[.62,.12];
    this.controller.setDemo(demo);if(!demo)this.controller.clearAudioLevels();this.controller.setPaused(this.controller.reducedMotion&&this.previous.paused);
    this.enterPhase(0);this.emit('start');
  }
  enterPhase(index){
    this.phaseIndex=index;this.phaseTime=0;this.milestones.clear();
    const phase=this.phase;
    const emotion=phase.id==='found'&&!this.matches.length?'concerned':phase.emotion;
    this.controller.setState(phase.state);this.controller.setEmotion(emotion,phase.intensity);this.controller.setActivity(phase.activity);
    if(phase.id==='receive'){this.controller.cue('acknowledge',{duration:1.1});this.append('Operator',this.query.instruction);}
    if(phase.id==='plan'){this.controller.cue('consider',{focus:[-.43,.4],duration:1.2});this.append('Plan','Match the frequency and signature, locate the source, assess the risk, then report.');}
    if(phase.id==='search'){this.controller.cue('tool-call',{focus:[-.72,.3],duration:.48,tool:'Local search'});this.append('Local search',this.records.length+' transmissions to examine. Comparing frequency and signature.');}
    if(phase.id==='found'){
      this.result=analyseTransmissions(this.matches);
      this.controller.cue(this.result?'found':'consider',{focus:this.result?this.lastMatchFocus:[-.2,.25],duration:1.45});
      this.append('Discovery',this.result?this.result.source+' · '+this.result.sector+' · '+this.result.records.length+' matching observations.':'No matching source.');
    }
    if(phase.id==='analyse'){
      this.result=analyseTransmissions(this.matches);
      this.controller.cue('inspect',{focus:[.62,-.1],duration:1.6,tool:'Signal analysis'});
      this.append('Analysis',this.result?this.result.packets+' packets examined; '+this.result.corrupted+' corrupted.':'Insufficient evidence for a conclusion.');
      if(!this.result)this.controller.setEmotion('concerned',.55);
      else this.controller.setEmotion(this.result.risk==='low'?'curious':'concerned',.45);
    }
    if(phase.id==='verify'){
      this.verification=verifyAnalysis(this.result,this.query);this.controller.cue('compare',{duration:3.35,tool:'Cross-check'});this.append('Cross-check',this.verification.reason);
    }
    if(phase.id==='report'){
      this.report=makeReport(this.result,this.verification);this.controller.cue('report',{duration:4.8});this.append('Report','Findings and recommendation prepared. No changes applied.');
    }
    this.emit('phase');
  }
  append(tool,message){this.log.push({tool,message,time:this.elapsed});}
  scanNext(){
    const index=this.scanned,record=this.records[this.scanned++],matched=matchesSignal(record,this.query);
    const side=Math.floor(index/6)%2?1:-1,focus=[side*.64+(index%2)*.035,.34-(index%6)*.115];
    if(matched){this.matches.push(record);this.lastMatchFocus=focus;}
    this.currentRecord=record;
    this.controller.cue('read',{focus,duration:.54,tool:'Reading transmissions',record:record.id,matched});
  }
  processPhase(){
    const phase=this.phase;
    if(phase.id==='search'){
      const target=Math.min(this.records.length,Math.floor(this.phaseTime/this.phaseDuration*this.records.length));
      while(this.scanned<target)this.scanNext();
    }
    if(phase.id==='found'&&this.phaseTime>1&&!this.milestones.has('settle')){
      this.milestones.add('settle');this.controller.setEmotion(this.result?'curious':'concerned',.45);
    }
    if(phase.id==='analyse'&&this.result&&this.phaseTime>1.7&&!this.milestones.has('metrics')){
      this.milestones.add('metrics');this.controller.cue('consider',{focus:[-.23,.36],duration:.95});this.append('Measurements','Power peak +'+this.result.powerExcess+'% · integrity '+this.result.integrity+'% · risk '+({low:'low',moderate:'moderate',high:'high'}[this.result.risk])+'.');
    }
  }
  update(delta){
    if(!this.running||this.paused||!Number.isFinite(delta)||delta<=0)return;
    let remaining=delta;
    while(remaining>0&&this.running){
      const advance=Math.min(remaining,this.phaseDuration-this.phaseTime);
      this.phaseTime+=advance;this.elapsed+=advance;remaining-=advance;this.processPhase();
      if(this.phaseTime>=this.phaseDuration-1e-8){
        if(!this.canAdvance()){remaining=0;break;}
        if(this.phase.id==='search'){
          while(this.scanned<this.records.length)this.scanNext();
          this.append('Result',this.matches.length+' transmissions match the frequency and signature.');
        }
        if(this.phaseIndex<missionPhases.length-1)this.enterPhase(this.phaseIndex+1);else this.finish();
      }
    }
    if(this.running&&this.elapsed-this.lastEmit>=.08){this.lastEmit=this.elapsed;this.emit('progress');}
  }
  finish(){
    this.status='complete';this.elapsed=this.duration;this.paused=false;
    this.append('Mission complete','Report delivered to the Operator. Recommendation only; no action taken.');
    this.restore();this.emit('complete');
  }
  stop(reason='Mission stopped by the Operator.'){
    if(!this.running)return;
    this.status='cancelled';this.paused=false;this.append('Interrupted',reason);this.restore();this.emit('cancelled');
  }
  restore(){
    this.controller.setActivity('none');this.controller.setState('idle');this.controller.setEmotion('neutral',.3);
    this.controller.cue('settle',{duration:1.2});
    this.controller.setDemo(this.previous?.demo??true);this.controller.setPaused(this.previous?.paused??this.controller.reducedMotion);
  }
  setPaused(paused){
    if(!this.running)return;this.paused=Boolean(paused);this.controller.setPaused(this.paused||(this.controller.reducedMotion&&this.previous.paused));this.emit('pause');
  }
  emit(type){this.onChange(this.snapshot(),type);}
  snapshot(){
    const id=this.phase?.id;
    let message=this.query.instruction;
    if(id==='plan')message='I will match the frequency and signature, locate the source, then check its integrity.';
    if(id==='search')message=(this.currentRecord?'Reading '+this.currentRecord.id+' · ':'Tool call · ')+this.scanned+' / '+this.records.length+' transmissions · '+this.matches.length+(this.matches.length===1?' match.':' matches.');
    if(id==='found')message=this.result?'I have a match, Operator. '+this.result.source+', near '+this.result.sector+'. Checking it now.':'No matching source. There is not enough evidence for a reliable conclusion.';
    if(id==='analyse')message=this.result?'Checking power and integrity across '+this.result.packets+' packets from this source.':'There is not enough data to make a reliable assessment.';
    if(id==='verify')message=this.verification.reason;
    if(id==='report'){
      const length=this.controller.reducedMotion?this.report.length:Math.ceil(this.phaseTime/this.phaseDuration*this.report.length);
      message=this.report.slice(0,length)||'Operator, here are my findings.';
    }
    if(this.status==='complete')message=this.report;
    if(this.status==='cancelled')message='Mission stopped. No final report was delivered.';
    return {status:this.status,paused:this.paused,phase:id,phaseIndex:this.phaseIndex,label:this.status==='complete'?'Report delivered':this.status==='cancelled'?'Mission stopped':id==='found'&&!this.result?'No source identified':this.phase?.label||'Demo mission',message,
      elapsed:this.elapsed,duration:this.duration,progress:this.elapsed/this.duration,scanned:this.scanned,total:this.records.length,matches:this.matches.length,log:this.log.map(entry=>({...entry})),report:this.status==='complete'?this.report:'',result:this.result};
  }
}
