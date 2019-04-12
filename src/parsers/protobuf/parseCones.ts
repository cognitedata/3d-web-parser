// Copyright 2019 Cognite AS

import * as THREE from 'three';
import ConeGroup from '../../geometry/ConeGroup';
import { PrimitiveGroupMap } from '../../geometry/PrimitiveGroup';
import { MatchingGeometries,
  parsePrimitiveColor,
  parsePrimitiveNodeId,
  parsePrimitiveTreeIndex,
  getPrimitiveType,
  isPrimitive } from './protobufUtils';
import { zAxis } from '../../constants';
import { ParseData } from '../parseUtils';

const globalColor = new THREE.Color();
const globalCenterA = new THREE.Vector3();
const globalCenterB = new THREE.Vector3();
const vector = new THREE.Vector3();

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
    const { thickness = 0, radiusA, radiusB } = primitiveInfo;

    if (geometry.type === 'cone'
    || (geometry.type === 'generalCylinder' && radiusA !== radiusB)) {
      matchingGeometries.geometries.push(geometry);
      if (thickness > 0) {
        matchingGeometries.count += 2;
      } else {
        matchingGeometries.count += 1;
      }
    } else if (geometry.type === 'cylinder') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    } else if (geometry.type === 'extrudedRing' || geometry.type === 'extrudedRingSegment') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 2;
    }
  });

  return matchingGeometries;
}

function createNewGroupIfNeeded(primitiveGroupMap: PrimitiveGroupMap, minimumRequiredCapacity: number) {
  if (primitiveGroupMap.Cone.group.data.count + minimumRequiredCapacity > primitiveGroupMap.Cone.group.capacity) {
      const capacity = Math.max(minimumRequiredCapacity, primitiveGroupMap.Cone.capacity);
      primitiveGroupMap.Cone.group = new ConeGroup(capacity);
      return true;
  }
  return false;
}

export default function parse(args: ParseData): boolean {
  const { geometries, primitiveGroupMap, filterOptions, treeIndexNodeIdMap, colorMap } = args;
  const matchingGeometries = findMatchingGeometries(geometries);

  const didCreateNewGroup = createNewGroupIfNeeded(primitiveGroupMap, matchingGeometries.count);
  const group = primitiveGroupMap.Cone.group;

  matchingGeometries.geometries.forEach(geometry => {
    let added = false;
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    globalColor.setHex(parsePrimitiveColor(geometry));

    let { x = 0, y = 0, z = 0 } = primitiveInfo.centerA;
    globalCenterA.set(x, y, z);

    ({ x = 0, y = 0, z = 0 } = primitiveInfo.centerB);
    globalCenterB.set(x, y, z);

    if (geometry.type === 'cylinder') {
      const { radius } = primitiveInfo;
      const size = Math.sqrt((2 * radius) ** 2 + globalCenterA.distanceTo(globalCenterB) ** 2);
      added = group.add(
        nodeId,
        treeIndex,
        size,
        globalCenterA,
        globalCenterB,
        radius,
        radius,
        0,
        2 * Math.PI,
        filterOptions);
    } else if (geometry.type === 'cone' || geometry.type === 'generalCylinder') {
      let { radiusA, radiusB } = primitiveInfo;
      const { angle = 0, arcAngle  = 2.0 * Math.PI, thickness = 0 } = primitiveInfo;
      const radius = Math.max(radiusA, radiusB);
      const size = Math.sqrt((2 * radius) ** 2 + globalCenterA.distanceTo(globalCenterB) ** 2);
      added = group.add(
        nodeId,
        treeIndex,
        size,
        globalCenterA,
        globalCenterB,
        radiusA,
        radiusB,
        angle,
        arcAngle,
        filterOptions);

      if (thickness > 0) {
        // Create the inner cone if it has a thickness
        radiusA -= thickness;
        radiusB -= thickness;
        added = group.add(
          nodeId,
          treeIndex,
          size,
          globalCenterA,
          globalCenterB,
          radiusA,
          radiusB,
          angle,
          arcAngle,
          filterOptions) || added;
      }
    } else if (geometry.type === 'extrudedRing' || geometry.type === 'extrudedRingSegment') {
      const { innerRadius, outerRadius, angle = 0, arcAngle = 2.0 * Math.PI } = primitiveInfo;
      const size = Math.sqrt((2 * outerRadius) ** 2 + globalCenterA.distanceTo(globalCenterB) ** 2);
      added = group.add(
        nodeId,
        treeIndex,
        size,
        globalCenterA,
        globalCenterB,
        innerRadius,
        innerRadius,
        angle,
        arcAngle,
        filterOptions);

      added = group.add(
        nodeId,
        treeIndex,
        size,
        globalCenterA,
        globalCenterB,
        outerRadius,
        outerRadius,
        angle,
        arcAngle,
        filterOptions) || added;
    }

    if (added) {
      treeIndexNodeIdMap[treeIndex] = nodeId;
      colorMap[treeIndex] = globalColor.clone();
    }
  });
  return didCreateNewGroup;
}
