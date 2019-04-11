// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from './PrimitiveGroup';
import { xAxis, yAxis, zAxis } from '../constants';
import { FilterOptions } from '../parsers/parseUtils';
import GeometryGroupData from './GeometryGroupData';
import { computeEllipsoidBoundingBox } from './EllipsoidSegmentGroup';
import { colorProperties } from './GeometryGroupDataParameters';
import { GeometryType } from './Types';
import { angleBetweenVector3s } from '../parsers/protobuf/protobufUtils';

const globalBox = new THREE.Box3();
const normal = new THREE.Vector3();
const ringCenterA = new THREE.Vector3();
const ringCenterB = new THREE.Vector3();
const extA = new THREE.Vector3();
const extB = new THREE.Vector3();
const planeA = new THREE.Vector4();
const planeB = new THREE.Vector4();
const capNormalA = new THREE.Vector3();
const capNormalB = new THREE.Vector3();
const localXAxis = new THREE.Vector3();
const globalRotation = new THREE.Quaternion();
const globalSlicingPlaneNormal = new THREE.Vector3();

export default class GeneralCylinderGroup extends PrimitiveGroup {

  static slicingPlane(target: THREE.Vector4,
                      slope: number,
                      zAngle: number,
                      height: number,
                      invertNormal: boolean) {
    globalSlicingPlaneNormal
      .copy(zAxis)
      .applyAxisAngle(yAxis, slope)
      .applyAxisAngle(zAxis, zAngle);

    if (invertNormal) {
      globalSlicingPlaneNormal.negate();
    }

    target.set(
      globalSlicingPlaneNormal.x,
      globalSlicingPlaneNormal.y,
      globalSlicingPlaneNormal.z,
      height,
    );
  }

  public type: GeometryType;
  public data: GeometryGroupData;

  constructor(capacity: number) {
    super(capacity);
    this.type = 'GeneralCylinder';
    this.hasCustomTransformAttributes = true;
    this.data = new GeometryGroupData('GeneralCylinder', capacity, this.attributes);
  }

  add(
    nodeId: number,
    treeIndex: number,
    diagonalSize: number,
    centerA: THREE.Vector3,
    centerB: THREE.Vector3,
    radius: number,
    heightA: number,
    heightB: number,
    slopeA: number,
    slopeB: number,
    zAngleA: number,
    zAngleB: number,
    angle: number = 0,
    arcAngle: number = Math.PI * 2.0,
    filterOptions?: FilterOptions,
  ): boolean {

    normal.subVectors(centerA, centerB).normalize();
    globalRotation.setFromUnitVectors(zAxis, normal);

    // Calculate global plane (also used to calculate normal A and B)
    GeneralCylinderGroup.slicingPlane(
      planeA,
      slopeA,
      zAngleA,
      heightA,
      false);

    capNormalA.set(planeA.x, planeA.y, planeA.z).applyQuaternion(globalRotation);

    GeneralCylinderGroup.slicingPlane(
      planeB,
      slopeB,
      zAngleB,
      heightB,
      true);

    capNormalB.set(planeB.x, planeB.y, planeB.z).applyQuaternion(globalRotation);

    localXAxis.copy(xAxis).applyQuaternion(globalRotation);
    this.setTreeIndex(treeIndex, this.data.count);
    this.data.add({
      diagonalSize,
      centerA,
      centerB,
      radiusA: radius,
      heightA,
      heightB,
      slopeA,
      slopeB,
      zAngleA,
      zAngleB,
      angle,
      planeA,
      planeB,
      arcAngle,
      capNormalA,
      capNormalB,
      localXAxis,
    });

    return this.filterLastObject(nodeId, filterOptions);
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix;
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    box.makeEmpty();
    globalBox.makeEmpty();
    this.data.getVector3('centerA', extA, index);
    this.data.getVector3('centerB', extB, index);
    normal.copy(extA).sub(extB).normalize();

    const distFromAToExtA = this.data.getNumber('radiusA', index) * Math.tan(this.data.getNumber('slopeA', index));
    const distFromBToExtB = this.data.getNumber('radiusA', index) * Math.tan(this.data.getNumber('slopeB', index));
    ringCenterA.copy(normal).multiplyScalar(-distFromAToExtA).add(extA);
    ringCenterB.copy(normal).multiplyScalar(distFromBToExtB).add(extB);

    computeEllipsoidBoundingBox(
      ringCenterA,
      this.data.getVector3('capNormalA', capNormalA, index),
      this.data.getNumber('radiusA', index),
      this.data.getNumber('radiusA', index) / Math.abs(Math.cos(this.data.getNumber('slopeA', index))),
      0,
      matrix,
      globalBox,
    );

    box.union(globalBox);
    globalBox.makeEmpty();
    computeEllipsoidBoundingBox(
      ringCenterB,
      this.data.getVector3('capNormalB', capNormalB, index),
      this.data.getNumber('radiusA', index),
      this.data.getNumber('radiusA', index) / Math.abs(Math.cos(this.data.getNumber('slopeB', index))),
      0,
      matrix,
      globalBox,
    );
    box.union(globalBox);

    return box;
  }
}
