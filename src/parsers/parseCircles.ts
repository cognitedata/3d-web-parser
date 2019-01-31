import * as THREE from 'three';
import CircleGroup from '../geometry/CircleGroup';
import { MatchingGeometries,
         parsePrimitiveColor,
         parsePrimitiveNodeId,
         parsePrimitiveTreeIndex,
         getPrimitiveType,
         isPrimitive } from './parseUtils';

const color = new THREE.Color();
const center = new THREE.Vector3();
const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();
const normal = new THREE.Vector3();
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
    const { isClosed = false, thickness = 0 } = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];

    if (geometry.type === 'circle') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    } else if (isClosed) {
      if (['cylinder', 'eccentricCone'].indexOf(geometry.type) !== -1) {
        // End caps on the cylinder types
        matchingGeometries.geometries.push(geometry);
        matchingGeometries.count += 2;
      } else if (geometry.type === 'cone' && thickness === 0) {
        // End caps on the cone
        matchingGeometries.geometries.push(geometry);
        matchingGeometries.count += 2;
      } else if (['ellipsoidSegment', 'sphericalSegment'].indexOf(geometry.type) !== -1) {
        // End cap on the sphere types
        matchingGeometries.geometries.push(geometry);
        matchingGeometries.count += 1;
      }
    }
  });

  return matchingGeometries;
}

function parseConeEccentricConeCylinder(geometry: any[], group: CircleGroup) {
  // @ts-ignore
  const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
  const nodeId = parsePrimitiveNodeId(geometry);
  const treeIndex = parsePrimitiveTreeIndex(geometry);
  color.setHex(parsePrimitiveColor(geometry));

  let { x = 0, y = 0, z = 0 } = primitiveInfo.centerA;
  centerA.set(x, y, z);

  ({ x = 0, y = 0, z = 0 } = primitiveInfo.centerB);
  centerB.set(x, y, z);
  // @ts-ignore
  if (geometry.type === 'cylinder') {
    const { radius = 0 } = primitiveInfo;
    normal.copy(centerA)
    .sub(centerB)
    .normalize();
    group.add(nodeId, treeIndex, color, centerA, normal, radius);
    group.add(nodeId, treeIndex, color, centerB, normal, radius);
  // @ts-ignore
  } else if (geometry.type === 'cone') {
    const { radiusA = 0, radiusB = 0 } = primitiveInfo;

    normal.copy(centerA)
    .sub(centerB)
    .normalize();

    group.add(nodeId, treeIndex, color, centerA, normal, radiusA);
    group.add(nodeId, treeIndex, color, centerB, normal, radiusA);
  // @ts-ignore
  } else if (geometry.type === 'eccentricCone') {
    const { radiusA, radiusB } = primitiveInfo;

    ({ x = 0, y = 0, z = 0 } = primitiveInfo.normalA);
    normal.set(x, y, z);
    const dotProduct = normal.dot(vector.copy(centerA).sub(centerB));

    if (dotProduct > 0) {
      normal.negate();
    }
    group.add(nodeId, treeIndex, color, centerA, normal, radiusA);
    group.add(nodeId, treeIndex, color, centerB, normal, radiusB);
  }
}

export default function parse(geometries: any[]): CircleGroup {
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = new CircleGroup(matchingGeometries.count);

  matchingGeometries.geometries.forEach(geometry => {
    if (['cylinder', 'cone', 'eccentricCone'].indexOf(geometry.type) !== -1) {
      parseConeEccentricConeCylinder(geometry, group);
    } else {
      // Regular circles
      const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
      const nodeId = parsePrimitiveNodeId(geometry);
      const treeIndex = parsePrimitiveTreeIndex(geometry);
      color.setHex(parsePrimitiveColor(geometry));

      let { x = 0, y = 0, z = 0 } = primitiveInfo.center;
      center.set(x, y, z);

      ({ x = 0, y = 0, z = 0 } = primitiveInfo.normal);
      normal.set(x, y, z);

      const radius = primitiveInfo.radius;
      group.add(nodeId, treeIndex, color, center, normal, radius);
    }
  });
  return group;
}
