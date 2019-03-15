import { CompressedGeometryData, UncompressedValues } from './../sharedFileParserTypes';
import PropertyLoader from './../PropertyLoader';
import { renderedPrimitiveToAddFunction, renderedPrimitivesPerFilePrimitive, renderedPrimitiveToGroup,
  renderedPrimitiveNames} from '../parserParameters';
import unpackInstancedMeshes from './InstancedMesh';
import unpackMergedMeshes from './MergedMesh';
import { PrimitiveGroup } from '../../geometry/GeometryGroups';
import { Sector } from '../..';
import { TreeIndexNodeIdMap, ColorMap, FilterOptions } from './../../parsers/parseUtils';

export { unpackInstancedMeshes, unpackMergedMeshes };

type PrimitivesPerSectorAndChildren = {[path: string]: {[renderedPrimitive: string]: number}};

export function unpackPrimitives(
  rootSector: Sector,
  uncompressedValues: UncompressedValues,
  sectorPathToCompressedData: {[path: string]: CompressedGeometryData[]},
  treeIndexNodeIdMap: TreeIndexNodeIdMap,
  colorMap: ColorMap,
  filterOptions?: FilterOptions) {

  const primitivesPerSectorAndChildren: PrimitivesPerSectorAndChildren = {};
  countRenderedPrimitivesPerSectorAndChildren(rootSector, sectorPathToCompressedData, primitivesPerSectorAndChildren);

  for (const sector of rootSector.traverseSectorsBreadthFirst()) {
    const compressedPrimitiveData = sectorPathToCompressedData[sector.path];
    compressedPrimitiveData.forEach(primitiveCompressedData => {
      unpackFilePrimitive(sector, primitiveCompressedData, uncompressedValues, treeIndexNodeIdMap, colorMap,
        primitivesPerSectorAndChildren, filterOptions);
    });
  }
}

function countRenderedPrimitivesPerSectorAndChildren(
  sector: Sector,
  sectorPathToCompressedData: {[path: string]: CompressedGeometryData[]},
  primitivesPerSectorAndChildren: PrimitivesPerSectorAndChildren,
) {
  // Count rendered primitives in sector
  primitivesPerSectorAndChildren[sector.path] = {};
  renderedPrimitiveNames.forEach(renderedPrimitive => {
    primitivesPerSectorAndChildren[sector.path][renderedPrimitive] = 0;
  });

  sectorPathToCompressedData[sector.path].forEach(fileGeometryData => {
    renderedPrimitivesPerFilePrimitive[fileGeometryData.type].forEach(renderedPrimitiveInfo => {
      primitivesPerSectorAndChildren[sector.path][renderedPrimitiveInfo.name] +=
      renderedPrimitiveInfo.count * fileGeometryData.count;
    });
  });

  // Add rendered primitives from children
  sector.children.forEach(childSector => {
    if (primitivesPerSectorAndChildren[childSector.path] === undefined) {
      countRenderedPrimitivesPerSectorAndChildren(
        childSector, sectorPathToCompressedData, primitivesPerSectorAndChildren);
    }
    renderedPrimitiveNames.forEach(renderedPrimitive => {
      primitivesPerSectorAndChildren[sector.path][renderedPrimitive] +=
        primitivesPerSectorAndChildren[childSector.path][renderedPrimitive];
    });
  });
}

function unpackFilePrimitive(
  currentSector: Sector,
  primitiveCompressedData: CompressedGeometryData,
  uncompressedValues: UncompressedValues,
  treeIndexNodeIdMap: TreeIndexNodeIdMap,
  colorMap: ColorMap,
  primitivesPerSectorAndChildren: PrimitivesPerSectorAndChildren,
  filterOptions?: FilterOptions) {

  const destinationPrimitiveGroups: {[name: string]: PrimitiveGroup} = {};
  const data = new PropertyLoader(uncompressedValues);
  for (let j = 0; j < primitiveCompressedData.count; j++) {
    updateDestinationGroups(destinationPrimitiveGroups, currentSector, primitiveCompressedData,
      j, primitivesPerSectorAndChildren);
    data.loadData(primitiveCompressedData);
    treeIndexNodeIdMap[data.treeIndex] = data.nodeId;
    colorMap[data.treeIndex] = data.color;
    // @ts-ignore
    renderedPrimitiveToAddFunction[primitiveCompressedData.type].call(this, destinationPrimitiveGroups, data, filterOptions);
  }
}

function updateDestinationGroups(
  destinationPrimitiveGroups: {[name: string]: PrimitiveGroup},
  currentSector: Sector,
  primitiveCompressedData: CompressedGeometryData,
  numberOfGeometriesAlreadyRendered: number,
  primitivesPerSectorAndChildren: PrimitivesPerSectorAndChildren,
) {
  renderedPrimitivesPerFilePrimitive[primitiveCompressedData.type].forEach(renderedPrimitiveInfo => {
    const destinationGroup = destinationPrimitiveGroups[renderedPrimitiveInfo.name];
    if ((destinationGroup === undefined) ||
      (destinationGroup.capacity < destinationGroup.data.count + renderedPrimitiveInfo.count)) {
        destinationPrimitiveGroups[renderedPrimitiveInfo.name] =
          findOrCreateDestinationGroup(
            currentSector, renderedPrimitiveInfo, numberOfGeometriesAlreadyRendered, primitivesPerSectorAndChildren);
      }
  });
}

function findOrCreateDestinationGroup(
  originalSector: Sector,
  renderedPrimitiveInfo: {name: string, count: number},
  numberOfGeometriesAlreadyRendered: number,
  primitivesPerSectorAndChildren: PrimitivesPerSectorAndChildren) {

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

  if (destinationGroup !== undefined) {
    return destinationGroup;
  } else {
    const capacity = Math.min(5000,
      primitivesPerSectorAndChildren[originalSector.path][renderedPrimitiveInfo.name]
        - numberOfGeometriesAlreadyRendered * renderedPrimitiveInfo.count);
    // @ts-ignore
    const createdGroup = new renderedPrimitiveToGroup[renderedPrimitiveInfo.name](capacity);
    originalSector.primitiveGroups.push(createdGroup);
    return createdGroup;
  }
}
