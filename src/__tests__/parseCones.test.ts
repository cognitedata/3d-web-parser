// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseCones from '../parsers/parseCones';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import ConeGroup from '../geometry/ConeGroup';

describe('parseCones', () => {
  test('parseCones', () => {
    const nodeId = 1234;
    const treeIndex = 123;
    const color = new THREE.Color(1.0, 0.3, 0.4);
    const centerA = new THREE.Vector3(1.0, 2.0, 0.0);
    const centerB = new THREE.Vector3(1.0, 2.0, 0.0);
    const radiusA = 2.0;
    const radiusB = 3.0;
    const isClosed = false;
    const angle = 1.5;
    const arcAngle = 1.4;

    const geometries = [
      {
        type: 'cone',
        nodes: [{ properties: [{
          nodeId: nodeId,
          treeIndex: treeIndex,
          color: { rgb: color.getHex() },
        }] }],
        primitiveInfo: {
          cone: {
            centerA: { x: centerA.x, y: centerA.y, z: centerA.z },
            centerB: { x: centerB.x, y: centerB.y, z: centerB.z },
            radiusA: radiusA,
            radiusB: radiusB,
            isClosed: isClosed,
            arcAngle: arcAngle,
            angle: angle,
          },
        },
      },
    ];

    let group: ConeGroup;
    // @ts-ignore
    group = parseCones(geometries);
    expect(group.capacity).toBe(1);
    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);
    expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    expectVector3Equal(group.getCenterA(new THREE.Vector3(), 0), centerA);
    expectVector3Equal(group.getCenterB(new THREE.Vector3(), 0), centerB);
    expect(group.getRadiusA(0)).toBeCloseTo(radiusA);
    expect(group.getRadiusB(0)).toBeCloseTo(radiusB);
    expect(group.getIsClosed(0)).toBe(isClosed);
    expect(group.getAngle(0)).toBe(angle);
    expect(group.getArcAngle(0)).toBe(arcAngle);
  });
});
