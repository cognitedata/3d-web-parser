import * as THREE from 'three';
import BaseCylinderGroup from './BaseCylinderGroup';

export default class EccentricConeGroup extends BaseCylinderGroup {
    static type = 'EccentricCone';
    public radiusA: Float32Array;
    public radiusB: Float32Array;
    public normal: Float32Array;
    public isClosed: Uint8Array;
  constructor(capacity: number) {
    super(capacity);
    this.radiusA = new Float32Array(capacity);
    this.radiusB = new Float32Array(capacity);
    this.isClosed = new Uint8Array(capacity);
    this.normal = new Float32Array(3 * capacity);
  }

  setRadiusA(value: number, index: number) {
    this.radiusA[index] = value;
  }

  getRadiusA(index: number): number {
    return this.radiusA[index];
  }

  setRadiusB(value: number, index: number) {
    this.radiusB[index] = value;
  }

  getRadiusB(index: number): number {
    return this.radiusB[index];
  }

  setIsClosed(value: boolean, index: number) {
    this.isClosed[index] = value ? 1 : 0;
  }

  getIsClosed(index: number): boolean {
    return this.isClosed[index] === 1 ? true : false;
  }

  setNormal(source: THREE.Vector3, index: number) {
    this.setVector(source, this.normal, index);
  }

  getNormal(target: THREE.Vector3, index: number) {
    return this.getVector(this.normal, target, index);
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    centerA: THREE.Vector3,
    centerB: THREE.Vector3,
    radiusA: number,
    radiusB: number,
    normal: THREE.Vector3,
    isClosed: boolean,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setVector(centerA, this.centerA, this.count);
    this.setVector(centerB, this.centerB, this.count);
    this.setRadiusA(radiusA, this.count);
    this.setRadiusB(radiusB, this.count);
    this.setNormal(normal, this.count);
    this.setIsClosed(isClosed, this.count);

    this.count += 1;
  }
}
