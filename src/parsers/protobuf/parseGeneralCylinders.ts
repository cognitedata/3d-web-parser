import * as THREE from 'three';
import GeneralCylinderGroup from '../../geometry/GeneralCylinderGroup';
import { PrimitiveGroupMap } from '../../geometry/PrimitiveGroup';
import { MatchingGeometries,
  parsePrimitiveColor,
  parsePrimitiveNodeId,
  parsePrimitiveTreeIndex,
  getPrimitiveType,
  isPrimitive,
  normalizeRadians } from './protobufUtils';
import { ParsePrimitiveData } from '../parseUtils';
import { zAxis } from '../../constants';

// reusable variables
const color = new THREE.Color();
const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();
const extA = new THREE.Vector3();
const extB = new THREE.Vector3();
const globalRotation = new THREE.Quaternion();
const slicingPlane = new THREE.Vector4();
const globalAxis = new THREE.Vector3();
const vertex = new THREE.Vector3();
const planes = [new THREE.Plane(), new THREE.Plane()];
const line = new THREE.Line3();
const lineStart = new THREE.Vector3();
const lineEnd = new THREE.Vector3();

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
    const { thickness = 0, radiusA, radiusB } = primitiveInfo;

    if (geometry.type === 'generalCylinder' && radiusA === radiusB) {
      // A cone is produced if radii are different
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
      if (thickness > 0) {
        matchingGeometries.count += 1;
      }
    }
  });

  return matchingGeometries;
}

function createNewGroupIfNeeded(primitiveGroupMap: PrimitiveGroupMap, minimumRequiredCapacity: number) {
  if (
    primitiveGroupMap.GeneralCylinder.group.data.count + minimumRequiredCapacity
    > primitiveGroupMap.GeneralCylinder.group.capacity) {
      const capacity = Math.max(minimumRequiredCapacity, primitiveGroupMap.GeneralCylinder.capacity);
      primitiveGroupMap.GeneralCylinder.group = new GeneralCylinderGroup(capacity);
      return true;
  }
  return false;
}

export default function parse(args: ParsePrimitiveData): boolean {
  const { geometries, primitiveGroupMap, filterOptions } = args;
  const matchingGeometries = findMatchingGeometries(geometries);
  const didCreateNewGroup = createNewGroupIfNeeded(primitiveGroupMap, matchingGeometries.count);
  const group = primitiveGroupMap.GeneralCylinder.group;

  matchingGeometries.geometries.forEach(geometry => {
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];

    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    let { x = 0, y = 0, z = 0 } = primitiveInfo.centerA;
    centerA.set(x, y, z);

    ({ x = 0, y = 0, z = 0 } = primitiveInfo.centerB);
    centerB.set(x, y, z);

    const {
      radiusA,
      radiusB,
      arcAngle = 2.0 * Math.PI,
      slopeA = 0,
      slopeB = 0,
      zAngleA = 0,
      zAngleB = 0,
      isClosed = false,
    } = primitiveInfo;

    let { angle = 0 } = primitiveInfo;
    angle = normalizeRadians(angle);

    const thickness = primitiveInfo.thickness || (isClosed ? radiusA : 0);

    globalAxis.subVectors(centerA, centerB);
    const distFromBToA = globalAxis.length();
    globalRotation.setFromUnitVectors(zAxis, globalAxis.normalize());

    const distFromAToExtA = radiusA * Math.tan(slopeA);
    const distFromBToExtB = radiusA * Math.tan(slopeB);
    const heightA = distFromBToExtB + distFromBToA;
    const heightB = distFromBToExtB;

    extA.copy(globalAxis)
      .multiplyScalar(distFromAToExtA)
      .add(centerA);
    extB.copy(globalAxis)
      .multiplyScalar(-distFromBToExtB)
      .add(centerB);

    group.add(nodeId, treeIndex, color, extA, extB,
              radiusA, heightA,
              heightB, slopeA, slopeB, zAngleA, zAngleB,
              angle, arcAngle, filterOptions);
    if (thickness > 0) {
      if (thickness !== radiusA) {
        group.add(nodeId, treeIndex, color, extA, extB,
                  radiusA - thickness, heightA,
                  heightB, slopeA, slopeB, zAngleA, zAngleB,
                  angle, arcAngle, filterOptions);
      }
    }
  });
  return didCreateNewGroup;
}
