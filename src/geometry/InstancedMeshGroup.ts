import * as THREE from 'three';
import GeometryGroup from './GeometryGroup';
import { TypedArray } from 'three';

export class InstancedMeshMappings {
  public count: number;
  public capacity: number;
  public color: Float32Array;
  public nodeId: Float64Array;
  public treeIndex: Float32Array;
  // The transformX arrays contain contain transformation matrix
  public transform0: Float32Array;
  public transform1: Float32Array;
  public transform2: Float32Array;
  public transform3: Float32Array;

  constructor(capacity: number) {
    this.count = 0;
    this.capacity = capacity;

    this.color = new Float32Array(3 * this.capacity);
    this.nodeId = new Float64Array(this.capacity);
    this.treeIndex = new Float32Array(this.capacity);

    this.transform0 = new Float32Array(3 * this.capacity);
    this.transform1 = new Float32Array(3 * this.capacity);
    this.transform2 = new Float32Array(3 * this.capacity);
    this.transform3 = new Float32Array(3 * this.capacity);
  }

  public add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    transformMatrix?: THREE.Matrix4,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    if (transformMatrix !== undefined) {
      this.setTransform(transformMatrix, this.count);
    }
    this.count += 1;
  }

  public getColor(target: THREE.Color, index: number): THREE.Color {
    let nextIndex = 3 * index;
    target.setRGB(
      this.color[nextIndex++],
      this.color[nextIndex++],
      this.color[nextIndex++],
    );
    return target;
  }

  public getNodeId(index: number): number {
    return this.nodeId[index];
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
    tmp = this.color;
    this.color = new Float32Array(3 * capacity);
    this.color.set(tmp.subarray(0, 3 * this.count), 0);

    tmp = this.nodeId;
    this.nodeId = new Float64Array(capacity);
    this.nodeId.set(tmp.subarray(0, this.count), 0);

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

    this.nodeId.set(otherMappings.nodeId.subarray(0, otherMappings.count), this.count);
    this.treeIndex.set(otherMappings.treeIndex.subarray(0, otherMappings.count), this.count);
    this.color.set(otherMappings.color.subarray(0, 3 * otherMappings.count), 3 * this.count);
    this.transform0.set(otherMappings.transform0.subarray(0, 3 * otherMappings.count), 3 * this.count);
    this.transform1.set(otherMappings.transform1.subarray(0, 3 * otherMappings.count), 3 * this.count);
    this.transform2.set(otherMappings.transform2.subarray(0, 3 * otherMappings.count), 3 * this.count);
    this.transform3.set(otherMappings.transform3.subarray(0, 3 * otherMappings.count), 3 * this.count);
    this.count = newCapacity;
  }

  private setColor(source: THREE.Color, index: number) {
    let nextIndex = 3 * index;
    this.color[nextIndex++] = source.r;
    this.color[nextIndex++] = source.g;
    this.color[nextIndex++] = source.b;
  }

  private setNodeId(value: number, index: number) {
    this.nodeId[index] = value;
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
  mappings: InstancedMeshMappings;
  constructor(triangleOffset: number, triangleCount: number, capacity: number) {
    this.triangleOffset = triangleOffset;
    this.triangleCount = triangleCount;
    this.mappings = new InstancedMeshMappings(capacity);
  }

  addMapping(nodeId: number,
             treeIndex: number,
             color: THREE.Color,
             transformMatrix?: THREE.Matrix4) {
    this.mappings.add(nodeId, treeIndex, color, transformMatrix);
  }
}

export class InstancedMesh {
  collections: InstancedMeshCollection[];
  fileId: number;
  geometry: null|THREE.Mesh;
  treeIndexMap: { [s: number]: number; };
  collectionByTriangleOffset: { [s: number]: InstancedMeshCollection; };
  constructor(capacity: number, fileId: number) {
    this.collections = [];
    this.geometry = null;
    this.fileId = fileId;
    this.treeIndexMap = {};
    this.collectionByTriangleOffset = {};
  }

  addCollection(collection: InstancedMeshCollection) {
    const existingCollection = this.collectionByTriangleOffset[collection.triangleOffset];
    if (existingCollection != null) {

    }
    this.collections.push(collection);
  }
}

export class InstancedMeshGroup extends GeometryGroup {
  meshes: InstancedMesh[];
  constructor() {
    super();
    this.meshes = [];
    this.type = 'InstancedMesh';
  }

  addMesh(mesh: InstancedMesh) {
    this.meshes.push(mesh);
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix;
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    return box;
  }
}
