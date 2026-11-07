const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const damp=(v,target,dt,speed)=>v+(target-v)*(1-Math.exp(-dt*speed));

export class OrbitInteraction {
  constructor(){this.x=0;this.y=0;this.targetX=0;this.targetY=0;this.zoom=1;this.targetZoom=1;this.velocityX=0;this.velocityY=0;this.dragging=false;this.elapsed=0;this.lastInteraction=0;this.interacted=false;}
  begin(){this.interacted=true;this.dragging=true;this.velocityX=this.velocityY=0;}
  drag(dx,dy,dt){
    this.interacted=true;
    this.targetX=clamp(this.targetX+dy*.003,-.65,.65);this.targetY+=dx*.0035;
    this.velocityX=clamp(dy*.003/Math.max(.016,dt),-1,1);this.velocityY=clamp(dx*.0035/Math.max(.016,dt),-1.4,1.4);this.lastInteraction=this.elapsed;
  }
  end(cancelled=false){this.dragging=false;this.lastInteraction=this.elapsed;if(cancelled)this.velocityX=this.velocityY=0;}
  zoomBy(ratio){this.targetZoom=clamp(this.targetZoom*ratio,.78,1.45);}
  reset(){this.targetX=this.targetY=0;this.targetZoom=1;this.velocityX=this.velocityY=0;}
  update(dt,paused=false){
    this.elapsed+=dt;
    if(!this.dragging&&!paused){
      this.targetX=clamp(this.targetX+this.velocityX*dt,-.65,.65);this.targetY+=this.velocityY*dt;
      this.velocityX*=Math.exp(-dt*5);this.velocityY*=Math.exp(-dt*5);
      if(this.elapsed-this.lastInteraction>2.5){this.targetX=damp(this.targetX,0,dt,.6);const rest=Math.round(this.targetY/(Math.PI*2))*Math.PI*2;this.targetY=damp(this.targetY,rest,dt,.6);}
    }
    this.x=damp(this.x,this.targetX,dt,10);this.y=damp(this.y,this.targetY,dt,10);this.zoom=damp(this.zoom,this.targetZoom,dt,9);
  }
}
