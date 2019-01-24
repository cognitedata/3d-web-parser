import * as THREE from 'three';
import SphericalSegmentGroup from '../geometry/SphericalSegmentGroup';
import { MatchingGeometries,
         parsePrimitiveColor,
         parsePrimitiveNodeId,
         parsePrimitiveTreeIndex,
         getPrimitiveType } from './parseUtils';

const color = new THREE.Color();
const center = new THREE.Vector3();
const normal = new THREE.Vector3();

function findMatchingGeometries(geometries: any[]): MatchingGeometries {
  const matchingGeometries: MatchingGeometries = {
    count: 0,
    geometries: [],
  };

  geometries.forEach(geometry => {
    if (geometry.type === 'sphere' || geometry.type === 'sphericalSegment') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    }
  });

  return matchingGeometries;
}

export default function parse(geometries: any[]): SphericalSegmentGroup|null {
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = new SphericalSegmentGroup(matchingGeometries.count);

  matchingGeometries.geometries.forEach(geometry => {
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    center.set(primitiveInfo.center.x, primitiveInfo.center.y, primitiveInfo.center.z);
    const radius = primitiveInfo.radius;
    let height = 2 * radius; // Default value for sphere

    if (geometry.type === 'sphericalSegment') {
      normal.set(primitiveInfo.normal.x, primitiveInfo.normal.y, primitiveInfo.normal.z);
      height = primitiveInfo.height;
    } else {
      normal.set(0, -1, 0);
    }

    group.add(nodeId, treeIndex, color, center, normal, radius, height);
  });
  return group;
}
