import * as THREE from 'three';
import { InstancedMeshGroup, InstancedMeshMappings } from '../geometry/InstancedMeshGroup';
import { expectColorEqual, expectMatrix4Equal } from '../TestUtils';

describe('MeshGroup', () => {
  test('InstancedMeshMappings', () => {
    const capacity = 5;
    const nodeMappings = new InstancedMeshMappings(capacity);

    expect(nodeMappings.count).toBe(0);
    expect(nodeMappings.capacity).toBe(capacity);
    expect(nodeMappings.color.length).toBe(3 * capacity);
    expect(nodeMappings.nodeId.length).toBe(capacity);
    expect(nodeMappings.treeIndex.length).toBe(capacity);
    expect(nodeMappings.transform0.length).toBe(3 * capacity);
    expect(nodeMappings.transform1.length).toBe(3 * capacity);
    expect(nodeMappings.transform2.length).toBe(3 * capacity);
    expect(nodeMappings.transform3.length).toBe(3 * capacity);

    let index = 0;
    // add first node mapping
    {
      const triangleOffset = 995;
      const triangleCount = 1234;
      const nodeId = 123;
      const treeIndex = 456;
      const color = new THREE.Color(0xff0000);
      const transformMatrix = new THREE.Matrix4();
      transformMatrix.set(
        111, 212, 313, 414,
        121, 222, 323, 424,
        131, 232, 333, 434,
        0, 0, 0, 1,
      );
      nodeMappings.add(nodeId, treeIndex, color, transformMatrix);
      expect(nodeMappings.count).toBe(index + 1);
      expect(nodeMappings.capacity).toBe(capacity);

      const targetColor = new THREE.Color();
      expect(nodeMappings.getColor(targetColor, index)).toBe(targetColor);
      expectColorEqual(targetColor, color);

      expect(nodeMappings.getNodeId(index)).toBe(nodeId);
      expect(nodeMappings.getTreeIndex(index)).toBe(treeIndex);

      const targetMatrix = new THREE.Matrix4();
      expect(nodeMappings.getTransformMatrix(targetMatrix, index)).toBe(targetMatrix);

      nodeMappings.getTransformMatrix(targetMatrix, index);
      expectMatrix4Equal(transformMatrix, targetMatrix);
      ++index;
    }

    // add second node mapping
    {
      const triangleOffset = 995;
      const triangleCount = 4322;
      const nodeId = 11;
      const treeIndex = 10;
      const color = new THREE.Color(0x00ff00);
      const transformMatrix = new THREE.Matrix4();
      transformMatrix.set(
        11, 12, 13, 14,
        21, 22, 23, 24,
        31, 32, 33, 34,
        0, 0, 0, 1,
      );
      nodeMappings.add(nodeId, treeIndex, color, transformMatrix);
      expect(nodeMappings.count).toBe(index + 1);
      expect(nodeMappings.capacity).toBe(capacity);

      const targetColor = new THREE.Color();
      expect(nodeMappings.getColor(targetColor, index)).toBe(targetColor);
      expectColorEqual(targetColor, color);

      expect(nodeMappings.getNodeId(index)).toBe(nodeId);
      expect(nodeMappings.getTreeIndex(index)).toBe(treeIndex);

      const targetMatrix = new THREE.Matrix4();
      expect(nodeMappings.getTransformMatrix(targetMatrix, index)).toBe(targetMatrix);

      nodeMappings.getTransformMatrix(targetMatrix, index);
      expectMatrix4Equal(transformMatrix, targetMatrix);
      expect(targetMatrix.elements).toEqual(transformMatrix.elements);
    }
  });
});
