import * as THREE from 'three';
import GeometryGroup from './GeometryGroup';

export class MergedMeshMappings {
  public count: number;
  public capacity: number;
  public triangleOffsets: Uint32Array;
  public triangleCounts: Uint32Array;
  public color: Float32Array;
  public nodeId: Float64Array;
  public treeIndex: Float32Array;

  constructor(capacity: number) {
    this.count = 0;
    this.capacity = capacity;
    this.triangleOffsets = new Uint32Array(this.capacity);
    this.triangleCounts = new Uint32Array(this.capacity);
    this.color = new Float32Array(3 * this.capacity);
    this.nodeId = new Float64Array(this.capacity);
    this.treeIndex = new Float32Array(this.capacity);
}

  public add(
    triangleOffset: number,
    triangleCount: number,
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
  ) {
    this.setTriangleOffset(triangleOffset, this.count);
    this.setTriangleCount(triangleCount, this.count);
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);

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

  public getTriangleCount(index: number) {
    return this.triangleCounts[index];
  }

  public getTriangleOffset(index: number) {
    return this.triangleOffsets[index];
  }

  private setColor(source: THREE.Color, index: number) {
    let nextIndex = 3 * index;
    this.color[nextIndex++] = source.r;
    this.color[nextIndex++] = source.g;
    this.color[nextIndex++] = source.b;
  }

  private setTriangleCount(value: number, index: number) {
    this.triangleCounts[index] = value;
  }

  private setTriangleOffset(value: number, index: number) {
    this.triangleOffsets[index] = value;
  }

  private setNodeId(value: number, index: number) {
    this.nodeId[index] = value;
  }

  private setTreeIndex(value: number, index: number) {
    this.treeIndex[index] = value;
  }
}

export class MergedMesh {
  mappings: MergedMeshMappings;
  fileId: number;
  geometry: null|THREE.Mesh;
  treeIndexMap: { [s: number]: number; };
  constructor(capacity: number, fileId: number) {
    this.mappings = new MergedMeshMappings(capacity);
    this.geometry = null;
    this.fileId = fileId;
    this.treeIndexMap = {};
  }
}

export class MergedMeshGroup extends GeometryGroup {
  meshes: MergedMesh[];
  constructor() {
    super();
    this.meshes = [];
    this.type = 'MergedMesh';
  }

  add(mesh: MergedMesh) {
    this.meshes.push(mesh);
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix;
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    return box;
  }
}
