import * as THREE from '#three';

export class AvatarRig {
  constructor(){
    this.positionRoot=new THREE.Group();this.crystalRoot=new THREE.Group();
    this.crystalRoot.rotation.set(.04,.18,Math.PI/4);this.positionRoot.add(this.crystalRoot);
  }
  attachCrystal(group){this.crystalRoot.add(group);}
  attachHorizontal(group){this.positionRoot.add(group);}
}
