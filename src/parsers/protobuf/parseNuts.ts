// Copyright 2019 Cognite AS

import * as THREE from 'three';
import NutGroup from '../../geometry/NutGroup';
import { PrimitiveGroupMap } from '../../geometry/PrimitiveGroup';
import { MatchingGeometries,
         parsePrimitiveColor,
         parsePrimitiveNodeId,
         parsePrimitiveTreeIndex,
         getPrimitiveType} from './protobufUtils';
import { ParseData } from '../parseUtils';
const color = new THREE.Color();
const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

function findMatchingGeometries(geometries: any[]): MatchingGeometries {
  const matchingGeometries: MatchingGeometries = {
    count: 0,
    geometries: [],
  };

  geometries.forEach(geometry => {
    if (geometry.type === 'nut') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    }
  });

  return matchingGeometries;
}

function createNewGroupIfNeeded(primitiveGroupMap: PrimitiveGroupMap, minimumRequiredCapacity: number) {
  if (primitiveGroupMap.Nut.group.data.count + minimumRequiredCapacity > primitiveGroupMap.Nut.group.capacity) {
      const capacity = Math.max(minimumRequiredCapacity, primitiveGroupMap.Nut.capacity);
      primitiveGroupMap.Nut.group = new NutGroup(capacity);
      return true;
  }
  return false;
}

export default function parse(args: ParseData): boolean {
  const { geometries, primitiveGroupMap, filterOptions, treeIndexNodeIdMap, colorMap } = args;
  const matchingGeometries = findMatchingGeometries(geometries);
  const didCreateNewGroup = createNewGroupIfNeeded(primitiveGroupMap, matchingGeometries.count);
  const group = primitiveGroupMap.Nut.group;

  matchingGeometries.geometries.forEach(geometry => {
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];

    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    let { x = 0, y = 0, z = 0 } = primitiveInfo.centerA;
    centerA.set(x, y, z);

    ({ x = 0, y = 0, z = 0 } = primitiveInfo.centerB);
    centerB.set(x, y, z);
    const { radius = 0, rotationAngle = 0 } = primitiveInfo;

    const diagonalSize = Math.sqrt((2 * primitiveInfo.radius) ** 2 + centerA.distanceTo(centerB) ** 2);

    const added = group.add(
      nodeId,
      treeIndex,
      diagonalSize,
      centerA,
      centerB,
      radius,
      rotationAngle,
      filterOptions);

    if (added) {
      treeIndexNodeIdMap[treeIndex] = nodeId;
      colorMap[treeIndex] = color.clone();
    }
  });

  return didCreateNewGroup;
}
