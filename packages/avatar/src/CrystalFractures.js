import * as THREE from '#three';
import { pointOnFace } from './CrystalBody.js';

export class CrystalFractures {
  constructor(){
    this.group=new THREE.Group();
    this.material=new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB(.7,1.25,1.6),transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false});
    const paths=[[[.06,.66],[.22,.58],[.35,.61],[.47,.48],[.53,.32],[.71,.21],[.84,.04]],[[.47,.48],[.69,.53],[.8,.44],[.96,.47]],[[.22,.58],[.16,.79],[.25,.95]]];
    for(let face=0;face<6;face++){
      for(let branch=0;branch<(face%2?2:3);branch++){
        const points=paths[branch].map(([u,v])=>{
          if(face%2)[u,v]=[v,1-u];
          if(face>2)u=1-u;
          return pointOnFace(face,u,v).multiplyScalar(1.002);
        });
        const path=new THREE.CurvePath();for(let i=1;i<points.length;i++)path.add(new THREE.LineCurve3(points[i-1],points[i]));
        const geometry=new THREE.TubeGeometry(path,points.length*5,.0018,4,false);
        const crack=new THREE.Mesh(geometry,this.material);crack.renderOrder=3;this.group.add(crack);
      }
    }
    this.shards=new THREE.Group();this.group.add(this.shards);
    for(const [index,face]of [0,2,4].entries()){
      const points=[[.46,.48],[.53,.34],[.65,.49]].map(([u,v])=>pointOnFace(face,u,v));
      const home=points[0].clone().add(points[1]).add(points[2]).multiplyScalar(1/3);
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points.flatMap(point=>point.clone().sub(home).multiplyScalar(.32).toArray()),3));geometry.computeVertexNormals();
      const material=new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB(.08,.6,1.1),transparent:true,opacity:.24,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
      const shard=new THREE.Mesh(geometry,material);shard.userData={home,normal:new THREE.Vector3().fromBufferAttribute(geometry.attributes.normal,0),index};
      this.shards.add(shard);
    }
  }
  update(frame,config,stage=7,energy){
    this.group.visible=config.fractures;
    this.material.opacity=Math.min(.9,.32+frame.energy*.22+frame.glitch*.3+(energy?.charge||0)*.2);
    const surge=(energy?.charge||0)*.25+(energy?.release||0)*.5;
    this.material.color.setRGB(.45+frame.glitch*.8+surge*.4,.95+frame.voice*.3+surge,1.4+frame.voice*.4+surge);
    const fracture=stage>=7?frame.fracture*config.fragmentsIntensity:0;
    this.shards.visible=fracture>.005;
    this.shards.children.forEach(shard=>{
      const {home,normal,index}=shard.userData;
      shard.position.copy(home).addScaledVector(normal,fracture*.13);
      shard.rotation.set(fracture*.24*Math.sin(index+frame.time*43),fracture*.18*Math.cos(index+frame.time*37),0);
      shard.material.opacity=.18+fracture*.18;
    });
  }
}
