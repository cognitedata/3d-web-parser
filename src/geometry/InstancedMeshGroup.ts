// Copyright 2019 Cognite AS

import * as THREE from 'three';
import GeometryGroup from './GeometryGroup';
import { TypedArray, MeshNormalMaterial } from 'three';
import { GeometryType } from './Types';
import { computeBoundingBox } from './GeometryUtils';

const globalMatrix = new THREE.Matrix4();
const globalBox = new THREE.Box3();
interface IndexMap { [s: number]: boolean; }

export class InstancedMeshMappings {
  public count: number;
  public capacity: number;
  public treeIndex: Float32Array;
  // The transformX arrays contain contain transformation matrix
  public transform0: Float32Array;
  public transform1: Float32Array;
  public transform2: Float32Array;
  public transform3: Float32Array;

  constructor(capacity: number) {
    this.count = 0;
    this.capacity = capacity;

    this.treeIndex = new Float32Array(this.capacity);

    this.transform0 = new Float32Array(3 * this.capacity);
    this.transform1 = new Float32Array(3 * this.capacity);
    this.transform2 = new Float32Array(3 * this.capacity);
    this.transform3 = new Float32Array(3 * this.capacity);
  }

  public removeIndices(indicesToRemove: IndexMap) {
    let newIndex = 0;
    for (let i = 0; i < this.count; i++) {
      if (!indicesToRemove[i]) {
        this.treeIndex[newIndex] = this.treeIndex[i];
        this.transform0[3 * newIndex + 0] = this.transform0[3 * i + 0];
        this.transform0[3 * newIndex + 1] = this.transform0[3 * i + 1];
        this.transform0[3 * newIndex + 2] = this.transform0[3 * i + 2];

        this.transform1[3 * newIndex + 0] = this.transform1[3 * i + 0];
        this.transform1[3 * newIndex + 1] = this.transform1[3 * i + 1];
        this.transform1[3 * newIndex + 2] = this.transform1[3 * i + 2];

        this.transform2[3 * newIndex + 0] = this.transform2[3 * i + 0];
        this.transform2[3 * newIndex + 1] = this.transform2[3 * i + 1];
        this.transform2[3 * newIndex + 2] = this.transform2[3 * i + 2];

        this.transform3[3 * newIndex + 0] = this.transform1[3 * i + 0];
        this.transform3[3 * newIndex + 1] = this.transform1[3 * i + 1];
        this.transform3[3 * newIndex + 2] = this.transform1[3 * i + 2];

        newIndex++;
      }
    }

    this.count = newIndex;
  }

  public add(
    nodeId: number,
    treeIndex: number,
    transformMatrix?: THREE.Matrix4,
  ) {
    this.setTreeIndex(treeIndex, this.count);
    if (transformMatrix !== undefined) {
      this.setTransform(transformMatrix, this.count);
    }
    this.count += 1;
  }

  public getTreeIndex(index: number): number {
    return this.treeIndex[index];
  }

  public getTransformMatrix(target: THREE.Matrix4, index: number) {
    const start = 3 * index;
    const end = 3 * (index + 1);
    const columns = [this.transform0, this.transform1, this.transform2, this.transform3];
    for (let columnIndex = 0; columnIndex < 4; columnIndex++) {
      for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
        const i = 4 * columnIndex + rowIndex;
        target.elements[i] = columns[columnIndex][3 * index + rowIndex];
      }
    }
    target.elements[3] = 0;
    target.elements[7] = 0;
    target.elements[11] = 0;
    target.elements[15] = 1;

    return target;
  }

  public resize(capacity: number) {
    // TODO(anders.hafreager) Create proper helper functions to simplify/automate constructor and resize

    if (capacity < this.count) {
      throw 'Error, tried to resize InstancedMeshMappings to smaller value than current count.';
    }

    let tmp: TypedArray;
    tmp = this.treeIndex;
    this.treeIndex = new Float32Array(capacity);
    this.treeIndex.set(tmp.subarray(0, this.count), 0);

    tmp = this.transform0;
    this.transform0 = new Float32Array(3 * capacity);
    this.transform0.set(tmp.subarray(0, 3 * this.count), 0);

    tmp = this.transform1;
    this.transform1 = new Float32Array(3 * capacity);
    this.transform1.set(tmp.subarray(0, 3 * this.count), 0);

    tmp = this.transform2;
    this.transform2 = new Float32Array(3 * capacity);
    this.transform2.set(tmp.subarray(0, 3 * this.count), 0);

    tmp = this.transform3;
    this.transform3 = new Float32Array(3 * capacity);
    this.transform3.set(tmp.subarray(0, 3 * this.count), 0);

    this.capacity = capacity;
  }

  public mergeWithMappings(otherMappings: InstancedMeshMappings) {
    // TODO(anders.hafreager) Create proper helper functions automate this
    const newCapacity = this.count + otherMappings.count;
    this.resize(newCapacity);

    this.treeIndex.set(otherMappings.treeIndex.subarray(0, otherMappings.count), this.count);
    this.transform0.set(otherMappings.transform0.subarray(0, 3 * otherMappings.count), 3 * this.count);
    this.transform1.set(otherMappings.transform1.subarray(0, 3 * otherMappings.count), 3 * this.count);
    this.transform2.set(otherMappings.transform2.subarray(0, 3 * otherMappings.count), 3 * this.count);
    this.transform3.set(otherMappings.transform3.subarray(0, 3 * otherMappings.count), 3 * this.count);
    this.count = newCapacity;
  }

  private setTreeIndex(value: number, index: number) {
    this.treeIndex[index] = value;
  }

  private setTransform(source: THREE.Matrix4, index: number) {
    const columns = [this.transform0, this.transform1, this.transform2, this.transform3];
    for (let rowIndex = 0; rowIndex < 4; ++rowIndex) {
      for (let colIndex = 0; colIndex < 4; ++colIndex) {
        const matrixIndex = 4 * colIndex + rowIndex;

        // Each column is an array containing all columns (length 3) for several nodes
        columns[colIndex][3 * index + rowIndex] = source.elements[matrixIndex];
      }
    }
  }
}

export class InstancedMeshCollection {
  triangleOffset: number;
  triangleCount: number;
  geometry?: THREE.InstancedBufferGeometry;
  mappings: InstancedMeshMappings;
  constructor(triangleOffset: number, triangleCount: number, capacity: number) {
    this.triangleOffset = triangleOffset;
    this.triangleCount = triangleCount;
    this.mappings = new InstancedMeshMappings(capacity);
  }

  addMapping(nodeId: number,
             treeIndex: number,
             transformMatrix?: THREE.Matrix4) {
    this.mappings.add(nodeId, treeIndex, transformMatrix);
  }
}

export class InstancedMesh {
  collections: InstancedMeshCollection[];
  fileId: number;
  treeIndexMap: { [s: number]: number; };
  collectionByTriangleOffset: { [s: number]: InstancedMeshCollection; };
  constructor(fileId: number) {
    this.collections = [];
    this.fileId = fileId;
    this.treeIndexMap = {};
    this.collectionByTriangleOffset = {};
  }

  addCollection(collection: InstancedMeshCollection) {
    // A collection is a geometry with a specific triangleOffset in a file.
    // If another collection shares the same file and triangleOffset, we can merge
    // the two collections to render them in the same draw call.
    const existingCollection = this.collectionByTriangleOffset[collection.triangleOffset];
    if (existingCollection != null) {
      existingCollection.mappings.mergeWithMappings(collection.mappings);
    } else {
      this.collections.push(collection);
      this.collectionByTriangleOffset[collection.triangleOffset] = collection;
    }
  }
}

interface MappingData {
  meshIndex: number;
  collectionIndex: number;
  mappingIndex: number;
}

interface TreeIndexMap {
  [s: number]: MappingData[];
}

export class InstancedMeshGroup extends GeometryGroup {
  public type: GeometryType;
  public meshes: InstancedMesh[];
  public treeIndexMap: TreeIndexMap;
  constructor() {
    super();
    this.meshes = [];
    this.type = 'InstancedMesh';
    this.treeIndexMap = {};
  }

  createTreeIndexMap() {
    this.treeIndexMap = {};

    this.meshes.forEach((instancedMesh, meshIndex) => {
      instancedMesh.collections.forEach( (collection, collectionIndex) => {
        for (let mappingIndex = 0; mappingIndex < collection.mappings.count; mappingIndex++) {
          const treeIndex = collection.mappings.getTreeIndex(mappingIndex);
          if (this.treeIndexMap[treeIndex] === undefined) {
            this.treeIndexMap[treeIndex] = [];
          }
          this.treeIndexMap[treeIndex].push({
            meshIndex,
            collectionIndex,
            mappingIndex,
          });
        }
      });
    });
  }

  addMesh(mesh: InstancedMesh) {
    this.meshes.push(mesh);
  }

  removeTreeIndicesFromCollection(treeIndices: number[], collection: InstancedMeshCollection) {
    const indicesToRemove: IndexMap = {};
    treeIndices.forEach(treeIndex => {
      this.treeIndexMap[treeIndex].forEach(mesh => {
        const { meshIndex, mappingIndex, collectionIndex } = mesh;
        indicesToRemove[mappingIndex] = true;
      });
    });
    collection.mappings.removeIndices(indicesToRemove);
    this.createTreeIndexMap();
  }

  computeBoundingBox(matrix: THREE.Matrix4,
                     box: THREE.Box3,
                     treeIndex: number,
                     geometry?: THREE.BufferGeometry): THREE.Box3 {
    box.makeEmpty();

    this.treeIndexMap[treeIndex].forEach(mesh => {
      const { meshIndex, collectionIndex, mappingIndex } = mesh;
      const instancedMesh = this.meshes[meshIndex];
      const collection = instancedMesh.collections[collectionIndex];

      if (geometry == null) {
        if (collection.geometry == null) {
          // Geometry may not be loaded yet, skip this geometry.
          return;
        }
        geometry = collection.geometry;
      }

      collection.mappings.getTransformMatrix(globalMatrix, mappingIndex);
      const triangleCount = collection.triangleCount;
      // TriangleOffset is 0 since each collection contains exactly one geometry
      const index = geometry.getIndex();
      const position = geometry.getAttribute('position');

      globalMatrix.multiplyMatrices(matrix, globalMatrix);

      computeBoundingBox(globalBox, globalMatrix, position, index, 0, triangleCount);
      box.union(globalBox);
    });

    return box;
  }
}
