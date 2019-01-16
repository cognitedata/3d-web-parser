import * as THREE from 'three';

export default class Sector {
  public readonly min: THREE.Vector3;
  public readonly max: THREE.Vector3;
  public readonly depth: number;
  public readonly object3d: THREE.Object3D;
  public parent: undefined | Sector;
  public children: Array<Sector>;

  constructor(min: THREE.Vector3, max: THREE.Vector3) {
    this.min = min;
    this.max = max;
    this.depth = 0;
    this.object3d = new THREE.Object3D();
    this.object3d.frustumCulled = false;
    this.children = [];
  }

  addChild(child: Sector) {
    child.parent = this;
    this.children.push(child);
  }
}
