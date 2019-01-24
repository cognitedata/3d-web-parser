import * as THREE from 'three';
import GeneralCylinderGroup from '../geometry/GeneralCylinderGroup';
import { MatchingGeometries,
         parsePrimitiveColor,
         parsePrimitiveNodeId,
         parsePrimitiveTreeIndex,
         getPrimitiveType } from './parseUtils';

const color = new THREE.Color();
const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

function findMatchingGeometries(geometries: any[]): MatchingGeometries {
  const matchingGeometries: MatchingGeometries = {
    count: 0,
    geometries: [],
  };

  geometries.forEach(geometry => {
    if (geometry.type === 'generalCylinder') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    }
  });

  return matchingGeometries;
}

export default function parse(geometries: any[]): GeneralCylinderGroup {
  // console.log('General cylinder parsing from generalCylinder parsing isn\'t implemented');
  return new GeneralCylinderGroup(0);
  // const matchingGeometries = findMatchingGeometries(geometries);
  // const group = new GeneralCylinderGroup(matchingGeometries.count);
  // if (group.capacity === 0) {
  //   return null;
  // }

  // matchingGeometries.geometries.forEach(geometry => {
  //   const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];

  //   const nodeId = parsePrimitiveNodeId(geometry);
  //   const treeIndex = parsePrimitiveTreeIndex(geometry);
  //   color.setHex(parsePrimitiveColor(geometry));

  //   centerA.set(primitiveInfo.centerA.x, primitiveInfo.centerA.y, primitiveInfo.centerA.z);
  //   centerB.set(primitiveInfo.centerB.x, primitiveInfo.centerB.y, primitiveInfo.centerB.z);
  //   const radius = primitiveInfo.radius;
  //   const heightA = primitiveInfo.heightA;
  //   const heightB = primitiveInfo.heightB;
  //   const slopeA = primitiveInfo.slopeA;
  //   const slopeB = primitiveInfo.slopeB;
  //   const zAngleA = primitiveInfo.zAngleA;
  //   const zAngleB = primitiveInfo.zAngleB;
  //   const angle = primitiveInfo.angle;
  //   const arcAngle = primitiveInfo.arcAngle;

  //   group.add(
  //     nodeId,
  //     treeIndex,
  //     color,
  //     centerA,
  //     centerB,
  //     radius,
  //     heightA,
  //     heightB,
  //     slopeA,
  //     slopeB,
  //     zAngleA,
  //     zAngleB,
  //     angle,
  //     arcAngle);
  // });

  // return group;
}
