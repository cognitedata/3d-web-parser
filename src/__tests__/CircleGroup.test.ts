import * as THREE from 'three';
import CircleGroup from '../geometry/CircleGroup';

describe('PlaneGroup', () => {
  test('constructor', () => {
    const group = new CircleGroup(2);
    expect(group.radius.length).toBe(2);
  });

  test('(set/get)Radius', () => {
    const group = new CircleGroup(2);

    const radius1 = 1.0;
    const radius2 = 10.0;

    group.setRadius(radius1, 0);
    expect(group.getRadius(0)).toBeCloseTo(radius1);

    group.setRadius(radius2, 1);
    expect(group.getRadius(0)).toBeCloseTo(radius1);
    expect(group.getRadius(1)).toBeCloseTo(radius2);
  });

  test('add', () => {
    const group = new CircleGroup(2);

    const radius = 10.0;
    const nodeId = 1;
    const treeIndex = 1;
    const color = new THREE.Color(0.5, 0.5, 0.5);
    const center = new THREE.Vector3(1, 2, 3);
    const normal = new THREE.Vector3(1, 2, 3);

    group.add(nodeId, treeIndex, color, center, normal, radius);
    const targetVector = new THREE.Vector3();
    const targetColor = new THREE.Color();

    expect(group.count).toBe(1);
    expect(group.getNodeId(0)).toBe(nodeId);

    group.getColor(targetColor, 0);
    expect(targetColor.r).toBeCloseTo(color.r);
    expect(targetColor.g).toBeCloseTo(color.g);
    expect(targetColor.b).toBeCloseTo(color.b);

    group.getNormal(targetVector, 0);
    expect(targetVector.x).toBeCloseTo(normal.x);
    expect(targetVector.y).toBeCloseTo(normal.y);
    expect(targetVector.z).toBeCloseTo(normal.z);

    group.getCenter(targetVector, 0);
    expect(targetVector.x).toBeCloseTo(center.x);
    expect(targetVector.y).toBeCloseTo(center.y);
    expect(targetVector.z).toBeCloseTo(center.z);

  });
});
