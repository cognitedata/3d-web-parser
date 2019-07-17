// Copyright 2019 Cognite AS

import * as THREE from 'three';
import SphericalSegmentGroup from '../../geometry/SphericalSegmentGroup';

import {
  MatchingGeometries,
  parsePrimitiveColor,
  parsePrimitiveNodeId,
  parsePrimitiveTreeIndex,
  getPrimitiveType
} from './protobufUtils';
import { ParseData } from '../parseUtils';

const color = new THREE.Color();
const center = new THREE.Vector3();
const normal = new THREE.Vector3();

function findMatchingGeometries(geometries: any[]): MatchingGeometries {
  const matchingGeometries: MatchingGeometries = {
    count: 0,
    geometries: []
  };

  geometries.forEach(geometry => {
    if (geometry.type === 'sphere' || geometry.type === 'sphericalSegment') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    }
  });

  return matchingGeometries;
}

export default function parse(args: ParseData): SphericalSegmentGroup {
  const { geometries, filterOptions, treeIndexNodeIdMap, colorMap } = args;
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = args.geometryGroup as SphericalSegmentGroup;

  matchingGeometries.geometries.forEach(geometry => {
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    let { x = 0, y = 0, z = 0 } = primitiveInfo.center;
    center.set(x, y, z);

    const radius = primitiveInfo.radius;
    let height = 2 * radius; // Default value for sphere

    if (geometry.type === 'sphericalSegment') {
      ({ x = 0, y = 0, z = 0 } = primitiveInfo.normal);
      normal.set(x, y, z);
      height = primitiveInfo.height;
    } else {
      normal.set(0, -1, 0);
    }

    const size = Math.sqrt((2 * radius) ** 2 + height ** 2);

    const added = group.add(nodeId, treeIndex, size, center, normal, radius, height, filterOptions);
    if (added) {
      treeIndexNodeIdMap[treeIndex] = nodeId;
      colorMap[treeIndex] = color.clone();
    }
  });
  return group;
}
