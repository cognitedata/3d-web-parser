import * as THREE from 'three';
import CircleGroup from '../geometry/CircleGroup';
import { MatchingGeometries, parsePrimitiveColor, parsePrimitiveNodeId, parsePrimitiveTreeIndex } from './parseUtils';

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
    const { isClosed = false, thickness = 0 } = geometry.primitiveInfo[geometry.type];

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
  const primitiveInfo = geometry.primitiveInfo[geometry.type];
  const nodeId = parsePrimitiveNodeId(geometry);
  const treeIndex = parsePrimitiveTreeIndex(geometry);
  color.setHex(parsePrimitiveColor(geometry));

  centerA.set(primitiveInfo.centerA.x, primitiveInfo.centerA.y, primitiveInfo.centerA.z);
  centerB.set(primitiveInfo.centerB.x, primitiveInfo.centerB.y, primitiveInfo.centerB.z);
  // @ts-ignore
  if (geometry.type === 'cylinder') {
    const radius = primitiveInfo.radius;
    normal.copy(centerA)
    .sub(centerB)
    .normalize();
    group.add(nodeId, treeIndex, color, centerA, normal, radius);
    group.add(nodeId, treeIndex, color, centerB, normal, radius);
  // @ts-ignore
  } else if (geometry.type === 'cone') {
    const radiusA = primitiveInfo.radiusA;
    const radiusB = primitiveInfo.radiusB;
    normal.copy(centerA)
    .sub(centerB)
    .normalize();
    group.add(nodeId, treeIndex, color, centerA, normal, radiusA);
    group.add(nodeId, treeIndex, color, centerB, normal, radiusA);
  // @ts-ignore
  } else if (geometry.type === 'eccentricCone') {
    const radiusA = primitiveInfo.radiusA;
    const radiusB = primitiveInfo.radiusB;
    // TODO(anders.hafreager) ref https://github.com/cognitedata/3d-optimizer/issues/127
    normal.set(primitiveInfo.normalA.x, primitiveInfo.normalA.y, primitiveInfo.normalA.z);
    const dotProduct = normal.dot(vector.copy(centerA).sub(centerB));
    if (Math.abs(dotProduct) < 1e-6) {
      // flat eccentric cones are discarded if it is processed by the latest 3d-optimizer in the backend.
      // However, models processed with earlier versions may still contain flat eccentric cones.
      return;
    }

    if (dotProduct > 0) {
      normal.negate();
    }
    group.add(nodeId, treeIndex, color, centerA, normal, radiusA);
    group.add(nodeId, treeIndex, color, centerB, normal, radiusA);
  }
}

export default function parse(geometries: any[]): CircleGroup|null {
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = new CircleGroup(matchingGeometries.count);
  if (group.capacity === 0) {
    return null;
  }

  matchingGeometries.geometries.forEach(geometry => {
    if (['cylinder', 'cone', 'eccentricCone'].indexOf(geometry.type) !== -1) {
      parseConeEccentricConeCylinder(geometry, group);
    } else {
      // Regular circles
      const primitiveInfo = geometry.primitiveInfo[geometry.type];
      const nodeId = parsePrimitiveNodeId(geometry);
      const treeIndex = parsePrimitiveTreeIndex(geometry);
      color.setHex(parsePrimitiveColor(geometry));

      center.set(primitiveInfo.center.x, primitiveInfo.center.y, primitiveInfo.center.z);
      normal.set(primitiveInfo.normal.x, primitiveInfo.normal.y, primitiveInfo.normal.z);
      const radius = primitiveInfo.radius;
      group.add(nodeId, treeIndex, color, center, normal, radius);
    }
  });
  return group;
}
