// Copyright 2019 Cognite AS

import { PerSectorCompressedData, UncompressedValues, CompressedGeometryData } from './../sharedFileParserTypes';
import PropertyLoader from './../PropertyLoader';
import {
  renderedPrimitiveToAddFunction,
  renderedPrimitivesPerFilePrimitive,
  renderedPrimitiveToGroup
} from '../parserParameters';
import { RenderedPrimitiveNames } from '../../../geometry/PrimitiveGroupDataParameters';
import unpackInstancedMeshes from './InstancedMesh';
import unpackMergedMeshes from './MergedMesh';
import { PrimitiveGroup } from '../../../geometry/GeometryGroups';
import Sector from '../../../Sector';
import { DataMaps, FilterOptions } from '../../parseUtils';

export { unpackInstancedMeshes, unpackMergedMeshes };

type NumberOfPrimitivesPerSector = { [path: string]: { [renderedPrimitive: string]: number } };

export function unpackPrimitives(
  rootSector: Sector,
  uncompressedValues: UncompressedValues,
  compressedData: PerSectorCompressedData,
  maps: DataMaps,
  formatVersion: Number,
  filterOptions?: FilterOptions
) {
  const numberOfPrimitivesPerSector = countRenderedNumberOfPrimitivesPerSector(rootSector, compressedData);

  for (const sector of rootSector.traverseSectors()) {
    compressedData[sector.path].primitives.forEach(primitiveCompressedData => {
      unpackFilePrimitive(
        sector,
        primitiveCompressedData,
        uncompressedValues,
        maps,
        numberOfPrimitivesPerSector,
        formatVersion,
        filterOptions
      );
    });
  }
  for (const primitiveGroup of rootSector.traversePrimitiveGroups()) {
    primitiveGroup.sort();
  }
}

function countRenderedNumberOfPrimitivesPerSector(rootSector: Sector, compressedData: PerSectorCompressedData) {
  const numberOfPrimitivesPerSector: NumberOfPrimitivesPerSector = {};
  for (const sector of rootSector.traverseSectors()) {
    numberOfPrimitivesPerSector[sector.path] = {};
    RenderedPrimitiveNames.forEach(renderedPrimitive => {
      numberOfPrimitivesPerSector[sector.path][renderedPrimitive] = 0;
    });

    compressedData[sector.path].primitives.forEach(fileGeometryData => {
      renderedPrimitivesPerFilePrimitive[fileGeometryData.type].forEach(renderedPrimitiveInfo => {
        numberOfPrimitivesPerSector[sector.path][renderedPrimitiveInfo.name] +=
          renderedPrimitiveInfo.count * fileGeometryData.count;
      });
    });
  }
  return numberOfPrimitivesPerSector;
}

function unpackFilePrimitive(
  currentSector: Sector,
  primitiveCompressedData: CompressedGeometryData,
  uncompressedValues: UncompressedValues,
  maps: DataMaps,
  numberOfPrimitivesPerSector: NumberOfPrimitivesPerSector,
  formatVersion: Number,
  filterOptions?: FilterOptions
) {
  const destinationPrimitiveGroups: { [name: string]: PrimitiveGroup } = {};
  const data = new PropertyLoader(uncompressedValues);
  for (let j = 0; j < primitiveCompressedData.count; j++) {
    updateDestinationGroups(
      destinationPrimitiveGroups,
      currentSector,
      primitiveCompressedData,
      j,
      numberOfPrimitivesPerSector
    );
    data.loadData(primitiveCompressedData, formatVersion);
    maps.treeIndexNodeIdMap[data.treeIndex] = data.nodeId;
    maps.colorMap[data.treeIndex] = data.color;
    // @ts-ignore
    renderedPrimitiveToAddFunction[primitiveCompressedData.type].call(
      // @ts-ignore
      this,
      destinationPrimitiveGroups,
      data,
      filterOptions
    );
  }
}

function updateDestinationGroups(
  destinationPrimitiveGroups: { [name: string]: PrimitiveGroup },
  currentSector: Sector,
  primitiveCompressedData: CompressedGeometryData,
  numberOfGeometriesAlreadyRendered: number,
  numberOfPrimitivesPerSector: NumberOfPrimitivesPerSector
) {
  renderedPrimitivesPerFilePrimitive[primitiveCompressedData.type].forEach(renderedPrimitiveInfo => {
    const destinationGroup = destinationPrimitiveGroups[renderedPrimitiveInfo.name];
    if (
      destinationGroup === undefined ||
      destinationGroup.capacity < destinationGroup.data.count + renderedPrimitiveInfo.count
    ) {
      destinationPrimitiveGroups[renderedPrimitiveInfo.name] = findOrCreateDestinationGroup(
        currentSector,
        renderedPrimitiveInfo,
        numberOfGeometriesAlreadyRendered,
        numberOfPrimitivesPerSector
      );
    }
  });
}

function findOrCreateDestinationGroup(
  originalSector: Sector,
  renderedPrimitiveInfo: { name: string; count: number },
  numberOfGeometriesAlreadyRendered: number,
  numberOfPrimitivesPerSector: NumberOfPrimitivesPerSector
) {
  let searchSector: Sector | undefined = originalSector;
  let destinationGroup: PrimitiveGroup | undefined;

  while (searchSector !== undefined && destinationGroup === undefined) {
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
  } else if (renderedPrimitiveInfo.name === 'TorusSegment') {
    const capacity = numberOfPrimitivesPerSector[originalSector.path].TorusSegment;
    // @ts-ignore
    const createdGroup = new renderedPrimitiveToGroup.TorusSegment(capacity);
    originalSector.primitiveGroups.push(createdGroup);
    return createdGroup;
  } else {
    let numberOfPrimitivesPerSectorAndChildren = 0;
    for (const sector of originalSector.traverseSectors()) {
      numberOfPrimitivesPerSectorAndChildren += numberOfPrimitivesPerSector[sector.path][renderedPrimitiveInfo.name];
    }
    const capacity = Math.min(
      5000,
      numberOfPrimitivesPerSectorAndChildren - numberOfGeometriesAlreadyRendered * renderedPrimitiveInfo.count
    );
    // @ts-ignore
    const createdGroup = new renderedPrimitiveToGroup[renderedPrimitiveInfo.name](capacity);
    originalSector.primitiveGroups.push(createdGroup);
    return createdGroup;
  }
}
