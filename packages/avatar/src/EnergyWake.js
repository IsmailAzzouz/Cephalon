import * as THREE from '#three';
import { ribbonGeometry } from './VoiceRings.js';

/** Expanding world-horizontal wavefronts and a bounded burst of ion trails. */
export class EnergyWake {
  constructor(){
    this.group=new THREE.Group();this.rings=[];
    for(let i=0;i<4;i++){
      const geometry=ribbonGeometry(160),material=new THREE.ShaderMaterial({
        uniforms:{uGain:{value:0},uAccent:{value:0}},
        vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader:`varying vec2 vUv;uniform float uGain,uAccent;void main(){float edge=pow(max(0.,1.-abs(vUv.y)),1.8);float stream=.6+.4*sin(vUv.x*31.4);vec3 light=mix(vec3(.1,1.1,2.3),vec3(.8,.4,1.8),uAccent*.5)+vec3(2.,2.7,3.)*pow(edge,5.);gl_FragColor=vec4(light*uGain,edge*stream);\n#include <colorspace_fragment>}`,
        transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
      });
      const mesh=new THREE.Mesh(geometry,material);mesh.renderOrder=4;mesh.frustumCulled=false;this.group.add(mesh);this.rings.push(mesh);
    }
    const geometry=new THREE.BufferGeometry(),positions=new Float32Array(72*2*3),colors=new Float32Array(72*2*3);
    geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3).setUsage(THREE.DynamicDrawUsage));
    this.sparks=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.65,depthWrite:false,blending:THREE.AdditiveBlending}));this.sparks.frustumCulled=false;this.group.add(this.sparks);
    this.direction=new THREE.Vector3();
  }
  update(energy,frame,config,crystalQuaternion){
    this.group.visible=config.voiceRing&&config.postFX&&(config.isolate==='all'||config.isolate==='voiceRing');
    if(!this.group.visible)return;
    const events=energy.events.filter(event=>frame.time>=event.at).slice(-2);
    this.rings.forEach((ring,i)=>{
      const event=events[Math.floor(i/2)],age=event?frame.time-event.at-(i%2)*.12:10,life=age/1.45;
      ring.visible=life>=0&&life<1;if(!ring.visible)return;
      const radius=.82+(1-Math.pow(1-life,3))*1.72,width=.023*(1-life)+.003;
      const p=ring.geometry.attributes.position,count=p.count/2-1;
      for(let j=0;j<=count;j++){
        const a=j/count*Math.PI*2,organic=Math.sin(a*5-age*3)*.016*(1-life);
        for(let side=0;side<2;side++){const r=radius+organic+(side?width:-width);p.setXYZ(j*2+side,Math.cos(a)*r,-.06+(i%2)*.06,Math.sin(a)*r);}
      }
      p.needsUpdate=true;
      ring.material.uniforms.uGain.value=Math.pow(1-life,2)*event.strength*energy.radiance*(i%2?.24:.7);
      ring.material.uniforms.uAccent.value=event.accent;
    });
    const p=this.sparks.geometry.attributes.position,c=this.sparks.geometry.attributes.color;
    for(let i=0;i<72;i++){
      const event=events[i%2],age=event?frame.time-event.at:10,life=age/(.7+(i%7)*.08),active=life>=0&&life<1;
      const a=i*2.399963,z=((i*31)%71)/71*1.65-.825,r=Math.sqrt(1-z*z);
      this.direction.set(Math.cos(a)*r,z,Math.sin(a)*r);
      const surface=1.04/Math.max(Math.abs(this.direction.x),Math.abs(this.direction.y),Math.abs(this.direction.z));this.direction.applyQuaternion(crystalQuaternion);
      const radius=surface+age*(1.1+(i%9)*.08),length=.035+(1-life)*.12;
      for(let end=0;end<2;end++){
        p.setXYZ(i*2+end,this.direction.x*(radius+end*length),this.direction.y*(radius+end*length),this.direction.z*(radius+end*length));
        const light=active?Math.pow(1-life,2)*event.strength*energy.radiance*(end?.8:.12):0;
        c.setXYZ(i*2+end,light*.4,light*1.7,light*2.8);
      }
    }
    p.needsUpdate=true;c.needsUpdate=true;this.sparks.visible=config.particles;
  }
}
