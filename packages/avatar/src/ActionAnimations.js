import { AnimationLibrary } from './AnimationLibrary.js';

/** Tracks action lifetimes and interruption. One controller, any agent framework. */
export class ActionAnimations {
  constructor(controller){this.controller=controller;this.library=new AnimationLibrary();this.entries=new Map();this.counter=0;this.current=null;this.previous=null;this.listeners=new Set();
    this.library.subscribe(()=>{
      for(const [id,entry]of this.entries)if(!Object.prototype.hasOwnProperty.call(this.library.profiles,entry.name))this.entries.delete(id);
      this.select();if(this.current)this.applyProfile(this.library.get(this.current.name));this.emit();
    });
  }
  start(name,{id,priority,focus,agentCount=1,tool='',record='',duration=null}={}){
    const profile=this.library.get(name);
    if(id!==undefined&&(typeof id!=='string'||!id||id.length>200))throw new Error('Identifiant d’action invalide.');
    if(duration!==null&&(!Number.isFinite(duration)||duration<.1||duration>3600))throw new Error('Durée d’action invalide.');
    if(focus!==undefined&&(!Array.isArray(focus)||focus.length!==2||focus.some(v=>!Number.isFinite(v)||Math.abs(v)>1)))throw new Error('Direction d’attention invalide.');
    if(priority!==undefined&&(!Number.isFinite(priority)||priority<0||priority>100))throw new Error('Priorité invalide.');
    if(!Number.isFinite(agentCount))throw new Error('Nombre de contacts invalide.');
    const actionId=id??'animation-'+(++this.counter);
    if(this.entries.has(actionId))return actionId; // repeated start is idempotent
    if(!this.entries.size)this.previous={state:this.controller.state==='glitch'?this.controller.returnState:this.controller.state,activity:this.controller.activity};
    const order=++this.counter;
    this.entries.set(actionId,{id:actionId,name,at:this.controller.time,order,priority:priority??(profile.state==='speaking'?90:profile.state==='listening'?80:['contact','summon'].includes(profile.behavior)?60:40),focus:focus?.slice(),agentCount:Math.max(1,Math.min(4,Math.round(agentCount))),tool:String(tool).slice(0,160),record:String(record).slice(0,160),duration});
    this.select();return actionId;
  }
  play(name,options={}){return this.start(name,{...options,duration:options.duration??this.library.get(name).duration});}
  finish(id){if(!this.entries.delete(id))return false;this.select();return true;}
  cancel(id){return this.finish(id);}
  stopAll({restore=true}={}){this.entries.clear();this.current=null;this.controller.action=null;if(restore)this.restore();else this.previous=null;this.emit();}
  restore(){const previous=this.previous;this.previous=null;if(previous){this.controller.setState(previous.state);this.controller.setActivity(previous.activity);}}
  select(){
    const next=[...this.entries.values()].sort((a,b)=>b.priority-a.priority||b.order-a.order)[0]||null;
    if(next?.id===this.current?.id)return;
    this.current=next;
    if(next){this.controller.action=null;this.applyProfile(this.library.get(next.name));}
    else{this.restore();this.controller.action=null;this.controller.cue('settle',{duration:.9});}
    this.emit();
  }
  applyProfile(profile){if(this.controller.state!=='glitch')this.controller.setState(profile.state);this.controller.setActivity(profile.activity);}
  update(){
    let expired=false;
    for(const [id,entry]of this.entries)if(entry.duration!==null&&this.controller.time-entry.at>=entry.duration){this.entries.delete(id);expired=true;}
    if(expired)this.select();
    if(this.current)this.applyProfile(this.library.get(this.current.name));
  }
  sample(){if(!this.current)return null;const profile=this.library.get(this.current.name);return {...this.current,profile,age:Math.max(0,this.controller.time-this.current.at),focus:this.current.focus||profile.focus,contacts:Math.max(this.current.agentCount,[...this.entries.values()].filter(entry=>['contact','summon'].includes(this.library.get(entry.name).behavior)).length)};}
  snapshot(){return {active:this.current?.name||null,id:this.current?.id||null,pending:[...this.entries.values()].map(entry=>({id:entry.id,name:entry.name,tool:entry.tool}))};}
  subscribe(listener){this.listeners.add(listener);return()=>this.listeners.delete(listener);}
  emit(){for(const listener of this.listeners)listener(this.snapshot());}
}
