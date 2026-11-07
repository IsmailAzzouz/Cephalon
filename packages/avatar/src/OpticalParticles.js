import * as THREE from '#three';

export class OpticalParticles {
  constructor(){
    const positions=[],seeds=[];
    for(let i=0;i<84;i++){
      const angle=i*2.399963,radius=.35+(i%17)/17*1.65,y=((i*37)%83)/83*2.8-1.4;
      positions.push(Math.cos(angle)*radius,y,Math.sin(angle)*radius);seeds.push(i*.71);
    }
    this.geometry=new THREE.BufferGeometry();this.geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));this.geometry.setAttribute('seed',new THREE.Float32BufferAttribute(seeds,1));
    this.material=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uEnergy:{value:.68},uScale:{value:1}},
      vertexShader:`attribute float seed;varying float vLight;uniform float uTime,uScale;void main(){vec3 p=position+vec3(sin(uTime*.12+seed),cos(uTime*.17+seed),sin(uTime*.1+seed))*.025;vec4 view=modelViewMatrix*vec4(p,1.);vLight=.2+.8*pow(.5+.5*sin(seed+uTime*.4),4.);gl_Position=projectionMatrix*view;gl_PointSize=(1.1+mod(seed,1.)*1.8)*uScale;}`,
      fragmentShader:`varying float vLight;uniform float uEnergy;void main(){float r=length(gl_PointCoord-.5);float glow=exp(-r*r*24.);gl_FragColor=vec4(vec3(.4,1.1,1.7)*vLight*(.7+uEnergy*.3),glow*.65);#include <colorspace_fragment>}`.replace(';#include',';\n#include'),
      transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    });
    this.group=new THREE.Group();this.group.add(new THREE.Points(this.geometry,this.material));
  }
  update(frame,scale){this.material.uniforms.uTime.value=frame.time;this.material.uniforms.uEnergy.value=frame.energy;this.material.uniforms.uScale.value=scale;}
}
