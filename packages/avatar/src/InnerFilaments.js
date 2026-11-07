import * as THREE from '#three';

export class InnerFilaments {
  constructor(){
    this.group=new THREE.Group();this.lines=[];
    for(let i=0;i<10;i++){
      const points=[];
      for(let j=0;j<6;j++){
        const q=j/5;
        points.push(new THREE.Vector3(-.85+q*1.7,Math.sin(i*1.9)*.55+(q-.5)*.55,Math.cos(i*2.1)*.68+Math.sin(q*3+i)*.09));
      }
      const geometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,.0014,3,false);
      const material=new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB(.12,.4,.65),transparent:true,opacity:.3,depthWrite:false,blending:THREE.AdditiveBlending});
      const line=new THREE.Mesh(geometry,material);line.renderOrder=2;this.lines.push(line);this.group.add(line);
    }
  }
  update(frame,config,energy){
    this.group.visible=config.filaments;
    this.lines.forEach((line,i)=>{
      const drift=Math.pow(Math.max(0,Math.sin(frame.time*.35+i*1.7)),8.);
      line.material.opacity=.15+drift*.25+frame.voice*.15+frame.thinking*.1+(frame.analysing||0)*.15;
      const surge=(energy?.charge||0)*.35+(energy?.release||0)*.6;
      line.material.color.setRGB(.16+drift*.3+surge*.4,.45+drift*.7+surge,.75+drift+surge*1.4);
    });
  }
}
