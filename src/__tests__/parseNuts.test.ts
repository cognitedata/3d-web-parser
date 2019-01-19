// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseNuts from '../parsers/parseNuts';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import NutGroup from '../geometry/NutGroup';

describe('parseNuts', () => {
  test('parseNuts', () => {
    const nodeId = 1234;
    const treeIndex = 123;
    const color = new THREE.Color(1.0, 0.3, 0.4);
    const centerA = new THREE.Vector3(1.0, 2.0, 3.0);
    const centerB = new THREE.Vector3(4.0, 5.0, 6.0);
    const radius = 2.11;
    const rotationAngle = 3.11;

    const geometries = [
      {
        type: 'nut',
        nodes: [{ properties: [{
          nodeId: nodeId,
          treeIndex: treeIndex,
          color: { rgb: color.getHex() },
        }] }],
        primitiveInfo: {
          nut: {
            centerA: { x: centerA.x, y: centerA.y, z: centerA.z },
            centerB: { x: centerB.x, y: centerB.y, z: centerB.z },
            radius: radius,
            rotationAngle: rotationAngle,
          },
        },
      },
    ];

    let group: NutGroup;
    // @ts-ignore
    group = parseNuts(geometries);
    expect(group.capacity).toBe(1);
    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);
    expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    expectVector3Equal(group.getCenterA(new THREE.Vector3(), 0), centerA);
    expectVector3Equal(group.getCenterB(new THREE.Vector3(), 0), centerB);
    expect(group.getRadius(0)).toBeCloseTo(radius);
    expect(group.getRotationAngle(0)).toBeCloseTo(rotationAngle);
  });
});
