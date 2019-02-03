import * as THREE from 'three';
import { MergedMeshMappings } from '../geometry/MergedMeshGroup';
import { expectColorEqual } from '../TestUtils';

describe('MeshGroup', () => {
  test('MergedMeshMappings', () => {
    const capacity = 5;
    const nodeMappings = new MergedMeshMappings(capacity);

    expect(nodeMappings.triangleOffsets.length).toBe(capacity);
    expect(nodeMappings.triangleCounts.length).toBe(capacity);
    expect(nodeMappings.count).toBe(0);
    expect(nodeMappings.capacity).toBe(capacity);
    expect(nodeMappings.color.length).toBe(3 * capacity);
    expect(nodeMappings.nodeId.length).toBe(capacity);
    expect(nodeMappings.treeIndex.length).toBe(capacity);
    expect(nodeMappings.transform0.length).toBe(capacity);
    expect(nodeMappings.transform1.length).toBe(capacity);
    expect(nodeMappings.transform2.length).toBe(capacity);
    expect(nodeMappings.transform3.length).toBe(capacity);

    let index = 0;
    // add first node mapping
    {
      const triangleOffset = 995;
      const triangleCount = 1234;
      const nodeId = 123;
      const treeIndex = 456;
      const color = new THREE.Color(0xff0000);
      nodeMappings.add(triangleOffset, triangleCount, nodeId, treeIndex, color);
      expect(nodeMappings.count).toBe(index + 1);
      expect(nodeMappings.capacity).toBe(capacity);

      const targetColor = new THREE.Color();
      expect(nodeMappings.getColor(targetColor, index)).toBe(targetColor);
      expectColorEqual(targetColor, color);

      expect(nodeMappings.getTriangleOffset(index)).toBe(triangleOffset);
      expect(nodeMappings.getTriangleCount(index)).toBe(triangleCount);
      expect(nodeMappings.getNodeId(index)).toBe(nodeId);
      expect(nodeMappings.getTreeIndex(index)).toBe(treeIndex);
      expect(nodeMappings.hasTransform(index)).toBe(false);

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
        0,  0,  0,  1,
      );

      nodeMappings.add(triangleOffset, triangleCount, nodeId, treeIndex, color, transformMatrix);
      expect(nodeMappings.count).toBe(index + 1);
      expect(nodeMappings.capacity).toBe(capacity);

      const targetColor = new THREE.Color();
      expect(nodeMappings.getColor(targetColor, index)).toBe(targetColor);
      expectColorEqual(targetColor, color);

      expect(nodeMappings.getTriangleCount(index)).toBe(triangleCount);
      expect(nodeMappings.getNodeId(index)).toBe(nodeId);
      expect(nodeMappings.getTreeIndex(index)).toBe(treeIndex);

      const targetMatrix = new THREE.Matrix4();
      expect(nodeMappings.hasTransform(index)).toBe(true);
      expect(nodeMappings.getTransformMatrix(targetMatrix, index)).toBe(targetMatrix);
      expect(targetMatrix.elements).toEqual(transformMatrix.elements);
    }
  });
});
