// Copyright 2019 Cognite AS

import * as THREE from 'three';
import { GeometryNode, GeometryMap, GeometryGroup } from './geometry/GeometryGroup';
import PrimitiveGroup from './geometry/PrimitiveGroup';
import { MergedMeshGroup } from './geometry/MergedMeshGroup';
import { InstancedMeshGroup } from './geometry/InstancedMeshGroup';

export class Sector {
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

  constructor(min: THREE.Vector3, max: THREE.Vector3) {
    this.min = min;
    this.max = max;
    this.path = '0/';
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
    const childPath = this.path + this.children.length.toString() + '/';
    child.path = childPath;
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
        byProperty: {},
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

/**
 * A binary pattern that describes the corners of a sector:
 *
 * ```text
 *    3____7
 *  2/___6/|
 *  | 1__|_5
 *  0/___4/
 * ```
 *
 * @type {Uint8Array[]}
 */

const corners = [
  new Uint8Array([0, 0, 0]),
  new Uint8Array([0, 0, 1]),
  new Uint8Array([0, 1, 0]),
  new Uint8Array([0, 1, 1]),

  new Uint8Array([1, 0, 0]),
  new Uint8Array([1, 0, 1]),
  new Uint8Array([1, 1, 0]),
  new Uint8Array([1, 1, 1]),
];

/**
 * Describes all possible sector corner connections.
 *
 * @type {Uint8Array[]}
 */

const edges = [
  // X-Axis.
  new Uint8Array([0, 4]),
  new Uint8Array([1, 5]),
  new Uint8Array([2, 6]),
  new Uint8Array([3, 7]),

  // Y-Axis.
  new Uint8Array([0, 2]),
  new Uint8Array([1, 3]),
  new Uint8Array([4, 6]),
  new Uint8Array([5, 7]),

  // Z-Axis.
  new Uint8Array([0, 1]),
  new Uint8Array([2, 3]),
  new Uint8Array([4, 5]),
  new Uint8Array([6, 7]),
];

export class SectorTreeHelper extends THREE.Group {
  rootSector: Sector;

  constructor(rootSector: Sector) {
    super();
    this.rootSector = rootSector;
    this.createLineSegments(rootSector);
  }

  createLineSegments(rootSector: Sector) {
    const material = new THREE.LineBasicMaterial({
      color: 0xffffff * Math.random(),
    });
    const group = new THREE.Group();

    let numSectors = 0;
    for (const sector of rootSector.traverseSectors()) {
      numSectors++;
    }

    const vertexCount = numSectors * 8;
    let d = 0;
    let c = 0;
    const indices = new Uint16Array(vertexCount * 3);
    const positions = new Float32Array(vertexCount * 3);
    for (const sector of rootSector.traverseSectors()) {
      const { min, max } = sector;
      for (let j = 0; j < 12; ++j) {
        const edge = edges[j];
        indices[d++] = c + edge[0];
        indices[d++] = c + edge[1];
      }

      // Create the vertices.
      for (let j = 0; j < 8; ++j, ++c) {
        const corner = corners[j];
        positions[c * 3] = corner[0] === 0 ? min.x : max.x;
        positions[c * 3 + 1] = corner[1] === 0 ? min.y : max.y;
        positions[c * 3 + 2] = corner[2] === 0 ? min.z : max.z;
      }

      return false;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    group.add(new THREE.LineSegments(geometry, material));
    this.add(group);
    return true;
  }

  dispose() {
    const groups = this.children;

    let group;
    let children;

    for (let i = 0, il = groups.length; i < il; ++i) {
      group = groups[i];
      ({ children } = group);

      for (let j = 0, jl = children.length; j < jl; ++j) {
        const child = children[j];
        if (child instanceof THREE.LineSegments) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      }

      while (children.length > 0) {
        group.remove(children[0]);
      }
    }

    while (groups.length > 0) {
      this.remove(groups[0]);
    }
  }
}
