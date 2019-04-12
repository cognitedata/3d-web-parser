// Copyright 2019 Cognite AS

import * as THREE from 'three';
import GeometryGroup from './GeometryGroup';
import { GeometryType } from './Types';
import { computeBoundingBox } from './GeometryUtils';

interface IndexMap { [s: number]: boolean; }
const globalBox = new THREE.Box3();

export class MergedMeshMappings {
  public static concat(mappings: MergedMeshMappings[]) {
    const capacity = mappings.reduce((sum, mapping) => sum + mapping.count, 0);
    const newMapping = new MergedMeshMappings(capacity);
    newMapping.count = capacity;
    let indexOffset = 0;
    let globalTriangleOffset = 0;
    mappings.forEach(mapping => {
      for (let i = 0; i < mapping.count; i++) {
        mapping.triangleOffsets[i] += globalTriangleOffset;
      }
      newMapping.triangleOffsets.set(mapping.triangleOffsets, indexOffset);
      newMapping.triangleCounts.set(mapping.triangleCounts, indexOffset);
      newMapping.treeIndex.set(mapping.treeIndex, indexOffset);
      for (let i = 0; i < mapping.count; i++) {
        newMapping.transform0[indexOffset + i] = mapping.transform0[i];
        newMapping.transform1[indexOffset + i] = mapping.transform1[i];
        newMapping.transform2[indexOffset + i] = mapping.transform2[i];
        newMapping.transform3[indexOffset + i] = mapping.transform3[i];
        globalTriangleOffset += mapping.triangleCounts[i];
      }
      indexOffset += mapping.count;
    });
    return newMapping;
  }

  public count: number;
  public capacity: number;
  public triangleOffsets: Uint32Array;
  public triangleCounts: Uint32Array;
  public treeIndex: Float32Array;
  // The transformX arrays contain contain transformation matrix
  public transform0: Float32Array[];
  public transform1: Float32Array[];
  public transform2: Float32Array[];
  public transform3: Float32Array[];

  public size: Float32Array;

  constructor(capacity: number) {
    this.count = 0;
    this.capacity = capacity;
    this.triangleOffsets = new Uint32Array(this.capacity);
    this.triangleCounts = new Uint32Array(this.capacity);
    this.treeIndex = new Float32Array(this.capacity);
    this.transform0 = []; this.transform0.length = capacity;
    this.transform1 = []; this.transform1.length = capacity;
    this.transform2 = []; this.transform2.length = capacity;
    this.transform3 = []; this.transform3.length = capacity;

    this.size = new Float32Array(this.capacity);
  }

  public add(
    triangleOffset: number,
    triangleCount: number,
    nodeId: number,
    treeIndex: number,
    size: number,
    transformMatrix?: THREE.Matrix4,
  ) {
    if (this.count + 1 > this.capacity) {
      throw 'Error in MergedMeshMappings::add. Trying to add more than capacity.';
    }
    this.setTriangleOffset(triangleOffset, this.count);
    this.setTriangleCount(triangleCount, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setSize(size, this.count);
    if (transformMatrix !== undefined) {
      this.setTransform(transformMatrix, this.count);
    }
    this.count += 1;
  }

  public getTreeIndex(index: number): number {
    return this.treeIndex[index];
  }

  public hasTransform(index: number): boolean {
  return this.transform0[index] !== undefined;
  }

  public getTransformMatrix(target: THREE.Matrix4, index: number) {
    const columns = [0, 1, 2, 3].map(columnIndex => {
      // @ts-ignore
      const transform = this[`transform${columnIndex}`];
      return transform[index];
    });
    const [ n11, n21, n31 ] = columns[0];
    const [ n12, n22, n32 ] = columns[1];
    const [ n13, n23, n33 ] = columns[2];
    const [ n14, n24, n34 ] = columns[3];
    target.set(
      n11, n12, n13, n14,
      n21, n22, n23, n24,
      n31, n32, n33, n34,
      0,   0,   0,   1,
    );
    return target;
  }

  public getTriangleCount(index: number) {
    return this.triangleCounts[index];
  }

  public getTriangleOffset(index: number) {
    return this.triangleOffsets[index];
  }

  public getSize(index: number) {
    return this.size[index];
  }

  public removeIndices(indicesToRemove: IndexMap) {
    let newIndex = 0;
    for (let i = 0; i < this.count; i++) {
      if (!indicesToRemove[i]) {
        this.triangleOffsets[newIndex] = this.triangleOffsets[i];
        this.triangleCounts[newIndex] = this.triangleCounts[i];

        this.treeIndex[newIndex] = this.treeIndex[i];
        this.transform0[newIndex] = this.transform0[i];
        this.transform1[newIndex] = this.transform1[i];
        this.transform2[newIndex] = this.transform2[i];
        this.transform3[newIndex] = this.transform3[i];
        newIndex++;
      }
    }

    this.count = newIndex;
  }

  public setTriangleCount(value: number, index: number) {
    this.triangleCounts[index] = value;
  }

  public setTriangleOffset(value: number, index: number) {
    this.triangleOffsets[index] = value;
  }

  public setTreeIndex(value: number, index: number) {
    this.treeIndex[index] = value;
  }

  public setSize(value: number, index: number) {
    this.size[index] = value;
  }

  public setTransform(source: THREE.Matrix4, index: number) {
    const columns = [0, 1, 2, 3].map(columnIndex => {
      // @ts-ignore
      const transform = this[`transform${columnIndex}`];
      return transform[index] = new Float32Array(3);
    });
    let matrixIndex = 0;
    for (let columnIndex = 0; columnIndex < 4; ++columnIndex, ++matrixIndex) {
      for (let rowIndex = 0; rowIndex < 3; ++rowIndex) {
        columns[columnIndex][rowIndex] = source.elements[matrixIndex++];
      }
    }
  }
}

export class MergedMesh {
  mappings: MergedMeshMappings;
  fileId: number;
  treeIndexMap: { [s: number]: number; };
  createdByInstancedMesh: boolean;
  constructor(capacity: number, fileId: number, createdByInstancedMesh: boolean = false) {
    this.mappings = new MergedMeshMappings(capacity);
    this.fileId = fileId;
    this.treeIndexMap = {};
    this.createdByInstancedMesh = createdByInstancedMesh;
  }
}

interface MappingData {
  meshIndex: number;
  mappingIndex: number;
}

interface TreeIndexMap {
  [s: number]: MappingData[];
}

export class MergedMeshGroup extends GeometryGroup {
  public type: GeometryType;
  meshes: MergedMesh[];
  treeIndexMap: TreeIndexMap;
  geometry?: THREE.BufferGeometry;
  geometrySizes?: Float32Array;

  constructor () {
    super();
    this.meshes = [];
    this.type = 'MergedMesh';
    this.treeIndexMap = {};
  }

  createTreeIndexMap() {
    this.treeIndexMap = {};
    this.meshes.forEach((mergedMesh, meshIndex) => {
      for (let mappingIndex = 0; mappingIndex < mergedMesh.mappings.count; mappingIndex++) {
        const treeIndex = mergedMesh.mappings.getTreeIndex(mappingIndex);
        if (this.treeIndexMap[treeIndex] === undefined) {
          this.treeIndexMap[treeIndex] = [];
        }
        this.treeIndexMap[treeIndex].push({
          meshIndex,
          mappingIndex,
        });
      }
    });
  }

  addMesh(mesh: MergedMesh) {
    this.meshes.push(mesh);
  }

  computeBoundingBox(
    matrix: THREE.Matrix4,
    box: THREE.Box3,
    treeIndex: number,
    geometry?: THREE.BufferGeometry,
  ): THREE.Box3 {
    box.makeEmpty();

    this.treeIndexMap[treeIndex].forEach(mesh => {
      const { meshIndex, mappingIndex } = mesh;
      const mergedMesh = this.meshes[meshIndex];

      if (geometry == null) {
        if (this.geometry == null) {
          // Geometry may not be loaded yet, skip this geometry.
          return;
        }
        geometry = this.geometry;
      }

      const triangleCount = mergedMesh.mappings.getTriangleCount(mappingIndex);
      const triangleOffset = mergedMesh.mappings.getTriangleOffset(mappingIndex);

      // index and position buffer containing the merged mesh
      const index = geometry!.getIndex();
      const position = geometry!.getAttribute('position');

      computeBoundingBox(globalBox, matrix, position, index, triangleOffset, triangleCount);
      box.union(globalBox);
    });

    return box;
  }

  removeTreeIndicesFromMesh(treeIndices: number[], mergedMesh: MergedMesh) {
    const indicesToRemove: IndexMap = {};
    treeIndices.forEach(treeIndex => {
      this.treeIndexMap[treeIndex].forEach(mesh => {
        const { meshIndex, mappingIndex } = mesh;
        indicesToRemove[mappingIndex] = true;
      });
    });
    mergedMesh.mappings.removeIndices(indicesToRemove);
    this.createTreeIndexMap();
  }
}
