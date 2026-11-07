import * as THREE from '#three';

/** Temporary relay endpoints for contact/summon. No permanent shards or faces. */
export class ContactLinks {
  constructor(){
    this.group=new THREE.Group();this.group.visible=false;this.nodes=[];
    for(let i=0;i<4;i++){
      const root=new THREE.Group(),theta=Math.PI*.12+i*Math.PI*.5;
      root.position.set(Math.cos(theta)*2.03,.24+Math.sin(theta)*.3,Math.sin(theta)*1.22);
      const material=new THREE.MeshBasicMaterial({color:new THREE.Color(.4,1.5,2.1),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
      const bead=new THREE.Mesh(new THREE.IcosahedronGeometry(.045,1),material);root.add(bead);
      const circle=[];for(let j=0;j<=48;j++){const a=j/48*Math.PI*2;circle.push(new THREE.Vector3(Math.cos(a)*.12,Math.sin(a)*.12,0));}
      const ringMaterial=new THREE.LineBasicMaterial({color:new THREE.Color(.3,1.1,1.65),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
      const ring=new THREE.Line(new THREE.BufferGeometry().setFromPoints(circle),ringMaterial);root.add(ring);
      const linkMaterial=new THREE.LineBasicMaterial({color:'#67DEFF',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
      const points=new Float32Array(28*3),geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(points,3));
      for(let j=0;j<28;j++){const t=j/27;geometry.attributes.position.setXYZ(j,root.position.x*t,root.position.y*t+Math.sin(t*Math.PI)*.17,root.position.z*t);}
      const link=new THREE.Line(geometry,linkMaterial);this.group.add(root,link);
      this.nodes.push({root,bead,ring,material,ringMaterial,link,linkMaterial});
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(4*8*3),3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('color',new THREE.BufferAttribute(new Float32Array(4*8*3),3).setUsage(THREE.DynamicDrawUsage));
    this.packets=new THREE.Points(geometry,new THREE.PointsMaterial({size:.035,vertexColors:true,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending}));
    this.packets.frustumCulled=false;this.group.add(this.packets);
  }
  update(pose,frame,config,camera,energy){
    this.group.visible=config.isolate==='all'&&pose.contact>.012;if(!this.group.visible)return;
    const count=pose.contactCount||1;
    this.nodes.forEach((node,index)=>{
      const visible=index<count;node.root.visible=visible;node.link.visible=visible;if(!visible)return;
      const sweep=.5+.5*Math.sin(frame.time*2.2-index*1.7),pulse=Math.max(pose.contactPulse||0,(energy?.release||0)*.7);
      node.material.opacity=pose.contact*(.5+sweep*.2+pulse*.3);
      node.ringMaterial.opacity=pose.contact*(.18+pulse*.5);
      node.linkMaterial.opacity=pose.contact*(.08+sweep*.06+pulse*.35);
      node.ring.scale.setScalar(1+pulse*1.8);node.root.quaternion.copy(camera.quaternion);
    });
    const p=this.packets.geometry.attributes.position,c=this.packets.geometry.attributes.color;
    for(let i=0;i<32;i++){
      const node=this.nodes[Math.floor(i/8)],tail=i%4,stream=Math.floor(i/4)%2;
      let t=(frame.time*.48-Math.floor(i/8)*.19+stream*.5-tail*.009)%1;if(t<0)t+=1;
      if(stream)t=1-t;
      const light=Math.floor(i/8)<count?pose.contact*(1-tail*.24):0;
      p.setXYZ(i,node.root.position.x*t,node.root.position.y*t+Math.sin(t*Math.PI)*.17,node.root.position.z*t);
      c.setXYZ(i,light*.75,light*2.2,light*3.1);
    }
    p.needsUpdate=true;c.needsUpdate=true;
  }
}
