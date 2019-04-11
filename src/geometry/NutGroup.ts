// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from './PrimitiveGroup';
import { zAxis } from './../constants';
import { FilterOptions } from '../parsers/parseUtils';
import GeometryGroupData from './GeometryGroupData';
import { GeometryType } from './Types';
import { colorProperties } from './GeometryGroupDataParameters';

// reusable variables
const firstRotation = new THREE.Quaternion();
const secondRotation = new THREE.Quaternion();
const fullMatrix = new THREE.Matrix4();

const globalNormal = new THREE.Vector3();
const globalScale = new THREE.Vector3();
const globalCenter = new THREE.Vector3();
const globalCenterA = new THREE.Vector3();
const globalCenterB = new THREE.Vector3();
const globalPoint = new THREE.Vector3();

export default class NutGroup extends PrimitiveGroup {
  public type: GeometryType;
  public data: GeometryGroupData;

  constructor(capacity: number) {
    super(capacity);
    this.type = 'Nut';
    this.data = new GeometryGroupData('Nut', capacity, this.attributes);
  }

  add(
    nodeId: number,
    treeIndex: number,
    diagonalSize: number,
    centerA: THREE.Vector3,
    centerB: THREE.Vector3,
    radius: number,
    rotationAngle: number,
    filterOptions?: FilterOptions,
  ): boolean {
    this.setTreeIndex(treeIndex, this.data.count);
    this.data.add({
      diagonalSize,
      centerA,
      centerB,
      radiusA: radius,
      rotationAngle,
    });

    return this.filterLastObject(nodeId, filterOptions);
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    this.data.getVector3('centerA', globalCenterA, index);
    this.data.getVector3('centerB', globalCenterB, index);
    globalCenter.addVectors(globalCenterA, globalCenterB).multiplyScalar(0.5);
    globalNormal.subVectors(globalCenterA, globalCenterB);
    const height = globalNormal.length();
    firstRotation.setFromAxisAngle(zAxis, this.data.getNumber('rotationAngle', index));
    secondRotation.setFromUnitVectors(zAxis, globalNormal.normalize());

    const diameter = 2 * this.data.getNumber('radiusA', index);
    globalScale.set(diameter, diameter, height);
    return outputMatrix.compose(
      globalCenter,
      secondRotation.multiply(firstRotation),
      globalScale,
    );
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    box.makeEmpty();
    this.computeModelMatrix(fullMatrix, index).premultiply(matrix);
    let angle = this.data.getNumber('rotationAngle', index) + Math.PI / 6;

    for (let i = 0; i < 6; i++, angle += Math.PI / 3) {
      const sin = 0.5 * Math.sin(angle);
      const cos = 0.5 * Math.cos(angle);
      globalPoint.set(sin, cos, 0.5).applyMatrix4(fullMatrix);
      box.expandByPoint(globalPoint);
      globalPoint.set(sin, cos, -0.5).applyMatrix4(fullMatrix);
      box.expandByPoint(globalPoint);
    }

    return box;
  }
}
