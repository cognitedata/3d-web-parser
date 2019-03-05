import { CompressedGeometryData, UncompressedValues } from '../sharedFileParserTypes';
import PropertyLoader from '../PropertyLoader';
import { MergedMeshGroup, MergedMesh } from '../../geometry/MergedMeshGroup';
import SceneStats from '../../SceneStats';
import Sector from './../../Sector';

export default function unpackMergedMeshes(
  rootSector: Sector,
  uncompressedValues: UncompressedValues,
  sectorPathToMergedMeshData: {[path: string]: CompressedGeometryData},
  sceneStats: SceneStats,
  treeIndexNodeIdMap: number[],
  colorMap: THREE.Color[],
) {
  const data = new PropertyLoader(uncompressedValues);

  for (const sector of rootSector!.traverseSectors()) {
    sector.mergedMeshGroup = new MergedMeshGroup();
    const geometryInfo = sectorPathToMergedMeshData[sector.path];
    if (geometryInfo !== undefined) {
      // count meshes per file Id
      const meshCounts: {[fileId: string]: number} = {};
      for (let i = 0; i < geometryInfo.count; i++) {
        data.loadData(geometryInfo);
        meshCounts[data.fileId] = meshCounts[data.fileId] ? meshCounts[data.fileId] : 0;
        meshCounts[data.fileId]++;
      }
      geometryInfo.indices.rewind();
      geometryInfo.nodeIds.rewind();

      // create merged meshes
      const mergedMeshes: {[fileId: string]: MergedMesh} = {};
      Object.keys(meshCounts).forEach(fileId => {
        if (meshCounts[fileId] !== 0) {
          mergedMeshes[fileId] = new MergedMesh(meshCounts[fileId], parseInt(fileId, 10));
        }
      });

      // create mappings while calculating running triangle offsets
      const triangleOffsets: {[fileId: string]: number} = {};
      for (let i = 0; i < geometryInfo.count; i++) {
        data.loadData(geometryInfo);
        treeIndexNodeIdMap[data.treeIndex] = data.nodeId;
        colorMap[data.treeIndex] = data.color;

        triangleOffsets[data.fileId] = triangleOffsets[data.fileId] ? triangleOffsets[data.fileId] : 0;
        mergedMeshes[data.fileId].mappings.add(
          triangleOffsets[data.fileId], data.triangleCount, data.nodeId, data.treeIndex);
        triangleOffsets[data.fileId] += data.triangleCount;
      }

      // add meshes to groups
      Object.keys(mergedMeshes).forEach(fileId => {
        sector.mergedMeshGroup.addMesh(mergedMeshes[fileId]);
        sceneStats.numMergedMeshes += 1;
      });
    }
    sector.mergedMeshGroup.createTreeIndexMap();
  }
}
