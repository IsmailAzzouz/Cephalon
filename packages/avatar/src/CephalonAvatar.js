import * as THREE from '#three';
import { CrystalBody } from './CrystalBody.js';
import { VoiceRings } from './VoiceRings.js';
import { CrystalFractures } from './CrystalFractures.js';
import { InnerFilaments } from './InnerFilaments.js';
import { EnergyCore } from './EnergyCore.js';
import { HologramPostFX } from './HologramPostFX.js';
import { OpticalParticles } from './OpticalParticles.js';
import { AvatarAnimationController } from './AvatarAnimationController.js';
import { OrbitInteraction } from './OrbitInteraction.js';
import { AvatarAudio } from './AvatarAudio.js';
import { AvatarRig } from './AvatarRig.js';
import { PresenceDirector } from './PresenceDirector.js';
import { AttentionField } from './AttentionField.js';
import { ContactLinks } from './ContactLinks.js';
import { EnergyDynamics,neutralEnergy } from './EnergyDynamics.js';
import { CrystalResonance } from './CrystalResonance.js';
import { EnergyWake } from './EnergyWake.js';
import { defaults,neutralFrame,layerVisible } from './settings.js';

export class CephalonAvatar {
  constructor(canvas,{stage=7,onError=console.error}={}){
    this.canvas=canvas;this.stage=stage;this.config={...defaults};this.frame=neutralFrame();
    this.controller=new AvatarAnimationController({demo:true,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches});this.orbit=new OrbitInteraction();
    this.audio=new AvatarAudio(this.controller);this.staticFrame=this.frame;
    this.energyDynamics=new EnergyDynamics();this.energy=neutralEnergy();this.presence=new PresenceDirector();this.restPose={yaw:0,pitch:0,roll:0,x:0,y:0,z:0,focusX:0,focusY:0,field:0,fieldSide:-1,readProgress:0,toolPulse:0,comparison:0,writing:0,contact:0,contactPulse:0,contactCount:0};
    this.onTick=null;this.presentation={x:0,y:0};this.presentationTarget={x:0,y:0};
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
    this.renderer.setClearColor('#010712');this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(34,1,.1,60);
    this.rig=new AvatarRig();this.positionRoot=this.rig.positionRoot;this.crystalRoot=this.rig.crystalRoot;this.scene.add(this.positionRoot);
    this.body=new CrystalBody();this.crystalRoot.add(this.body.group);
    this.rings=new VoiceRings();this.rig.attachHorizontal(this.rings.group);
    this.fractures=new CrystalFractures();this.crystalRoot.add(this.fractures.group);
    this.filaments=new InnerFilaments();this.crystalRoot.add(this.filaments.group);
    this.core=new EnergyCore();this.crystalRoot.add(this.core.group);
    this.post=new HologramPostFX(this.renderer);this.coreScreen=new THREE.Vector2();this.projectedCore=new THREE.Vector3();
    this.particles=new OpticalParticles();this.positionRoot.add(this.particles.group);
    this.attentionField=new AttentionField();this.positionRoot.add(this.attentionField.group);
    this.contacts=new ContactLinks();this.positionRoot.add(this.contacts.group);
    this.resonance=new CrystalResonance();this.crystalRoot.add(this.resonance.group);
    this.wake=new EnergyWake();this.positionRoot.add(this.wake.group);
    this.bindInput();
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas.parentElement);this.resize();
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.renderer.setAnimationLoop(null);onError('The projection was interrupted. Reload the page.');});
    this.lastTime=performance.now();
    this.renderer.setAnimationLoop(now=>this.render(now));
  }
  resize(){
    const {width,height}=this.canvas.getBoundingClientRect();if(!width||!height)return;
    this.renderer.setSize(width,height,false);this.camera.aspect=width/height;this.camera.updateProjectionMatrix();
    this.distance=Math.max(8.4,7.2/this.camera.aspect);
    if(width>=900&&height>=550)this.distance=Math.max(this.distance,9.8);
    if(height<500)this.distance=Math.max(this.distance,11);
    const size=this.renderer.getDrawingBufferSize(new THREE.Vector2());this.post.resize(size.x,size.y);
  }
  bindInput(){
    const pointers=new Map();let moved=false,pinch=0;
    const distance=()=>{const[a,b]=[...pointers.values()];return a&&b?Math.hypot(a.x-b.x,a.y-b.y):0;};
    this.canvas.addEventListener('pointerdown',event=>{
      if(event.pointerType==='mouse'&&event.button!==0)return;
      this.canvas.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,start:event.timeStamp,time:event.timeStamp});
      if(pointers.size===1){moved=false;this.orbit.begin();}else moved=true;
      pinch=distance();
    });
    this.canvas.addEventListener('pointermove',event=>{
      const p=pointers.get(event.pointerId);if(!p)return;
      if(Math.hypot(event.clientX-p.startX,event.clientY-p.startY)>7)moved=true;
      if(pointers.size===1)this.orbit.drag(event.clientX-p.x,event.clientY-p.y,(event.timeStamp-p.time)/1000);
      p.x=event.clientX;p.y=event.clientY;p.time=event.timeStamp;
      if(pointers.size===2){const next=distance();if(pinch>0)this.orbit.zoomBy(pinch/Math.max(1,next));pinch=next;}
    });
    const release=(event,cancelled)=>{
      const p=pointers.get(event.pointerId);if(!p)return;pointers.delete(event.pointerId);
      if(!pointers.size){this.orbit.end(cancelled);if(!cancelled&&!moved&&event.timeStamp-p.start<600){this.onStateInteraction?.();this.controller.setState('listening');}}
      pinch=distance();
    };
    this.canvas.addEventListener('pointerup',event=>release(event,false));
    for(const name of ['pointercancel','lostpointercapture'])this.canvas.addEventListener(name,event=>release(event,true));
    this.canvas.addEventListener('wheel',event=>{event.preventDefault();this.orbit.zoomBy(Math.exp(event.deltaY*.00065));},{passive:false});
    this.canvas.addEventListener('dblclick',()=>this.orbit.reset());
    this.canvas.addEventListener('keydown',event=>{
      const keys={ArrowLeft:[-25,0],ArrowRight:[25,0],ArrowUp:[0,-25],ArrowDown:[0,25]};
      if(keys[event.key]){event.preventDefault();this.orbit.drag(...keys[event.key],.1);this.orbit.end(true);}
      if(event.key==='Home'){event.preventDefault();this.orbit.reset();}
    });
    document.addEventListener('visibilitychange',()=>{this.lastTime=performance.now();if(document.hidden){pointers.clear();this.orbit.end(true);}});
  }
  render(now){
    if(document.hidden){this.lastTime=now;return;}
    const elapsed=Math.max(0,(now-this.lastTime)/1000),dt=Math.min(.1,elapsed);this.lastTime=now;
    this.onTick?.(Math.min(elapsed,.25));
    if(this.stage>=6){this.audio.update();this.frame=this.controller.update(dt);}else this.frame=this.staticFrame;
    this.orbit.update(dt,this.controller.paused);
    const f=this.frame,t=f.motionTime??f.time;
    const pose=this.stage>=6?this.presence.update(dt,this.controller,f,this.orbit):this.restPose;
    this.energy=this.stage>=6?this.energyDynamics.update(dt,this.controller,f,pose):neutralEnergy();
    const energy=this.energy;
    const settle=this.controller.reducedMotion?1:1-Math.exp(-dt*4);
    this.presentation.x+=(this.presentationTarget.x-this.presentation.x)*settle;this.presentation.y+=(this.presentationTarget.y-this.presentation.y)*settle;
    this.positionRoot.position.set(this.presentation.x+pose.x,this.presentation.y+pose.y,pose.z);
    this.crystalRoot.rotation.set(.04+this.orbit.x+pose.pitch,.18+this.orbit.y+pose.yaw,Math.PI/4+pose.roll+energy.twist+f.glitch*Math.sin(t*100)*.035);
    this.crystalRoot.scale.set(energy.scaleX,energy.scaleY,energy.scaleZ);
    this.camera.position.set(0,this.distance*.31*this.orbit.zoom,this.distance*this.orbit.zoom);this.camera.lookAt(0,0,0);this.camera.updateMatrixWorld();
    this.body.update(this.frame,this.config,this.stage,this.camera,pose,energy);
    this.fractures.update(this.frame,this.config,this.stage,energy);this.fractures.group.visible&&=this.stage>=3;
    this.filaments.update(this.frame,this.config,energy);this.filaments.group.visible&&=this.stage>=3;
    this.resonance.update(energy,f,this.config,this.stage);
    this.crystalRoot.updateWorldMatrix(true,true);
    this.wake.update(energy,f,this.config,this.crystalRoot.quaternion);this.wake.group.visible&&=this.stage>=5;
    this.rings.group.visible=this.stage>=2;this.rings.update(this.frame,this.config,this.crystalRoot.matrixWorld,energy);
    this.body.group.visible=layerVisible(this.config,'crystal');
    this.fractures.group.visible&&=layerVisible(this.config,'fractures');this.filaments.group.visible&&=layerVisible(this.config,'filaments');
    this.rings.main.visible&&=layerVisible(this.config,'voiceRing');this.rings.inner.visible&&=layerVisible(this.config,'innerWaveform');this.rings.ticks.visible&&=layerVisible(this.config,'ticks');
    this.rings.pulses.forEach(pulse=>{pulse.visible&&=layerVisible(this.config,'voiceRing');});
    this.particles.group.visible=this.stage>=5&&layerVisible(this.config,'particles');this.particles.update(this.frame,this.renderer.getPixelRatio());
    this.attentionField.update(pose,f,this.controller,this.config,dt);
    this.contacts.update(pose,f,this.config,this.camera,energy);
    this.core.update(this.frame,this.config,this.camera,pose,energy);this.core.group.visible&&=this.stage>=4;
    this.core.group.visible&&=layerVisible(this.config,'core');
    this.core.group.getWorldPosition(this.projectedCore);this.projectedCore.project(this.camera);this.coreScreen.set(this.projectedCore.x*.5+.5,this.projectedCore.y*.5+.5);
    this.post.render(this.scene,this.camera,this.frame,this.config,this.stage,this.coreScreen,energy);
  }
}
