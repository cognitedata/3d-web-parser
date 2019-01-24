import * as THREE from 'three';
import EllipsoidSegmentGroup from '../geometry/EllipsoidSegmentGroup';
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
    if (geometry.type === 'ellipsoid' || geometry.type === 'ellipsoidSegment') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    }
  });

  return matchingGeometries;
}

export default function parse(geometries: any[]): EllipsoidSegmentGroup {
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = new EllipsoidSegmentGroup(matchingGeometries.count);

  matchingGeometries.geometries.forEach(geometry => {
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    let { x = 0, y = 0, z = 0 } = primitiveInfo.center;
    center.set(x, y, z);

    ({ x = 0, y = 0, z = 0 } = primitiveInfo.normal);
    normal.set(x, y, z);

    const { horizontalRadius, verticalRadius } = primitiveInfo;
    let height = 2 * verticalRadius; // Default value for ellipsoids

    if (geometry.type === 'ellipsoidSegment') {
      height = primitiveInfo.height;
    }

    group.add(nodeId, treeIndex, color, center, normal, horizontalRadius, verticalRadius, height);
  });
  return group;
}
