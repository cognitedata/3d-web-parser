import * as THREE from 'three';
import { InstancedMeshGroup, InstancedMeshMappings } from '../geometry/InstancedMeshGroup';
import { expectColorEqual, expectMatrix4Equal } from '../TestUtils';

describe('MeshGroup', () => {
  test('InstancedMeshMappings', () => {
    const capacity = 5;
    const nodeMappings1 = new InstancedMeshMappings(capacity);

    expect(nodeMappings1.count).toBe(0);
    expect(nodeMappings1.capacity).toBe(capacity);
    expect(nodeMappings1.color.length).toBe(3 * capacity);
    expect(nodeMappings1.nodeId.length).toBe(capacity);
    expect(nodeMappings1.treeIndex.length).toBe(capacity);
    expect(nodeMappings1.transform0.length).toBe(3 * capacity);
    expect(nodeMappings1.transform1.length).toBe(3 * capacity);
    expect(nodeMappings1.transform2.length).toBe(3 * capacity);
    expect(nodeMappings1.transform3.length).toBe(3 * capacity);

    const triangleOffsets = [995, 996, 997, 998];
    const triangleCounts = [4322, 4323, 4324, 4325];
    const nodeIds = [11, 12, 13, 14];
    const treeIndices = [10, 20, 30, 40];
    const colors = [
      new THREE.Color(0x00ff00),
      new THREE.Color(0xaabbcc),
      new THREE.Color(0xbbccaa),
      new THREE.Color(0xff3322),
    ];
    const transformMatrices = [
      new THREE.Matrix4(),
      new THREE.Matrix4(),
      new THREE.Matrix4(),
      new THREE.Matrix4(),
    ];

    transformMatrices[0].set(
      11, 12, 13, 14,
      21, 22, 23, 24,
      31, 32, 33, 34,
      0, 0, 0, 1,
    );

    transformMatrices[1].set(
      112, 122, 132, 142,
      212, 222, 232, 242,
      312, 322, 332, 342,
      0, 0, 0, 1,
    );

    transformMatrices[2].set(
      113, 123, 133, 143,
      213, 223, 233, 243,
      313, 323, 333, 343,
      0, 0, 0, 1,
    );

    transformMatrices[3].set(
      114, 124, 134, 144,
      214, 224, 234, 244,
      314, 324, 334, 344,
      0, 0, 0, 1,
    );

    let index = 0;
    // add first node mapping
    {
      nodeMappings1.add(nodeIds[index], treeIndices[index], colors[index], transformMatrices[index]);
      expect(nodeMappings1.count).toBe(index + 1);
      expect(nodeMappings1.capacity).toBe(capacity);

      const targetColor = new THREE.Color();
      expect(nodeMappings1.getColor(targetColor, index)).toBe(targetColor);
      expectColorEqual(targetColor, colors[index]);

      expect(nodeMappings1.getNodeId(index)).toBe(nodeIds[index]);
      expect(nodeMappings1.getTreeIndex(index)).toBe(treeIndices[index]);

      const targetMatrix = new THREE.Matrix4();
      expect(nodeMappings1.getTransformMatrix(targetMatrix, index)).toBe(targetMatrix);

      nodeMappings1.getTransformMatrix(targetMatrix, index);
      expectMatrix4Equal(transformMatrices[index], targetMatrix);
      ++index;
    }

    // add second node mapping
    {
      nodeMappings1.add(nodeIds[index], treeIndices[index], colors[index], transformMatrices[index]);
      expect(nodeMappings1.count).toBe(index + 1);
      expect(nodeMappings1.capacity).toBe(capacity);

      const targetColor = new THREE.Color();
      expect(nodeMappings1.getColor(targetColor, index)).toBe(targetColor);
      expectColorEqual(targetColor, colors[index]);

      expect(nodeMappings1.getNodeId(index)).toBe(nodeIds[index]);
      expect(nodeMappings1.getTreeIndex(index)).toBe(treeIndices[index]);

      const targetMatrix = new THREE.Matrix4();
      expect(nodeMappings1.getTransformMatrix(targetMatrix, index)).toBe(targetMatrix);

      nodeMappings1.getTransformMatrix(targetMatrix, index);
      expectMatrix4Equal(transformMatrices[index], targetMatrix);

      // Resize
      {
        // @ts-ignore
        nodeMappings1.resize(2);
        expect(nodeMappings1.count).toBe(2);
        expect(nodeMappings1.capacity).toBe(2);

        expect(nodeMappings1.getColor(targetColor, index)).toBe(targetColor);
        expectColorEqual(targetColor, colors[index]);

        expect(nodeMappings1.getNodeId(index)).toBe(nodeIds[index]);
        expect(nodeMappings1.getTreeIndex(index)).toBe(treeIndices[index]);

        expect(nodeMappings1.getTransformMatrix(targetMatrix, index)).toBe(targetMatrix);

        nodeMappings1.getTransformMatrix(targetMatrix, index);
        expectMatrix4Equal(transformMatrices[index], targetMatrix);
        expect(targetMatrix.elements).toEqual(transformMatrices[index].elements);
      }
    }

    // Merge node mappings
    {
      const nodeMappings2 = new InstancedMeshMappings(2);

      nodeMappings2.add(nodeIds[2], treeIndices[2], colors[2], transformMatrices[2]);
      nodeMappings2.add(nodeIds[3], treeIndices[3], colors[3], transformMatrices[3]);
      nodeMappings1.mergeWithMappings(nodeMappings2);
      expect(nodeMappings1.count).toBe(4);
      expect(nodeMappings1.capacity).toBe(4);
      for (let i = 0; i < 4; i++) {
        const targetColor = new THREE.Color();
        expect(nodeMappings1.getColor(targetColor, i)).toBe(targetColor);
        expectColorEqual(targetColor, colors[i]);

        expect(nodeMappings1.getNodeId(i)).toBe(nodeIds[i]);
        expect(nodeMappings1.getTreeIndex(i)).toBe(treeIndices[i]);

        const targetMatrix = new THREE.Matrix4();
        expect(nodeMappings1.getTransformMatrix(targetMatrix, i)).toBe(targetMatrix);

        nodeMappings1.getTransformMatrix(targetMatrix, i);
        expectMatrix4Equal(transformMatrices[i], targetMatrix);
      }
    }
  });
});
