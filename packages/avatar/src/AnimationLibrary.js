/** Portable animation definitions. JSON only: no renderer, DOM, network or executable code. */
export const animationBehaviors=['idle','read','write','listen','speak','think','search','analyse','compare','contact','summon','report'];
const make=(label,behavior,state,activity,focus,extra={})=>({label,behavior,state,activity,focus,duration:5,tempo:1,intensity:1,travel:1,tilt:1,lean:1,pulse:1,radiance:1,...extra});
export const builtinAnimations={
  idle:make('Repos','idle','idle','none',[0,.06]),
  read:make('Lire','read','thinking','analysing',[-.65,.28]),
  write:make('Écrire','write','thinking','analysing',[.54,-.12]),
  listen:make('Écouter','listen','listening','none',[0,.06]),
  speak:make('Parler','speak','speaking','none',[0,.04]),
  think:make('Réfléchir','think','thinking','planning',[-.4,.36]),
  search:make('Chercher','search','thinking','searching',[-.65,.28]),
  analyse:make('Analyser','analyse','thinking','analysing',[.6,-.08]),
  compare:make('Comparer','compare','thinking','analysing',[-.6,.22]),
  contact:make('Contacter','contact','thinking','none',[.62,.18],{duration:6}),
  summon:make('Appeler des sous-agents','summon','thinking','none',[-.62,.22],{duration:7}),
  report:make('Rapporter','report','speaking','reporting',[0,.04]),
};
const own=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
const idPattern=/^[a-z][a-z0-9_-]{0,63}$/;
const isObject=value=>value&&typeof value==='object'&&!Array.isArray(value);
const number=(value,min,max,key)=>{
  if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)throw new Error(key+' doit être compris entre '+min+' et '+max+'.');return value;
};
const fields=['label','behavior','state','activity','focus','duration','tempo','intensity','travel','tilt','lean','pulse','radiance'];
function validate(id,input,base){
  if(!idPattern.test(id)||['constructor','prototype','__proto__'].includes(id))throw new Error('Identifiant de set invalide : '+id);
  if(!isObject(input))throw new Error('Le set '+id+' doit être un objet.');
  for(const key of Object.keys(input))if(!fields.includes(key)&&key!=='extends')throw new Error('Paramètre inconnu : '+key);
  const profile={...base,...input};delete profile.extends;
  if(typeof profile.label!=='string'||!profile.label.trim()||profile.label.length>80)throw new Error('Libellé de set invalide.');
  if(!animationBehaviors.includes(profile.behavior))throw new Error('Comportement inconnu : '+profile.behavior);
  if(!['idle','listening','thinking','speaking'].includes(profile.state))throw new Error('État de set invalide.');
  if(!['none','planning','searching','analysing','reporting'].includes(profile.activity))throw new Error('Activité de set invalide.');
  if(!Array.isArray(profile.focus)||profile.focus.length!==2)throw new Error('focus doit contenir deux nombres.');
  profile.focus=profile.focus.map(value=>number(value,-1,1,'focus'));
  for(const [key,min,max]of [['duration',.3,120],['tempo',.25,2.5],['intensity',0,2],['travel',0,2],['tilt',0,2],['lean',0,2],['pulse',0,2],['radiance',0,2]])number(profile[key],min,max,key);
  return profile;
}
export class AnimationLibrary {
  constructor(){this.profiles=this.defaults();this.tools=this.defaultTools();this.listeners=new Set();}
  defaults(){return Object.fromEntries(Object.entries(builtinAnimations).map(([id,profile])=>[id,structuredClone(profile)]));}
  defaultTools(){return {read_file:'read',write_file:'write',apply_patch:'write',search:'search',browse:'read',run_command:'analyse',spawn_agent:'summon',send_message:'contact'};}
  get(id){if(!own(this.profiles,id))throw new Error('Set d’animation inconnu : '+id);return structuredClone(this.profiles[id]);}
  list(){return Object.entries(this.profiles).map(([id,profile])=>({id,...structuredClone(profile)}));}
  configure(id,patch){
    const base=patch?.extends?this.get(patch.extends):own(this.profiles,id)?this.get(id):this.get('idle');
    const profile=validate(id,patch,base);this.profiles[id]=profile;this.emit();return this.get(id);
  }
  bindTools(mapping){
    if(!isObject(mapping)||Object.keys(mapping).length>200)throw new Error('Table d’outils invalide.');
    const tools=Object.create(null);
    for(const [tool,animation]of Object.entries(mapping)){
      if(!tool||tool.length>160||['__proto__','constructor','prototype'].includes(tool)||typeof animation!=='string'||!own(this.profiles,animation))throw new Error('Liaison d’outil invalide : '+tool);
      tools[tool]=animation;
    }
    this.tools=tools;this.emit();
  }
  resolveTool(tool){return own(this.tools,tool)?this.tools[tool]:'think';}
  export(){return {version:1,profiles:structuredClone(this.profiles),tools:{...this.tools}};}
  import(value){
    const data=typeof value==='string'?JSON.parse(value):value;
    if(!isObject(data)||data.version!==1||!isObject(data.profiles)||Object.keys(data.profiles).length>100||Object.keys(data).some(key=>!['version','profiles','tools'].includes(key)))throw new Error('Configuration d’animations v1 invalide.');
    // Validate everything in a separate library before replacing the live configuration.
    const draft=new AnimationLibrary();
    for(const [id,profile]of Object.entries(data.profiles))draft.configure(id,profile);
    if(data.tools!==undefined)draft.bindTools(data.tools);
    this.profiles=draft.profiles;this.tools=draft.tools;this.emit();return this.export();
  }
  reset(id){if(id){if(!own(builtinAnimations,id))throw new Error('Ce set est personnalisé.');this.profiles[id]=structuredClone(builtinAnimations[id]);}else{this.profiles=this.defaults();this.tools=this.defaultTools();}this.emit();}
  subscribe(listener){this.listeners.add(listener);return()=>this.listeners.delete(listener);}
  emit(){for(const listener of this.listeners)listener(this.export());}
}
