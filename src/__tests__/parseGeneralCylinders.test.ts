// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseGeneralCylinders from '../parsers/parseGeneralCylinders';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import GeneralCylinderGroup from '../geometry/GeneralCylinderGroup';

describe('parseGeneralCylinders', () => {
  test('parseGeneralCylinders', () => {
    const nodeId = 1234;
    const treeIndex = 123;
    const color = new THREE.Color(1.0, 0.3, 0.4);
    const centerA = new THREE.Vector3(1.0, 2.0, 0.0);
    const centerB = new THREE.Vector3(1.0, 2.0, 0.0);
    const radius = 2.0;
    const heightA = 3.0;
    const heightB = 4.0;
    const slopeA = 5.0;
    const slopeB = 6.0;
    const zAngleA = 7.0;
    const zAngleB = 8.0;
    const angle = 1.5;
    const arcAngle = 1.4;

    const geometries = [
      {
        type: 'generalCylinder',
        nodes: [{ properties: [{
          nodeId: nodeId,
          treeIndex: treeIndex,
          color: { rgb: color.getHex() },
        }] }],
        primitiveInfo: {
          generalCylinder: {
            centerA: { x: centerA.x, y: centerA.y, z: centerA.z },
            centerB: { x: centerB.x, y: centerB.y, z: centerB.z },
            radius: radius,
            heightA: heightA,
            heightB: heightB,
            slopeA: slopeA,
            slopeB: slopeB,
            zAngleA: zAngleA,
            zAngleB: zAngleB,
            angle: angle,
            arcAngle: arcAngle,
          },
        },
      },
    ];

    let group: GeneralCylinderGroup;
    // @ts-ignore
    group = parseGeneralCylinders(geometries);
    expect(group.capacity).toBe(1);
    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);
    expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    expectVector3Equal(group.getCenterA(new THREE.Vector3(), 0), centerA);
    expectVector3Equal(group.getCenterB(new THREE.Vector3(), 0), centerB);
    expect(group.getRadius(0)).toBeCloseTo(radius);
    expect(group.getHeightA(0)).toBeCloseTo(heightA);
    expect(group.getHeightB(0)).toBeCloseTo(heightB);
    expect(group.getSlopeA(0)).toBeCloseTo(slopeA);
    expect(group.getSlopeB(0)).toBeCloseTo(slopeB);
    expect(group.getZAngleA(0)).toBeCloseTo(zAngleA);
    expect(group.getZAngleB(0)).toBeCloseTo(zAngleB);
    expect(group.getAngle(0)).toBeCloseTo(angle);
    expect(group.getArcAngle(0)).toBeCloseTo(arcAngle);
  });
});
