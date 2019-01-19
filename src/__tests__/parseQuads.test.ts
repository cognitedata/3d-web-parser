// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseQuads from '../parsers/parseQuads';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import QuadGroup from '../geometry/QuadGroup';

describe('parseQuads', () => {
  test('parseQuads', () => {
    const nodeId = 1234;
    const treeIndex = 123;
    const color = new THREE.Color(1.0, 0.3, 0.4);
    const vertex1 = new THREE.Vector3(1.0, 2.0, 3.0);
    const vertex2 = new THREE.Vector3(4.0, 5.0, 6.0);
    const vertex3 = new THREE.Vector3(7.0, 8.0, 9.0);

    const geometries = [
      {
        type: 'quad',
        nodes: [{ properties: [{
          nodeId: nodeId,
          treeIndex: treeIndex,
          color: { rgb: color.getHex() },
        }] }],
        primitiveInfo: {
          quad: {
            vertex1: { x: vertex1.x, y: vertex1.y, z: vertex1.z },
            vertex2: { x: vertex2.x, y: vertex2.y, z: vertex2.z },
            vertex3: { x: vertex3.x, y: vertex3.y, z: vertex3.z },
          },
        },
      },
    ];

    let group: QuadGroup;
    // @ts-ignore
    group = parseQuads(geometries);
    expect(group.capacity).toBe(1);
    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);
    expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    expectVector3Equal(group.getVertex1(new THREE.Vector3(), 0), vertex1);
    expectVector3Equal(group.getVertex2(new THREE.Vector3(), 0), vertex2);
    expectVector3Equal(group.getVertex3(new THREE.Vector3(), 0), vertex3);
  });
});
