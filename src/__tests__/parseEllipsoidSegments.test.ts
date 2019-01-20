// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseEllipsoidSegments from '../parsers/parseEllipsoidSegments';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import EllipsoidSegmentGroup from '../geometry/EllipsoidSegmentGroup';

describe('parseEllipsoidSegments', () => {
  test('parseEllipsoidSegments', () => {
    const nodeId = 1234;
    const treeIndex = 123;
    const color = new THREE.Color(1.0, 0.3, 0.4);
    const center = new THREE.Vector3(1.0, 2.0, 0.0);
    const normal = new THREE.Vector3(5.0, 10.0, 3.0);
    const hRadius = 1.1;
    const vRadius = 2.1;
    const height = 3.1;
    const isClosed = false;

    const geometries = [
      {
        type: 'ellipsoidSegment',
        nodes: [{ properties: [{
          nodeId: nodeId,
          treeIndex: treeIndex,
          color: { rgb: color.getHex() },
        }] }],
        primitiveInfo: {
          ellipsoidSegment: {
            center: { x: center.x, y: center.y, z: center.z },
            normal: { x: normal.x, y: normal.y, z: normal.z },
            hRadius: hRadius,
            vRadius: vRadius,
            height: height,
            isClosed: isClosed,
          },
        },
      },
    ];

    let group: EllipsoidSegmentGroup;
    // @ts-ignore
    group = parseEllipsoidSegments(geometries);
    expect(group.capacity).toBe(1);
    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);
    expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    expectVector3Equal(group.getCenter(new THREE.Vector3(), 0), center);
    expectVector3Equal(group.getNormal(new THREE.Vector3(), 0), normal);
    expect(group.getVRadius(0)).toBeCloseTo(vRadius);
    expect(group.getHRadius(0)).toBeCloseTo(hRadius);
    expect(group.getHeight(0)).toBeCloseTo(height);
    expect(group.getIsClosed(0)).toBe(isClosed);
  });
});
