import * as THREE from 'three';
import BoxGroup from '../geometry/BoxGroup';
import { MatchingGeometries,
  parsePrimitiveColor,
  parsePrimitiveInfo,
  parsePrimitiveNodeId,
  parsePrimitiveTreeIndex,
} from './parseUtils';

const color = new THREE.Color();
const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();

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

export default function parseBoxes(geometries: any[]): BoxGroup|null {
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = new BoxGroup(matchingGeometries.count);
  if (group.capacity === 0) {
    return null;
  }

  matchingGeometries.geometries.forEach(geometry => {
    const primitiveInfo = parsePrimitiveInfo(geometry.primitiveInfo);

    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    const center = geometry.primitiveInfo.box.center;
    const normal = geometry.primitiveInfo.box.normal;
    const delta = geometry.primitiveInfo.box.delta;
    const angle = geometry.primitiveInfo.box.angle;

    vector1.set(center.x, center.y, center.z);
    vector2.set(normal.x, normal.y, normal.z);
    vector3.set(delta.x, delta.y, delta.z);

    group.add(nodeId, treeIndex, color, vector1, vector2, angle, vector3);
  });
  return group;
}
