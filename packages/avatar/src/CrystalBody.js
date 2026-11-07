import * as THREE from '#three';

const glassVertex=`
  attribute float faceId;
  varying vec2 vUv;varying vec3 vWorld,vNormal,vLocal;varying float vFace;
  uniform float uTime,uFracture;
  void main(){
    vUv=uv;vFace=faceId;vLocal=position;
    vec3 p=position+normal*uFracture*.032*sin(faceId*7.3+floor(uTime*17.));
    vec4 world=modelMatrix*vec4(p,1.);vWorld=world.xyz;vNormal=normalize(mat3(modelMatrix)*normal);
    gl_Position=projectionMatrix*viewMatrix*world;
  }
`;
const glassFragment=`
  varying vec2 vUv;varying vec3 vWorld,vNormal,vLocal;varying float vFace;
  uniform float uTime,uOpacity,uFresnel,uEnergy,uVoice,uSad,uGlitch;
  uniform vec2 uAttention;
  void main(){
    vec3 view=normalize(cameraPosition-vWorld);
    float facing=clamp(abs(dot(view,normalize(vNormal))),0.,1.);
    float fresnel=pow(1.-facing,2.5);
    float edge=max(0.,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));
    float thickness=exp(-edge*72.);
    vec2 refracted=vUv+view.xy*.045*(1.-facing)+uAttention*.028;
    float diagonal=pow(max(0.,1.-abs(sin(refracted.x*5.3+refracted.y*3.8-uTime*.08+vFace*.67))),28.);
    float second=pow(max(0.,1.-abs(sin(refracted.x*3.1-refracted.y*6.2+uTime*.045))),52.);
    vec2 cell=fract(refracted*22.);
    float lattice=min(min(abs(cell.x-cell.y),abs(cell.x+cell.y-1.)),min(min(cell.x,1.-cell.x),min(cell.y,1.-cell.y)));
    float etching=(1.-smoothstep(.015,.04,lattice))*.021;
    etching*=smoothstep(.1,.9,sin(refracted.x*6.+refracted.y*4.+vFace)*.5+.5);
    float veil=.5+.5*sin(vLocal.x*3.2+vLocal.y*2.4+view.x*2.+uTime*.06);
    float faceLight=.4+.6*pow(facing,.7);
    vec3 blue=vec3(.012,.09,.17)*faceLight;
    blue=mix(blue,vec3(.055,.025,.15),(.1+uSad*.45)*(1.-facing));
    vec3 optical=vec3(.13,.4,.65)*(diagonal*.24+second*.12+etching+fresnel*.22*uFresnel);
    optical+=vec3(.45,.85,1.1)*thickness*.13*uFresnel;
    float front=gl_FrontFacing?1.:.38;
    vec3 color=(blue*(.4+veil*.6)+optical)*(.7+uEnergy*.5)*front;
    float alpha=uOpacity*(.38+fresnel*.8+diagonal*.45+thickness*.5)*front;
    alpha*=1.-uGlitch*.35*step(.6,sin(vWorld.y*56.+floor(uTime*13.)));
    // Transmissive glass stays below the emissive extraction threshold.
    gl_FragColor=vec4(clamp(color,vec3(0.),vec3(.9)),clamp(alpha,.015,.6));
    #include <colorspace_fragment>
  }
`;

// One closed hexahedron. Every face reuses the same eight spatial corners.
export const crystalCorners=[
  [-1.035,-1.02,-.98],[1.015,-1.035,-1.015],[1.035,1.025,-.99],[-1.005,1.045,-1.02],
  [-1.025,-1.035,1.02],[1.04,-1.015,.995],[1.015,1.035,1.025],[-1.045,1.015,1.005],
].map(p=>new THREE.Vector3(...p));
export const crystalFaces=[[4,5,6,7],[1,0,3,2],[5,1,2,6],[0,4,7,3],[7,6,2,3],[0,1,5,4]];
export const crystalEdges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];

export function makeCrystalGeometry(){
  const positions=[],uvs=[],faceIds=[];
  crystalFaces.forEach((face,id)=>{
    const uv=[[0,0],[1,0],[1,1],[0,1]];
    for(const index of [0,1,2,0,2,3]){
      positions.push(...crystalCorners[face[index]].toArray());uvs.push(...uv[index]);faceIds.push(id);
    }
  });
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geometry.setAttribute('faceId',new THREE.Float32BufferAttribute(faceIds,1));
  geometry.computeVertexNormals();return geometry;
}

export function pointOnFace(faceId,u,v){
  const face=crystalFaces[faceId];
  const lower=crystalCorners[face[0]].clone().lerp(crystalCorners[face[1]],u);
  const upper=crystalCorners[face[3]].clone().lerp(crystalCorners[face[2]],u);
  return lower.lerp(upper,v);
}

export class CrystalBody {
  constructor(){
    this.group=new THREE.Group();
    this.geometry=makeCrystalGeometry();
    this.silhouetteMaterial=new THREE.MeshBasicMaterial({color:'#123a54',transparent:true,opacity:.4,side:THREE.DoubleSide,depthWrite:false});
    this.mesh=new THREE.Mesh(this.geometry,this.silhouetteMaterial);this.group.add(this.mesh);
    this.mesh.renderOrder=1;
    this.uniforms={uTime:{value:0},uFracture:{value:0},uOpacity:{value:.22},uFresnel:{value:1.4},uEnergy:{value:.68},uVoice:{value:0},uSad:{value:0},uGlitch:{value:0},uAttention:{value:new THREE.Vector2()}};
    this.glassMaterial=new THREE.ShaderMaterial({vertexShader:glassVertex,fragmentShader:glassFragment,uniforms:this.uniforms,transparent:true,side:THREE.DoubleSide,depthWrite:false});
    this.edgeMaterial=new THREE.MeshBasicMaterial({color:'#a6e9ff',transparent:true,opacity:.9,depthWrite:false});
    this.edges=new THREE.Group();
    for(const [a,b]of crystalEdges){
      const start=crystalCorners[a],end=crystalCorners[b];
      const points=[];
      for(let i=0;i<=8;i++){
        const p=start.clone().lerp(end,i/8);
        if(i>0&&i<8)p.addScalar(Math.sin(i*4.7+a)*.0025);
        points.push(p);
      }
      const tube=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,.009,5,false);
      const edge=new THREE.Mesh(tube,this.edgeMaterial.clone());
      edge.userData.path=tube.parameters.path;
      edge.userData.mid=start.clone().lerp(end,.5);
      edge.userData.faces=crystalFaces.map((face,id)=>face.includes(a)&&face.includes(b)?id:-1).filter(id=>id>=0);
      edge.renderOrder=6;this.edges.add(edge);
    }
    this.group.add(this.edges);
    this.localCamera=new THREE.Vector3();this.direction=new THREE.Vector3();
    this.faceNormals=crystalFaces.map((face)=>new THREE.Vector3().subVectors(crystalCorners[face[1]],crystalCorners[face[0]]).cross(new THREE.Vector3().subVectors(crystalCorners[face[2]],crystalCorners[face[0]])).normalize());
    this.lastWidth=1;
  }
  update(frame,config,stage=7,camera,pose,energy){
    this.mesh.material=stage>=3?this.glassMaterial:this.silhouetteMaterial;
    this.mesh.visible=config.crystal;this.edges.visible=config.crystal;
    this.uniforms.uTime.value=frame.time;this.uniforms.uOpacity.value=config.crystalOpacity;
    this.uniforms.uFresnel.value=config.fresnelStrength;this.uniforms.uEnergy.value=frame.energy;
    this.uniforms.uVoice.value=frame.voice;this.uniforms.uSad.value=frame.sad+frame.concerned*.4;
    this.uniforms.uGlitch.value=frame.glitch;this.uniforms.uFracture.value=stage>=7?frame.fracture*config.fragmentsIntensity:0;
    this.uniforms.uAttention.value.set(pose?.focusX||0,pose?.focusY||0);
    if(camera){this.group.updateWorldMatrix(true,false);this.localCamera.copy(camera.position);this.group.worldToLocal(this.localCamera);}
    for(const edge of this.edges.children){
      if(config.edgeWidth!==this.lastWidth){edge.geometry.dispose();edge.geometry=new THREE.TubeGeometry(edge.userData.path,24,.009*config.edgeWidth,5,false);}
      this.direction.copy(this.localCamera).sub(edge.userData.mid).normalize();
      const fronts=edge.userData.faces.filter(face=>this.faceNormals[face].dot(this.direction)>0).length;
      const strength=fronts===0?.12:fronts===2?.68:1;
      const resonance=energy?(1+energy.charge*.24+energy.release*.52)*energy.radiance:1;
      const emission=resonance*(stage>=4?config.edgeEmission:1)*strength*(.85+frame.voice*.16+frame.glitch*.2);
      const violet=(energy?.accent||0)*(energy?.charge||0)*.16;
      edge.material.color.setRGB(emission*((fronts===0?.25:.7)+violet),emission,emission*1.18);
      edge.material.opacity=fronts===0?.28:.92;
    }
    this.lastWidth=config.edgeWidth;
  }
}
