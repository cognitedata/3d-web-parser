// Copyright 2019 Cognite AS

import * as THREE from 'three';
import GeometryGroup from './geometry/GeometryGroup';

export default class Sector {
  public readonly min: THREE.Vector3;
  public readonly max: THREE.Vector3;
  public depth: number;
  public children: Sector[];
  public parent: undefined | Sector;
  public geometries: GeometryGroup[];
  public readonly object3d: THREE.Object3D;

  constructor(min: THREE.Vector3, max: THREE.Vector3) {
    this.min = min;
    this.max = max;
    this.geometries = [];
    this.depth = 0;
    this.object3d = new THREE.Object3D();
    this.object3d.frustumCulled = false;
    this.children = [];
  }

  addChild(child: Sector) {
    child.parent = this;
    this.children.push(child);
    child.depth = this.depth + 1;
    this.object3d.add(child.object3d);
  }

  *traverseChilds(): IterableIterator<Sector> {
    yield this;
    for (const child of this.children) {
      yield* child.traverseChilds();
    }
  }
}
