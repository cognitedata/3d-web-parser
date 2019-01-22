// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseSphericalSegments from '../parsers/parseSphericalSegments';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import SphericalSegmentGroup from '../geometry/SphericalSegmentGroup';
import * as TestScene from './fixtures/test_scene.json';

describe('parseSphericalSegments', () => {
  test('parseSphericalSegments', () => {
    let group: SphericalSegmentGroup;
    // @ts-ignore
    group = parseSphericalSegments(TestScene.geometries);
    // expect(group.capacity).toBe(1);
    // expect(group.getNodeId(0)).toBe(nodeId);
    // expect(group.getTreeIndex(0)).toBe(treeIndex);
    // expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    // expectVector3Equal(group.getCenter(new THREE.Vector3(), 0), center);
    // expectVector3Equal(group.getNormal(new THREE.Vector3(), 0), normal);
    // expect(group.getRadius(0)).toBeCloseTo(radius);
    // expect(group.getHeight(0)).toBeCloseTo(height);
    // expect(group.getIsClosed(0)).toBe(isClosed);
  });
});
