import * as THREE from 'three';
import ConeGroup from '../geometry/ConeGroup';
import { parsePrimitiveColor, parsePrimitiveInfo, parsePrimitiveNodeId, parsePrimitiveTreeIndex } from './parseUtils';
import { zAxis } from '../constants';

const color = new THREE.Color();
const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();
const vector = new THREE.Vector3();

interface MatchingGeometries {
  count: number;
  geometries: any[];
}

function findMatchingGeometries(geometries: any[]): MatchingGeometries {
  const matchingGeometries: MatchingGeometries = {
    count: 0,
    geometries: [],
  };

  geometries.forEach(geometry => {
    const isClosed = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)].isClosed;
    const thickness = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)].thickness;

    if (geometry.type === 'cone') {
      matchingGeometries.geometries.push(geometry);
      if (geometry.thickness > 0.0) {
        matchingGeometries.count += 2;
      } else {
        matchingGeometries.count += 1;
      }
    } else if (geometry.type === 'cylinder') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 2;
    } else if (geometry.type === 'extrudedRing') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 2;
    }
  });

  return matchingGeometries;
}

export default function parse(geometries: any[]): ConeGroup|null {
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = new ConeGroup(matchingGeometries.count);
  if (group.capacity === 0) {
    return null;
  }

  matchingGeometries.geometries.forEach(geometry => {

    // Regular circles
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    centerA.set(primitiveInfo.centerA.x, primitiveInfo.centerA.y, primitiveInfo.centerA.z);
    centerB.set(primitiveInfo.centerB.x, primitiveInfo.centerB.y, primitiveInfo.centerB.z);
    if (geometry.type === 'cylinder') {
      const radius = primitiveInfo.radius;
      group.add(nodeId, treeIndex, color, centerA, centerB, radius, radius);
    } else if (geometry.type === 'cone') {
      let radiusA = primitiveInfo.radiusA;
      let radiusB = primitiveInfo.radiusB;
      const angle  = primitiveInfo.angle;
      const arcAngle  = primitiveInfo.arcAngle;

      group.add(nodeId, treeIndex, color, centerA, centerB, radiusA, radiusB, angle, arcAngle);

      if (primitiveInfo.thickness > 0) {
        // Create the inner cone if it has a thickness
        radiusA -= primitiveInfo.thickness;
        radiusB -= primitiveInfo.thickness;
        group.add(nodeId, treeIndex, color, centerA, centerB, radiusA, radiusB, angle, arcAngle);
      }
    } else if (geometry.type === 'extrudedRing') {
      const innerRadius = primitiveInfo.innerRadius;
      const outerRadius = primitiveInfo.outerRadius;
      const angle  = primitiveInfo.angle;
      const arcAngle  = primitiveInfo.arcAngle;
      group.add(nodeId, treeIndex, color, centerA, centerB, innerRadius, innerRadius, angle, arcAngle);
      group.add(nodeId, treeIndex, color, centerA, centerB, outerRadius, outerRadius, angle, arcAngle);
    }
  });
  return group;
}
