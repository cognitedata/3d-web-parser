import * as THREE from 'three';
import GeneralRingGroup from '../geometry/GeneralRingGroup';
import GeneralCylinderGroup from '../geometry/GeneralCylinderGroup';
import { MatchingGeometries,
         parsePrimitiveColor,
         parsePrimitiveNodeId,
         parsePrimitiveTreeIndex,
         getPrimitiveType,
         isPrimitive,
         angleBetweenVector3s } from './parseUtils';
import { xAxis, yAxis, zAxis } from '../constants';

const globalColor = new THREE.Color();
const globalCenter = new THREE.Vector3();
const globalCenterA = new THREE.Vector3();
const globalCenterB = new THREE.Vector3();
const globalCapZAxis = new THREE.Vector3();
const globalCapXAxis = new THREE.Vector3();
const globalNormal = new THREE.Vector3();
const globalLocalXAxis = new THREE.Vector3();
const globalSlicingPlane = new THREE.Vector4();
const globalAxis = new THREE.Vector3();
const globalVertex = new THREE.Vector3();
const globalRotation = new THREE.Quaternion();
const globalPlanes = [new THREE.Plane(), new THREE.Plane()];
const globalExtA = new THREE.Vector3();
const globalExtB = new THREE.Vector3();
const globalLine = new THREE.Line3();
const globalLineStart = new THREE.Vector3();
const globalLineEnd = new THREE.Vector3();

function findMatchingGeometries(geometries: any[]): MatchingGeometries {
  const matchingGeometries: MatchingGeometries = {
    count: 0,
    geometries: [],
  };

  geometries.forEach(geometry => {
    if (!isPrimitive(geometry)) {
      return;
    }
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const { thickness = 0 } = primitiveInfo;

    if (geometry.type === 'ring') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    } else if (geometry.type === 'extrudedRing'
            || geometry.type === 'extrudedRingSegment'
            || geometry.type === 'generalCylinder'
            || geometry.type === 'cone' && thickness > 0) {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 2;
    }
  });

  return matchingGeometries;
}

function parseRing(primitiveInfo: any,
                   nodeId: number,
                   treeIndex: number,
                   color: THREE.Color,
                   group: GeneralRingGroup) {

  let { x = 0, y = 0, z = 0 } = primitiveInfo.center;
  globalCenter.set(x, y, z);

  ({ x = 0, y = 0, z = 0 } = primitiveInfo.normal);
  globalNormal.set(x, y, z);
  const { innerRadius, outerRadius } = primitiveInfo;

  globalLocalXAxis.copy(xAxis).applyQuaternion(globalRotation.setFromUnitVectors(zAxis, globalNormal)),
  group.add(nodeId,
            treeIndex,
            color,
            globalCenter,
            globalNormal,
            globalLocalXAxis,
            outerRadius,
            outerRadius,
            outerRadius - innerRadius,
            );
}

function parseCone(primitiveInfo: any,
                   nodeId: number,
                   treeIndex: number,
                   color: THREE.Color,
                   group: GeneralRingGroup) {
  let { x = 0, y = 0, z = 0 } = primitiveInfo.centerA;
  globalCenterA.set(x, y, z);

  ({ x = 0, y = 0, z = 0 } = primitiveInfo.centerB);
  globalCenterB.set(x, y, z);

  globalCapZAxis.copy(globalCenterA).sub(globalCenterB);
  globalRotation.setFromUnitVectors(zAxis, globalCapZAxis.normalize());
  globalCapXAxis.copy(xAxis).applyQuaternion(globalRotation);
  const {
    angle = 0,
    arcAngle = 2 * Math.PI,
    radiusA,
    radiusB,
    thickness = 0,
  } = primitiveInfo;

  group.add(nodeId, treeIndex, color, globalCenterA,
            globalCapZAxis, globalCapXAxis, radiusA,
            radiusA, thickness, angle, arcAngle);
  group.add(nodeId, treeIndex, color, globalCenterB,
            globalCapZAxis, globalCapXAxis, radiusB,
            radiusB, thickness, angle, arcAngle);
}

function parseExtrudedRing(primitiveInfo: any,
                           nodeId: number,
                           treeIndex: number,
                           color: THREE.Color,
                           group: GeneralRingGroup) {
  const {
    angle = 0,
    arcAngle = 2 * Math.PI,
    innerRadius,
    outerRadius,
  } = primitiveInfo;

  let { x = 0, y = 0, z = 0 } = primitiveInfo.centerA;
  globalCenterA.set(x, y, z);

  ({ x = 0, y = 0, z = 0 } = primitiveInfo.centerB);
  globalCenterB.set(x, y, z);

  globalNormal.copy(globalCenterA).sub(globalCenterB).normalize();
  globalRotation.setFromUnitVectors(zAxis, globalNormal);
  globalCapXAxis.copy(xAxis).applyQuaternion(globalRotation);

  group.add(nodeId,
            treeIndex,
            color,
            globalCenterA,
            globalNormal,
            globalCapXAxis,
            outerRadius,
            outerRadius,
            outerRadius - innerRadius,
            angle,
            arcAngle);
  group.add(nodeId,
              treeIndex,
              color,
              globalCenterB,
              globalNormal,
              globalCapXAxis,
              outerRadius,
              outerRadius,
              outerRadius - innerRadius,
              angle,
              arcAngle);
}

function parseGeneralCylinder(primitiveInfo: any,
                              nodeId: number,
                              treeIndex: number,
                              color: THREE.Color,
                              group: GeneralRingGroup) {
  //
  const {
    radiusA,
    radiusB,
    angle = 0,
    arcAngle = 2.0 * Math.PI,
    slopeA = 0,
    slopeB = 0,
    zAngleA = 0,
    zAngleB = 0,
    isClosed = false,
  } = primitiveInfo;
  const thickness = primitiveInfo.thickness || (isClosed ? radiusA : 0);

  let { x = 0, y = 0, z = 0 } = primitiveInfo.centerA;
  globalCenterA.set(x, y, z);

  ({ x = 0, y = 0, z = 0 } = primitiveInfo.centerB);
  globalCenterB.set(x, y, z);

  globalAxis.subVectors(globalCenterA, globalCenterB);
  const distFromBToA = globalAxis.length();
  globalRotation.setFromUnitVectors(zAxis, globalAxis.normalize());

  const distFromAToExtA = radiusA * Math.tan(slopeA);
  const distFromBToExtB = radiusA * Math.tan(slopeB);
  const heightA = distFromBToExtB + distFromBToA;
  const heightB = distFromBToExtB;

  ['A', 'B'].forEach(key => {
    const isA = key === 'A';
    const center = isA ? globalCenterA : globalCenterB;
    const slope = isA ? slopeA : slopeB;
    const zAngle = isA ? zAngleA : zAngleB;
    const height = isA ? heightA : heightB;

    globalExtA.copy(globalAxis)
      .multiplyScalar(distFromAToExtA)
      .add(globalCenterA);
    globalExtB.copy(globalAxis)
      .multiplyScalar(-distFromBToExtB)
      .add(globalCenterB);

    const invertNormal = !isA;
    GeneralCylinderGroup.slicingPlane(globalSlicingPlane, slope, zAngle, height, invertNormal);
    if (invertNormal) { globalSlicingPlane.negate(); }

    const normal = new THREE.Vector3(
      globalSlicingPlane.x,
      globalSlicingPlane.y,
      globalSlicingPlane.z,
    ).applyQuaternion(globalRotation);

    const plane = globalPlanes[Number(Boolean(isA))];
    plane.setFromNormalAndCoplanarPoint(normal, center);

    const capXAxis = xAxis
      .clone()
      .applyAxisAngle(yAxis, slope)
      .applyAxisAngle(zAxis, zAngle)
      .applyQuaternion(globalRotation)
      .normalize();

    globalVertex
      .set(Math.cos(angle), Math.sin(angle), 0)
      .applyQuaternion(globalRotation)
      .normalize();

    globalLineStart
      .copy(globalVertex)
      .multiplyScalar(radiusA)
      .add(globalExtB)
      .sub(globalAxis);
    globalLineEnd
      .copy(globalVertex)
      .multiplyScalar(radiusA)
      .add(globalExtA)
      .add(globalAxis);

    globalLine.set(globalLineStart, globalLineEnd);
    plane.intersectLine(globalLine, globalVertex);

    const capAngleAxis = globalVertex.sub(center).normalize();
    const capAngle = angleBetweenVector3s(capAngleAxis, capXAxis, normal);

    if (thickness > 0) {
      group.add(nodeId, treeIndex, color, center, normal,
                capXAxis, radiusA / Math.abs(Math.cos(slope)),
                radiusA, thickness, capAngle, arcAngle);
    }
  });
}

export default function parse(geometries: any[]): GeneralRingGroup {
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = new GeneralRingGroup(matchingGeometries.count);

  matchingGeometries.geometries.forEach(geometry => {
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    globalColor.setHex(parsePrimitiveColor(geometry));

    if (geometry.type === 'ring') {
      parseRing(primitiveInfo, nodeId, treeIndex, globalColor, group);
    } else if (geometry.type === 'cone') {
      parseCone(primitiveInfo, nodeId, treeIndex, globalColor, group);
    } else if (geometry.type === 'extrudedRing' || geometry.type === 'extrudedRingSegment') {
      parseExtrudedRing(primitiveInfo, nodeId, treeIndex, globalColor, group);
    } else if (geometry.type === 'generalCylinder') {
      parseGeneralCylinder(primitiveInfo, nodeId, treeIndex, globalColor, group);
    }
  });
  return group;
}
