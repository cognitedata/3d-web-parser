import * as THREE from 'three';
import ConeGroup from '../../geometry/ConeGroup';
import { PrimitiveGroupMap } from '../../geometry/PrimitiveGroup';
import { MatchingGeometries,
  parsePrimitiveColor,
  parsePrimitiveNodeId,
  parsePrimitiveTreeIndex,
  getPrimitiveType,
  isPrimitive } from './protobufUtils';
import { zAxis } from '../../constants';
import { ParsePrimitiveData } from '../parseUtils';

const globalColor = new THREE.Color();
const globalCenterA = new THREE.Vector3();
const globalCenterB = new THREE.Vector3();
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
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const { thickness = 0, radiusA, radiusB } = primitiveInfo;

    if (geometry.type === 'cone'
    || (geometry.type === 'generalCylinder' && radiusA !== radiusB)) {
      matchingGeometries.geometries.push(geometry);
      if (thickness > 0) {
        matchingGeometries.count += 2;
      } else {
        matchingGeometries.count += 1;
      }
    } else if (geometry.type === 'cylinder') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    } else if (geometry.type === 'extrudedRing' || geometry.type === 'extrudedRingSegment') {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 2;
    }
  });

  return matchingGeometries;
}

function createNewGroupIfNeeded(primitiveGroupMap: PrimitiveGroupMap, minimumRequiredCapacity: number) {
  if (primitiveGroupMap.Cone.group.count + minimumRequiredCapacity > primitiveGroupMap.Cone.group.capacity) {
      const capacity = Math.max(minimumRequiredCapacity, primitiveGroupMap.Cone.capacity);
      primitiveGroupMap.Cone.group = new ConeGroup(capacity);
      return true;
  }
  return false;
}

export default function parse(args: ParsePrimitiveData): boolean {
  const { geometries, primitiveGroupMap, filterOptions } = args;
  const matchingGeometries = findMatchingGeometries(geometries);

  const didCreateNewGroup = createNewGroupIfNeeded(primitiveGroupMap, matchingGeometries.count);
  const group = primitiveGroupMap.Cone.group;

  matchingGeometries.geometries.forEach(geometry => {
    const primitiveInfo = geometry.primitiveInfo[getPrimitiveType(geometry.primitiveInfo)];
    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    globalColor.setHex(parsePrimitiveColor(geometry));

    let { x = 0, y = 0, z = 0 } = primitiveInfo.centerA;
    globalCenterA.set(x, y, z);

    ({ x = 0, y = 0, z = 0 } = primitiveInfo.centerB);
    globalCenterB.set(x, y, z);

    if (geometry.type === 'cylinder') {
      const { radius } = primitiveInfo;
      group.add(nodeId,
        treeIndex,
        globalColor,
        globalCenterA,
        globalCenterB,
        radius,
        radius,
        0,
        2 * Math.PI,
        filterOptions);
    } else if (geometry.type === 'cone' || geometry.type === 'generalCylinder') {
      let { radiusA, radiusB } = primitiveInfo;
      const { angle = 0, arcAngle  = 2.0 * Math.PI, thickness = 0 } = primitiveInfo;
      group.add(nodeId,
        treeIndex,
        globalColor,
        globalCenterA,
        globalCenterB,
        radiusA,
        radiusB,
        angle,
        arcAngle,
        filterOptions);

      if (thickness > 0) {
        // Create the inner cone if it has a thickness
        radiusA -= thickness;
        radiusB -= thickness;
        group.add(nodeId,
          treeIndex,
          globalColor,
          globalCenterA,
          globalCenterB,
          radiusA,
          radiusB,
          angle,
          arcAngle,
          filterOptions);
      }
    } else if (geometry.type === 'extrudedRing' || geometry.type === 'extrudedRingSegment') {
      const { innerRadius, outerRadius, angle = 0, arcAngle = 2.0 * Math.PI } = primitiveInfo;
      group.add(nodeId,
        treeIndex,
        globalColor,
        globalCenterA,
        globalCenterB,
        innerRadius,
        innerRadius,
        angle,
        arcAngle,
        filterOptions);

      group.add(nodeId,
        treeIndex,
        globalColor,
        globalCenterA,
        globalCenterB,
        outerRadius,
        outerRadius,
        angle,
        arcAngle,
        filterOptions);
    }
  });
  return didCreateNewGroup;
}