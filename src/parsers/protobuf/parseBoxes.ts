import * as THREE from 'three';
import BoxGroup from '../../geometry/BoxGroup';
import { PrimitiveGroupMap } from '../../geometry/PrimitiveGroup';
import { MatchingGeometries,
         parsePrimitiveColor,
         parsePrimitiveNodeId,
         parsePrimitiveTreeIndex,
         getPrimitiveType } from './protobufUtils';
import { ParsePrimitiveData } from '../parseUtils';

const color = new THREE.Color();
const center = new THREE.Vector3();
const normal = new THREE.Vector3();
const delta = new THREE.Vector3();

function findMatchingGeometries(geometries: any[]): MatchingGeometries {
  const matchingGeometries: MatchingGeometries = {
    count: 0,
    geometries: [],
  };

  geometries.forEach(geometry => {
    if (geometry.type === 'box') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    }
  });

  return matchingGeometries;
}

function createNewGroupIfNeeded(primitiveGroupMap: PrimitiveGroupMap, minimumRequiredCapacity: number) {
  if (primitiveGroupMap.Box.group.count + minimumRequiredCapacity > primitiveGroupMap.Box.group.capacity) {
      const capacity = Math.max(minimumRequiredCapacity, primitiveGroupMap.Box.capacity);
      primitiveGroupMap.Box.group = new BoxGroup(capacity);
      return true;
  }
  return false;
}

export default function parse(args: ParsePrimitiveData): boolean {
  const { geometries, primitiveGroupMap, filterOptions } = args;
  const matchingGeometries = findMatchingGeometries(geometries);
  const didCreateNewGroup = createNewGroupIfNeeded(primitiveGroupMap, matchingGeometries.count);
  const group = primitiveGroupMap.Box.group;

  matchingGeometries.geometries.forEach(geometry => {
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];

    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    let { x = 0, y = 0, z = 0 } = primitiveInfo.center;
    center.set(x, y, z);

    ({ x = 0, y = 0, z = 0 } = primitiveInfo.normal);
    normal.set(x, y, z);

    ({ x = 0, y = 0, z = 0 } = primitiveInfo.delta);
    delta.set(x, y, z);

    const { angle = 0 } = geometry.primitiveInfo.box;
    group.add(nodeId, treeIndex, color, center, normal, angle, delta, filterOptions);
  });
  return didCreateNewGroup;
}