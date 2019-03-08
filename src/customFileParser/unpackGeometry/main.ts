import { CompressedGeometryData, UncompressedValues } from './../sharedFileParserTypes';
import PropertyLoader from './../PropertyLoader';
import { renderedPrimitiveToAddFunction, renderedPrimitivesPerFilePrimitive, renderedPrimitiveToGroup,
  renderedPrimitiveNames } from '../parserParameters';
import unpackInstancedMeshes from './InstancedMesh';
import unpackMergedMeshes from './MergedMesh';
import { PrimitiveGroup } from '../../geometry/GeometryGroups';
import { Sector } from '../..';
import { TreeIndexNodeIdMap, ColorMap } from './../../parsers/parseUtils';

export { unpackInstancedMeshes, unpackMergedMeshes };

function createGroup(sector: Sector, primitiveName: string, capacity: number) {
  // @ts-ignore
  const createdGroup = new renderedPrimitiveToGroup[primitiveName](capacity);
  sector.primitiveGroups.push(createdGroup);
  return createdGroup;
}

function findOrCreateDestinationGroup(
  originalSector: Sector,
  renderedPrimitiveInfo: {name: string, count: number},
  numberOfGeometries: number,
  groupSpaceRequirementsPerSector: any) {

  let searchSector: Sector | undefined = originalSector;
  let destinationGroup: PrimitiveGroup | undefined = undefined;

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
      const capacity = renderedPrimitiveInfo.count * numberOfGeometries;
      return createGroup(originalSector, renderedPrimitiveInfo.name, capacity);
    } else {
      return createGroup(originalSector, renderedPrimitiveInfo.name, 1000);
    }
  }
}

function loadDestinationGroups(
  destinationPrimitiveGroups: {[name: string]: PrimitiveGroup},
  currentSector: Sector,
  primitiveCompressedData: any,
  groupSpaceRequirementsPerSector: any,
) {
  renderedPrimitivesPerFilePrimitive[primitiveCompressedData.type].forEach(renderedPrimitiveInfo => {
    destinationPrimitiveGroups[renderedPrimitiveInfo.name] =
          findOrCreateDestinationGroup(currentSector, renderedPrimitiveInfo, primitiveCompressedData.count,
            groupSpaceRequirementsPerSector);
  });
}

function updateDestinationGroups(
  destinationPrimitiveGroups: {[name: string]: PrimitiveGroup},
  currentSector: Sector,
  primitiveCompressedData: CompressedGeometryData,
  numberOfGeometries: number,
  groupSpaceRequirementsPerSector: any,
) {
  renderedPrimitivesPerFilePrimitive[primitiveCompressedData.type].forEach(renderedPrimitiveInfo => {
    const destinationGroup = destinationPrimitiveGroups[renderedPrimitiveInfo.name];
    if ( destinationGroup.capacity < destinationGroup.data.count + renderedPrimitiveInfo.count) {
        destinationPrimitiveGroups[renderedPrimitiveInfo.name] =
          findOrCreateDestinationGroup(
            currentSector, renderedPrimitiveInfo, numberOfGeometries, groupSpaceRequirementsPerSector);
      }
  });
}

function unpackFilePrimitive(
  currentSector: Sector,
  primitiveCompressedData: CompressedGeometryData,
  uncompressedValues: UncompressedValues,
  treeIndexNodeIdMap: TreeIndexNodeIdMap,
  colorMap: ColorMap,
  groupSpaceRequirementsPerSector: any) {

  const destinationPrimitiveGroups: {[name: string]: PrimitiveGroup} = {};
  loadDestinationGroups(
    destinationPrimitiveGroups, currentSector, primitiveCompressedData, groupSpaceRequirementsPerSector);

  const data = new PropertyLoader(uncompressedValues);
  for (let j = 0; j < primitiveCompressedData.count; j++) {
    updateDestinationGroups(destinationPrimitiveGroups, currentSector, primitiveCompressedData,
      primitiveCompressedData.count - j, groupSpaceRequirementsPerSector);
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
  treeIndexNodeIdMap: TreeIndexNodeIdMap,
  colorMap: ColorMap) {

  const groupSpaceRequirementsPerSector: any = {};
  for (const sector of rootSector.traverseSectors()) {
    const renderedPrimitiveCount: any = {};
    renderedPrimitiveNames.forEach(renderedPrimitive => {
      renderedPrimitiveCount[renderedPrimitive] = 0;
    });

    const compressedPrimitiveData = sectorPathToPrimitiveData[sector.path];
    compressedPrimitiveData.forEach(filePrimitive => {
      renderedPrimitivesPerFilePrimitive[filePrimitive.type].forEach(renderedPrimitive => {
        renderedPrimitiveCount[renderedPrimitive.name] += renderedPrimitive.count * filePrimitive.count;
      });
    });

    groupSpaceRequirementsPerSector[sector.path] = renderedPrimitiveCount;
  }

  const groupSpaceRequirementsPerSectorAndChildren: any = {};
  for (const parentSector of rootSector.traverseSectors()) {
    const renderedPrimitiveCount: any = {};
    renderedPrimitiveNames.forEach(renderedPrimitiveName => {
      renderedPrimitiveCount[renderedPrimitiveName] =
      groupSpaceRequirementsPerSector[parentSector.path][renderedPrimitiveName];
    });

    for (const childSector of parentSector.traverseSectors()) {
      renderedPrimitiveNames.forEach(renderedPrimitiveName => {
        renderedPrimitiveCount[renderedPrimitiveName] +=
        groupSpaceRequirementsPerSector[childSector.path][renderedPrimitiveName];
      });
    }

    groupSpaceRequirementsPerSectorAndChildren[parentSector.path] = renderedPrimitiveCount;
  }

  for (const sector of rootSector.traverseSectorsBreadthFirst()) {
    const compressedPrimitiveData = sectorPathToPrimitiveData[sector.path];
    compressedPrimitiveData.forEach(primitiveCompressedData => {
      unpackFilePrimitive(sector, primitiveCompressedData, uncompressedValues, treeIndexNodeIdMap, colorMap,
        groupSpaceRequirementsPerSectorAndChildren);
    });
  }
}
