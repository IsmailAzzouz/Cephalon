const ranges=[['tempo','Vitesse',.25,2.5,.05],['intensity','Intensité',0,2,.05],['travel','Direction et déplacement',0,2,.05],['tilt','Inclinaison et accents',0,2,.05],['lean','Rapprochement',0,2,.05],['pulse','Pulsation du cristal',0,2,.05],['radiance','Rayonnement énergétique',0,2,.05],['duration','Durée de l’aperçu · secondes',.3,120,.1],['focusX','Attention gauche / droite',-1,1,.05],['focusY','Attention bas / haut',-1,1,.05]];
const storageKey='cephalon.animations.v1';

export class AnimationStudio {
  constructor(avatar,{onPreview=()=>{},onStop=()=>{}}={}){
    this.avatar=avatar;this.player=avatar.controller.animations;this.library=this.player.library;this.selected='read';this.controls=[];
    this.select=document.querySelector('#animation-set');this.status=document.querySelector('#animation-status');
    try{const saved=localStorage.getItem(storageKey);if(saved)this.library.import(saved);}catch{this.message('Configuration locale illisible. Les sets fournis restent disponibles.');}
    this.library.subscribe(config=>{
      try{localStorage.setItem(storageKey,JSON.stringify(config));}catch{this.message('Stockage local indisponible ; exportez vos réglages pour les conserver.');}
      this.refresh();
    });
    this.select.addEventListener('change',()=>{this.selected=this.select.value;this.refresh();});
    for(const [key,label,min,max,step]of ranges){
      const row=document.createElement('label');row.className='debug-range';
      const text=document.createElement('span');text.textContent=label;const output=document.createElement('output');
      const input=document.createElement('input');Object.assign(input,{type:'range',min,max,step});input.dataset.animationParameter=key;
      input.addEventListener('input',()=>{
        const value=Number(input.value),profile=this.library.get(this.selected);
        const patch=key.startsWith('focus')?{focus:key==='focusX'?[value,profile.focus[1]]:[profile.focus[0],value]}:{[key]:value};
        this.library.configure(this.selected,patch);
      });
      row.append(text,output,input);document.querySelector('#animation-ranges').append(row);this.controls.push({key,input,output});
    }
    document.querySelector('#animation-preview').addEventListener('click',()=>{
      onPreview();this.player.stopAll();avatar.audio.stop();avatar.controller.setDemo(true);
      this.player.play(this.selected,{agentCount:this.library.get(this.selected).behavior==='summon'?3:1});
      this.message('Aperçu : '+this.library.get(this.selected).label+'.');
      document.querySelector('#debug-panel').hidden=true;document.querySelector('#debug-toggle').setAttribute('aria-expanded','false');avatar.canvas.focus({preventScroll:true});
    });
    document.querySelector('#animation-stop').addEventListener('click',()=>{onStop();this.player.stopAll();this.message('Animation arrêtée.');});
    document.querySelector('#animation-reset').addEventListener('click',()=>{this.library.reset(this.selected);this.message('Set rétabli.');});
    document.querySelector('#animation-duplicate').addEventListener('click',()=>{
      let i=1,id;do{id='custom-'+this.selected.replace(/^custom-/,'').slice(0,40)+'-'+i++;}while(Object.prototype.hasOwnProperty.call(this.library.profiles,id));
      const source=this.selected;this.selected=id;this.library.configure(id,{extends:source,label:this.library.get(source).label.slice(0,68)+' · copie'});this.message('Copie créée. Ses réglages sont indépendants.');
    });
    document.querySelector('#animation-export').addEventListener('click',()=>{
      const url=URL.createObjectURL(new Blob([JSON.stringify(this.library.export(),null,2)+'\n'],{type:'application/json'}));
      const link=document.createElement('a');link.href=url;link.download='cephalon-animations.v1.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);this.message('Configuration exportée.');
    });
    document.querySelector('#animation-import').addEventListener('change',async event=>{
      const file=event.target.files[0];if(!file)return;
      try{if(file.size>200000)throw new Error('Fichier trop volumineux (200 Ko maximum).');this.library.import(await file.text());this.message('Configuration importée et enregistrée sur cet appareil.');}
      catch(error){this.message('Import refusé : '+error.message);}event.target.value='';
    });
    document.querySelector('#animation-bind-tools').addEventListener('click',()=>{
      try{this.library.bindTools(JSON.parse(document.querySelector('#animation-tools').value));this.message('Liaisons d’outils enregistrées.');}catch(error){this.message('Liaisons refusées : '+error.message);}
    });
    this.refresh();
  }
  message(text){this.status.textContent=text;}
  refresh(){
    const profiles=this.library.list();if(!profiles.some(profile=>profile.id===this.selected))this.selected='read';
    this.select.replaceChildren(...profiles.map(profile=>{const option=document.createElement('option');option.value=profile.id;option.textContent=profile.label;return option;}));this.select.value=this.selected;
    const profile=this.library.get(this.selected);
    for(const {key,input,output}of this.controls){const value=key==='focusX'?profile.focus[0]:key==='focusY'?profile.focus[1]:profile[key];input.value=value;output.textContent=String(Number(value.toFixed(2)));}
    const reset=document.querySelector('#animation-reset');reset.disabled=!['idle','read','write','listen','speak','think','search','analyse','compare','contact','summon','report'].includes(this.selected);
    const tools=document.querySelector('#animation-tools');if(document.activeElement!==tools)tools.value=JSON.stringify(this.library.tools,null,2);
    document.querySelector('#animation-behavior').textContent='Comportement : '+profile.behavior+' · réglages conservés sur cet appareil.';
  }
}
