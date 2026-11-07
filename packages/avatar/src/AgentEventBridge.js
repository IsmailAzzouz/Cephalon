/** Versioned JSON event adapter. Transport (SSE/WebSocket/IPC) belongs to the host. */
export class AgentEventBridge {
  constructor(controller){this.controller=controller;this.actions=controller.animations;}
  handle(event){
    if(!event||typeof event!=='object'||event.version!==1||typeof event.type!=='string')throw new Error('Événement agent v1 invalide.');
    const {type,id,tool}=event;
    const end=['action.end','action.cancel','tool.end','tool.error','subagent.end','subagent.error','speech.end','listening.end'];
    const starts=['action.start','tool.start','subagent.start','speech.start','listening.start'];
    const eventId=id??(type.startsWith('speech.')?'audio:output':type.startsWith('listening.')?'audio:input':null);
    if([...starts,...end].includes(type)&&(typeof eventId!=='string'||!eventId||eventId.length>190))throw new Error('Un id corrélé est requis.');
    if(starts.includes(type)){
      if(type==='tool.start'&&(typeof tool!=='string'||!tool))throw new Error('Nom d’outil requis.');
      const name=type==='tool.start'?this.actions.library.resolveTool(tool):type==='subagent.start'?'summon':type==='speech.start'?'speak':type==='listening.start'?'listen':event.animation;
      const result=this.actions.start(name,{id:'event:'+eventId,tool,focus:event.focus,agentCount:event.agentCount??1,priority:event.priority});
      this.controller.setDemo(false);return result;
    }
    if(end.includes(type)){
      const removed=this.actions.finish('event:'+eventId);
      if(removed&&type.endsWith('.error'))this.controller.triggerGlitch(.35,.18);
      if(removed&&type==='speech.end'&&![...this.actions.entries.values()].some(entry=>this.actions.library.get(entry.name).state==='speaking'))this.controller.setSignals({outputVoiceLevel:0,frequencyBands:[0,0,0]});
      if(removed&&type==='listening.end'&&![...this.actions.entries.values()].some(entry=>this.actions.library.get(entry.name).state==='listening'))this.controller.setSignals({inputMicLevel:0,inputFrequencyBands:[0,0,0]});
      return removed;
    }
    if(type==='signals'){this.controller.setSignals(event.signals);this.controller.setDemo(false);return;}
    if(type==='emotion'){this.controller.setEmotion(event.emotion,event.intensity);return;}
    if(type==='reset'){this.actions.stopAll();this.controller.setSignals({outputVoiceLevel:0,inputMicLevel:0,frequencyBands:[0,0,0],inputFrequencyBands:[0,0,0]});return;}
    throw new Error('Événement agent inconnu : '+type);
  }
}
