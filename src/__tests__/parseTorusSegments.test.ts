// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseTorusSegments from '../parsers/parseTorusSegments';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import TorusSegmentGroup from '../geometry/TorusSegmentGroup';

describe('parseTorusSegments', () => {
  test('parseTorusSegments', () => {
    const nodeId = 1234;
    const treeIndex = 123;
    const color = new THREE.Color(1.0, 0.3, 0.4);
    const center = new THREE.Vector3(1.0, 2.0, 0.0);
    const normal = new THREE.Vector3(5.0, 10.0, 3.0);
    const radius = 1.0;
    const tubeRadius = 2.0;
    const isClosed = false;
    const angle = 1.1;
    const arcAngle = 1.2;

    const geometries = [
      {
        type: 'torusSegment',
        nodes: [{ properties: [{
          nodeId: nodeId,
          treeIndex: treeIndex,
          color: { rgb: color.getHex() },
        }] }],
        primitiveInfo: {
          torusSegment: {
            center: { x: center.x, y: center.y, z: center.z },
            normal: { x: normal.x, y: normal.y, z: normal.z },
            radius: radius,
            tubeRadius: tubeRadius,
            isClosed: isClosed,
            angle: angle,
            arcAngle: arcAngle,
          },
        },
      },
    ];

    let group: TorusSegmentGroup;
    // @ts-ignore
    group = parseTorusSegments(geometries);
    expect(group.capacity).toBe(1);
    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);
    expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    expectVector3Equal(group.getCenter(new THREE.Vector3(), 0), center);
    expectVector3Equal(group.getNormal(new THREE.Vector3(), 0), normal);
    expect(group.getRadius(0)).toBeCloseTo(radius);
    expect(group.getTubeRadius(0)).toBeCloseTo(tubeRadius);
    expect(group.getIsClosed(0)).toBe(isClosed);
    expect(group.getAngle(0)).toBeCloseTo(angle);
    expect(group.getArcAngle(0)).toBeCloseTo(arcAngle);
  });
});
