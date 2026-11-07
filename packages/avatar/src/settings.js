export const defaults={
  crystalOpacity:.22,fresnelStrength:1.4,edgeWidth:1,edgeEmission:4.5,
  bloomIntensity:.85,bloomRadius:1,aberration:1.7,coreSize:1,coreIntensity:1,
  ringYaw:0,waveAmplitude:1,fragmentsIntensity:0,postFX:true,lensEffects:true,
  crystal:true,fractures:false,core:true,voiceRing:true,innerWaveform:true,ticks:true,filaments:false,particles:true,
  isolate:'all',
};

export const neutralFrame=()=>({
  time:0,motionTime:0,energy:.68,voice:0,mic:0,bass:0,mid:0,high:0,transient:0,
  speaking:0,listening:0,thinking:0,happy:0,curious:0,concerned:0,sad:0,angry:0,
  surprise:0,glitch:0,fracture:0,pulse:0,emotionIntensity:0,searching:0,analysing:0,
});

export function layerVisible(config,name){return config[name]&&(config.isolate==='all'||config.isolate===name);}
