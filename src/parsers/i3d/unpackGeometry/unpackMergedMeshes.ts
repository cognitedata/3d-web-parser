import { DataMaps, MergedMesh, MergedMeshGroup } from '../../..';
import { CompressedGeometryData } from '../sharedFileParserTypes';
import PropertyLoader from '../PropertyLoader';
/**
 * Unpacks merged meshes for a sector and returns the MergedMeshGroup holding the geometry.
 */
export function unpackMergedMeshes(
  dataLoader: PropertyLoader,
  dataMaps: DataMaps,
  geometryInfo: CompressedGeometryData
): MergedMeshGroup {
  const mergedMeshGroup = new MergedMeshGroup();
  // count meshes per file Id
  const meshCounts: {
    [fileId: string]: number;
  } = {};
  // TODO 20190916 larsmoa: Don't read the entire geometry simply to count number of meshes and then rewind.
  for (let i = 0; i < geometryInfo.count; i++) {
    dataLoader.loadData(geometryInfo);
    meshCounts[dataLoader.fileId] = meshCounts[dataLoader.fileId] || 0;
    meshCounts[dataLoader.fileId]++;
  }
  geometryInfo.indices.rewind();
  geometryInfo.nodeIds.rewind();

  // create merged meshes
  const mergedMeshes: {
    [fileId: string]: MergedMesh;
  } = {};
  Object.keys(meshCounts).forEach(fileId => {
    if (meshCounts[fileId] !== 0) {
      mergedMeshes[fileId] = new MergedMesh(
        meshCounts[fileId],
        parseInt(fileId, 10),
        false,
        dataLoader.diffuseTexture,
        dataLoader.specularTexture,
        dataLoader.ambientTexture,
        dataLoader.normalTexture,
        dataLoader.bumpTexture
      );
    }
  });
  // create mappings while calculating running triangle offsets
  const triangleOffsets: {
    [fileId: string]: number;
  } = {};
  for (let i = 0; i < geometryInfo.count; i++) {
    dataLoader.loadData(geometryInfo);
    dataMaps.treeIndexNodeIdMap[dataLoader.treeIndex] = dataLoader.nodeId;
    dataMaps.colorMap[dataLoader.treeIndex] = dataLoader.color;
    triangleOffsets[dataLoader.fileId] = triangleOffsets[dataLoader.fileId] || 0;
    mergedMeshes[dataLoader.fileId].mappings.add(
      triangleOffsets[dataLoader.fileId],
      dataLoader.triangleCount,
      dataLoader.treeIndex,
      dataLoader.size
    );
    triangleOffsets[dataLoader.fileId] += dataLoader.triangleCount;
  }
  // add meshes to groups
  Object.keys(mergedMeshes).forEach(fileId => {
    mergedMeshGroup.addMesh(mergedMeshes[fileId]);
  });
  return mergedMeshGroup;
}
