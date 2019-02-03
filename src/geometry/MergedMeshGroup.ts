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
  public maxTreeIndex: number;
  // The transformX arrays contain contain transformation matrix
  public transform0: Float32Array[];
  public transform1: Float32Array[];
  public transform2: Float32Array[];
  public transform3: Float32Array[];

  constructor(capacity: number) {
    this.count = 0;
    this.capacity = capacity;
    this.triangleOffsets = new Uint32Array(this.capacity);
    this.triangleCounts = new Uint32Array(this.capacity);
    this.color = new Float32Array(3 * this.capacity);
    this.nodeId = new Float64Array(this.capacity);
    this.treeIndex = new Float32Array(this.capacity);
    this.maxTreeIndex = -1;
    this.transform0 = []; this.transform0.length = capacity;
    this.transform1 = []; this.transform1.length = capacity;
    this.transform2 = []; this.transform2.length = capacity;
    this.transform3 = []; this.transform3.length = capacity;
}

  public add(
    triangleOffset: number,
    triangleCount: number,
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    transformMatrix?: THREE.Matrix4,
  ) {
    if (this.count + 1 > this.capacity) {
      throw 'Error in MergedMeshMappings::add. Trying to add more than capacity.';
    }

    this.setTriangleOffset(triangleOffset, this.count);
    this.setTriangleCount(triangleCount, this.count);
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
    this.maxTreeIndex = Math.max(this.maxTreeIndex, value);
    this.treeIndex[index] = value;
  }

  private setTransform(source: THREE.Matrix4, index: number) {
    const columns = [0, 1, 2, 3].map(columnIndex => {
      // @ts-ignore
      const transform = this[`transform${columnIndex}`];
      return transform[this.count] = new Float32Array(3);
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
  geometry: null|THREE.Mesh;
  treeIndexMap: { [s: number]: number; };
  createdByInstancedMesh: boolean;
  constructor(capacity: number, fileId: number, createdByInstancedMesh: boolean = false) {
    this.mappings = new MergedMeshMappings(capacity);
    this.geometry = null;
    this.fileId = fileId;
    this.treeIndexMap = {};
    this.createdByInstancedMesh = createdByInstancedMesh;
  }
}

export class MergedMeshGroup extends GeometryGroup {
  meshes: MergedMesh[];
  constructor() {
    super();
    this.meshes = [];
    this.type = 'MergedMesh';
  }

  addMesh(mesh: MergedMesh) {
    this.meshes.push(mesh);
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix;
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    return box;
  }
}
