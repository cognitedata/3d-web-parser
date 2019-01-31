import * as THREE from 'three';
import BoxGroup from '../geometry/BoxGroup';
import { MatchingGeometries,
         parsePrimitiveColor,
         parsePrimitiveNodeId,
         parsePrimitiveTreeIndex,
         getPrimitiveType } from './parseUtils';

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
    if (geometry.type === 'triangleMesh') {
      // console.log(geometry);
      // const fileId = geometry.file[0].fileId;
      // console.log(geometry.file[0].fileId);
      // console.log(geometry.nodes[0].properties);
      // matchingGeometries.geometries.push(geometry);
      // matchingGeometries.count += 1;
    }
  });

  return matchingGeometries;
}

export default function parseMeshes(geometries: any[]): BoxGroup {
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = new BoxGroup(matchingGeometries.count);

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
    group.add(nodeId, treeIndex, color, center, normal, angle, delta);
  });
  return group;
}
