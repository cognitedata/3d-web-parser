import * as THREE from 'three';
import CircleGroup from '../../geometry/CircleGroup';
import { PrimitiveGroupMap } from '../../geometry/PrimitiveGroup';
import { MatchingGeometries,
         parsePrimitiveColor,
         parsePrimitiveNodeId,
         parsePrimitiveTreeIndex,
         getPrimitiveType,
         isPrimitive } from './protobufUtils';

import { ParsePrimitiveData, FilterOptions } from '../parseUtils';

const color = new THREE.Color();
const center = new THREE.Vector3();
const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();
const normal = new THREE.Vector3();
const vector = new THREE.Vector3();

function findMatchingGeometries(geometries: any[]): MatchingGeometries {
  const matchingGeometries: MatchingGeometries = {
    count: 0,
    geometries: [],
  };

  geometries.forEach(geometry => {
    if (!isPrimitive(geometry)) {
      return;
    }
    const { isClosed = false, thickness = 0 } = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];

    if (geometry.type === 'circle') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    } else if (isClosed) {
      // Closed geometries may produce circles

      if (['cylinder', 'eccentricCone'].indexOf(geometry.type) !== -1) {
        // End caps on the cylinder types
        matchingGeometries.geometries.push(geometry);
        matchingGeometries.count += 2;
      } else if (geometry.type === 'cone' && thickness === 0) {
        // End caps on the cone
        matchingGeometries.geometries.push(geometry);
        matchingGeometries.count += 2;
      } else if (geometry.type === 'sphericalSegment') {
        // End cap on spherical segments
        const EPS = 1e-6;
        const { radius, height } = geometry.primitiveInfo.sphericalSegment;
        const circleRadius = Math.sqrt(height * (2 * radius - height));
        if (circleRadius / radius > EPS) {
          matchingGeometries.geometries.push(geometry);
          matchingGeometries.count += 1;
        }
      } else if (geometry.type === 'ellipsoidSegment') {
        // End cap on ellipsoid segments
        const EPS = 1e-6;
        const { verticalRadius, horizontalRadius, height } = geometry.primitiveInfo.ellipsoidSegment;
        // Ellipse equation: x^2 / hR ^2 + y^2 / vR^2 = 1
        const y = verticalRadius - height;
        const circleRadius = (Math.sqrt(verticalRadius * verticalRadius - y * y) * horizontalRadius) / verticalRadius;
        if (circleRadius / horizontalRadius > EPS) {
          matchingGeometries.geometries.push(geometry);
          matchingGeometries.count += 1;
        }
      }
    }
  });

  return matchingGeometries;
}

function parseConeEccentricConeCylinder(geometry: any[], group: CircleGroup, filterOptions?: FilterOptions) {
  // @ts-ignore
  const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
  const nodeId = parsePrimitiveNodeId(geometry);
  const treeIndex = parsePrimitiveTreeIndex(geometry);
  color.setHex(parsePrimitiveColor(geometry));

  let { x = 0, y = 0, z = 0 } = primitiveInfo.centerA;
  centerA.set(x, y, z);

  ({ x = 0, y = 0, z = 0 } = primitiveInfo.centerB);
  centerB.set(x, y, z);
  // @ts-ignore
  if (geometry.type === 'cylinder') {
    const { radius = 0 } = primitiveInfo;
    normal.copy(centerA)
    .sub(centerB)
    .normalize();
    group.add(nodeId, treeIndex, color, centerA, normal, radius, filterOptions);
    group.add(nodeId, treeIndex, color, centerB, normal, radius, filterOptions);
  // @ts-ignore
  } else if (geometry.type === 'cone') {
    const { radiusA = 0, radiusB = 0 } = primitiveInfo;

    normal.copy(centerA)
    .sub(centerB)
    .normalize();

    group.add(nodeId, treeIndex, color, centerA, normal, radiusA, filterOptions);
    group.add(nodeId, treeIndex, color, centerB, normal, radiusA, filterOptions);
  // @ts-ignore
  } else if (geometry.type === 'eccentricCone') {
    const { radiusA, radiusB } = primitiveInfo;

    ({ x = 0, y = 0, z = 0 } = primitiveInfo.normalA);
    normal.set(x, y, z);
    const dotProduct = normal.dot(vector.copy(centerA).sub(centerB));

    if (dotProduct > 0) {
      normal.negate();
    }
    group.add(nodeId, treeIndex, color, centerA, normal, radiusA, filterOptions);
    group.add(nodeId, treeIndex, color, centerB, normal, radiusB, filterOptions);
  }
}

function createNewGroupIfNeeded(primitiveGroupMap: PrimitiveGroupMap, minimumRequiredCapacity: number) {
  if (primitiveGroupMap.Circle.group.count + minimumRequiredCapacity > primitiveGroupMap.Circle.group.capacity) {
      const capacity = Math.max(minimumRequiredCapacity, primitiveGroupMap.Circle.capacity);
      primitiveGroupMap.Circle.group = new CircleGroup(capacity);
      return true;
  }
  return false;
}

export default function parse(args: ParsePrimitiveData): boolean {
  const { geometries, primitiveGroupMap, filterOptions } = args;
  const matchingGeometries = findMatchingGeometries(geometries);

  const didCreateNewGroup = createNewGroupIfNeeded(primitiveGroupMap, matchingGeometries.count);
  const group = primitiveGroupMap.Circle.group;

  matchingGeometries.geometries.forEach(geometry => {
    if (['cylinder', 'cone', 'eccentricCone'].indexOf(geometry.type) !== -1) {
      parseConeEccentricConeCylinder(geometry, group, filterOptions);
    } else {
      const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
      const nodeId = parsePrimitiveNodeId(geometry);
      const treeIndex = parsePrimitiveTreeIndex(geometry);
      color.setHex(parsePrimitiveColor(geometry));

      const { radius } = primitiveInfo;

      let { x = 0, y = 0, z = 0 } = primitiveInfo.normal;
      normal.set(x, y, z);

      ({ x = 0, y = 0, z = 0 } = primitiveInfo.center);
      center.set(x, y, z);

      if (geometry.type === 'sphericalSegment') {
        const { height } = primitiveInfo;
        const circleRadius = Math.sqrt(height * (2 * radius - height));
        center.add(vector.copy(normal).multiplyScalar(radius - height));
        group.add(nodeId, treeIndex, color, center, normal, circleRadius, filterOptions);
      } else if (geometry.type === 'ellipsoidSegment') {
        const { verticalRadius, horizontalRadius, height } = primitiveInfo;
        const length = verticalRadius - height;
        const circleRadius =
              (Math.sqrt(verticalRadius * verticalRadius - length * length) * horizontalRadius)
              / verticalRadius;
        center.add(vector.copy(normal).normalize().multiplyScalar(length));
        group.add(nodeId, treeIndex, color, center, normal, circleRadius, filterOptions);
      } else {
        // Regular circles
        group.add(nodeId, treeIndex, color, center, normal, radius, filterOptions);
      }
    }
  });
  return didCreateNewGroup;
}