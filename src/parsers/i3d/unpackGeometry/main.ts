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

type PrimitivesPerSector = { [path: string]: { [renderedPrimitive: string]: number } };

export function unpackPrimitives(
  rootSector: Sector,
  uncompressedValues: UncompressedValues,
  compressedData: PerSectorCompressedData,
  maps: DataMaps,
  filterOptions?: FilterOptions
) {
  const primitivesPerSector = countRenderedPrimitivesPerSector(rootSector, compressedData);

  for (const sector of rootSector.traverseSectorsBreadthFirst()) {
    compressedData[sector.path].primitives.forEach(primitiveCompressedData => {
      unpackFilePrimitive(
        sector,
        primitiveCompressedData,
        uncompressedValues,
        maps,
        primitivesPerSector,
        filterOptions
      );
    });
  }
}

function countRenderedPrimitivesPerSector(
  rootSector: Sector,
  compressedData: PerSectorCompressedData,
) {
  const primitivesPerSector: PrimitivesPerSector = {};
  for (const sector of rootSector.traverseSectors()) {
    primitivesPerSector[sector.path] = {};
    RenderedPrimitiveNames.forEach(renderedPrimitive => {
      primitivesPerSector[sector.path][renderedPrimitive] = 0;
    });
  
    compressedData[sector.path].primitives.forEach(fileGeometryData => {
      renderedPrimitivesPerFilePrimitive[fileGeometryData.type].forEach(renderedPrimitiveInfo => {
        primitivesPerSector[sector.path][renderedPrimitiveInfo.name] +=
          renderedPrimitiveInfo.count * fileGeometryData.count;
      });
    });
  }
  return primitivesPerSector;
}

function unpackFilePrimitive(
  currentSector: Sector,
  primitiveCompressedData: CompressedGeometryData,
  uncompressedValues: UncompressedValues,
  maps: DataMaps,
  primitivesPerSector: PrimitivesPerSector,
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
      primitivesPerSector
    );
    data.loadData(primitiveCompressedData);
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
  primitivesPerSector: PrimitivesPerSector
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
        primitivesPerSector
      );
    }
  });
}

function findOrCreateDestinationGroup(
  originalSector: Sector,
  renderedPrimitiveInfo: { name: string; count: number },
  numberOfGeometriesAlreadyRendered: number,
  primitivesPerSector: PrimitivesPerSector
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
  } else {
    let primitivesPerSectorAndChildren = 0;
    for (const sector of originalSector.traverseSectors()) {
      primitivesPerSectorAndChildren += primitivesPerSector[sector.path][renderedPrimitiveInfo.name];
    }
    const capacity = Math.min(
      5000,
      primitivesPerSectorAndChildren -
        numberOfGeometriesAlreadyRendered * renderedPrimitiveInfo.count
    );
    // @ts-ignore
    const createdGroup = new renderedPrimitiveToGroup[renderedPrimitiveInfo.name](capacity);
    originalSector.primitiveGroups.push(createdGroup);
    return createdGroup;
  }
}
