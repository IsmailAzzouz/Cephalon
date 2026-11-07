import * as THREE from '#three';
import { makeCrystalGeometry,crystalCorners,crystalEdges } from './CrystalBody.js';

const vertex=`varying vec3 vLocal,vNormal,vWorld;varying vec2 vUv;void main(){vLocal=position;vUv=uv;vNormal=normalize(mat3(modelMatrix)*normal);vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`;
const fragment=`
 varying vec3 vLocal,vNormal,vWorld;varying vec2 vUv;
 uniform float uTime,uCharge,uRelease,uFlow,uAccent,uGain;uniform vec3 uRadii,uStrengths;
 void main(){
   float facing=abs(dot(normalize(cameraPosition-vWorld),normalize(vNormal)));
   float fresnel=pow(1.-clamp(facing,0.,1.),2.);
   float edge=min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y));
   float thin=exp(-abs(sin((vUv.x*.72+vUv.y)*18.+sin(vUv.y*13.)*.7-uTime*.55))*90.);
   float cross=exp(-abs(sin((vUv.x-vUv.y*.6)*11.+uTime*.22))*120.);
   float swell=.5+.5*sin(vLocal.y*2.4+vLocal.x*1.4-uTime*.8);
   float conduit=(thin+cross*.45)*(.08+uCharge*.85+uFlow*.14)*(.4+swell*.6);
   float r=length(vLocal),wave=0.;
   wave+=exp(-pow((r-uRadii.x)/.035,2.))*uStrengths.x;
   wave+=exp(-pow((r-uRadii.y)/.035,2.))*uStrengths.y;
   wave+=exp(-pow((r-uRadii.z)/.035,2.))*uStrengths.z;
   float sweep=exp(-pow((vLocal.y-sin(uTime*.8)*1.5)/.026,2.))*uFlow*.13;
   float rim=exp(-max(edge,0.)*110.)*(uCharge*.18+uRelease*.25);
   float amount=(conduit+wave*.58+sweep+rim)*(.35+facing*.65);
   vec3 cyan=vec3(.17,1.35,2.1),violet=vec3(.8,.35,1.8);
   vec3 color=mix(cyan,violet,uAccent*.5)*(amount+fresnel*uCharge*.045)*uGain;
   color+=vec3(2.8,3.7,4.1)*wave*.2*uGain;
   gl_FragColor=vec4(color,clamp(amount*.8+fresnel*uCharge*.06,0.,.75));
   #include <colorspace_fragment>
 }
`;
export class CrystalResonance {
  constructor(){
    this.group=new THREE.Group();
    this.uniforms={uTime:{value:0},uCharge:{value:0},uRelease:{value:0},uFlow:{value:0},uAccent:{value:0},uGain:{value:1},uRadii:{value:new THREE.Vector3(-1,-1,-1)},uStrengths:{value:new THREE.Vector3()}};
    this.surface=new THREE.Mesh(makeCrystalGeometry(),new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:this.uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
    this.surface.scale.setScalar(1.001);this.surface.renderOrder=3;this.group.add(this.surface);
    const points=[];for(const [a,b]of crystalEdges)points.push(crystalCorners[a],crystalCorners[b]);
    const geometry=new THREE.BufferGeometry().setFromPoints(points);this.echoes=[];
    for(let i=0;i<3;i++){
      const material=new THREE.LineBasicMaterial({color:'#67DEFF',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
      const echo=new THREE.LineSegments(geometry,material);echo.renderOrder=3;this.group.add(echo);this.echoes.push(echo);
    }
  }
  update(energy,frame,config,stage){
    this.group.visible=stage>=4&&config.crystal&&(config.isolate==='all'||config.isolate==='crystal');if(!this.group.visible)return;
    const u=this.uniforms;u.uTime.value=frame.time;u.uCharge.value=energy.charge;u.uRelease.value=energy.release;u.uFlow.value=energy.flow;u.uAccent.value=energy.accent;u.uGain.value=energy.radiance;
    u.uRadii.value.set(-1,-1,-1);u.uStrengths.value.set(0,0,0);
    const events=energy.events.filter(event=>frame.time>=event.at).slice(-3);
    this.echoes.forEach((echo,i)=>{
      const event=events[i],age=event?frame.time-event.at:10,life=age/.85;
      echo.visible=life>=0&&life<1;if(!echo.visible)return;
      const strength=event.strength*energy.radiance;
      echo.scale.setScalar(1.012+life*.18);echo.rotation.set(life*.014,-life*.012,0);
      echo.material.opacity=Math.pow(1-life,2)*strength*.23;
      echo.material.color.setRGB(.25+event.accent*.6,.8,1.5);
      u.uRadii.value.setComponent(i,.3+age*2.65);u.uStrengths.value.setComponent(i,Math.max(0,1-age/1.05)*strength);
    });
  }
}
