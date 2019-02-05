import * as THREE from 'three';
import SphericalSegmentGroup from '../geometry/SphericalSegmentGroup';
import { PrimitiveGroupMap } from '../geometry/PrimitiveGroup';
import { MatchingGeometries,
         parsePrimitiveColor,
         parsePrimitiveNodeId,
         parsePrimitiveTreeIndex,
         getPrimitiveType,
         ParsePrimitiveArguments } from './parseUtils';

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

function createNewGroupIfNeeded(primitiveGroupMap: PrimitiveGroupMap, minimumRequiredCapacity: number) {
  if (
    primitiveGroupMap.SphericalSegment.group.count + minimumRequiredCapacity
    > primitiveGroupMap.SphericalSegment.group.capacity) {
      const capacity = Math.max(minimumRequiredCapacity, primitiveGroupMap.SphericalSegment.capacity);
      primitiveGroupMap.SphericalSegment.group = new SphericalSegmentGroup(capacity);
      return true;
  }
  return false;
}

export default function parse(args: ParsePrimitiveArguments): boolean {
  const { geometries, primitiveGroupMap, filterOptions } = args;
  const matchingGeometries = findMatchingGeometries(geometries);
  const didCreateNewGroup = createNewGroupIfNeeded(primitiveGroupMap, matchingGeometries.count);
  const group = primitiveGroupMap.SphericalSegment.group;

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

    group.add(nodeId, treeIndex, color, center, normal, radius, height, filterOptions);
  });
  return didCreateNewGroup;
}
