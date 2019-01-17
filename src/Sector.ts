import * as THREE from 'three';
import GeometryGroup from './geometry/GeometryGroup';

export default class Sector {
  public readonly min: THREE.Vector3;
  public readonly max: THREE.Vector3;
  public geometries: GeometryGroup;
  public depth: number;
  public readonly object3d: THREE.Object3D;
  public parent: undefined | Sector;
  public children: Array<Sector>;

  constructor(min: THREE.Vector3, max: THREE.Vector3) {
    this.min = min;
    this.max = max;
    this.geometries = {};
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

export function traverseSectors(sector, callback) {
  const stop = callback(sector);
  if (!stop) {
    const { children } = sector;
    if (children != null) {
      for (let i = 0; i < children.length; i++)
        traverseSectors(children[i], callback);
    }
  }
}

export function traverseGeometries(sector, callback) {
  traverseSectors(sector, curSector => {
    const { geometries } = curSector;
    if (geometries) {
      Object.values(geometries).forEach(items => {
        items.forEach(callback);
      });
    }
    return false;
  });
}