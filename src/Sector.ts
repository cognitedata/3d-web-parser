// Copyright 2019 Cognite AS

import * as THREE from 'three';
import GeometryGroup from './geometry/GeometryGroup';
import PrimitiveGroup from './geometry/PrimitiveGroup';
import { MergedMeshGroup } from './geometry/MergedMeshGroup';
import { InstancedMeshGroup } from './geometry/InstancedMeshGroup';

interface GeometryNode {
  treeIndex: number;
  nodeId: number;
  color: THREE.Color;
}

export default class Sector {
  public readonly min: THREE.Vector3;
  public readonly max: THREE.Vector3;
  public depth: number;
  public path: string;
  public children: Sector[];
  public parent: undefined | Sector;
  public primitiveGroups: PrimitiveGroup[];
  public mergedMeshGroup: MergedMeshGroup;
  public instancedMeshGroup: InstancedMeshGroup;
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

  *traversePrimitiveGroups(): IterableIterator<PrimitiveGroup> {
    for (const child of this.traverseSectors()) {
      for (const geometryGroup of child.primitiveGroups) {
        yield geometryGroup;
      }
    }
  }

  *traverseGeometryNodes(color: THREE.Color): IterableIterator<GeometryNode> {
    // Will traverse all geometries and yield
    // nodeId and treeIndex
    for (const child of this.traverseSectors()) {
      for (const geometryGroup of child.primitiveGroups) {
        for (let i = 0; i < geometryGroup.count; i++) {
          const treeIndex = geometryGroup.getTreeIndex(i);
          const nodeId = geometryGroup.getNodeId(i);
          geometryGroup.getColor(color, i);
          yield { treeIndex, nodeId, color };
        }
      }

      for (let meshIndex = 0; meshIndex < child.mergedMeshGroup.meshes.length; meshIndex++) {
        const mappings = child.mergedMeshGroup.meshes[meshIndex].mappings;
        for (let i = 0; i < mappings.count; i++) {
          const treeIndex = mappings.getTreeIndex(i);
          const nodeId = mappings.getNodeId(i);
          mappings.getColor(color, i);
          yield { treeIndex, nodeId, color };
        }
      }

      for (let meshIndex = 0; meshIndex < child.instancedMeshGroup.meshes.length; meshIndex++) {
        const instancedMesh = child.instancedMeshGroup.meshes[meshIndex];
        for (let collectionIndex = 0; collectionIndex < instancedMesh.collections.length; collectionIndex++) {
          const mappings = instancedMesh.collections[collectionIndex].mappings;
          for (let i = 0; i < mappings.count; i++) {
            const treeIndex = mappings.getTreeIndex(i);
            const nodeId = mappings.getNodeId(i);
            mappings.getColor(color, i);
            yield { treeIndex, nodeId, color };
          }
        }
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
