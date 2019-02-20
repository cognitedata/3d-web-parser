import PropertyLoader from '../PropertyLoader';
import * as THREE from 'three';
import { xAxis, yAxis, zAxis } from './../../constants';
import { addOpenCone, addClosedCone } from './Cone';
import { truncate } from 'fs';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();
const extA = new THREE.Vector3();
const extB = new THREE.Vector3();

const axisRotation = new THREE.Quaternion();
const localXAxis = new THREE.Vector3();
const slicingPlaneNormal = new THREE.Vector3();
const globalVertex = new THREE.Vector3();
const rotation = new THREE.Quaternion();
const globalPlanes = [new THREE.Plane(), new THREE.Plane()];
const globalLine = new THREE.Line3();
const globalLineStart = new THREE.Vector3();
const globalLineEnd = new THREE.Vector3();
const globalVector = new THREE.Vector3();

const globalCapZAxis = new THREE.Vector3();
const globalCapXAxis = new THREE.Vector3();
const globalVertices = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

export function addClosedCylinder(groups: {[name: string]: any}, data: PropertyLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.Cone.add(data.nodeId, data.treeIndex, centerA, centerB,
    data.radiusA, data.radiusA, data.rotationAngle);
  groups.Circle.add(data.nodeId, data.treeIndex, centerA, data.normal, data.radiusA);
  groups.Circle.add(data.nodeId, data.treeIndex, centerB, data.normal, data.radiusA);
}

export function addOpenCylinder(groups: {[name: string]: any}, data: PropertyLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.Cone.add(data.nodeId, data.treeIndex, centerA, centerB,
  data.radiusA, data.radiusA, data.rotationAngle);
}

export function addOpenGeneralCylinder(groups: {[name: string]: any}, data: PropertyLoader) {
  if (data.radiusA !== data.radiusB) {
    drawHollowedCone(groups, data, false);
  } else {
    drawGeneralCylinders(groups, data, false);
  }
}

export function addClosedGeneralCylinder(groups: {[name: string]: any}, data: PropertyLoader) {
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

function normalizeRadians (angle: number, lowerBound = -Math.PI, upperBound = Math.PI): number {
  while (angle < lowerBound) {
    angle += 2 * Math.PI;
  }
  while (angle > upperBound) {
    angle -= 2 * Math.PI;
  }
  return angle;
}

function drawGeneralCylinders(groups: {[name: string]: any}, data: PropertyLoader, drawQuads: boolean) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);

  const distFromAToExtA = data.radiusA * Math.tan(data.slopeA);
  const distFromBToExtB = data.radiusA * Math.tan(data.slopeB);
  const heightA = distFromBToExtB + data.height;
  const heightB = distFromBToExtB;
  extA.copy(data.normal).multiplyScalar(distFromAToExtA).add(centerA);
  extB.copy(data.normal).multiplyScalar(-distFromBToExtB).add(centerB);

  groups.GeneralCylinder.add(data.nodeId, data.treeIndex, extA, extB, data.radiusA, heightA,
    heightB, data.slopeA, data.slopeB, data.zAngleA, data.zAngleB, data.rotationAngle, data.arcAngle);
  if ((data. thickness > 0) && (data. thickness !== data.radiusA)) {
    groups.GeneralCylinder.add(data.nodeId, data.treeIndex, extA, extB, data.radiusA - data.thickness,
      heightA, heightB, data.slopeA, data.slopeB, data.zAngleA, data.zAngleB, data.rotationAngle, data.arcAngle);
  }

  [true, false].forEach(isA => {
    const center = isA ? centerA : centerB;
    const slope = isA ? data.slopeA : data.slopeB;
    const zAngle = isA ? data.zAngleA : data.zAngleB;
    const radius = isA ? data.radiusA : data.radiusB;

    rotation.setFromUnitVectors(zAxis, data.normal);
    slicingPlaneNormal.copy(zAxis)
      .applyAxisAngle(yAxis, slope).applyAxisAngle(zAxis, zAngle).applyQuaternion(rotation);

    const plane = globalPlanes[Number(Boolean(isA))];
    plane.setFromNormalAndCoplanarPoint(slicingPlaneNormal, center);

    const capXAxis = xAxis.clone().applyAxisAngle(yAxis, slope).applyAxisAngle(zAxis, zAngle)
      .applyQuaternion(rotation).normalize();

    globalVertex.set(Math.cos(data.rotationAngle), Math.sin(data.rotationAngle), 0)
      .applyQuaternion(rotation).normalize();

    globalLineStart.copy(globalVertex).multiplyScalar(data.radiusA).add(extB).sub(data.normal);
    globalLineEnd.copy(globalVertex).multiplyScalar(data.radiusA).add(extA).add(data.normal);
    globalLine.set(globalLineStart, globalLineEnd);
    plane.intersectLine(globalLine, globalVertex);

    const capAngleAxis = globalVertex.sub(center).normalize();
    const capAngle = angleBetweenVector3s(capAngleAxis, capXAxis, slicingPlaneNormal);

    if (data.thickness > 0) {
      groups.GeneralRing.add(data.nodeId, data.treeIndex, center, slicingPlaneNormal,
        capXAxis, radius / Math.abs(Math.cos(slope)),
        radius, data.thickness, capAngle, data.arcAngle);
    }
  });

  if (drawQuads) {
    [false, true].forEach(isSecondQuad => {
      let vertexIndex = 0;
      const finalAngle = data.rotationAngle + Number(isSecondQuad) * data.arcAngle;
      const radii = !isSecondQuad
        ? [data.radiusA, data.radiusA - data.thickness]
        : [data.radiusA - data.thickness, data.radiusA];
      globalVertex
        .set(Math.cos(finalAngle), Math.sin(finalAngle), 0)
        .applyQuaternion(rotation)
        .normalize();
      radii.forEach(r => {
        globalLineStart
          .copy(globalVertex)
          .multiplyScalar(r)
          .add(extB)
          .sub(data.normal);
        globalLineEnd
          .copy(globalVertex)
          .multiplyScalar(r)
          .add(extA)
          .add(data.normal);
        globalLine.set(globalLineStart, globalLineEnd);
        globalPlanes.forEach(p => {
          p.intersectLine(globalLine, globalVertices[vertexIndex]);
          vertexIndex++;
        });
      });

      groups.Trapezium.add(
        data.nodeId,
        data.treeIndex,
        globalVertices[0],
        globalVertices[1],
        globalVertices[2],
        globalVertices[3]);
    });
  }
}

function drawHollowedCone(groups: {[name: string]: any}, data: PropertyLoader, drawQuads: boolean) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.Cone.add(data.nodeId, data.treeIndex, centerA, centerB, data.radiusA, data.radiusB,
    data.rotationAngle, data.arcAngle);
  groups.Cone.add(data.nodeId, data.treeIndex, centerA, centerB, data.radiusA - data.thickness,
    data.radiusB - data.thickness, data.rotationAngle, data.arcAngle);
  localXAxis.copy(xAxis).applyQuaternion(axisRotation.setFromUnitVectors(zAxis, data.normal));
  groups.GeneralRing.add(data.nodeId, data.treeIndex, centerA, data.normal,
    localXAxis, data.radiusA, data.radiusA, data.thickness,
    data.rotationAngle, data.arcAngle);
  groups.GeneralRing.add(data.nodeId, data.treeIndex, centerB, data.normal,
    localXAxis, data.radiusB, data.radiusB, data.thickness,
    data.rotationAngle, data.arcAngle);

  if (drawQuads) {
    globalCapZAxis.copy(centerA).sub(centerB);
    rotation.setFromUnitVectors(zAxis, globalCapZAxis.normalize());
    globalCapXAxis.copy(xAxis).applyQuaternion(rotation);

    [false, true].forEach(isSecondQuad => {
    const finalAngle = data.rotationAngle + Number(isSecondQuad) * data.arcAngle;
    globalVertex
      .set(Math.cos(finalAngle), Math.sin(finalAngle), 0)
      .applyQuaternion(rotation)
      .normalize();
    const vertices: THREE.Vector3[] = [];
    const offsets = [0, -data.thickness];
    [true, false].forEach(isA => {
      if (isSecondQuad) { isA = !isA; }
      const radius = isA ? data.radiusA : data.radiusB;
      const center = isA ? centerA : centerB;
      offsets.forEach(offset => {
        vertices.push(
          globalVertex
            .clone()
            .multiplyScalar(radius + offset)
            .add(center),
        );
      });
    });
    groups.Trapezium.add(
      data.nodeId,
      data.treeIndex,
      vertices[0],
      vertices[1],
      vertices[2],
      vertices[3]);
    });
  }
}
