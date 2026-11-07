import * as THREE from '#three';

const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const bright=`
  varying vec2 vUv;uniform sampler2D uSource;uniform float uThreshold;
  void main(){vec3 color=texture2D(uSource,vUv).rgb;float l=max(max(color.r,color.g),color.b);float mask=smoothstep(uThreshold,uThreshold+.6,l);gl_FragColor=vec4(color*mask,1.);}
`;
const blur=`
  varying vec2 vUv;uniform sampler2D uSource;uniform vec2 uStep;
  void main(){
    vec3 color=texture2D(uSource,vUv).rgb*.227027;
    color+=(texture2D(uSource,vUv+uStep*1.384615).rgb+texture2D(uSource,vUv-uStep*1.384615).rgb)*.316216;
    color+=(texture2D(uSource,vUv+uStep*3.230769).rgb+texture2D(uSource,vUv-uStep*3.230769).rgb)*.070270;
    gl_FragColor=vec4(color,1.);
  }
`;
const composite=`
  varying vec2 vUv;uniform sampler2D uScene,uBloom0,uBloom1,uBloom2;
  uniform vec2 uPixel,uCore;uniform float uBloom,uAberration,uGlitch,uLens,uEnergy,uShock;
  vec3 tone(vec3 c){return clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.);}
  void main(){
    vec3 base=texture2D(uScene,vUv).rgb;
    float highlight=smoothstep(.7,3.,max(max(base.r,base.g),base.b));
    vec2 direction=normalize(vUv-uCore+vec2(.00001));
    vec2 shift=direction*uPixel*uAberration*(highlight+uGlitch*.6);
    vec3 dispersed=vec3(texture2D(uScene,vUv+shift).r,texture2D(uScene,vUv-shift*.12).g,texture2D(uScene,vUv-shift).b);
    vec3 bloom=texture2D(uBloom0,vUv).rgb*.5+texture2D(uBloom1,vUv).rgb*vec3(.55,.95,1.2)*.35+texture2D(uBloom2,vUv).rgb*vec3(.3,.5,1.5)*.3;
    vec2 p=(vUv-uCore)/uPixel;
    float flare=exp(-abs(p.y)*.6)*exp(-abs(p.x)/(70.+uShock*140.))*.035*uLens*uEnergy;
    float halo=exp(-pow((length(p)-65.-uShock*30.)/8.,2.))*(.0025+uShock*.006)*uLens;
    float star=exp(-abs(p.x+p.y*.45)*.9)*exp(-abs(p.y)/45.)*.018*uShock*uLens;
    vec3 color=dispersed+bloom*uBloom+vec3(.4,.8,1.2)*(flare+star)+vec3(.2,.16,.35)*halo;
    gl_FragColor=vec4(tone(color),1.);
    #include <colorspace_fragment>
  }
`;

export class HologramPostFX {
  constructor(renderer){
    this.renderer=renderer;this.hdr=renderer.extensions.has('EXT_color_buffer_float');
    const type=this.hdr?THREE.HalfFloatType:THREE.UnsignedByteType;
    const target=(depth=false)=>new THREE.WebGLRenderTarget(1,1,{type,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:depth});
    this.sceneTarget=target(true);this.sceneTarget.samples=Math.min(2,renderer.capabilities.maxSamples);
    this.brightTarget=target();this.levels=[0,1,2].map(()=>({horizontal:target(),vertical:target()}));
    this.passScene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),null);this.quad.frustumCulled=false;this.passScene.add(this.quad);
    this.brightMaterial=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:bright,uniforms:{uSource:{value:null},uThreshold:{value:1.1}},depthTest:false,depthWrite:false});
    this.blurMaterial=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:blur,uniforms:{uSource:{value:null},uStep:{value:new THREE.Vector2()}},depthTest:false,depthWrite:false});
    this.compositeMaterial=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:composite,uniforms:{
      uScene:{value:this.sceneTarget.texture},uBloom0:{value:this.levels[0].vertical.texture},uBloom1:{value:this.levels[1].vertical.texture},uBloom2:{value:this.levels[2].vertical.texture},
      uPixel:{value:new THREE.Vector2()},uCore:{value:new THREE.Vector2(.5,.5)},uBloom:{value:.85},uAberration:{value:0},uGlitch:{value:0},uLens:{value:0},uEnergy:{value:1},uShock:{value:0},
    },depthTest:false,depthWrite:false});
  }
  resize(width,height){
    this.sceneTarget.setSize(width,height);this.brightTarget.setSize(Math.max(1,Math.round(width/2)),Math.max(1,Math.round(height/2)));
    this.levels.forEach((level,i)=>{const w=Math.max(1,Math.round(width/Math.pow(2,i+1))),h=Math.max(1,Math.round(height/Math.pow(2,i+1)));level.horizontal.setSize(w,h);level.vertical.setSize(w,h);});
    this.compositeMaterial.uniforms.uPixel.value.set(1/width,1/height);
  }
  pass(material,target){this.quad.material=material;this.renderer.setRenderTarget(target);this.renderer.render(this.passScene,this.camera);}
  render(scene,camera,frame,config,stage,coreScreen,energy){
    if(!config.postFX||stage<4){this.renderer.setRenderTarget(null);this.renderer.render(scene,camera);return;}
    this.renderer.setRenderTarget(this.sceneTarget);this.renderer.render(scene,camera);
    this.brightMaterial.uniforms.uSource.value=this.sceneTarget.texture;this.pass(this.brightMaterial,this.brightTarget);
    let source=this.brightTarget;
    this.levels.forEach(level=>{
      this.blurMaterial.uniforms.uSource.value=source.texture;
      this.blurMaterial.uniforms.uStep.value.set(config.bloomRadius/source.width,0);this.pass(this.blurMaterial,level.horizontal);
      this.blurMaterial.uniforms.uSource.value=level.horizontal.texture;
      this.blurMaterial.uniforms.uStep.value.set(0,config.bloomRadius/level.horizontal.height);this.pass(this.blurMaterial,level.vertical);
      source=level.vertical;
    });
    const u=this.compositeMaterial.uniforms;
    u.uBloom.value=config.bloomIntensity*(1+(energy?.release||0)*.4);u.uAberration.value=stage>=5?config.aberration*(1+(energy?.release||0)*.65):0;
    u.uGlitch.value=stage>=5?frame.glitch:0;u.uLens.value=stage>=5&&config.lensEffects&&config.core&&(config.isolate==='all'||config.isolate==='core')?1:0;
    u.uShock.value=energy?.release||0;
    u.uEnergy.value=frame.energy*config.coreIntensity*(1+(energy?.release||0)*3.5+(energy?.charge||0)*.8);u.uCore.value.copy(coreScreen);
    this.pass(this.compositeMaterial,null);
  }
}
