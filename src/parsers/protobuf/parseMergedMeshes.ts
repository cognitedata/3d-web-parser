// Copyright 2019 Cognite AS

import * as THREE from 'three';
import { MergedMeshGroup, MergedMesh } from '../../geometry/MergedMeshGroup';
import { MatchingGeometries } from './protobufUtils';
import SceneStats from '../../SceneStats';
import { ParseData } from '../parseUtils';
const globalColor = new THREE.Color();
let hasWarnedAboutMissingColor = false;

function findMatchingGeometries(geometries: any[]): MatchingGeometries {
  const matchingGeometries: MatchingGeometries = {
    count: 0,
    geometries: []
  };

  geometries.forEach(geometry => {
    if (geometry.type === 'triangleMesh' && !geometry.isInstanced) {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    }
  });

  return matchingGeometries;
}

export default function parse(data: ParseData): MergedMeshGroup {
  const matchingGeometries = findMatchingGeometries(data.geometries);
  const group = new MergedMeshGroup();

  matchingGeometries.geometries.forEach(geometry => {
    const fileId = geometry.file[0].fileId;

    const nodes: any[] = geometry.nodes;
    const mergedMesh = new MergedMesh(nodes.length, fileId);

    let triangleOffset = 0;
    nodes.forEach(node => {
      const nodeId = Number(node.properties[0].nodeId);
      const { treeIndex } = node.properties[0];
      if (node.properties[0].color == null && !hasWarnedAboutMissingColor) {
        hasWarnedAboutMissingColor = true;
        // tslint:disable-next-line:no-console
        console.warn(
          '3d-web-parser encountered node with missing color while loading',
          '(using #ff00ff to highlight objects with missing color).'
        );
      }
      const color = node.properties[0].color != null ? node.properties[0].color : { rgb: 0xff00ff };

      const { triangleCount } = node;
      globalColor.setHex(color.rgb);
      // size is calculated later
      mergedMesh.mappings.add(triangleOffset, triangleCount, treeIndex, 0);
      triangleOffset += triangleCount;

      data.treeIndexNodeIdMap[treeIndex] = nodeId;
      data.colorMap[treeIndex] = globalColor.clone();
    });

    data.sceneStats.geometryCount.MergedMesh += 1;
    group.addMesh(mergedMesh);
  });

  return group;
}
