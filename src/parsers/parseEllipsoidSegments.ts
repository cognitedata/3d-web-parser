import * as THREE from 'three';
import EllipsoidSegmentGroup from '../geometry/EllipsoidSegmentGroup';
import { PrimitiveGroupMap } from '../geometry/PrimitiveGroup';
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

function createNewGroupIfNeeded(primitiveGroupMap: PrimitiveGroupMap, minimumRequiredCapacity: number) {
  if (
    primitiveGroupMap.EllipsoidSegment.group.count + minimumRequiredCapacity
    > primitiveGroupMap.EllipsoidSegment.group.capacity) {
      const capacity = Math.max(minimumRequiredCapacity, primitiveGroupMap.EllipsoidSegment.capacity);
      primitiveGroupMap.EllipsoidSegment.group = new EllipsoidSegmentGroup(capacity);
      return true;
  }
  return false;
}

export default function parse(geometries: any[], primitiveGroupMap: PrimitiveGroupMap): boolean {
  const matchingGeometries = findMatchingGeometries(geometries);
  const didCreateNewGroup = createNewGroupIfNeeded(primitiveGroupMap, matchingGeometries.count);
  const group = primitiveGroupMap.EllipsoidSegment.group;

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
  return didCreateNewGroup;
}
