// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseGeneralRings from '../parsers/parseGeneralRings';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import GeneralRingGroup from '../geometry/GeneralRingGroup';

describe('parseGeneralRings', () => {
  test('parseGeneralRings', () => {
    const nodeId = 1234;
    const treeIndex = 123;
    const color = new THREE.Color(1.0, 0.3, 0.4);
    const center = new THREE.Vector3(1.0, 2.0, 0.0);
    const normal = new THREE.Vector3(5.0, 10.0, 3.0);
    const xRadius = 1.0;
    const yRadius = 1.0;
    const localXAxis = new THREE.Vector3(6.0, 11.0, 4.0);
    const thickness = 1.0;
    const angle = 1.0;
    const arcAngle = 1.0;

    const geometries = [
      {
        type: 'generalRing',
        nodes: [{ properties: [{
          nodeId: nodeId,
          treeIndex: treeIndex,
          color: { rgb: color.getHex() },
        }] }],
        primitiveInfo: {
          generalRing: {
            center: { x: center.x, y: center.y, z: center.z },
            normal: { x: normal.x, y: normal.y, z: normal.z },
            xRadius: xRadius,
            yRadius: yRadius,
            localXAxis: localXAxis,
            thickness: thickness,
            angle: angle,
            arcAngle: arcAngle,
          },
        },
      },
    ];

    let group: GeneralRingGroup;
    // @ts-ignore
    group = parseGeneralRings(geometries);
    expect(group.capacity).toBe(1);
    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);
    expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    expectVector3Equal(group.getCenter(new THREE.Vector3(), 0), center);
    expectVector3Equal(group.getNormal(new THREE.Vector3(), 0), normal);
    expect(group.getXRadius(0)).toBe(xRadius);
    expect(group.getYRadius(0)).toBe(yRadius);
    expectVector3Equal(group.getLocalXAxis(new THREE.Vector3(), 0), localXAxis);
    expect(group.getThickness(0)).toBe(thickness);
    expect(group.getAngle(0)).toBe(angle);
    expect(group.getArcAngle(0)).toBe(arcAngle);
  });
});
