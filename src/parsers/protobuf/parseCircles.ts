// Copyright 2019 Cognite AS

import * as THREE from 'three';
import CircleGroup from '../../geometry/CircleGroup';

import {
  MatchingGeometries,
  parsePrimitiveColor,
  parsePrimitiveNodeId,
  parsePrimitiveTreeIndex,
  getPrimitiveType,
  isPrimitive
} from './protobufUtils';

import { ParseData, FilterOptions } from '../parseUtils';

const color = new THREE.Color();
const center = new THREE.Vector3();
const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();
const normal = new THREE.Vector3();
const vector = new THREE.Vector3();

function findMatchingGeometries(geometries: any[]): MatchingGeometries {
  const matchingGeometries: MatchingGeometries = {
    count: 0,
    geometries: []
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

function parseConeEccentricConeCylinder(geometry: any[], group: CircleGroup, filterOptions?: FilterOptions): boolean {
  let added = false;
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
    const size = 2 * radius;
    normal
      .copy(centerA)
      .sub(centerB)
      .normalize();
    added = group.add(nodeId, treeIndex, size, centerA, normal, radius, filterOptions);
    added = group.add(nodeId, treeIndex, size, centerB, normal, radius, filterOptions) || added;
    // @ts-ignore
  } else if (geometry.type === 'cone') {
    const { radiusA = 0, radiusB = 0 } = primitiveInfo;
    const sizeA = 2 * radiusA;
    const sizeB = 2 * radiusB;

    normal
      .copy(centerA)
      .sub(centerB)
      .normalize();

    added = group.add(nodeId, treeIndex, sizeA, centerA, normal, radiusA, filterOptions);
    added = group.add(nodeId, treeIndex, sizeB, centerB, normal, radiusB, filterOptions) || added;
    // @ts-ignore
  } else if (geometry.type === 'eccentricCone') {
    const { radiusA, radiusB } = primitiveInfo;
    const sizeA = 2 * radiusA;
    const sizeB = 2 * radiusB;

    ({ x = 0, y = 0, z = 0 } = primitiveInfo.normalA);
    normal.set(x, y, z);
    const dotProduct = normal.dot(vector.copy(centerA).sub(centerB));

    if (dotProduct > 0) {
      normal.negate();
    }
    added = group.add(nodeId, treeIndex, sizeA, centerA, normal, radiusA, filterOptions);
    added = group.add(nodeId, treeIndex, sizeB, centerB, normal, radiusB, filterOptions) || added;
  }

  return added;
}

export default function parse(args: ParseData): CircleGroup {
  const { geometries, filterOptions, treeIndexNodeIdMap, colorMap } = args;
  const matchingGeometries = findMatchingGeometries(geometries);

  const group = new CircleGroup(matchingGeometries.count);

  matchingGeometries.geometries.forEach(geometry => {
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    let added = false;

    if (['cylinder', 'cone', 'eccentricCone'].indexOf(geometry.type) !== -1) {
      added = parseConeEccentricConeCylinder(geometry, group, filterOptions);
    } else {
      let { x = 0, y = 0, z = 0 } = primitiveInfo.normal;
      normal.set(x, y, z);

      ({ x = 0, y = 0, z = 0 } = primitiveInfo.center);
      center.set(x, y, z);

      if (geometry.type === 'sphericalSegment') {
        const { radius, height } = primitiveInfo;
        const circleRadius = Math.sqrt(height * (2 * radius - height));
        const size = 2 * circleRadius;
        center.add(vector.copy(normal).multiplyScalar(radius - height));
        added = group.add(nodeId, treeIndex, size, center, normal, circleRadius, filterOptions);
      } else if (geometry.type === 'ellipsoidSegment') {
        const { verticalRadius, horizontalRadius, height } = primitiveInfo;
        const length = verticalRadius - height;
        const circleRadius =
          (Math.sqrt(verticalRadius * verticalRadius - length * length) * horizontalRadius) / verticalRadius;
        const size = 2 * circleRadius;
        center.add(
          vector
            .copy(normal)
            .normalize()
            .multiplyScalar(length)
        );
        added = group.add(nodeId, treeIndex, size, center, normal, circleRadius, filterOptions);
      } else {
        // Regular circles
        const { radius } = primitiveInfo;
        const size = 2 * radius;
        added = group.add(nodeId, treeIndex, size, center, normal, radius, filterOptions);
      }
    }
    if (added) {
      treeIndexNodeIdMap[treeIndex] = nodeId;
      colorMap[treeIndex] = color.clone();
    }
  });
  return group;
}
