import PropertyLoader from '../PropertyLoader';
import * as THREE from 'three';
import { xAxis, yAxis, zAxis } from './../../constants';
import { addOpenCone, addClosedCone } from './Cone';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();
const extA = new THREE.Vector3();
const extB = new THREE.Vector3();

const axisRotation = new THREE.Quaternion();
const localXAxis = new THREE.Vector3();
const slicingPlaneNormal = new THREE.Vector3();
const globalVertex = new THREE.Vector3();
const globalRotation = new THREE.Quaternion();
const globalPlanes = [new THREE.Plane(), new THREE.Plane()];
const globalLine = new THREE.Line3();
const globalLineStart = new THREE.Vector3();
const globalLineEnd = new THREE.Vector3();
const globalVector = new THREE.Vector3();

const vertex = new THREE.Vector3();
const vertex1 = new THREE.Vector3();
const vertex2 = new THREE.Vector3();
const vertex3 = new THREE.Vector3();

export function addClosedCylinder(groups: any, data: PropertyLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.Cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
    data.radiusA, data.radiusA, data.rotationAngle);
  groups.Circle.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal, data.radiusA);
  groups.Circle.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal, data.radiusA);
}

export function addOpenCylinder(groups: any, data: PropertyLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.Cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
  data.radiusA, data.radiusA, data.rotationAngle);
}

export function addOpenGeneralCylinder(groups: any, data: PropertyLoader) {
  if (data.radiusA !== data.radiusB) {
    drawHollowedCone(groups, data, false);
  } else {
    drawGeneralCylinders(groups, data, false);
  }
}

export function addClosedGeneralCylinder(groups: any, data: PropertyLoader) {
  if (data.radiusA !== data.radiusB) {
    drawHollowedCone(groups, data, true);
  } else {
    drawGeneralCylinders(groups, data, true);
  }
}

function angleBetweenVector3s(v1: THREE.Vector3, v2: THREE.Vector3, up: THREE.Vector3): number {
  const angle = v1.angleTo(v2);
  const right = globalVector.copy(v1).cross(up);
  const moreThanPi = right.dot(v2) < 0;
  return normalizeRadians(moreThanPi ? 2 * Math.PI - angle : angle);
}

export function normalizeRadians (angle: number, lowerBound = -Math.PI, upperBound = Math.PI): number {
  while (angle < lowerBound) {
    angle += 2 * Math.PI;
  }
  while (angle > upperBound) {
    angle -= 2 * Math.PI;
  }
  return angle;
}

function drawGeneralCylinders(groups: any, data: PropertyLoader, drawQuads: boolean) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);

  const distFromAToExtA = data.radiusA * Math.tan(data.slopeA);
  const distFromBToExtB = data.radiusA * Math.tan(data.slopeB);
  const heightA = distFromBToExtB + data.height;
  const heightB = distFromBToExtB;
  extA.copy(data.normal).multiplyScalar(distFromAToExtA).add(centerA);
  extB.copy(data.normal).multiplyScalar(-distFromBToExtB).add(centerB);

  groups.GeneralCylinder.add(data.nodeId, data.treeIndex, data.color, extA, extB, data.radiusA, heightA,
    heightB, data.slopeA, data.slopeB, data.zAngleA, data.zAngleB, data.rotationAngle, data.arcAngle);
  if ((data. thickness > 0) && (data. thickness !== data.radiusA)) {
    groups.GeneralCylinder.add(data.nodeId, data.treeIndex, data.color, extA, extB, data.radiusA - data.thickness,
      heightA, heightB, data.slopeA, data.slopeB, data.zAngleA, data.zAngleB, data.rotationAngle, data.arcAngle);
  }

  [true, false].forEach(isA => {
    const center = isA ? centerA : centerB;
    const slope = isA ? data.slopeA : data.slopeB;
    const zAngle = isA ? data.zAngleA : data.zAngleB;
    const radius = isA ? data.radiusA : data.radiusB;

    globalRotation.setFromUnitVectors(zAxis, data.normal);
    slicingPlaneNormal.copy(zAxis)
      .applyAxisAngle(yAxis, slope).applyAxisAngle(zAxis, zAngle).applyQuaternion(globalRotation);

    const plane = globalPlanes[Number(Boolean(isA))];
    plane.setFromNormalAndCoplanarPoint(slicingPlaneNormal, center);

    const capXAxis = xAxis.clone().applyAxisAngle(yAxis, slope).applyAxisAngle(zAxis, zAngle)
      .applyQuaternion(globalRotation).normalize();

    globalVertex.set(Math.cos(data.rotationAngle), Math.sin(data.rotationAngle), 0)
      .applyQuaternion(globalRotation).normalize();

    globalLineStart.copy(globalVertex).multiplyScalar(data.radiusA).add(extB).sub(data.normal);
    globalLineEnd.copy(globalVertex).multiplyScalar(data.radiusA).add(extA).add(data.normal);
    globalLine.set(globalLineStart, globalLineEnd);
    plane.intersectLine(globalLine, globalVertex);

    const capAngleAxis = globalVertex.sub(center).normalize();
    const capAngle = angleBetweenVector3s(capAngleAxis, capXAxis, slicingPlaneNormal);

    if (data.thickness > 0) {
      groups.GeneralRing.add(data.nodeId, data.treeIndex, data.color, center, slicingPlaneNormal,
        capXAxis, radius / Math.abs(Math.cos(slope)),
        radius, data.thickness, capAngle, data.arcAngle);
    }

    if (drawQuads) {
      // TODO
    }
  });
}

function drawHollowedCone(groups: any, data: PropertyLoader, drawQuads: boolean) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.Cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB, data.radiusA, data.radiusB,
    data.rotationAngle, data.arcAngle);
  groups.Cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB, data.radiusA - data.thickness,
    data.radiusB - data.thickness, data.rotationAngle, data.arcAngle);
  localXAxis.copy(xAxis).applyQuaternion(axisRotation.setFromUnitVectors(zAxis, data.normal));
  groups.GeneralRing.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal,
    localXAxis, data.radiusA, data.radiusA, data.thickness,
    data.rotationAngle, data.arcAngle);
  groups.GeneralRing.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal,
    localXAxis, data.radiusB, data.radiusB, data.thickness,
    data.rotationAngle, data.arcAngle);

  if (drawQuads) {
    // TODO
  }
}
