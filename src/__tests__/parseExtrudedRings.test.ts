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
          },
        },
      },
      {
        type: 'extrudedRingSegment',
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
    expect(group.capacity).toBe(2);

    {
      // Test regular extrudedRing
      const index = 0;
      expect(group.getNodeId(index)).toBe(nodeId);
      expect(group.getTreeIndex(index)).toBe(treeIndex);
      expectColorEqual(group.getColor(new THREE.Color(), 0), color);

      expectVector3Equal(group.getCenterA(new THREE.Vector3(), 0), centerA);
      expectVector3Equal(group.getCenterB(new THREE.Vector3(), 0), centerB);
      expect(group.getInnerRadius(index)).toBeCloseTo(innerRadius);
      expect(group.getOuterRadius(index)).toBeCloseTo(outerRadius);
    }

    {
      // Test extrudedRingSegment
      const index = 1;
      expect(group.getNodeId(index)).toBe(nodeId);
      expect(group.getTreeIndex(index)).toBe(treeIndex);
      expectColorEqual(group.getColor(new THREE.Color(), 0), color);

      expectVector3Equal(group.getCenterA(new THREE.Vector3(), 0), centerA);
      expectVector3Equal(group.getCenterB(new THREE.Vector3(), 0), centerB);
      expect(group.getInnerRadius(index)).toBeCloseTo(innerRadius);
      expect(group.getOuterRadius(index)).toBeCloseTo(outerRadius);
      expect(group.getIsClosed(index)).toBe(isClosed);
      expect(group.getAngle(index)).toBe(angle);
      expect(group.getArcAngle(index)).toBe(arcAngle);
    }
  });
});
