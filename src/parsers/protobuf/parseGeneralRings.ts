import * as THREE from 'three';
import GeneralRingGroup from '../../geometry/GeneralRingGroup';
import GeneralCylinderGroup from '../../geometry/GeneralCylinderGroup';
import { PrimitiveGroupMap } from '../../geometry/PrimitiveGroup';
import { MatchingGeometries,
         parsePrimitiveColor,
         parsePrimitiveNodeId,
         parsePrimitiveTreeIndex,
         getPrimitiveType,
         isPrimitive,
         angleBetweenVector3s,
         normalizeRadians} from './protobufUtils';
import { ParseData, FilterOptions } from '../parseUtils';
import { xAxis, yAxis, zAxis } from '../../constants';

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
                   group: GeneralRingGroup,
                   filterOptions?: FilterOptions): boolean {

  let { x = 0, y = 0, z = 0 } = primitiveInfo.center;
  globalCenter.set(x, y, z);

  ({ x = 0, y = 0, z = 0 } = primitiveInfo.normal);
  globalNormal.set(x, y, z);
  const { innerRadius, outerRadius } = primitiveInfo;

  globalLocalXAxis.copy(xAxis).applyQuaternion(globalRotation.setFromUnitVectors(zAxis, globalNormal));
  return group.add(nodeId,
            treeIndex,
            globalCenter,
            globalNormal,
            globalLocalXAxis,
            outerRadius,
            outerRadius,
            outerRadius - innerRadius,
            0,
            2 * Math.PI,
            filterOptions,
            );
}

function parseCone(primitiveInfo: any,
                   nodeId: number,
                   treeIndex: number,
                   group: GeneralRingGroup,
                   filterOptions?: FilterOptions): boolean {
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

  let added = group.add(nodeId, treeIndex, globalCenterA,
            globalCapZAxis, globalCapXAxis, radiusA,
            radiusA, thickness, angle, arcAngle, filterOptions);
  added = group.add(nodeId, treeIndex, globalCenterB,
            globalCapZAxis, globalCapXAxis, radiusB,
            radiusB, thickness, angle, arcAngle, filterOptions) || added;

  return added;
}

function parseExtrudedRing(primitiveInfo: any,
                           nodeId: number,
                           treeIndex: number,
                           group: GeneralRingGroup,
                           filterOptions?: FilterOptions): boolean {
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

  let added = group.add(nodeId,
            treeIndex,
            globalCenterA,
            globalNormal,
            globalCapXAxis,
            outerRadius,
            outerRadius,
            outerRadius - innerRadius,
            angle,
            arcAngle,
            filterOptions);
  added = group.add(nodeId,
              treeIndex,
              globalCenterB,
              globalNormal,
              globalCapXAxis,
              outerRadius,
              outerRadius,
              outerRadius - innerRadius,
              angle,
              arcAngle,
              filterOptions) || added;
  return added;
}

function parseGeneralCylinder(primitiveInfo: any,
                              nodeId: number,
                              treeIndex: number,
                              group: GeneralRingGroup,
                              filterOptions?: FilterOptions): boolean {
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
  let added = false;

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

  globalExtA.copy(globalAxis)
      .multiplyScalar(distFromAToExtA)
      .add(globalCenterA);
  globalExtB.copy(globalAxis)
      .multiplyScalar(-distFromBToExtB)
      .add(globalCenterB);

  [true, false].forEach(isA => {
    const center = isA ? globalCenterA : globalCenterB;
    const slope = isA ? slopeA : slopeB;
    const zAngle = isA ? zAngleA : zAngleB;
    const height = isA ? heightA : heightB;
    const radius = isA ? radiusA : radiusB;

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
      added = group.add(nodeId, treeIndex, center, normal,
                capXAxis, radius / Math.abs(Math.cos(slope)),
                radius, thickness, normalizeRadians(capAngle), arcAngle, filterOptions) || added;
    }
  });

  return added;
}

function createNewGroupIfNeeded(primitiveGroupMap: PrimitiveGroupMap, minimumRequiredCapacity: number) {
  if (
    primitiveGroupMap.GeneralRing.group.data.count + minimumRequiredCapacity
    > primitiveGroupMap.GeneralRing.group.capacity) {
      const capacity = Math.max(minimumRequiredCapacity, primitiveGroupMap.GeneralRing.capacity);
      primitiveGroupMap.GeneralRing.group = new GeneralRingGroup(capacity);
      return true;
  }
  return false;
}

export default function parse(args: ParseData): boolean {
  const { geometries, primitiveGroupMap, filterOptions, treeIndexNodeIdMap, colorMap } = args;
  const matchingGeometries = findMatchingGeometries(geometries);
  const didCreateNewGroup = createNewGroupIfNeeded(primitiveGroupMap, matchingGeometries.count);
  const group = primitiveGroupMap.GeneralRing.group;

  matchingGeometries.geometries.forEach(geometry => {
    let added = false;
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    globalColor.setHex(parsePrimitiveColor(geometry));

    if (geometry.type === 'ring') {
      added = parseRing(primitiveInfo, nodeId, treeIndex, group, filterOptions);
    } else if (geometry.type === 'cone') {
      added = parseCone(primitiveInfo, nodeId, treeIndex, group, filterOptions);
    } else if (geometry.type === 'extrudedRing' || geometry.type === 'extrudedRingSegment') {
      added = parseExtrudedRing(primitiveInfo, nodeId, treeIndex, group, filterOptions);
    } else if (geometry.type === 'generalCylinder') {
      added = parseGeneralCylinder(primitiveInfo, nodeId, treeIndex, group, filterOptions);
    }

    if (added) {
      treeIndexNodeIdMap[treeIndex] = nodeId;
      colorMap[treeIndex] = globalColor.clone();
    }
  });
  return didCreateNewGroup;
}
