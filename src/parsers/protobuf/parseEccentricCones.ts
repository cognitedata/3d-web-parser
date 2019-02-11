import * as THREE from 'three';
import EccentricConeGroup from '../../geometry/EccentricConeGroup';
import { PrimitiveGroupMap } from '../../geometry/PrimitiveGroup';
import { MatchingGeometries,
         parsePrimitiveColor,
         parsePrimitiveNodeId,
         parsePrimitiveTreeIndex,
         getPrimitiveType } from './protobufUtils';

import { zAxis } from '../../constants';
import { ParsePrimitiveData } from '../parseUtils';

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

function createNewGroupIfNeeded(primitiveGroupMap: PrimitiveGroupMap, minimumRequiredCapacity: number) {
  if (
    primitiveGroupMap.EccentricCone.group.count + minimumRequiredCapacity
    > primitiveGroupMap.EccentricCone.group.capacity) {
      const capacity = Math.max(minimumRequiredCapacity, primitiveGroupMap.EccentricCone.capacity);
      primitiveGroupMap.EccentricCone.group = new EccentricConeGroup(capacity);
      return true;
  }
  return false;
}

export default function parse(args: ParsePrimitiveData): boolean {
  const { geometries, primitiveGroupMap, filterOptions } = args;
  const matchingGeometries = findMatchingGeometries(geometries);
  const didCreateNewGroup = createNewGroupIfNeeded(primitiveGroupMap, matchingGeometries.count);
  const group = primitiveGroupMap.EccentricCone.group;

  matchingGeometries.geometries.forEach(geometry => {
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    let { x = 0, y = 0, z = 0 } = primitiveInfo.centerA;
    centerA.set(x, y, z);

    ({ x = 0, y = 0, z = 0 } = primitiveInfo.centerB);
    centerB.set(x, y, z);

    const { radiusA, radiusB } = primitiveInfo;

    ({ x = 0, y = 0, z = 0 } = primitiveInfo.normalA);
    normal.set(x, y, z);

    const dotProduct = normal.dot(vector.copy(centerA).sub(centerB));
    if (dotProduct < 0) {
      normal.negate();
    }

    group.add(nodeId, treeIndex, color, centerA, centerB, radiusA, radiusB, normal, filterOptions);
  });
  return didCreateNewGroup;
}