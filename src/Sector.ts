// Copyright 2019 Cognite AS

import * as THREE from 'three';
import { GeometryNode, GeometryMap, GeometryGroup } from './geometry/GeometryGroup';
import PrimitiveGroup from './geometry/PrimitiveGroup';
import { MergedMeshGroup } from './geometry/MergedMeshGroup';
import { InstancedMeshGroup } from './geometry/InstancedMeshGroup';

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

  *traversePrimitiveGroups(): IterableIterator<PrimitiveGroup> {
    for (const child of this.traverseSectors()) {
      for (const geometryGroup of child.primitiveGroups) {
        yield geometryGroup;
      }
    }
  }

  findMaxTreeIndex() {
    let maxTreeIndex = -1;
    for (const child of this.traverseSectors()) {
      for (const geometryGroup of child.primitiveGroups) {
        maxTreeIndex = Math.max(geometryGroup.maxTreeIndex, maxTreeIndex);
      }

      for (let meshIndex = 0; meshIndex < child.mergedMeshGroup.meshes.length; meshIndex++) {
        const mappings = child.mergedMeshGroup.meshes[meshIndex].mappings;
        maxTreeIndex = Math.max(mappings.maxTreeIndex, maxTreeIndex);
      }

      for (let meshIndex = 0; meshIndex < child.instancedMeshGroup.meshes.length; meshIndex++) {
        const instancedMesh = child.instancedMeshGroup.meshes[meshIndex];
        for (let collectionIndex = 0; collectionIndex < instancedMesh.collections.length; collectionIndex++) {
          const mappings = instancedMesh.collections[collectionIndex].mappings;
          maxTreeIndex = Math.max(mappings.maxTreeIndex, maxTreeIndex);
        }
      }
    }

    return maxTreeIndex;
  }

  *traverseGeometryNodes(color?: THREE.Color): IterableIterator<GeometryNode> {
    // Will traverse all geometries and yield
    // nodeId and treeIndex
    for (const child of this.traverseSectors()) {
      for (const geometryGroup of child.primitiveGroups) {
        for (let mappingIndex = 0; mappingIndex < geometryGroup.count; mappingIndex++) {
          const treeIndex = geometryGroup.getTreeIndex(mappingIndex);
          const nodeId = geometryGroup.getNodeId(mappingIndex);
          if (color != null) {
            geometryGroup.getColor(color, mappingIndex);
            yield { treeIndex, nodeId, geometryGroup, groupIndex: { mappingIndex }, color };
          } else {
            yield { treeIndex, nodeId, geometryGroup, groupIndex: { mappingIndex } };
          }
        }
      }

      for (let meshIndex = 0; meshIndex < child.mergedMeshGroup.meshes.length; meshIndex++) {
        const mappings = child.mergedMeshGroup.meshes[meshIndex].mappings;
        for (let mappingIndex = 0; mappingIndex < mappings.count; mappingIndex++) {
          const treeIndex = mappings.getTreeIndex(mappingIndex);
          const nodeId = mappings.getNodeId(mappingIndex);
          if (color != null) {
            mappings.getColor(color, mappingIndex);
            yield { treeIndex, nodeId, geometryGroup: child.mergedMeshGroup, groupIndex: { mappingIndex }, color };
          } else {
            yield { treeIndex, nodeId, geometryGroup: child.mergedMeshGroup, groupIndex: { mappingIndex } };
          }
        }
      }

      for (let meshIndex = 0; meshIndex < child.instancedMeshGroup.meshes.length; meshIndex++) {
        const instancedMesh = child.instancedMeshGroup.meshes[meshIndex];
        for (let collectionIndex = 0; collectionIndex < instancedMesh.collections.length; collectionIndex++) {
          const mappings = instancedMesh.collections[collectionIndex].mappings;
          for (let mappingIndex = 0; mappingIndex < mappings.count; mappingIndex++) {
            const treeIndex = mappings.getTreeIndex(mappingIndex);
            const nodeId = mappings.getNodeId(mappingIndex);
            if (color != null) {
              mappings.getColor(color, mappingIndex);
              yield {
                treeIndex,
                nodeId,
                geometryGroup: child.instancedMeshGroup,
                groupIndex: {
                  collectionIndex,
                  mappingIndex,
                },
              color,
            };
            } else {
              yield {
                treeIndex,
                nodeId,
                geometryGroup: child.instancedMeshGroup,
                groupIndex: {
                  collectionIndex,
                  mappingIndex,
                },
              };
            }
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
