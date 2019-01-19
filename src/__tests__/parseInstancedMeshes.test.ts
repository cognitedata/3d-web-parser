// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseBoxes from '../parsers/parseBoxes';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import BoxGroup from '../geometry/BoxGroup';

describe('parseBoxes', () => {
  test('parseBoxes', () => {
    const nodeId = 1234;
    const treeIndex = 123;
    const color = new THREE.Color(1.0, 0.3, 0.4);
    const center = new THREE.Vector3(1.0, 2.0, 0.0);
    const normal = new THREE.Vector3(5.0, 10.0, 3.0);
    const delta = new THREE.Vector3(12, 15.1, 10.32);
    const angle = 1.0;

    const geometries = [
      {
        type: 'box',
        nodes: [{ properties: [{
          nodeId: nodeId,
          treeIndex: treeIndex,
          color: { rgb: color.getHex() },
        }] }],
        primitiveInfo: {
          box: {
            center: { x: center.x, y: center.y, z: center.z },
            normal: { x: normal.x, y: normal.y, z: normal.z },
            delta: { x: delta.x, y: delta.y, z: delta.z },
            angle: angle,
          },
        },
      },
    ];

    let group: BoxGroup;
    // @ts-ignore
    group = parseBoxes(geometries);
    expect(group.capacity).toBe(1);
    expectColorEqual(group.getColor(new THREE.Color(), 0), color);
    expectVector3Equal(group.getCenter(new THREE.Vector3(), 0), center);
    expectVector3Equal(group.getNormal(new THREE.Vector3(), 0), normal);
    expectVector3Equal(group.getDelta(new THREE.Vector3(), 0), delta);
    expect(group.getAngle(0)).toBeCloseTo(angle);
    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);
  });
});
