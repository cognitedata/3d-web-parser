import * as THREE from 'three';
import GeometryGroup from './GeometryGroup';

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
  constructor(capacity: number, fileId: number) {
    this.collections = [];
    this.geometry = null;
    this.fileId = fileId;
    this.treeIndexMap = {};
  }

  addCollection(collection: InstancedMeshCollection) {
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
