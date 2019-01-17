import * as THREE from 'three';
import EllipsoidGroup from '../geometry/EllipsoidGroup';

describe('EllipsoidGroup', () => {
  test('constructor', () => {
    const group = new EllipsoidGroup(2);
    expect(group.hRadius.length).toBe(2);
    expect(group.vRadius.length).toBe(2);
    expect(EllipsoidGroup.type).toBe('Ellipsoid');
  });

  test('(set/get)hRadius', () => {
    const group = new EllipsoidGroup(2);
    const radius = 1.0;
    group.setHRadius(radius, 0);
    expect(group.getHRadius(0)).toBeCloseTo(radius);
  });

  test('(set/get)vRadius', () => {
    const group = new EllipsoidGroup(2);
    const radius = 1.0;
    group.setVRadius(radius, 0);
    expect(group.getVRadius(0)).toBeCloseTo(radius);
  });

  test('add', () => {
    const group = new EllipsoidGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const color = new THREE.Color(0.5, 0.5, 0.5);
    const center = new THREE.Vector3(1, 2, 3);
    const normal = new THREE.Vector3(1, 2, 3);
    const hRadius = 10.0;
    const vRadius = 10.0;

    group.add(nodeId, treeIndex, color, center, normal, hRadius, vRadius);
    const targetVector = new THREE.Vector3();
    const targetColor = new THREE.Color();

    expect(group.count).toBe(1);

    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);

    group.getColor(targetColor, 0);
    expect(targetColor.r).toBeCloseTo(color.r);
    expect(targetColor.g).toBeCloseTo(color.g);
    expect(targetColor.b).toBeCloseTo(color.b);

    group.getCenter(targetVector, 0);
    expect(targetVector.x).toBeCloseTo(center.x);
    expect(targetVector.y).toBeCloseTo(center.y);
    expect(targetVector.z).toBeCloseTo(center.z);

    group.getNormal(targetVector, 0);
    expect(targetVector.x).toBeCloseTo(normal.x);
    expect(targetVector.y).toBeCloseTo(normal.y);
    expect(targetVector.z).toBeCloseTo(normal.z);

    expect(group.getHRadius(0)).toBeCloseTo(hRadius);
    expect(group.getVRadius(0)).toBeCloseTo(vRadius);
  });
});
