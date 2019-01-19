// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseTori from '../parsers/parseTori';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import TorusGroup from '../geometry/TorusGroup';

describe('parseTori', () => {
  test('parseTori', () => {
    const nodeId = 1234;
    const treeIndex = 123;
    const color = new THREE.Color(1.0, 0.3, 0.4);
    const center = new THREE.Vector3(1.0, 2.0, 0.0);
    const normal = new THREE.Vector3(5.0, 10.0, 3.0);
    const radius = 1.0;
    const tubeRadius = 1.0;

    const geometries = [
      {
        type: 'torus',
        nodes: [{ properties: [{
          nodeId: nodeId,
          treeIndex: treeIndex,
          color: { rgb: color.getHex() },
        }] }],
        primitiveInfo: {
          torus: {
            center: { x: center.x, y: center.y, z: center.z },
            normal: { x: normal.x, y: normal.y, z: normal.z },
            radius: radius,
            tubeRadius: tubeRadius,
          },
        },
      },
    ];

    let group: TorusGroup;
    // @ts-ignore
    group = parseTori(geometries);
    expect(group.capacity).toBe(1);
    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);
    expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    expectVector3Equal(group.getCenter(new THREE.Vector3(), 0), center);
    expectVector3Equal(group.getNormal(new THREE.Vector3(), 0), normal);
    expect(group.getRadius(0)).toBeCloseTo(radius);
    expect(group.getTubeRadius(0)).toBeCloseTo(tubeRadius);
  });
});
