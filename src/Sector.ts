// Copyright 2019 Cognite AS

import * as THREE from 'three';
import { GeometryNode, GeometryMap, GeometryGroup } from './geometry/GeometryGroup';
import PrimitiveGroup from './geometry/PrimitiveGroup';
import { MergedMeshGroup } from './geometry/MergedMeshGroup';
import { InstancedMeshGroup } from './geometry/InstancedMeshGroup';

export default class Sector {
  public readonly id: number;
  public readonly min: THREE.Vector3;
  public readonly max: THREE.Vector3;
  public depth: number;
  public path: string;
  public children: Sector[];
  public parent: undefined | Sector;
  public primitiveGroups: PrimitiveGroup[];
  public mergedMeshGroup: MergedMeshGroup;
  public instancedMeshGroup: InstancedMeshGroup;
  public geometryMap: GeometryMap;
  public readonly object3d: THREE.Object3D;

  constructor(id: number, min: THREE.Vector3, max: THREE.Vector3, path?: string) {
    this.id = id;
    this.min = min;
    this.max = max;
    this.path = path !== undefined ? path : '';
    this.primitiveGroups = [];
    this.mergedMeshGroup = new MergedMeshGroup();
    this.instancedMeshGroup = new InstancedMeshGroup();
    this.depth = 0;
    this.object3d = new THREE.Object3D();
    this.object3d.frustumCulled = false;
    this.children = [];
    this.geometryMap = {};
  }

  addChild(child: Sector) {
    child.parent = this;
    if (child.path === '') {
      // Only set child path if not already set
      const childPath = this.path + this.children.length.toString() + '/';
      child.path = childPath;
    }
    this.children.push(child);
    child.depth = this.depth + 1;
    this.object3d.add(child.object3d);
  }

  *traverseSectors(): IterableIterator<Sector> {
    yield this;
    for (const child of this.children) {
      yield* child.traverseSectors();
    }
  }

  *traverseSectorsBreadthFirst(): IterableIterator<Sector> {
    const stack: Sector[] = [this];
    while (stack.length > 0) {
      const nextSector = stack.shift();
      nextSector!.children.forEach(child => {
        stack.push(child);
      });
      yield nextSector!;
    }
  }

  *traversePrimitiveGroups(): IterableIterator<PrimitiveGroup> {
    for (const child of this.traverseSectors()) {
      for (const geometryGroup of child.primitiveGroups) {
        yield geometryGroup;
      }
    }
  }

  memoryUsage(recursive = true, usage: any): number {
    if (usage == null) {
      usage = {
        total: 0,
        byGeometry: {},
        byProperty: {}
      };
    }
    this.primitiveGroups.forEach(geometryGroup => {
      geometryGroup.memoryUsage(usage);
    });

    if (this.mergedMeshGroup != null) {
      this.mergedMeshGroup.memoryUsage(usage);
    }

    if (this.instancedMeshGroup != null) {
      this.instancedMeshGroup.memoryUsage(usage);
    }

    if (recursive) {
      for (const child of this.traverseSectors()) {
        child.memoryUsage(false, usage);
      }
    }

    return usage;
  }
}
