import * as THREE from '#three';

const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

/** Faint working projections: only present while the avatar consults a tool. */
export class AttentionField {
  constructor(){
    this.group=new THREE.Group();this.sources=[];
    for(const side of [-1,1]){
      const group=new THREE.Group();group.position.set(side*1.61,.24,.12);group.rotation.y=-side*.28;
      const framePoints=[-.23,.29,0,-.23,.19,0,-.23,.29,0,-.13,.29,0,.23,-.29,0,.23,-.19,0,.23,-.29,0,.13,-.29,0];
      const frameMaterial=new THREE.LineBasicMaterial({color:'#5595b5',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
      group.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(framePoints,3)),frameMaterial));
      const rows=new Float32Array(6*2*3);
      for(let i=0;i<6;i++){const y=.2-i*.08,length=.15+(i%4)*.045;rows.set([-.18,y,0,-.18+length,y,0],i*6);}
      const rowGeometry=new THREE.BufferGeometry();rowGeometry.setAttribute('position',new THREE.BufferAttribute(rows,3).setUsage(THREE.DynamicDrawUsage));
      const rowMaterial=new THREE.LineBasicMaterial({color:'#69b6d5',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
      group.add(new THREE.LineSegments(rowGeometry,rowMaterial));
      const cursorMaterial=new THREE.LineBasicMaterial({color:new THREE.Color().setRGB(.5,1.6,2),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
      const cursor=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.18,0,.008),new THREE.Vector3(.18,0,.008)]),cursorMaterial);
      group.add(cursor);this.group.add(group);
      this.sources.push({side,group,frameMaterial,rowMaterial,cursor,cursorMaterial,rowGeometry,level:0});
    }
    this.linkGeometry=new THREE.BufferGeometry();this.linkGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(24*3),3).setUsage(THREE.DynamicDrawUsage));
    this.linkMaterial=new THREE.LineBasicMaterial({color:new THREE.Color().setRGB(.1,.8,1.2),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
    this.link=new THREE.Line(this.linkGeometry,this.linkMaterial);this.link.frustumCulled=false;this.group.add(this.link);
  }
  update(pose,frame,controller,config,delta){
    this.group.visible=config.isolate==='all'&&pose.field>.015;
    if(!this.group.visible)return;
    const follow=1-Math.exp(-delta*8);
    for(const source of this.sources){
      const selected=source.side===pose.fieldSide;
      const target=pose.field*(selected?1:pose.comparison?.3:0);
      source.level+=(target-source.level)*follow;
      source.group.visible=source.level>.01;
      source.frameMaterial.opacity=source.level*.23;source.rowMaterial.opacity=source.level*.27;
      source.cursorMaterial.opacity=source.level*(.5+pose.toolPulse*.25);
      source.cursor.position.y=clamp(pose.focusY*.65,-.23,.23);
      source.cursor.scale.x=.35+pose.readProgress*.65;
      if(pose.writing){
        const row=Math.floor(frame.time*1.5)%6,p=source.rowGeometry.attributes.position;
        source.cursor.position.y=.2-row*.08;
        for(let i=0;i<6;i++)p.setX(i*2+1,-.18+(i<row?.31:i===row?.31*pose.readProgress:0));
        p.needsUpdate=true;
      }
      const playback=controller.animations.current;
      const id=(playback?.record||controller.action?.record||'')+(pose.writing?':write':'');
      if(selected&&source.record!==id){
        source.record=id;const hash=[...id].reduce((sum,c)=>sum+c.charCodeAt(0),0),p=source.rowGeometry.attributes.position;
        for(let i=0;i<6;i++)p.setX(i*2+1,-.18+.13+((hash+i*7)%23)*.009);
        p.needsUpdate=true;
      }
    }
    const positions=this.linkGeometry.attributes.position;
    for(let i=0;i<positions.count;i++){
      const t=i/(positions.count-1),x=pose.fieldSide*1.61;
      positions.setXYZ(i,x*t,.24*t+Math.sin(t*Math.PI)*.12,.12+Math.sin(t*Math.PI)*.16);
    }
    positions.needsUpdate=true;this.linkMaterial.opacity=pose.field*pose.toolPulse*.24;
  }
}
