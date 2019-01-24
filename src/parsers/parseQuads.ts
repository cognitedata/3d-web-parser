import * as THREE from 'three';
import QuadGroup from '../geometry/QuadGroup';
import { MatchingGeometries,
         parsePrimitiveColor,
         parsePrimitiveNodeId,
         parsePrimitiveTreeIndex,
         getPrimitiveType } from './parseUtils';
import { zAxis } from '../constants';

const color = new THREE.Color();
const vertex = new THREE.Vector3();
const vertex1 = new THREE.Vector3();
const vertex2 = new THREE.Vector3();
const vertex3 = new THREE.Vector3();
const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();
const normal = new THREE.Vector3();
const axisRotation = new THREE.Quaternion();

function findMatchingGeometries(geometries: any[]): MatchingGeometries {
  const matchingGeometries: MatchingGeometries = {
    count: 0,
    geometries: [],
  };

  geometries.forEach(geometry => {
    if (geometry.type === 'extrudedRing'
        && geometry.primitiveInfo.extrudedRing.arcAngle < 2 * Math.PI
        && geometry.primitiveInfo.extrudedRing.isClosed) {
          matchingGeometries.geometries.push(geometry);
          matchingGeometries.count += 2;
      }
  });

  return matchingGeometries;
}

export default function parse(geometries: any[]): QuadGroup|null {
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = new QuadGroup(matchingGeometries.count);

  matchingGeometries.geometries.forEach(geometry => {
    // Only extruded rings will produce quads
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    const {
      angle,
      innerRadius,
      outerRadius,
      arcAngle,
    } = primitiveInfo;

    centerA.set(primitiveInfo.centerA.x, primitiveInfo.centerA.y, primitiveInfo.centerA.z);
    centerB.set(primitiveInfo.centerB.x, primitiveInfo.centerB.y, primitiveInfo.centerB.z);

    normal.copy(centerA).sub(centerB).normalize();
    axisRotation.setFromUnitVectors(zAxis, normal);

    [false, true].forEach(isSecondQuad => {
      const finalAngle = angle + Number(isSecondQuad) * arcAngle;
      vertex
        .set(Math.cos(finalAngle), Math.sin(finalAngle), 0)
        .applyQuaternion(axisRotation)
        .normalize();
      vertex1.copy(vertex)
        .multiplyScalar(innerRadius)
        .add(centerA);
      vertex2.copy(vertex)
        .multiplyScalar(outerRadius)
        .add(centerB);
      vertex3.copy(vertex)
        .clone()
        .multiplyScalar(innerRadius)
        .add(centerB);

      if (isSecondQuad) {
        // swap the order of vertex1 and vertex2 to flip the normal
        group.add(nodeId, treeIndex, color, vertex2, vertex1, vertex3);
      } else {
        group.add(nodeId, treeIndex, color, vertex1, vertex2, vertex3);
      }

    });
  });
  return group;
}
