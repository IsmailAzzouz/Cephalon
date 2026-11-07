import * as THREE from '#three';

const ribbonVertex=`
  varying vec2 vUv; varying vec3 vWorld;
  void main(){vUv=uv;vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}
`;
const ribbonFragment=`
  varying vec2 vUv; varying vec3 vWorld;
  uniform float uTime,uEnergy,uGain,uOcclusion;
  uniform mat4 uCrystalInverse;
  float visibility(){
    vec3 origin=(uCrystalInverse*vec4(cameraPosition,1.)).xyz;
    vec3 point=(uCrystalInverse*vec4(vWorld,1.)).xyz;
    vec3 ray=point-origin;float distanceToPoint=length(ray);ray/=max(distanceToPoint,.0001);
    vec3 inverse=1./(ray+vec3(.00001));
    vec3 a=(-vec3(1.03)-origin)*inverse,b=(vec3(1.03)-origin)*inverse;
    vec3 near=min(a,b),far=max(a,b);
    float enter=max(max(near.x,near.y),near.z),leave=min(min(far.x,far.y),far.z);
    return leave>max(enter,0.)&&enter<distanceToPoint-.06?uOcclusion:1.;
  }
  void main(){
    float crossSection=pow(max(0.,1.-abs(vUv.y)),.7);
    float center=pow(max(0.,1.-abs(vUv.y)),6.);
    float gap=smoothstep(.012,.028,abs(fract(vUv.x-.08)-.5));
    float local=.8+.2*sin(vUv.x*25.13-uTime*.7);
    vec3 cyan=vec3(.35,2.1,3.2);
    vec3 white=vec3(4.8,6.4,7.);
    vec3 light=mix(cyan,white,center)*uGain*(.7+uEnergy*.45)*local;
    gl_FragColor=vec4(light,crossSection*gap*visibility());
    #include <colorspace_fragment>
  }
`;

export function ribbonGeometry(count=256){
  const positions=new Float32Array((count+1)*2*3),uv=new Float32Array((count+1)*2*2),indices=[];
  for(let i=0;i<=count;i++){
    uv[i*4]=uv[i*4+2]=i/count;uv[i*4+1]=-1;uv[i*4+3]=1;
    if(i<count){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));geometry.setIndex(indices);return geometry;
}

export class VoiceRings {
  constructor(){
    this.group=new THREE.Group(); // World-horizontal; never parented to crystalRoot.
    this.sweepAngle=0;this.scanPhase=0;this.lastTime=0;
    this.uniforms={uTime:{value:0},uEnergy:{value:.68},uGain:{value:1},uOcclusion:{value:.35},uCrystalInverse:{value:new THREE.Matrix4()}};
    this.main=new THREE.Group();this.inner=new THREE.Group();this.ticks=new THREE.Group();
    this.group.add(this.main,this.inner,this.ticks);
    this.ribbon=ribbonGeometry();
    this.material=new THREE.ShaderMaterial({vertexShader:ribbonVertex,fragmentShader:ribbonFragment,uniforms:this.uniforms,transparent:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false});
    const ring=new THREE.Mesh(this.ribbon,this.material);ring.frustumCulled=false;ring.renderOrder=5;this.main.add(ring);
    this.trails=[];
    for(let i=0;i<2;i++){
      const geometry=ribbonGeometry(192),material=this.material.clone();
      material.uniforms={...this.uniforms,uGain:{value:i===0?.13:.045}};
      const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;mesh.renderOrder=4;mesh.position.y=-.008*(i+1);
      this.trails.push(mesh);this.main.add(mesh);
    }
    this.innerGeometry=ribbonGeometry(160);
    const innerMaterial=this.material.clone();innerMaterial.uniforms={...this.uniforms,uGain:{value:.72},uOcclusion:{value:.55}};
    const inner=new THREE.Mesh(this.innerGeometry,innerMaterial);inner.frustumCulled=false;inner.renderOrder=5;this.inner.add(inner);
    this.barsGeometry=new THREE.BufferGeometry();this.barsGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(64*2*3),3).setUsage(THREE.DynamicDrawUsage));
    this.barMaterial=new THREE.LineBasicMaterial({color:new THREE.Color().setRGB(.9,2.2,3),transparent:true,opacity:.65,depthWrite:false,blending:THREE.AdditiveBlending});
    const bars=new THREE.LineSegments(this.barsGeometry,this.barMaterial);bars.frustumCulled=false;bars.renderOrder=5;this.inner.add(bars);
    this.tickGeometry=new THREE.BufferGeometry();
    const ticks=[],colors=[];
    for(let i=0;i<96;i++){
      const a=i/96*Math.PI*2,r=1.98,length=i%8===0?.065:.027+(i%3)*.007;
      ticks.push(Math.cos(a)*r,0,Math.sin(a)*r,Math.cos(a)*(r+length),0,Math.sin(a)*(r+length));
      colors.push(.2,.6,.9,.3,.8,1.2);
    }
    this.tickGeometry.setAttribute('position',new THREE.Float32BufferAttribute(ticks,3));this.tickGeometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    this.tickMaterial=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.45,depthWrite:false,blending:THREE.AdditiveBlending});
    const crown=new THREE.LineSegments(this.tickGeometry,this.tickMaterial);crown.renderOrder=4;this.ticks.add(crown);
    this.pulses=[];
    for(let i=0;i<3;i++){
      const geometry=ribbonGeometry(128),material=this.material.clone();material.uniforms={...this.uniforms,uGain:{value:0}};
      const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;mesh.renderOrder=4;this.group.add(mesh);this.pulses.push(mesh);
    }
  }

  fillRibbon(geometry,frame,radius,width,activity,delay=0){
    const p=geometry.attributes.position,count=p.count/2-1,t=frame.time-delay;
    for(let i=0;i<=count;i++){
      const a=i/count*Math.PI*2;
      const organic=Math.sin(a*3+t*.63)*.45+Math.sin(a*7-t*.81+Math.sin(t*.32))*.24+Math.sin(a*13+t*1.17)*.13+Math.sin(a*29-t*2.1)*.06;
      const voice=Math.sin(a*17+t*4.7)*frame.mid*.24+Math.sin(a*37-t*6.3)*frame.high*.11;
      const bump=Math.pow(.5+.5*Math.sin(a*2-t*.43),6.);
      const r=radius+organic*activity+voice*activity;
      const w=width*(.75+bump*.7+frame.transient*.5);
      for(let side=0;side<2;side++){
        const edge=r+(side?1:-1)*w;
        p.setXYZ(i*2+side,Math.cos(a)*edge,organic*activity*.045,Math.sin(a)*edge);
      }
    }
    p.needsUpdate=true;
  }

  update(frame,config,crystalWorld,energy){
    this.uniforms.uTime.value=frame.time;this.uniforms.uEnergy.value=frame.energy+(energy?.charge||0)*.25+(energy?.release||0)*.7;
    if(crystalWorld)this.uniforms.uCrystalInverse.value.copy(crystalWorld).invert();
    this.group.rotation.set(0,config.ringYaw,0);
    const activity=(.012+frame.voice*.13+frame.mic*.045+frame.happy*.035+frame.glitch*.12)*config.waveAmplitude*(1-frame.sad*.5-frame.concerned*.25);
    this.fillRibbon(this.ribbon,frame,1.56+frame.happy*.06+frame.surprise*.16+(energy?.release||0)*.08-(energy?.charge||0)*.035,.012,activity);
    this.trails.forEach((trail,i)=>{trail.visible=frame.voice+frame.glitch>.08;this.fillRibbon(trail.geometry,frame,1.56,.015,activity,.08*(i+1));});
    this.fillRibbon(this.innerGeometry,frame,.53,.007,.012+frame.voice*.11+frame.mic*.04+frame.glitch*.05);
    const bars=this.barsGeometry.attributes.position;
    for(let i=0;i<64;i++){
      const a=i/64*Math.PI*2;
      const noise=.35+.65*Math.abs(Math.sin(a*11-frame.time*3.1)*Math.sin(a*5+frame.time*1.7));
      const height=.012+noise*(frame.voice*.17+frame.mic*.07+frame.high*.08);
      const x=Math.cos(a)*.57,z=Math.sin(a)*.57;
      bars.setXYZ(i*2,x,-height*.5,z);bars.setXYZ(i*2+1,x,height*.5,z);
    }
    bars.needsUpdate=true;
    this.tickMaterial.opacity=.25+frame.energy*.17+(energy?.release||0)*.18;
    const dt=Math.max(0,Math.min(.1,frame.time-this.lastTime));this.lastTime=frame.time;
    this.sweepAngle+=dt*(.008+frame.thinking*.07+(frame.searching||0)*.11);
    this.scanPhase+=dt*(.8+(frame.searching||0)*1.2);
    this.ticks.rotation.y=this.sweepAngle;
    const tickColors=this.tickGeometry.attributes.color;
    for(let i=0;i<96;i++){
      const a=i/96*Math.PI*2,sweep=Math.pow(.5+.5*Math.cos(a-this.scanPhase),16.);
      const brightness=.45+(energy?.release||0)*.75+sweep*(frame.thinking*1.4+frame.listening*.6+(frame.searching||0)*.6)+frame.high*.3;
      for(let j=0;j<2;j++)tickColors.setXYZ(i*2+j,brightness*.25,brightness*.7,brightness);
    }
    tickColors.needsUpdate=true;
    this.pulses.forEach((pulse,i)=>{
      const phase=(frame.time*(.5+frame.happy*.3)+i/3)%1;
      const gain=(frame.listening*(.15+frame.mic)*.18+frame.happy*.12+frame.surprise*.2+(frame.searching||0)*.06)*(1-phase)*(1-phase);
      this.fillRibbon(pulse.geometry,frame,.15+phase*1.85,.006,.003);
      pulse.material.uniforms.uGain.value=gain;pulse.visible=config.voiceRing&&gain>.004;
    });
    this.main.visible=config.voiceRing;this.inner.visible=config.innerWaveform;this.ticks.visible=config.ticks;
  }
}
