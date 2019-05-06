// Copyright 2019 Cognite AS

import * as THREE from 'three';
import NutGroup from '../../geometry/NutGroup';

import {
  MatchingGeometries,
  parsePrimitiveColor,
  parsePrimitiveNodeId,
  parsePrimitiveTreeIndex,
  getPrimitiveType
} from './protobufUtils';
import { ParseData } from '../parseUtils';
const color = new THREE.Color();
const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

function findMatchingGeometries(geometries: any[]): MatchingGeometries {
  const matchingGeometries: MatchingGeometries = {
    count: 0,
    geometries: []
  };

  geometries.forEach(geometry => {
    if (geometry.type === 'nut') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    }
  });

  return matchingGeometries;
}

export default function parse(args: ParseData): NutGroup {
  const { geometries, filterOptions, treeIndexNodeIdMap, colorMap } = args;
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = new NutGroup(matchingGeometries.count);

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

    const size = Math.sqrt((2 * radius) ** 2 + centerA.distanceTo(centerB) ** 2);

    const added = group.add(nodeId, treeIndex, size, centerA, centerB, radius, rotationAngle, filterOptions);

    if (added) {
      treeIndexNodeIdMap[treeIndex] = nodeId;
      colorMap[treeIndex] = color.clone();
    }
  });

  return group;
}
