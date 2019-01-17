import * as THREE from 'three';
import GeometryGroup from './GeometryGroup';

type TypedArray = Float32Array | Float64Array;
type THREEVector = THREE.Vector2 | THREE.Vector3;

export default abstract class PrimitiveGroup extends GeometryGroup {
  static type: string;

  count: number;
  capacity: number;
  nodeId: Float64Array;
  treeIndex: Float32Array;
  color: Float32Array;
  hasCustomTransformAttributes: boolean;
  // _parents: BasePrimitive[];
  // _children: BasePrimitive[];
  // abstract: boolean;
  constructor(capacity: number) {
    super();
    this.count = 0;
    this.capacity = capacity;

    this.nodeId = new Float64Array(this.capacity);
    this.treeIndex = new Float32Array(this.capacity);
    this.color = new Float32Array(3 * this.capacity);
    // this._parent = null;
    // this._children = [];
    // this.abstract = false;
    this.hasCustomTransformAttributes = false;
  }

  setVector<T extends TypedArray, U extends THREEVector>(
    source: U,
    target: T,
    index: number,
  ) {
    // @ts-ignore
    if (source.isVector2) {
      target[2 * index + 0] = source.x;
      target[2 * index + 1] = source.y;
      // @ts-ignore
    } else if (source.isVector3) {
      target[3 * index + 0] = source.x;
      target[3 * index + 1] = source.y;
      // @ts-ignore
      target[3 * index + 2] = source.z;
    }
  }

  getVector<T extends TypedArray, U extends THREEVector>(
    array: T,
    target: U,
    index: number,
  ): U {
    // @ts-ignore
    if (target.isVector2) {
      // @ts-ignore
      target.set(
        array[2 * index + 0],
        array[2 * index + 1],
        array[2 * index + 2],
      );
      // @ts-ignore
    } else if (target.isVector3) {
      // @ts-ignore
      target.set(
        array[3 * index + 0],
        array[3 * index + 1],
        array[3 * index + 2],
      );
    }

    return target;
  }

  setColor(source: THREE.Color, index: number) {
    this.color[3 * index + 0] = source.r;
    this.color[3 * index + 1] = source.g;
    this.color[3 * index + 2] = source.b;
  }

  getColor(target: THREE.Color, index: number): THREE.Color {
    target.setRGB(
      this.color[3 * index + 0],
      this.color[3 * index + 1],
      this.color[3 * index + 2],
    );
    return target;
  }

  setNodeId(nodeId: number, index: number) {
    this.nodeId[index] = nodeId;
  }

  setTreeIndex(treeIndex: number, index: number) {
    this.treeIndex[index] = treeIndex;
  }

  getNodeId(index: number): number {
    return this.nodeId[index];
  }

  getTreeIndex(index: number): number {
    return this.treeIndex[index];
  }
}
