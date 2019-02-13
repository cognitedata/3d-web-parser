import * as THREE from 'three';
import QuadGroup from '../../geometry/QuadGroup';
import { PrimitiveGroupMap } from '../../geometry/PrimitiveGroup';
import { MatchingGeometries,
         parsePrimitiveColor,
         parsePrimitiveNodeId,
         parsePrimitiveTreeIndex,
         getPrimitiveType,
         isPrimitive} from './protobufUtils';
import { ParsePrimitiveData } from '../parseUtils';
import { zAxis } from '../../constants';

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
    if (!isPrimitive(geometry)) {
      return;
    }

    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const { arcAngle = 0, isClosed = false } = primitiveInfo;

    if ( (geometry.type === 'extrudedRing' || geometry.type === 'extrudedRingSegment')
        && arcAngle < 2 * Math.PI
        && isClosed) {
          matchingGeometries.geometries.push(geometry);
          matchingGeometries.count += 2;
          const treeIndex = parsePrimitiveTreeIndex(geometry);
      }
  });

  return matchingGeometries;
}

function createNewGroupIfNeeded(primitiveGroupMap: PrimitiveGroupMap, minimumRequiredCapacity: number) {
  if (primitiveGroupMap.Quad.group.data.count + minimumRequiredCapacity > primitiveGroupMap.Quad.group.capacity) {
      const capacity = Math.max(minimumRequiredCapacity, primitiveGroupMap.Quad.capacity);
      primitiveGroupMap.Quad.group = new QuadGroup(capacity);
      return true;
  }
  return false;
}

export default function parse(args: ParsePrimitiveData): boolean {
  const { geometries, primitiveGroupMap, filterOptions } = args;
  const matchingGeometries = findMatchingGeometries(geometries);
  const didCreateNewGroup = createNewGroupIfNeeded(primitiveGroupMap, matchingGeometries.count);
  const group = primitiveGroupMap.Quad.group;

  matchingGeometries.geometries.forEach(geometry => {
    // Only extruded rings will produce quads
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));
    const {
      angle = 0,
      innerRadius,
      outerRadius,
      arcAngle = 2 * Math.PI,
    } = primitiveInfo;

    let { x = 0, y = 0, z = 0 } = primitiveInfo.centerA;
    centerA.set(x, y, z);

    ({ x = 0, y = 0, z = 0 } = primitiveInfo.centerB);
    centerB.set(x, y, z);

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
        .multiplyScalar(innerRadius)
        .add(centerB);

      if (isSecondQuad) {
        // swap the order of vertex1 and vertex2 to flip the normal
        group.add(nodeId, treeIndex, color, vertex2, vertex1, vertex3, filterOptions);
      } else {
        group.add(nodeId, treeIndex, color, vertex1, vertex2, vertex3, filterOptions);
      }
    });
  });
  return didCreateNewGroup;
}
