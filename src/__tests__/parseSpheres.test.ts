// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseSpheres from '../parsers/parseSpheres';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import SphereGroup from '../geometry/SphereGroup';

describe('parseSpheres', () => {
  test('parseSpheres', () => {
    const nodeId = 1234;
    const treeIndex = 123;
    const color = new THREE.Color(1.0, 0.3, 0.4);
    const center = new THREE.Vector3(2.0, 3.0, 4.0);
    const radius = 1.0;

    const geometries = [
      {
        type: 'sphere',
        nodes: [{ properties: [{
          nodeId: nodeId,
          treeIndex: treeIndex,
          color: { rgb: color.getHex() },
        }] }],
        primitiveInfo: {
          sphere: {
            center: { x: center.x, y: center.y, z: center.z },
            radius: radius,
          },
        },
      },
    ];

    let group: SphereGroup;
    // @ts-ignore
    group = parseSpheres(geometries);
    expect(group.capacity).toBe(1);
    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);
    expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    expectVector3Equal(group.getCenter(new THREE.Vector3(), 0), center);
    expect(group.getRadius(0)).toBeCloseTo(radius);
  });
});
