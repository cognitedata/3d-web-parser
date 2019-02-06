// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PlaneGroup from './PlaneGroup';
import { zAxis } from '../constants';
import { FilterOptions } from '../parsers/parseUtils';

// reusable variables
const firstRotation = new THREE.Quaternion();
const secondRotation = new THREE.Quaternion();
const fullMatrix = new THREE.Matrix4();
const globalNormal = new THREE.Vector3();
const globalDelta = new THREE.Vector3();
const globalCenter = new THREE.Vector3();
const globalPoint = new THREE.Vector3();

export default class BoxGroup extends PlaneGroup {
  public angle: Float32Array;
  public delta: Float32Array;
  constructor(capacity: number) {
    super(capacity);
    this.type = 'Box';
    this.hasCustomTransformAttributes = false;
    this.angle = new Float32Array(capacity);
    this.delta = new Float32Array(3 * capacity);
  }

  setAngle(value: number, index: number) {
    this.angle[index] = value;
  }

  getAngle(index: number): number {
    return this.angle[index];
  }

  setDelta(value: THREE.Vector3, index: number) {
    this.setVector(value, this.delta, index);
  }

  getDelta(target: THREE.Vector3, index: number): THREE.Vector3 {
    return this.getVector(this.delta, target, index);
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    angle: number,
    delta: THREE.Vector3,
    filterOptions?: FilterOptions,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenter(center, this.count);
    this.setNormal(normal, this.count);
    this.setAngle(angle, this.count);
    this.setDelta(delta, this.count);
    this.count += 1;

    if (filterOptions) {
      this.filterLastObject(filterOptions);
    }
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    firstRotation.setFromAxisAngle(zAxis, this.getAngle(index));
    secondRotation.setFromUnitVectors(zAxis, this.getNormal(globalNormal, index));
    const scale = this.getDelta(globalDelta, index);
    return outputMatrix.compose(
      this.getCenter(globalCenter, index),
      secondRotation.multiply(firstRotation), // A.multiply(B) === A*B
      scale,
    );
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    box.makeEmpty();
    this.computeModelMatrix(fullMatrix, index).premultiply(matrix);
    const coords = [-0.5, 0.5];
    coords.forEach(x =>
      coords.forEach(y =>
        coords.forEach(z =>
          box.expandByPoint(globalPoint.set(x, y, z).applyMatrix4(fullMatrix)),
        ),
      ),
    );

    return box;
  }
}
