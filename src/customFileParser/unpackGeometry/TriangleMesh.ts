import { CompressedGeometryData } from './../sharedFileParserTypes';
import { fileGeometryProperties } from './../parserParameters';
import PropertyLoader from './../PropertyLoader';
import { MergedMeshGroup, MergedMesh } from './../../geometry/MergedMeshGroup';
import SceneStats from './../../SceneStats';

function countMeshesPerFileIdIndex(geometryInfo: CompressedGeometryData, uncompressedValues: any) {
  const data = new PropertyLoader(uncompressedValues);
  const meshCounts: any = {};
  for (let i = 0; i < geometryInfo.count; i++) {
    data.loadData(geometryInfo);
    if (meshCounts[data.fileId] === undefined) {
      meshCounts[data.fileId] = 0;
    }
    meshCounts[data.fileId] += 1;
  }
  geometryInfo.indexes.rewind();
  geometryInfo.nodeIds.rewind();
  return meshCounts;
}

export default function unpackTriangleMesh(
  group: MergedMeshGroup,
  geometryInfo: CompressedGeometryData,
  uncompressedValues: any,
  sceneStats: SceneStats) {
  const meshCounts = countMeshesPerFileIdIndex(geometryInfo, uncompressedValues);

  const mergedMeshes: any = {};
  Object.keys(meshCounts).forEach(fileId => {
    if (meshCounts[fileId] !== 0) {
      mergedMeshes[fileId] = new MergedMesh(meshCounts[fileId], parseInt(fileId, 10));
    }
  });

  const triangleOffsets: any = {};
  const data = new PropertyLoader(uncompressedValues);
  for (let i = 0; i < geometryInfo.count; i++) {
    data.loadData(geometryInfo);
    if (Object.keys(triangleOffsets).indexOf(data.fileId.toString()) === -1) {
      triangleOffsets[data.fileId] = 0;
    }
    mergedMeshes[data.fileId].mappings.add(
      triangleOffsets[data.fileId], data.triangleCount, data.nodeId, data.treeIndex, data.color);
    triangleOffsets[data.fileId] += data.triangleCount;
  }

  Object.keys(mergedMeshes).forEach(fileId => {
    group.addMesh(mergedMeshes[fileId]);
    sceneStats.numMergedMeshes += 1;
  });

  return group;
}
