// Copyright 2019 Cognite AS

import * as THREE from 'three';
import GeneralCylinderGroup from '../../geometry/GeneralCylinderGroup';

import {
  MatchingGeometries,
  parsePrimitiveColor,
  parsePrimitiveNodeId,
  parsePrimitiveTreeIndex,
  getPrimitiveType,
  isPrimitive
} from './protobufUtils';
import { ParseData } from '../parseUtils';
import { zAxis } from '../../constants';
import { normalizeRadians } from '../../MathUtils';

// reusable variables
const color = new THREE.Color();
const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();
const extA = new THREE.Vector3();
const extB = new THREE.Vector3();
const globalRotation = new THREE.Quaternion();
const slicingPlane = new THREE.Vector4();
const globalAxis = new THREE.Vector3();
const vertex = new THREE.Vector3();
const planes = [new THREE.Plane(), new THREE.Plane()];
const line = new THREE.Line3();
const lineStart = new THREE.Vector3();
const lineEnd = new THREE.Vector3();

function findMatchingGeometries(geometries: any[]): MatchingGeometries {
  const matchingGeometries: MatchingGeometries = {
    count: 0,
    geometries: []
  };

  geometries.forEach(geometry => {
    if (!isPrimitive(geometry)) {
      return;
    }
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const { thickness = 0, radiusA, radiusB } = primitiveInfo;

    if (geometry.type === 'generalCylinder' && radiusA === radiusB) {
      // A cone is produced if radii are different
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
      if (thickness > 0) {
        matchingGeometries.count += 1;
      }
    }
  });

  return matchingGeometries;
}

export default function parse(args: ParseData): GeneralCylinderGroup {
  const { geometries, filterOptions, treeIndexNodeIdMap, colorMap } = args;
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = new GeneralCylinderGroup(matchingGeometries.count);

  matchingGeometries.geometries.forEach(geometry => {
    let added = false;
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];

    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    let { x = 0, y = 0, z = 0 } = primitiveInfo.centerA;
    centerA.set(x, y, z);

    ({ x = 0, y = 0, z = 0 } = primitiveInfo.centerB);
    centerB.set(x, y, z);

    const {
      radiusA,
      radiusB,
      arcAngle = 2.0 * Math.PI,
      slopeA = 0,
      slopeB = 0,
      zAngleA = 0,
      zAngleB = 0,
      isClosed = false
    } = primitiveInfo;

    let { angle = 0 } = primitiveInfo;
    angle = normalizeRadians(angle);

    const thickness = primitiveInfo.thickness || (isClosed ? radiusA : 0);

    globalAxis.subVectors(centerA, centerB);
    const distFromBToA = globalAxis.length();
    globalRotation.setFromUnitVectors(zAxis, globalAxis.normalize());

    const distFromAToExtA = radiusA * Math.tan(slopeA);
    const distFromBToExtB = radiusA * Math.tan(slopeB);
    const heightA = distFromBToExtB + distFromBToA;
    const heightB = distFromBToExtB;

    extA
      .copy(globalAxis)
      .multiplyScalar(distFromAToExtA)
      .add(centerA);
    extB
      .copy(globalAxis)
      .multiplyScalar(-distFromBToExtB)
      .add(centerB);

    const size = Math.sqrt((2 * radiusA) ** 2 + centerA.distanceTo(centerB) ** 2);

    added = group.add(
      nodeId,
      treeIndex,
      size,
      extA,
      extB,
      radiusA,
      heightA,
      heightB,
      slopeA,
      slopeB,
      zAngleA,
      zAngleB,
      angle,
      arcAngle,
      filterOptions
    );
    if (thickness > 0) {
      if (thickness !== radiusA) {
        added =
          group.add(
            nodeId,
            treeIndex,
            size,
            extA,
            extB,
            radiusA - thickness,
            heightA,
            heightB,
            slopeA,
            slopeB,
            zAngleA,
            zAngleB,
            angle,
            arcAngle,
            filterOptions
          ) || added;
      }
    }

    if (added) {
      treeIndexNodeIdMap[treeIndex] = nodeId;
      colorMap[treeIndex] = color.clone();
    }
  });
  return group;
}
