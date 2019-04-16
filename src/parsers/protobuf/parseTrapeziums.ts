// Copyright 2019 Cognite AS

import * as THREE from 'three';
import TrapeziumGroup from '../../geometry/TrapeziumGroup';
import { PrimitiveGroupMap } from '../../geometry/PrimitiveGroup';
import GeneralCylinderGroup from '../../geometry/GeneralCylinderGroup';
import {
  MatchingGeometries,
  parsePrimitiveColor,
  parsePrimitiveNodeId,
  parsePrimitiveTreeIndex,
  getPrimitiveType,
  isPrimitive
} from './protobufUtils';
import { ParseData, FilterOptions } from '../parseUtils';
import { xAxis, zAxis } from '../../constants';

const globalColor = new THREE.Color();
const globalCenterA = new THREE.Vector3();
const globalCenterB = new THREE.Vector3();
const globalCapZAxis = new THREE.Vector3();
const globalCapXAxis = new THREE.Vector3();
const globalVertex = new THREE.Vector3();
const globalSlicingPlane = new THREE.Vector4();
const globalAxis = new THREE.Vector3();
const globalNormal = new THREE.Vector3();
const globalLocalXAxis = new THREE.Vector3();
const globalRotation = new THREE.Quaternion();
const globalLine = new THREE.Line3();
const globalLineStart = new THREE.Vector3();
const globalLineEnd = new THREE.Vector3();
const globalExtA = new THREE.Vector3();
const globalExtB = new THREE.Vector3();
const globalPlanes = [new THREE.Plane(), new THREE.Plane()];
const globalVertices = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

function findMatchingGeometries(geometries: any[]): MatchingGeometries {
  const matchingGeometries: MatchingGeometries = {
    count: 0,
    geometries: []
  };

  geometries.forEach(geometry => {
    if (!isPrimitive(geometry)) {
      return;
    }

    const { thickness = 0, arcAngle = 2 * Math.PI, isClosed = false } = geometry.primitiveInfo[
      getPrimitiveType(geometry.primitiveInfo)
    ];
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    if (
      (geometry.type === 'cone' || geometry.type === 'generalCylinder') &&
      thickness > 0 &&
      arcAngle < 2 * Math.PI &&
      isClosed
    ) {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 2;
    }
  });

  return matchingGeometries;
}

function parseCone(
  primitiveInfo: any,
  nodeId: number,
  treeIndex: number,
  group: TrapeziumGroup,
  filterOptions?: FilterOptions
) {
  let added = false;
  let { x = 0, y = 0, z = 0 } = primitiveInfo.centerA;
  globalCenterA.set(x, y, z);

  ({ x = 0, y = 0, z = 0 } = primitiveInfo.centerB);
  globalCenterB.set(x, y, z);

  globalCapZAxis.copy(globalCenterA).sub(globalCenterB);
  globalRotation.setFromUnitVectors(zAxis, globalCapZAxis.normalize());
  globalCapXAxis.copy(xAxis).applyQuaternion(globalRotation);
  const { angle = 0, arcAngle, radiusA, radiusB, thickness = 0 } = primitiveInfo;

  [false, true].forEach(isSecondQuad => {
    const finalAngle = angle + Number(isSecondQuad) * arcAngle;
    globalVertex
      .set(Math.cos(finalAngle), Math.sin(finalAngle), 0)
      .applyQuaternion(globalRotation)
      .normalize();
    const vertices: THREE.Vector3[] = [];
    const offsets = [0, -thickness];
    [true, false].forEach(isA => {
      if (isSecondQuad) {
        isA = !isA;
      }
      const radius = isA ? radiusA : radiusB;
      const center = isA ? globalCenterA : globalCenterB;
      offsets.forEach(offset => {
        vertices.push(
          globalVertex
            .clone()
            .multiplyScalar(radius + offset)
            .add(center)
        );
      });
    });
    const size = (vertices[0].distanceTo(vertices[2]) + vertices[1].distanceTo(vertices[3])) / 2;
    added =
      group.add(nodeId, treeIndex, size, vertices[0], vertices[1], vertices[2], vertices[3], filterOptions) || added;
  });
  return added;
}

function parseGeneralCylinder(
  primitiveInfo: any,
  nodeId: number,
  treeIndex: number,
  group: TrapeziumGroup,
  filterOptions?: FilterOptions
) {
  let added = false;
  //
  const {
    radiusA,
    radiusB,
    angle = 0,
    thickness = 0,
    slopeA = 0,
    slopeB = 0,
    zAngleA = 0,
    zAngleB = 0,
    arcAngle = 2 * Math.PI,
    isClosed = false
  } = primitiveInfo;

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

  globalExtA
    .copy(globalAxis)
    .multiplyScalar(distFromAToExtA)
    .add(globalCenterA);
  globalExtB
    .copy(globalAxis)
    .multiplyScalar(-distFromBToExtB)
    .add(globalCenterB);

  [true, false].forEach(isA => {
    const center = isA ? globalCenterA : globalCenterB;
    const slope = isA ? slopeA : slopeB;
    const zAngle = isA ? zAngleA : zAngleB;
    const height = isA ? heightA : heightB;

    const invertNormal = !isA;
    GeneralCylinderGroup.slicingPlane(globalSlicingPlane, slope, zAngle, height, invertNormal);
    if (invertNormal) {
      globalSlicingPlane.negate();
    }
    globalNormal.set(globalSlicingPlane.x, globalSlicingPlane.y, globalSlicingPlane.z).applyQuaternion(globalRotation);

    const plane = globalPlanes[Number(Boolean(isA))];
    plane.setFromNormalAndCoplanarPoint(globalNormal, center);
  });

  [false, true].forEach(isSecondQuad => {
    let vertexIndex = 0;
    const finalAngle = angle + Number(isSecondQuad) * arcAngle;
    const radii = !isSecondQuad ? [radiusA, radiusA - thickness] : [radiusA - thickness, radiusA];
    globalVertex
      .set(Math.cos(finalAngle), Math.sin(finalAngle), 0)
      .applyQuaternion(globalRotation)
      .normalize();
    radii.forEach(radius => {
      globalLineStart
        .copy(globalVertex)
        .multiplyScalar(radius)
        .add(globalExtB)
        .sub(globalAxis);
      globalLineEnd
        .copy(globalVertex)
        .multiplyScalar(radius)
        .add(globalExtA)
        .add(globalAxis);
      globalLine.set(globalLineStart, globalLineEnd);
      globalPlanes.forEach(plane => {
        plane.intersectLine(globalLine, globalVertices[vertexIndex]);
        vertexIndex++;
      });
    });

    const size =
      (globalVertices[0].distanceTo(globalVertices[2]) + globalVertices[1].distanceTo(globalVertices[3])) / 2;

    added =
      group.add(
        nodeId,
        treeIndex,
        size,
        globalVertices[0],
        globalVertices[1],
        globalVertices[2],
        globalVertices[3],
        filterOptions
      ) || added;
  });

  return added;
}

function createNewGroupIfNeeded(primitiveGroupMap: PrimitiveGroupMap, minimumRequiredCapacity: number) {
  if (
    primitiveGroupMap.Trapezium.group.data.count + minimumRequiredCapacity >
    primitiveGroupMap.Trapezium.group.capacity
  ) {
    const capacity = Math.max(minimumRequiredCapacity, primitiveGroupMap.Trapezium.capacity);
    primitiveGroupMap.Trapezium.group = new TrapeziumGroup(capacity);
    return true;
  }
  return false;
}

export default function parse(args: ParseData): boolean {
  const { geometries, primitiveGroupMap, filterOptions, treeIndexNodeIdMap, colorMap } = args;
  const matchingGeometries = findMatchingGeometries(geometries);

  const didCreateNewGroup = createNewGroupIfNeeded(primitiveGroupMap, matchingGeometries.count);
  const group = primitiveGroupMap.Trapezium.group;

  matchingGeometries.geometries.forEach(geometry => {
    let added = false;
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    globalColor.setHex(parsePrimitiveColor(geometry));

    if (geometry.type === 'cone') {
      added = parseCone(primitiveInfo, nodeId, treeIndex, group, filterOptions);
    } else if (geometry.type === 'generalCylinder') {
      const { radiusA, radiusB } = primitiveInfo;
      if (radiusA !== radiusB) {
        added = parseCone(primitiveInfo, nodeId, treeIndex, group, filterOptions);
      } else {
        added = parseGeneralCylinder(primitiveInfo, nodeId, treeIndex, group, filterOptions);
      }
    }

    if (added) {
      treeIndexNodeIdMap[treeIndex] = nodeId;
      colorMap[treeIndex] = globalColor.clone();
    }
  });
  return didCreateNewGroup;
}
