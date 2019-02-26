import { CompressedGeometryData, UncompressedValues } from './../sharedFileParserTypes';
import PropertyLoader from './../PropertyLoader';
import { renderedPrimitiveToAddFunction, renderedPrimitivesPerFilePrimitive, renderedPrimitiveToGroup }
  from '../parserParameters';
import unpackInstancedMeshes from './InstancedMesh';
import unpackMergedMeshes from './MergedMesh';
import { Sector } from '../..';

export { unpackInstancedMeshes, unpackMergedMeshes };

function createGroup(sector: Sector, primitiveName: string, capacity: number) {
  const createdGroup = new renderedPrimitiveToGroup[primitiveName](capacity);
  sector.primitiveGroups.push(createdGroup);
  return createdGroup;
}

function findOrCreateDestinationGroup(
  originalSector: Sector,
  renderedPrimitiveInfo: {name: string, count: number},
  numOfGeometries: number) {

  let searchSector: Sector | undefined = originalSector;
  let destinationGroup: any = undefined;

  while ((searchSector !== undefined) && (destinationGroup === undefined)) {

    searchSector.primitiveGroups.forEach(primitiveGroup => {
      if (primitiveGroup.type === renderedPrimitiveInfo.name) {
        if (primitiveGroup.capacity >= primitiveGroup.data.count + renderedPrimitiveInfo.count) {
          destinationGroup = primitiveGroup;
        }
      }
    });

    searchSector = searchSector.parent;
  }

  if (destinationGroup) {
    return destinationGroup;
  } else {
    if (originalSector.children.length === 0) {
      const capacity = renderedPrimitiveInfo.count * numOfGeometries;
      return createGroup(originalSector, renderedPrimitiveInfo.name, capacity);
    } else {
      return createGroup(originalSector, renderedPrimitiveInfo.name, 1000);
    }
  }
}

function loadDestinationGroups(
  destinationPrimitiveGroups: any,
  currentSector: Sector,
  primitiveCompressedData: any,
) {
  renderedPrimitivesPerFilePrimitive[primitiveCompressedData.type].forEach(renderedPrimitiveInfo => {
    destinationPrimitiveGroups[renderedPrimitiveInfo.name] =
          findOrCreateDestinationGroup(currentSector, renderedPrimitiveInfo, primitiveCompressedData.count);
  });
}

function updateDestinationGroups(
  destinationPrimitiveGroups: any,
  currentSector: Sector,
  primitiveCompressedData: any,
  numOfGeometries: number,
) {
  renderedPrimitivesPerFilePrimitive[primitiveCompressedData.type].forEach(renderedPrimitiveInfo => {
    const destinationGroup = destinationPrimitiveGroups[renderedPrimitiveInfo.name];
    if ( destinationGroup.capacity < destinationGroup.data.count + renderedPrimitiveInfo.count) {
        destinationPrimitiveGroups[renderedPrimitiveInfo.name] =
          findOrCreateDestinationGroup(currentSector, renderedPrimitiveInfo, numOfGeometries);
      }
  });
}

function unpackFilePrimitive(
  currentSector: Sector,
  primitiveCompressedData: CompressedGeometryData,
  uncompressedValues: any,
  treeIndexNodeIdMap: any,
  colorMap: any) {

  const destinationPrimitiveGroups: any = {};
  loadDestinationGroups(destinationPrimitiveGroups, currentSector, primitiveCompressedData);

  const data = new PropertyLoader(uncompressedValues);
  for (let j = 0; j < primitiveCompressedData.count; j++) {
    updateDestinationGroups(destinationPrimitiveGroups, currentSector, primitiveCompressedData,
      primitiveCompressedData.count - j);
    data.loadData(primitiveCompressedData);
    treeIndexNodeIdMap[data.treeIndex] = data.nodeId;
    colorMap[data.treeIndex] = data.color;
    // @ts-ignore
    renderedPrimitiveToAddFunction[primitiveCompressedData.type].call(this, destinationPrimitiveGroups, data);
  }
}

export function unpackPrimitives(
  rootSector: Sector,
  uncompressedValues: UncompressedValues,
  sectorPathToPrimitiveData: {[path: string]: CompressedGeometryData[]},
  treeIndexNodeIdMap: number[],
  colorMap: THREE.Color[]) {

  for (const sector of rootSector!.traverseSectors()) {
    const compressedPrimitiveData = sectorPathToPrimitiveData[sector.path];
    compressedPrimitiveData.forEach(primitiveCompressedData => {
      unpackFilePrimitive(sector, primitiveCompressedData, uncompressedValues, treeIndexNodeIdMap, colorMap);
    });
  }
}
