import * as THREE from '#three';

const vertex=`varying vec3 vLocal;void main(){vLocal=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment=`
  varying vec3 vLocal;uniform vec3 uCamera;uniform float uTime,uIntensity,uVoice,uGlitch,uCharge,uRelease,uAccent,uFlow;
  void main(){
    vec3 direction=normalize(vLocal-uCamera),color=vec3(0.);float transmittance=1.;
    for(int i=0;i<28;i++){
      vec3 p=vLocal+direction*(float(i)*.031);
      p.xz+=vec2(sin(p.y*21.+uTime*2.),cos(p.y*17.-uTime*1.8))*.018*uCharge;
      float r=length(p);float core=exp(-r*r*125.);
      float turbulence=sin(p.x*29.+uTime*1.7+sin(p.y*21.-uTime))*.5+.5;
      turbulence*=sin(p.z*25.-uTime*1.3+p.y*13.)*.5+.5;
      float mist=max(0.,.43-r)*pow(max(0.,turbulence),2.)*1.3;
      float density=core*2.+mist*.2;
      vec3 light=vec3(8.,11.,12.)*core+mix(vec3(.06,1.2,2.8),vec3(.9,.35,2.6),uAccent*.55)*mist*(1.+uFlow*.5)+vec3(.3,.12,.8)*mist*.3;
      color+=transmittance*light*.16;transmittance*=exp(-density*.1);
    }
    color*=uIntensity*(1.+uVoice*.45+uGlitch*.3);
    gl_FragColor=vec4(color,1.);
    #include <colorspace_fragment>
  }
`;

export class EnergyCore {
  constructor(){
    this.group=new THREE.Group();
    this.uniforms={uCamera:{value:new THREE.Vector3()},uTime:{value:0},uIntensity:{value:1},uVoice:{value:0},uGlitch:{value:0},uCharge:{value:0},uRelease:{value:0},uAccent:{value:0},uFlow:{value:0}};
    this.material=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:this.uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
    this.volume=new THREE.Mesh(new THREE.SphereGeometry(.43,32,20),this.material);this.volume.renderOrder=2;this.group.add(this.volume);
    this.filaments=[];
    for(let i=0;i<5;i++){
      const points=[];
      for(let j=0;j<=32;j++){
        const a=j/32*Math.PI*2;
        points.push(new THREE.Vector3(Math.cos(a)*(.22+i*.012),Math.sin(a*2+i)*.075,Math.sin(a)*(.22+i*.012)));
      }
      const material=new THREE.LineBasicMaterial({color:new THREE.Color().setRGB(.15,1.4,2.1),transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false});
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),material);line.rotation.set(i*.4,i*.7,i*.3);line.renderOrder=2;
      this.filaments.push(line);this.group.add(line);
    }
  }
  update(frame,config,camera,pose,energy){
    this.group.visible=config.core;
    this.group.position.set((pose?.focusX||0)*.045,(pose?.focusY||0)*.035,0);
    this.group.scale.setScalar((1+(energy?.release||0)*.16-(energy?.charge||0)*.12)*config.coreSize*(1+frame.thinking*Math.sin(frame.time*1.5)*.035-frame.surprise*.02));
    this.volume.updateWorldMatrix(true,false);
    this.uniforms.uCamera.value.copy(camera.position);this.volume.worldToLocal(this.uniforms.uCamera.value);
    this.uniforms.uTime.value=frame.motionTime??frame.time;
    this.uniforms.uCharge.value=energy?.charge||0;this.uniforms.uRelease.value=energy?.release||0;this.uniforms.uAccent.value=energy?.accent||0;this.uniforms.uFlow.value=energy?.flow||0;
    this.uniforms.uIntensity.value=(1+(energy?.charge||0)*.42+(energy?.release||0)*.75)*(energy?.radiance??1)*config.coreIntensity*(.85+frame.energy*.35+Math.sin(frame.time*1.2)*.035+frame.surprise*.45);
    this.uniforms.uVoice.value=frame.voice;this.uniforms.uGlitch.value=frame.glitch;
    this.filaments.forEach((line,i)=>{line.visible=config.filaments;line.rotation.y=frame.time*(.08+i*.025)+i;line.material.opacity=.17+frame.voice*.2+frame.glitch*.3+(energy?.charge||0)*.28+(energy?.release||0)*.3;line.scale.setScalar(1+(energy?.corona||0)*.55);});
  }
}
