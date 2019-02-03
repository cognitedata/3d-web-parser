import * as THREE from 'three';
import { MergedMeshGroup, MergedMesh } from '../geometry/MergedMeshGroup';
import { MatchingGeometries } from './parseUtils';
const globalColor = new THREE.Color();

function findMatchingGeometries(geometries: any[]): MatchingGeometries {
  const matchingGeometries: MatchingGeometries = {
    count: 0,
    geometries: [],
  };

  geometries.forEach(geometry => {
    if (geometry.type === 'triangleMesh' && !geometry.isInstanced) {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    }
  });

  return matchingGeometries;
}

export default function parse(geometries: any[]): MergedMeshGroup {
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = new MergedMeshGroup();

  matchingGeometries.geometries.forEach(geometry => {
    const fileId = geometry.file[0].fileId;

    const nodes: any[] = geometry.nodes;
    const mergedMesh = new MergedMesh(nodes.length, fileId);

    let triangleOffset = 0;
    nodes.forEach(node => {
      const nodeId = Number(node.properties[0].nodeId);
      const { color, treeIndex } = node.properties[0];
      const { triangleCount } = node;
      globalColor.setHex(color.rgb);
      mergedMesh.mappings.add(triangleOffset, triangleCount, nodeId, treeIndex, globalColor);
      triangleOffset += triangleCount;
    });
    group.addMesh(mergedMesh);
  });

  return group;
}
