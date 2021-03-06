// Copyright 2019 Cognite AS

import { UncompressedValues, PerSectorCompressedData } from '../sharedFileParserTypes';
import PropertyLoader from '../PropertyLoader';
import { MergedMeshGroup, MergedMesh } from '../../../geometry/MergedMeshGroup';
import SceneStats from '../../../SceneStats';
import Sector from '../../../Sector';
import { DataMaps } from '../../parseUtils';

export default function unpackMergedMeshes(
  rootSector: Sector,
  uncompressedValues: UncompressedValues,
  compressedData: PerSectorCompressedData,
  maps: DataMaps,
  sceneStats: SceneStats
) {
  const data = new PropertyLoader(uncompressedValues);

  for (const sector of rootSector!.traverseSectors()) {
    sector.mergedMeshGroup = new MergedMeshGroup();
    const geometryInfo = compressedData[sector.path].mergedMesh;
    if (geometryInfo !== undefined) {
      // count meshes per file Id
      const meshCounts: { [fileId: string]: number } = {};
      for (let i = 0; i < geometryInfo.count; i++) {
        data.loadData(geometryInfo);
        meshCounts[data.fileId] = meshCounts[data.fileId] ? meshCounts[data.fileId] : 0;
        meshCounts[data.fileId]++;
      }
      geometryInfo.indices.rewind();
      geometryInfo.nodeIds.rewind();

      // create merged meshes
      const mergedMeshes: { [fileId: string]: MergedMesh } = {};
      Object.keys(meshCounts).forEach(fileId => {
        if (meshCounts[fileId] !== 0) {
          mergedMeshes[fileId] = new MergedMesh(
            meshCounts[fileId],
            parseInt(fileId, 10),
            false,
            data.diffuseTexture,
            data.specularTexture,
            data.ambientTexture,
            data.normalTexture,
            data.bumpTexture
          );
        }
      });

      // create mappings while calculating running triangle offsets
      const triangleOffsets: { [fileId: string]: number } = {};
      for (let i = 0; i < geometryInfo.count; i++) {
        data.loadData(geometryInfo);
        maps.treeIndexNodeIdMap[data.treeIndex] = data.nodeId;
        maps.colorMap[data.treeIndex] = data.color;

        triangleOffsets[data.fileId] = triangleOffsets[data.fileId] ? triangleOffsets[data.fileId] : 0;
        mergedMeshes[data.fileId].mappings.add(
          triangleOffsets[data.fileId],
          data.triangleCount,
          data.treeIndex,
          data.size
        );
        triangleOffsets[data.fileId] += data.triangleCount;
      }

      // add meshes to groups
      Object.keys(mergedMeshes).forEach(fileId => {
        sector.mergedMeshGroup.addMesh(mergedMeshes[fileId]);
        sceneStats.geometryCount.MergedMesh += 1;
      });
    }
  }
}
