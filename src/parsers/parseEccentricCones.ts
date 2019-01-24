import * as THREE from 'three';
import EccentricConeGroup from '../geometry/EccentricConeGroup';
import { MatchingGeometries,
         parsePrimitiveColor,
         parsePrimitiveNodeId,
         parsePrimitiveTreeIndex,
         getPrimitiveType } from './parseUtils';
import { zAxis } from '../constants';

const color = new THREE.Color();
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
    if (geometry.type === 'eccentricCone') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    }
  });

  return matchingGeometries;
}

export default function parse(geometries: any[]): EccentricConeGroup {
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = new EccentricConeGroup(matchingGeometries.count);

  matchingGeometries.geometries.forEach(geometry => {
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    centerA.set(primitiveInfo.centerA.x, primitiveInfo.centerA.y, primitiveInfo.centerA.z);
    centerB.set(primitiveInfo.centerB.x, primitiveInfo.centerB.y, primitiveInfo.centerB.z);
    const radiusA = primitiveInfo.radiusA;
    const radiusB = primitiveInfo.radiusB;

    // TODO(anders.hafreager) ref https://github.com/cognitedata/3d-optimizer/issues/127
    normal.set(primitiveInfo.normalA.x, primitiveInfo.normalA.y, primitiveInfo.normalA.z);
    const dotProduct = normal.dot(vector.copy(centerA).sub(centerB));
    if (dotProduct === 0) {
      // flat eccentric cones are discarded if it is processed by the latest 3d-optimizer in the backend.
      // However, models processed with earlier versions may still contain flat eccentric cones.
      return;
    }

    group.add(nodeId, treeIndex, color, centerA, centerB, radiusA, radiusB, normal);
  });
  return group;
}
