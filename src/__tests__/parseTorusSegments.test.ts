// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseTorusSegments from '../parsers/parseTorusSegments';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import TorusSegmentGroup from '../geometry/TorusSegmentGroup';
import * as TestScene from './fixtures/test_scene.json';

describe('parseTorusSegments', () => {
  test('parseTorusSegments', () => {
    let group: TorusSegmentGroup;
    // @ts-ignore
    group = parseTorusSegments(TestScene.geometries);
    // expect(group.capacity).toBe(1);
    // expect(group.getNodeId(0)).toBe(nodeId);
    // expect(group.getTreeIndex(0)).toBe(treeIndex);
    // expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    // expectVector3Equal(group.getCenter(new THREE.Vector3(), 0), center);
    // expectVector3Equal(group.getNormal(new THREE.Vector3(), 0), normal);
    // expect(group.getRadius(0)).toBeCloseTo(radius);
    // expect(group.getTubeRadius(0)).toBeCloseTo(tubeRadius);
    // expect(group.getIsClosed(0)).toBe(isClosed);
    // expect(group.getAngle(0)).toBeCloseTo(angle);
    // expect(group.getArcAngle(0)).toBeCloseTo(arcAngle);
  });
});
