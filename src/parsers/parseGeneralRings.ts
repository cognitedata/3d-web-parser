import * as THREE from 'three';
import GeneralRingGroup from '../geometry/GeneralRingGroup';
import { MatchingGeometries,
         parsePrimitiveColor,
         parsePrimitiveNodeId,
         parsePrimitiveTreeIndex,
         getPrimitiveType,
         isPrimitive } from './parseUtils';
import { xAxis, zAxis } from '../constants';

const THREEColor = new THREE.Color();
const center = new THREE.Vector3();
const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();
const capZAxis = new THREE.Vector3();
const capXAxis = new THREE.Vector3();
const normal = new THREE.Vector3();
const localXAxis = new THREE.Vector3();
const rotation = new THREE.Quaternion();

function findMatchingGeometries(geometries: any[]): MatchingGeometries {
  const matchingGeometries: MatchingGeometries = {
    count: 0,
    geometries: [],
  };

  geometries.forEach(geometry => {
    if (!isPrimitive(geometry)) {
      return;
    }
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const { thickness = 0 } = primitiveInfo;

    if (geometry.type === 'ring') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    } else if (geometry.type === 'extrudedRing'
            || geometry.type === 'extrudedRingSegment'
            || geometry.type === 'generalCylinder'
            || geometry.type === 'cone' && thickness > 0) {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 2;
    }
  });

  return matchingGeometries;
}

function parseRing(primitiveInfo: any,
                   nodeId: number,
                   treeIndex: number,
                   color: THREE.Color,
                   group: GeneralRingGroup) {

  let { x = 0, y = 0, z = 0 } = primitiveInfo.center;
  center.set(x, y, z);

  ({ x = 0, y = 0, z = 0 } = primitiveInfo.normal);
  normal.set(x, y, z);
  const { innerRadius, outerRadius } = primitiveInfo;

  localXAxis.copy(xAxis).applyQuaternion(rotation.setFromUnitVectors(zAxis, normal)),
  group.add(nodeId,
            treeIndex,
            color,
            center,
            normal,
            localXAxis,
            outerRadius,
            outerRadius,
            outerRadius - innerRadius,
            );
}

function parseCone(primitiveInfo: any,
                   nodeId: number,
                   treeIndex: number,
                   color: THREE.Color,
                   group: GeneralRingGroup) {
  let { x = 0, y = 0, z = 0 } = primitiveInfo.centerA;
  centerA.set(x, y, z);

  ({ x = 0, y = 0, z = 0 } = primitiveInfo.centerB);
  centerB.set(x, y, z);

  capZAxis.copy(centerA).sub(centerB);
  rotation.setFromUnitVectors(zAxis, capZAxis.normalize());
  capXAxis.copy(xAxis).applyQuaternion(rotation);
  const {
    angle = 0,
    arcAngle,
    isClosed,
    radiusA,
    radiusB,
    thickness = 0,
  } = primitiveInfo;

  group.add(nodeId, treeIndex, color, centerA, capZAxis, capXAxis, radiusA, radiusA, thickness, angle, arcAngle);
  group.add(nodeId, treeIndex, color, centerB, capZAxis, capXAxis, radiusB, radiusB, thickness, angle, arcAngle);
}

function parseExtrudedRing(primitiveInfo: any,
                           nodeId: number,
                           treeIndex: number,
                           color: THREE.Color,
                           group: GeneralRingGroup) {
  const {
    angle = 0,
    arcAngle = 2 * Math.PI,
    innerRadius,
    outerRadius,
  } = primitiveInfo;

  let { x = 0, y = 0, z = 0 } = primitiveInfo.centerA;
  centerA.set(x, y, z);

  ({ x = 0, y = 0, z = 0 } = primitiveInfo.centerB);
  centerB.set(x, y, z);

  normal.copy(centerA).sub(centerB).normalize();

  rotation.setFromUnitVectors(zAxis, normal);
  capXAxis.copy(xAxis).applyQuaternion(rotation);

  group.add(nodeId,
            treeIndex,
            color,
            centerA,
            normal,
            capXAxis,
            outerRadius,
            outerRadius,
            outerRadius - innerRadius,
            angle,
            arcAngle);
  group.add(nodeId,
              treeIndex,
              color,
              centerB,
              normal,
              capXAxis,
              outerRadius,
              outerRadius,
              outerRadius - innerRadius,
              angle,
              arcAngle);
}

function parseGeneralCylinder(primitiveInfo: any,
                              nodeId: number,
                              treeIndex: number,
                              color: THREE.Color,
                              group: GeneralRingGroup) {
  console.log('General ring parsing from generalCylinder parsing isn\'t implemented');
}

export default function parse(geometries: any[]): GeneralRingGroup {
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = new GeneralRingGroup(matchingGeometries.count);

  matchingGeometries.geometries.forEach(geometry => {
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    THREEColor.setHex(parsePrimitiveColor(geometry));

    if (geometry.type === 'ring') {
      parseRing(primitiveInfo, nodeId, treeIndex, THREEColor, group);
    } else if (geometry.type === 'cone') {
      parseCone(primitiveInfo, nodeId, treeIndex, THREEColor, group);
    } else if (geometry.type === 'extrudedRing' || geometry.type === 'extrudedRingSegment') {
      parseExtrudedRing(primitiveInfo, nodeId, treeIndex, THREEColor, group);
    } else if (geometry.type === 'generalCylinder') {
      parseGeneralCylinder(primitiveInfo, nodeId, treeIndex, THREEColor, group);
    }
  });
  return group;
}
