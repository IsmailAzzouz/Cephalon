import { defaults } from '/packages/avatar/src/settings.js';

const ranges=[
  ['crystalOpacity','Opacité du cristal',0,.7,.01],['fresnelStrength','Fresnel',0,3,.05],
  ['edgeWidth','Épaisseur des arêtes',.3,2.5,.05],['edgeEmission','Émission des arêtes',.5,10,.1],
  ['bloomIntensity','Intensité du bloom',0,2,.05],['bloomRadius','Rayon du bloom',.4,3,.05],
  ['aberration','Dispersion chromatique · px',0,4,.1],['coreSize','Taille du noyau',.4,1.8,.05],
  ['coreIntensity','Énergie du noyau',.1,3,.05],['ringYaw','Azimut des anneaux · XZ',-3.14,3.14,.05],
  ['waveAmplitude','Amplitude des ondes',0,2,.05],['fragmentsIntensity','Micro-fragments',0,2,.05],
];
const layerNames={crystal:'Cristal',fractures:'Fissures et micro-fragments',core:'Noyau',voiceRing:'Onde principale',innerWaveform:'Oscillogramme central',ticks:'Couronne graduée',filaments:'Filaments',particles:'Particules'};

export class AvatarDebug {
  constructor(avatar){
    this.avatar=avatar;this.panel=document.querySelector('#debug-panel');this.controls=[];
    const fields=document.querySelector('#optical-controls');
    for(const [key,label,min,max,step]of ranges){
      const row=document.createElement('label');row.className='debug-range';
      const text=document.createElement('span');text.textContent=label;
      const output=document.createElement('output');output.textContent=String(avatar.config[key]);
      const input=document.createElement('input');Object.assign(input,{type:'range',min,max,step,value:avatar.config[key]});input.dataset.config=key;
      input.addEventListener('input',()=>{avatar.config[key]=Number(input.value);output.textContent=Number(input.value).toFixed(step<.1?2:1);});
      row.append(text,output,input);fields.append(row);this.controls.push({key,input,output});
    }
    const isolate=document.querySelector('#isolate-layer');
    for(const [key,label]of Object.entries(layerNames)){
      const option=document.createElement('option');option.value=key;option.textContent=label;isolate.append(option);
      const row=document.createElement('label');row.className='debug-check';
      const input=document.createElement('input');input.type='checkbox';input.checked=avatar.config[key];input.dataset.config=key;
      input.addEventListener('change',()=>{avatar.config[key]=input.checked;});row.append(input,document.createTextNode(label));document.querySelector('#layer-controls').append(row);
    }
    isolate.addEventListener('change',()=>{avatar.config.isolate=isolate.value;});
    for(const key of ['postFX','lensEffects']){
      const input=document.querySelector('[data-config='+key+']');input.addEventListener('change',()=>{avatar.config[key]=input.checked;});
    }
    document.querySelector('#debug-stage').addEventListener('change',event=>{avatar.stage=Number(event.target.value);});
    const emotion=document.querySelector('#emotion');emotion.addEventListener('change',()=>avatar.controller.setEmotion(emotion.value));
    document.querySelector('#emotion-intensity').addEventListener('input',event=>{avatar.controller.setEmotion(avatar.controller.emotion,Number(event.target.value));});
    document.querySelector('#demo-signal').addEventListener('change',event=>{
      if(event.target.checked)avatar.audio.stop();avatar.controller.setDemo(event.target.checked);
    });
    document.querySelector('#audio-file').addEventListener('change',async event=>{
      const file=event.target.files[0];if(!file)return;
      try{await avatar.audio.playFile(file);this.message('Lecture locale : '+file.name);}catch{this.message('Lecture impossible. Essayez un MP3 ou un WAV.');}
    });
    document.querySelector('#audio-stop').addEventListener('click',()=>{avatar.audio.stop();avatar.controller.setState('idle');this.message('Signal arrêté.');});
    document.querySelector('#microphone').addEventListener('click',async()=>{
      try{await avatar.audio.requestMicrophone();this.message('Microphone actif. Aucun signal microphone n’est envoyé aux haut-parleurs.');}
      catch(error){this.message(error.message||'Le microphone est indisponible.');}
    });
    if(!navigator.mediaDevices?.getUserMedia){document.querySelector('#microphone').disabled=true;this.message('Sur le réseau local en HTTP, utilisez un fichier ou un flux audio. Le microphone nécessite HTTPS ou localhost.');}
    document.querySelector('#reset-optics').addEventListener('click',()=>{
      Object.assign(avatar.config,defaults);avatar.stage=7;avatar.controller.setEmotion('neutral',.7);avatar.orbit.reset();
      this.controls.forEach(({key,input,output})=>{input.value=avatar.config[key];output.textContent=String(avatar.config[key]);});
      document.querySelectorAll('[data-config]').forEach(input=>{if(input.type==='checkbox')input.checked=avatar.config[input.dataset.config];});
      isolate.value='all';document.querySelector('#debug-stage').value='7';this.refresh();
    });
    this.refresh();
  }
  message(text){document.querySelector('#audio-message').textContent=text;}
  refresh(){
    document.querySelector('#emotion').value=this.avatar.controller.emotion;
    document.querySelector('#emotion-intensity').value=this.avatar.controller.emotionIntensity;
    document.querySelector('#demo-signal').checked=this.avatar.controller.demo;
    document.querySelector('#hdr-status').textContent=this.avatar.post.hdr?'HDR 16 bits · bloom sélectif':'HDR indisponible sur ce navigateur · rendu de secours';
  }
}
