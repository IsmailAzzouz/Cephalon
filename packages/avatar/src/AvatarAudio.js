const unit=value=>Math.min(1,Math.max(0,value));
export function rmsLevel(samples,gain=4){
  if(!samples.length)return 0;
  let sum=0;for(const value of samples)sum+=value*value;
  return unit(Math.sqrt(sum/samples.length)*gain);
}
export function frequencyLevels(bins,sampleRate,fftSize){
  return [[20,250],[250,2000],[2000,8000]].map(([low,high])=>{
    const first=Math.max(1,Math.floor(low*fftSize/sampleRate)),last=Math.min(bins.length,Math.ceil(high*fftSize/sampleRate));
    let total=0;for(let i=first;i<last;i++)total+=bins[i]/255;
    return last>first?unit(total/(last-first)):0;
  });
}

class AudioAnalyser {
  constructor(context,source,audible=false){
    this.context=context;this.source=source;this.node=context.createAnalyser();this.node.fftSize=1024;this.node.smoothingTimeConstant=0;
    source.connect(this.node);if(audible)this.node.connect(context.destination);
    this.samples=new Float32Array(this.node.fftSize);this.bins=new Uint8Array(this.node.frequencyBinCount);
  }
  read(){this.node.getFloatTimeDomainData(this.samples);this.node.getByteFrequencyData(this.bins);return {level:rmsLevel(this.samples),bands:frequencyLevels(this.bins,this.context.sampleRate,this.node.fftSize)};}
  disconnect(){try{this.source.disconnect(this.node);}catch{}this.node.disconnect();}
}

export class AvatarAudio {
  constructor(controller){this.controller=controller;this.output=null;this.input=null;this.element=null;this.url=null;this.stream=null;this.onChange=()=>{};this.version=0;this.inputVersion=0;}
  async connectOutput(source,{audible=false,preserveState=false}={}){
    this.stopOutput({preserveState});const version=this.version;
    this.context=source.context;await this.context.resume();
    if(version!==this.version)return;
    this.output=new AudioAnalyser(this.context,source,audible);this.controller.setDemo(false);this.onChange('output');
  }
  async playFile(file){
    return this.playMedia(file);
  }
  async playUrl(url){
    return this.playMedia(url);
  }
  async playMedia(input){
    this.stopOutput();const version=this.version;
    this.context??=new AudioContext();await this.context.resume();if(version!==this.version)return;
    if(typeof input!=='string')this.url=URL.createObjectURL(input);
    const audio=this.element=new Audio(typeof input==='string'?input:this.url);
    const source=this.context.createMediaElementSource(audio);
    this.output=new AudioAnalyser(this.context,source,true);
    this.controller.setDemo(false);this.controller.setState('speaking');
    audio.onended=()=>{if(version===this.version)this.stopOutput();};
    audio.onerror=()=>{if(version===this.version){this.stopOutput();this.onChange('error','This audio format cannot be played. Try an MP3 or WAV file.');}};
    try{await audio.play();if(version!==this.version){audio.pause();return false;}this.onChange('output');return true;}
    catch(error){if(version===this.version){this.stopOutput();throw error;}}
  }
  async connectMicrophone(stream,{ownsStream=false}={}){
    this.stopInput();
    const version=this.inputVersion;
    this.context??=new AudioContext();
    try{await this.context.resume();}catch(error){if(ownsStream)stream.getTracks().forEach(track=>track.stop());throw error;}
    if(version!==this.inputVersion){if(ownsStream)stream.getTracks().forEach(track=>track.stop());return;}
    this.stream=stream;this.ownsStream=ownsStream;this.input=new AudioAnalyser(this.context,this.context.createMediaStreamSource(stream),false);
    this.controller.setDemo(false);this.controller.setState('listening');this.onChange('input');
  }
  async requestMicrophone(){
    if(!navigator.mediaDevices?.getUserMedia)throw new Error('The microphone requires HTTPS or localhost. You can also use an audio file on the local network.');
    const version=++this.inputVersion;
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
    if(version!==this.inputVersion){stream.getTracks().forEach(track=>track.stop());return;}
    await this.connectMicrophone(stream,{ownsStream:true});
  }
  update(){
    const signals={};
    if(this.output){const data=this.output.read();signals.outputVoiceLevel=data.level;signals.frequencyBands=data.bands;}
    if(this.input){const data=this.input.read();signals.inputMicLevel=data.level;signals.inputFrequencyBands=data.bands;}
    this.controller.setSignals(signals);
  }
  stopOutput({preserveState=false}={}){
    this.version++;if(this.element){this.element.onended=this.element.onerror=null;this.element.pause();this.element.src='';this.element=null;}
    this.output?.disconnect();this.output=null;if(this.url){URL.revokeObjectURL(this.url);this.url=null;}
    this.controller.setSignals({outputVoiceLevel:0,frequencyBands:[0,0,0]});
    if(!preserveState&&(this.controller.state==='speaking'||(this.controller.state==='glitch'&&this.controller.returnState==='speaking')))this.controller.setState('idle');this.onChange('stopped');
  }
  stopInput(){
    this.inputVersion++;
    this.input?.disconnect();this.input=null;if(this.ownsStream)this.stream?.getTracks().forEach(track=>track.stop());this.stream=null;this.ownsStream=false;
    this.controller.setSignals({inputMicLevel:0,inputFrequencyBands:[0,0,0]});this.onChange('stopped');
  }
  stop(){this.stopOutput();this.stopInput();}
}
