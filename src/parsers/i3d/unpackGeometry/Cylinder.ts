// Copyright 2019 Cognite AS

import PropertyLoader from '../PropertyLoader';
import * as THREE from 'three';
import { xAxis, yAxis, zAxis } from '../../../constants';
import { PrimitiveGroup, ConeGroup, GeneralCylinderGroup, TrapeziumGroup, CircleGroup, GeneralRingGroup }
  from '../../../geometry/GeometryGroups';
import { FilterOptions } from '../../parseUtils';

const globalCenterA = new THREE.Vector3();
const globalCenterB = new THREE.Vector3();
const globalExtA = new THREE.Vector3();
const globalExtB = new THREE.Vector3();
const globalSlicingPlaneNormal = new THREE.Vector3();
const globalVertex = new THREE.Vector3();
const globalRotation = new THREE.Quaternion();
const globalPlanes = [new THREE.Plane(), new THREE.Plane()];
const globalLine = new THREE.Line3();
const globalLineStart = new THREE.Vector3();
const globalLineEnd = new THREE.Vector3();
const globalVector = new THREE.Vector3();
const globalVertices = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

export function addClosedCylinder(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                                  filterOptions?: FilterOptions) {
  globalCenterA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  globalCenterB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  (groups.Cone as ConeGroup).add(data.nodeId, data.treeIndex, data.diagonalSize, globalCenterA, globalCenterB,
    data.radiusA, data.radiusA, 0, 2 * Math.PI, filterOptions);
  (groups.Circle as CircleGroup).add(
    data.nodeId, data.treeIndex, data.diagonalSize, globalCenterA, data.normal, data.radiusA, filterOptions);
  (groups.Circle as CircleGroup).add(
    data.nodeId, data.treeIndex, data.diagonalSize, globalCenterB, data.normal, data.radiusA, filterOptions);
}

export function addOpenCylinder(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                                filterOptions?: FilterOptions) {
  globalCenterA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  globalCenterB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  (groups.Cone as ConeGroup).add(data.nodeId, data.treeIndex, data.diagonalSize, globalCenterA, globalCenterB,
  data.radiusA, data.radiusA, 0, 2 * Math.PI, filterOptions);
}

function angleBetweenVector3s(v1: THREE.Vector3, v2: THREE.Vector3, up: THREE.Vector3): number {
  const angle = v1.angleTo(v2);
  const right = globalVector.copy(v1).cross(up);
  const moreThanPi = right.dot(v2) < 0;
  return normalizeRadians(moreThanPi ? 2 * Math.PI - angle : angle);
}

function normalizeRadians (angle: number, lowerBound = -Math.PI, upperBound = Math.PI): number {
  while (angle < lowerBound) {
    angle += 2 * Math.PI;
  }
  while (angle > upperBound) {
    angle -= 2 * Math.PI;
  }
  return angle;
}

export function addOpenGeneralCylinder(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                                       filterOptions?: FilterOptions) {
  globalCenterA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  globalCenterB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);

  const distFromAToExtA = data.radiusA * Math.tan(data.slopeA);
  const distFromBToExtB = data.radiusA * Math.tan(data.slopeB);
  const heightA = distFromBToExtB + data.height;
  const heightB = distFromBToExtB;
  globalExtA.copy(data.normal).multiplyScalar(distFromAToExtA).add(globalCenterA);
  globalExtB.copy(data.normal).multiplyScalar(-distFromBToExtB).add(globalCenterB);

  (groups.GeneralCylinder as GeneralCylinderGroup).add(
    data.nodeId, data.treeIndex, data.diagonalSize, globalExtA, globalExtB, data.radiusA, heightA,
    heightB, data.slopeA, data.slopeB, data.zAngleA, data.zAngleB, data.rotationAngle, data.arcAngle, filterOptions);
}

export function addClosedGeneralCylinder(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                                         filterOptions?: FilterOptions) {
  addOpenGeneralCylinder(groups, data, filterOptions);

  [true, false].forEach(isA => {
    const center = isA ? globalCenterA : globalCenterB;
    const slope = isA ? data.slopeA : data.slopeB;
    const zAngle = isA ? data.zAngleA : data.zAngleB;
    const radius = isA ? data.radiusA : data.radiusB;

    globalRotation.setFromUnitVectors(zAxis, data.normal);
    globalSlicingPlaneNormal.copy(zAxis)
      .applyAxisAngle(yAxis, slope).applyAxisAngle(zAxis, zAngle).applyQuaternion(globalRotation);

    const plane = globalPlanes[Number(Boolean(isA))];
    plane.setFromNormalAndCoplanarPoint(globalSlicingPlaneNormal, center);

    const capXAxis = xAxis.clone().applyAxisAngle(yAxis, slope).applyAxisAngle(zAxis, zAngle)
      .applyQuaternion(globalRotation).normalize();

    globalVertex.set(Math.cos(data.rotationAngle), Math.sin(data.rotationAngle), 0)
      .applyQuaternion(globalRotation).normalize();

    globalLineStart.copy(globalVertex).multiplyScalar(data.radiusA).add(globalExtB).sub(data.normal);
    globalLineEnd.copy(globalVertex).multiplyScalar(data.radiusA).add(globalExtA).add(data.normal);
    globalLine.set(globalLineStart, globalLineEnd);
    plane.intersectLine(globalLine, globalVertex);

    const capAngleAxis = globalVertex.sub(center).normalize();
    const capAngle = angleBetweenVector3s(capAngleAxis, capXAxis, globalSlicingPlaneNormal);

    (groups.GeneralRing as GeneralRingGroup).add(data.nodeId, data.treeIndex, data.diagonalSize,
      center, globalSlicingPlaneNormal,
      capXAxis, radius / Math.abs(Math.cos(slope)),
      radius, data.thickness, capAngle, data.arcAngle, filterOptions);
  });
}

export function addSolidOpenGeneralCylinder(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                                            filterOptions?: FilterOptions) {
    addClosedGeneralCylinder(groups, data, filterOptions);
    const distFromBToExtB = data.radiusA * Math.tan(data.slopeB);
    const heightA = distFromBToExtB + data.height;
    const heightB = distFromBToExtB;
    (groups.GeneralCylinder as GeneralCylinderGroup).add(data.nodeId, data.treeIndex, data.diagonalSize,
      globalExtA, globalExtB,
      data.radiusA - data.thickness, heightA, heightB, data.slopeA, data.slopeB, data.zAngleA,
      data.zAngleB, data.rotationAngle, data.arcAngle, filterOptions);
}

export function addSolidClosedGeneralCylinder(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                                              filterOptions?: FilterOptions) {
  addSolidOpenGeneralCylinder(groups, data, filterOptions);

  [false, true].forEach(isSecondQuad => {
    let vertexIndex = 0;
    const finalAngle = data.rotationAngle + Number(isSecondQuad) * data.arcAngle;
    const radii = !isSecondQuad
      ? [data.radiusA, data.radiusA - data.thickness]
      : [data.radiusA - data.thickness, data.radiusA];
    globalVertex
      .set(Math.cos(finalAngle), Math.sin(finalAngle), 0)
      .applyQuaternion(globalRotation)
      .normalize();
    radii.forEach(r => {
      globalLineStart
        .copy(globalVertex)
        .multiplyScalar(r)
        .add(globalExtB)
        .sub(data.normal);
      globalLineEnd
        .copy(globalVertex)
        .multiplyScalar(r)
        .add(globalExtA)
        .add(data.normal);
      globalLine.set(globalLineStart, globalLineEnd);
      globalPlanes.forEach(p => {
        p.intersectLine(globalLine, globalVertices[vertexIndex]);
        vertexIndex++;
      });
    });

    (groups.Trapezium as TrapeziumGroup).add(
      data.nodeId,
      data.treeIndex,
      data.diagonalSize,
      globalVertices[0],
      globalVertices[1],
      globalVertices[2],
      globalVertices[3],
      filterOptions);
  });
}
