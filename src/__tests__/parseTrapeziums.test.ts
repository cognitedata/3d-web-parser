// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseTrapeziums from '../parsers/parseTrapeziums';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import TrapeziumGroup from '../geometry/TrapeziumGroup';

describe('parseTrapeziums', () => {
  test('parseTrapeziums', () => {
    const nodeId = 1234;
    const treeIndex = 123;
    const color = new THREE.Color(1.0, 0.3, 0.4);
    const vertex1 = new THREE.Vector3(1.0, 2.0, 3.0);
    const vertex2 = new THREE.Vector3(4.0, 5.0, 6.0);
    const vertex3 = new THREE.Vector3(7.0, 8.0, 9.0);
    const vertex4 = new THREE.Vector3(10.0, 11.0, 12.0);

    const geometries = [
      {
        type: 'trapezium',
        nodes: [{ properties: [{
          nodeId: nodeId,
          treeIndex: treeIndex,
          color: { rgb: color.getHex() },
        }] }],
        primitiveInfo: {
          trapezium: {
            vertex1: { x: vertex1.x, y: vertex1.y, z: vertex1.z },
            vertex2: { x: vertex2.x, y: vertex2.y, z: vertex2.z },
            vertex3: { x: vertex3.x, y: vertex3.y, z: vertex3.z },
            vertex4: { x: vertex4.x, y: vertex4.y, z: vertex4.z },
          },
        },
      },
    ];

    let group: TrapeziumGroup;
    // @ts-ignore
    group = parseTrapeziums(geometries);
    expect(group.capacity).toBe(1);
    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);
    expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    expectVector3Equal(group.getVertex1(new THREE.Vector3(), 0), vertex1);
    expectVector3Equal(group.getVertex2(new THREE.Vector3(), 0), vertex2);
    expectVector3Equal(group.getVertex3(new THREE.Vector3(), 0), vertex3);
    expectVector3Equal(group.getVertex4(new THREE.Vector3(), 0), vertex4);
  });
});
