import * as THREE from 'three';

// NodeMapping = {
//   properties: [
//     transformMatrix: number[] (12 numbers),
//     color: { rgb: number },
//     nodeId: number,
//     treeIndex: number,
//   ],
//   triangleCount:  ? ?  ,
// };

export class NodeMappings {
  public count: number;
  public capacity: number;
  public triangleCounts: Uint32Array;
  public color: Float32Array;
  public nodeId: Float64Array;
  public treeIndex: Float32Array;

  // The transformX arrays contain contain transformation matrix
  public transform0: Float32Array[];
  public transform1: Float32Array[];
  public transform2: Float32Array[];
  public transform3: Float32Array[];
  constructor(capacity: number) {
    this.count = 0;
    this.capacity = capacity;
    this.triangleCounts = new Uint32Array(this.capacity);
    this.color = new Float32Array(3 * this.capacity);
    this.nodeId = new Float64Array(this.capacity);
    this.treeIndex = new Float32Array(this.capacity);

    this.transform0 = []; this.transform0.length = capacity;
    this.transform1 = []; this.transform1.length = capacity;
    this.transform2 = []; this.transform2.length = capacity;
    this.transform3 = []; this.transform3.length = capacity;
  }

  public add(
    triangleCount: number,
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    transformMatrix?: THREE.Matrix4,
  ) {
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

  private setColor(source: THREE.Color, index: number) {
    let nextIndex = 3 * index;
    this.color[nextIndex++] = source.r;
    this.color[nextIndex++] = source.g;
    this.color[nextIndex++] = source.b;
  }

  private setTriangleCount(value: number, index: number) {
    this.triangleCounts[index] = value;
  }

  private setNodeId(value: number, index: number) {
    this.nodeId[index] = value;
  }

  private setTreeIndex(value: number, index: number) {
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

export default class MeshGroup {
  public type: string;
  constructor(capacity: number) {
    this.type = 'Mesh';
  }
}

// NormalMesh = {
//   file: [ { type: 'ctm', fileId: number } ],
//   type: 'triangleMesh',
//   nodes: [ NodeMapping ],
// };

// InstancedMesh = {
//   file: [ { type: 'ctm', fileId: number } ],
//   type: 'triangleMesh',
//   isInstanced: true,
//   nodes: [ NodeMapping ],
// };
