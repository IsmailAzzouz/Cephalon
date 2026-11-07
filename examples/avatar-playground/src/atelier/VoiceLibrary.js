const names={listen:'Écoute',read:'Lecture',write:'Écriture',think:'Réflexion',search:'Recherche',found:'Découverte',analyse:'Analyse',compare:'Comparaison',summon:'Appel de sous-agents',contact:'Contact',report:'Rapport',complete:'Mission terminée',glitch:'Rupture de personnalité',view:'Contemplation',welcome:'Accueil',support:'Renforts'};
const catalogs={en:'/audio/ordis-en/manifest.json',official:'/audio/ordis-official/manifest.json',fr:'/audio/ordis/manifest.json'};

/** Generated dialogue and original game recordings keep distinct catalogs and provenance. */
export class VoiceLibrary {
  constructor(avatar,{beforePlay=()=>{},afterPlay=()=>{}}={}){
    this.avatar=avatar;this.beforePlay=beforePlay;this.afterPlay=afterPlay;this.clips=[];this.catalogs=Object.create(null);this.serial=0;this.collection='en';this.playback=null;
    this.select=document.querySelector('#voice-clip');this.collectionSelect=document.querySelector('#voice-collection');this.button=document.querySelector('#voice-play');this.message=document.querySelector('#voice-status');
    this.ready=this.load();
    this.collectionSelect.addEventListener('change',()=>this.setCollection(this.collectionSelect.value));
    this.select.addEventListener('change',()=>this.refreshSelection());
    this.button.addEventListener('click',()=>{this.play(this.select.value).catch(error=>{this.message.textContent=error.message||'Lecture impossible. Touchez à nouveau le bouton.';});});
  }
  async load(){
    const results=await Promise.allSettled(Object.entries(catalogs).map(async([id,url])=>{
      const response=await fetch(url);if(!response.ok)throw new Error('Catalogue indisponible : '+id);
      const data=await response.json();
      if(data.version!==1||!Array.isArray(data.clips))throw new Error('Catalogue vocal invalide.');
      const clips=data.clips.filter(clip=>typeof clip.id==='string'&&typeof clip.text==='string'&&Number.isFinite(clip.duration)&&/^\/audio\/(ordis|ordis-en|ordis-official)\/[a-z0-9_-]+\.mp3$/.test(clip.mp3));
      if(!clips.length)throw new Error('Le catalogue vocal est vide.');return [id,{...data,clips}];
    }));
    for(const result of results)if(result.status==='fulfilled'){const [id,catalog]=result.value;this.catalogs[id]=catalog;}
    const requested=new URLSearchParams(location.search).get('voice');
    this.setCollection(Object.hasOwn(catalogs,requested)?requested:'en');
    if(!Object.keys(this.catalogs).length)this.message.textContent='Les répliques vocales ne sont pas disponibles.';
  }
  setCollection(id){
    this.collection=id;this.collectionSelect.value=id;this.clips=this.catalogs[id]?.clips||[];
    this.select.replaceChildren(...this.clips.map(clip=>{const option=document.createElement('option');option.value=clip.id;option.textContent=(names[clip.id]||clip.id)+' · '+clip.duration.toFixed(1)+' s';return option;}));
    this.select.disabled=this.button.disabled=!this.clips.length;
    if(this.clips.length){this.message.textContent=this.clips.length+' répliques · lecture locale.';this.refreshSelection();}
    else{this.message.textContent='Cette collection est indisponible.';document.querySelector('#voice-text').textContent='';document.querySelector('#voice-download').hidden=true;document.querySelector('#voice-source').hidden=true;document.querySelector('#voice-provenance').textContent='';}
  }
  refreshSelection(){
    const clip=this.clips.find(item=>item.id===this.select.value);if(!clip)return;
    document.querySelector('#voice-text').textContent=clip.text;
    const download=document.querySelector('#voice-download');download.href=clip.mp3;download.download='ordis-'+this.collection+'-'+clip.id+'.mp3';download.hidden=false;
    const official=this.collection==='official',source=document.querySelector('#voice-source');
    document.querySelector('#voice-provenance').textContent=official?'Enregistrement du jeu · Digital Extremes / Warframe.':'Texte original · voix générée avec le modèle Ordis fourni.';
    source.hidden=!official;if(official)source.href=clip.sourcePage;
  }
  async play(id){
    const serial=++this.serial;await this.ready;if(serial!==this.serial)return;
    let collection=this.collection,clipId=id;
    if(id.includes(':'))[collection,clipId]=id.split(':',2);
    let clip=this.catalogs[collection]?.clips.find(item=>item.id===clipId);
    if(!clip&&!id.includes(':')){collection='en';clip=this.catalogs.en?.clips.find(item=>item.id===id);}
    if(!clip)throw new Error('Réplique vocale inconnue : '+id);
    this.beforePlay();this.setCollection(collection);this.select.value=clipId;this.refreshSelection();
    this.message.textContent='Lecture : '+clip.text;
    const started=await this.avatar.audio.playUrl(clip.mp3);
    if(started&&serial===this.serial){
      this.playback={clip,element:this.avatar.audio.element,fired:new Set()};
      this.avatar.controller.cue('report',{duration:.9});this.afterPlay();
    }
    return clip;
  }
  update(){
    const playback=this.playback;if(!playback)return;
    if(this.avatar.audio.element!==playback.element){this.playback=null;return;}
    for(const [index,cue]of (playback.clip.cues||[]).entries()){
      if(playback.element.currentTime<cue.time||playback.fired.has(index))continue;
      playback.fired.add(index);if(cue.type==='glitch'&&!this.avatar.controller.reducedMotion&&!this.avatar.controller.paused)this.avatar.controller.triggerGlitch(cue.intensity,cue.duration);
    }
  }
  stop(){this.serial++;this.playback=null;this.avatar.audio.stopOutput();}
}
