import * as THREE from 'three';
import TorusSegmentGroup from '../geometry/TorusSegmentGroup';
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
    if (geometry.type === 'torus' || geometry.type === 'torusSegment') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    }
  });

  return matchingGeometries;
}

export default function parse(geometries: any[]): TorusSegmentGroup|null {
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = new TorusSegmentGroup(matchingGeometries.count);
  if (group.capacity === 0) {
    return null;
  }

  matchingGeometries.geometries.forEach(geometry => {
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];

    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    center.set(primitiveInfo.center.x, primitiveInfo.center.y, primitiveInfo.center.z);
    normal.set(primitiveInfo.normal.x, primitiveInfo.normal.y, primitiveInfo.normal.z);

    const {
      radius,
      tubeRadius,
      angle = 0.0,
      arcAngle = 2 * Math.PI,
    } = primitiveInfo;

    group.add(nodeId, treeIndex, color, center, normal, radius, tubeRadius, angle, arcAngle);
  });
  return group;
}
