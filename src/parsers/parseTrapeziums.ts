import * as THREE from 'three';
import TrapeziumGroup from '../geometry/TrapeziumGroup';
import { MatchingGeometries,
         parsePrimitiveColor,
         parsePrimitiveNodeId,
         parsePrimitiveTreeIndex,
         getPrimitiveType,
         isPrimitive } from './parseUtils';
import { xAxis, zAxis } from '../constants';

const THREEColor = new THREE.Color();
const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();
const capZAxis = new THREE.Vector3();
const capXAxis = new THREE.Vector3();
const vertex = new THREE.Vector3();
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

    const { thickness, arcAngle, isClosed } = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];

    if ( (geometry.type === 'cone' || geometry.type === 'generalCylinder')
        && thickness > 0
        && arcAngle < 2 * Math.PI
        && isClosed) {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 2;
    }
  });

  return matchingGeometries;
}

function parseCone(primitiveInfo: any,
                   nodeId: number,
                   treeIndex: number,
                   color: THREE.Color,
                   group: TrapeziumGroup) {
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

  [false, true].forEach(isSecondQuad => {
    const finalAngle = angle + Number(isSecondQuad) * arcAngle;
    vertex
      .set(Math.cos(finalAngle), Math.sin(finalAngle), 0)
      .applyQuaternion(rotation)
      .normalize();
    const vertices: THREE.Vector3[] = [];
    const offsets = [0, -thickness];
    [true, false].forEach(isA => {
      if (isSecondQuad) { isA = !isA; }
      const radius = isA ? radiusA : radiusB;
      const center = isA ? centerA : centerB;
      offsets.forEach(offset => {
        vertices.push(
          vertex
            .clone()
            .multiplyScalar(radius + offset)
            .add(center),
        );
      });
    });
    group.add(nodeId, treeIndex, color, vertices[0], vertices[1], vertices[2], vertices[3]);
  });
}

function parseGeneralCylinder(primitiveInfo: any,
                              nodeId: number,
                              treeIndex: number,
                              color: THREE.Color,
                              group: TrapeziumGroup) {
  console.log('Trapezium parsing from generalCylinder parsing isn\'t implemented');
}

export default function parse(geometries: any[]): TrapeziumGroup {
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = new TrapeziumGroup(matchingGeometries.count);

  matchingGeometries.geometries.forEach(geometry => {
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    THREEColor.setHex(parsePrimitiveColor(geometry));

    if (geometry.type === 'cone') {
      parseCone(primitiveInfo, nodeId, treeIndex, THREEColor, group);
    } else if (geometry.type === 'generalCylinder') {
      parseGeneralCylinder(primitiveInfo, nodeId, treeIndex, THREEColor, group);
    }
  });
  return group;
}
