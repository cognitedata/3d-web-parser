// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseExtrudedRings from '../parsers/parseExtrudedRings';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import ExtrudedRingGroup from '../geometry/ExtrudedRingGroup';

describe('parseExtrudedRings', () => {
  test('parseExtrudedRings', () => {
    const nodeId = 1234;
    const treeIndex = 123;
    const color = new THREE.Color(1.0, 0.3, 0.4);
    const centerA = new THREE.Vector3(1.0, 2.0, 0.0);
    const centerB = new THREE.Vector3(1.0, 2.0, 0.0);
    const innerRadius = 2.0;
    const outerRadius = 3.0;
    const isClosed = false;
    const angle = 1.5;
    const arcAngle = 1.4;

    const geometries = [
      {
        type: 'extrudedRing',
        nodes: [{ properties: [{
          nodeId: nodeId,
          treeIndex: treeIndex,
          color: { rgb: color.getHex() },
        }] }],
        primitiveInfo: {
          extrudedRing: {
            centerA: { x: centerA.x, y: centerA.y, z: centerA.z },
            centerB: { x: centerB.x, y: centerB.y, z: centerB.z },
            innerRadius: innerRadius,
            outerRadius: outerRadius,
            isClosed: isClosed,
            arcAngle: arcAngle,
            angle: angle,
          },
        },
      },
    ];

    let group: ExtrudedRingGroup;
    // @ts-ignore
    group = parseExtrudedRings(geometries);
    expect(group.capacity).toBe(1);
    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);
    expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    expectVector3Equal(group.getCenterA(new THREE.Vector3(), 0), centerA);
    expectVector3Equal(group.getCenterB(new THREE.Vector3(), 0), centerB);
    expect(group.getInnerRadius(0)).toBeCloseTo(innerRadius);
    expect(group.getOuterRadius(0)).toBeCloseTo(outerRadius);
    expect(group.getIsClosed(0)).toBe(isClosed);
    expect(group.getAngle(0)).toBe(angle);
    expect(group.getArcAngle(0)).toBe(arcAngle);
  });
});
