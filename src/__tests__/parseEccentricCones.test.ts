// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseEccentricCone from '../parsers/parseEccentricCone';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import EccentricConeGroup from '../geometry/EccentricConeGroup';

describe('parseEccentricCone', () => {
  test('parseEccentricCone', () => {
    const nodeId = 1234;
    const treeIndex = 123;
    const color = new THREE.Color(1.0, 0.3, 0.4);
    const centerA = new THREE.Vector3(1.0, 2.0, 0.0);
    const centerB = new THREE.Vector3(1.0, 2.0, 0.0);
    const radiusA = 2.0;
    const radiusB = 3.0;
    const isClosed = false;
    const normal = new THREE.Vector3(0.2, 0.1, 0.5);

    const geometries = [
      {
        type: 'eccentricCone',
        nodes: [{ properties: [{
          nodeId: nodeId,
          treeIndex: treeIndex,
          color: { rgb: color.getHex() },
        }] }],
        primitiveInfo: {
          eccentricCone: {
            centerA: { x: centerA.x, y: centerA.y, z: centerA.z },
            centerB: { x: centerB.x, y: centerB.y, z: centerB.z },
            normal: { x: normal.x, y: normal.y, z: normal.z },
            radiusA: radiusA,
            radiusB: radiusB,
            isClosed: isClosed,
          },
        },
      },
    ];

    let group: EccentricConeGroup;
    // @ts-ignore
    group = parseEccentricCone(geometries);
    expect(group.capacity).toBe(1);
    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);
    expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    expectVector3Equal(group.getCenterA(new THREE.Vector3(), 0), centerA);
    expectVector3Equal(group.getCenterB(new THREE.Vector3(), 0), centerB);
    expect(group.getRadiusA(0)).toBeCloseTo(radiusA);
    expect(group.getRadiusB(0)).toBeCloseTo(radiusB);
    expect(group.getIsClosed(0)).toBe(isClosed);
    expectVector3Equal(group.getNormal(new THREE.Vector3(), 0), normal);
  });
});
