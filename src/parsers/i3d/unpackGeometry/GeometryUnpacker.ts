// Copyright 2019 Cognite AS

import { Sector, DataMaps, PrimitiveGroup } from '../../..';
import { UncompressedValues, SectorCompressedData, CompressedGeometryData } from '../sharedFileParserTypes';
import { FilterOptions } from '../../parseUtils';
import { RenderedPrimitiveNames } from '../../../geometry/PrimitiveGroupDataParameters';
import {
  renderedPrimitivesPerFilePrimitive,
  renderedPrimitiveToGroup,
  renderedPrimitiveToAddFunction,
  FileGeometryNameType
} from '../parserParameters';
import PropertyLoader from '../PropertyLoader';

type NumberOfPrimitives = { [renderedPrimitive: string]: number };

export default class GeometryUnpacker {
  private readonly dataMaps: DataMaps;
  private readonly filterOptions?: FilterOptions;

  private readonly dataLoader: PropertyLoader;

  constructor(maps: DataMaps, uncompressedValues: UncompressedValues, filterOptions?: FilterOptions) {
    this.dataMaps = maps;
    this.filterOptions = filterOptions;
    this.dataLoader = new PropertyLoader(uncompressedValues);
  }

  public unpackPrimitives(sector: Sector, compressedData: SectorCompressedData) {
    // TODO 20190912 larsmo: Remove sector argument and return primitiveGroups rather than
    // updating the instance.

    // TODO 20190912 larsmoa: I think we are counting primitives for the sole purpose
    // of better estimating the 'complexity' of torus segments in findOrCreateDestinationGroup
    const numberOfPrimitives = countPrimitiveRenderCount(compressedData);
    compressedData.primitives.forEach(data => {
      this.unpackFilePrimitive(sector, data, numberOfPrimitives);
    });
    for (const group of sector.primitiveGroups) {
      group.sort();
    }
  }

  private unpackFilePrimitive(
    currentSector: Sector,
    primitiveCompressedData: CompressedGeometryData,
    numberOfPrimitives: NumberOfPrimitives
  ) {
    const destinationPrimitiveGroups: { [name: string]: PrimitiveGroup } = {};
    for (let i = 0; i < primitiveCompressedData.count; ++i) {
      updateDestinationGroups(
        destinationPrimitiveGroups,
        currentSector,
        primitiveCompressedData.type,
        numberOfPrimitives
      );
      this.dataLoader.loadData(primitiveCompressedData); // TODO 20190912 larsmoa: Make PropertyLoader return something rather than updating state (because f*** state)
      const [treeIndex, nodeId, color] = [this.dataLoader.treeIndex, this.dataLoader.nodeId, this.dataLoader.color];
      this.dataMaps.treeIndexNodeIdMap[treeIndex] = nodeId;
      this.dataMaps.colorMap[treeIndex] = color;

      // @ts-ignore
      renderedPrimitiveToAddFunction[primitiveCompressedData.type].call(
        this,
        destinationPrimitiveGroups,
        this.dataLoader,
        this.filterOptions
      );
    }
  }
}

/**
 * Returns the "render complexity" of primitives in the provided sector data.
 * @param compressedData
 */
function countPrimitiveRenderCount(compressedData: SectorCompressedData) {
  const numberOfPrimitives: NumberOfPrimitives = {};
  RenderedPrimitiveNames.forEach(renderedPrimitive => {
    numberOfPrimitives[renderedPrimitive] = 0;
  });

  compressedData.primitives.forEach(geometryData => {
    renderedPrimitivesPerFilePrimitive[geometryData.type].forEach(renderedPrimitiveInfo => {
      numberOfPrimitives[renderedPrimitiveInfo.name] += renderedPrimitiveInfo.count * geometryData.count;
    });
  });
  return numberOfPrimitives;
}

// TODO 20190912 larsmoa: A lot of WTFs in the code below (https://mk0osnewswb2dmu4h0a.kinstacdn.com/images/comics/wtfm.jpg)
function updateDestinationGroups(
  destinationPrimitiveGroups: { [name: string]: PrimitiveGroup },
  sector: Sector,
  geometryType: FileGeometryNameType,
  numberOfPrimitives: NumberOfPrimitives
) {
  renderedPrimitivesPerFilePrimitive[geometryType].forEach(renderedPrimitiveInfo => {
    const destinationGroup = destinationPrimitiveGroups[renderedPrimitiveInfo.name];
    if (
      destinationGroup === undefined ||
      destinationGroup.capacity < destinationGroup.data.count + renderedPrimitiveInfo.count
    ) {
      destinationPrimitiveGroups[renderedPrimitiveInfo.name] = findOrCreateDestinationGroup(
        sector,
        renderedPrimitiveInfo,
        numberOfPrimitives
      );
    }
  });
}

function findOrCreateDestinationGroup(
  originalSector: Sector,
  renderedPrimitiveInfo: { name: string; count: number },
  numberOfPrimitives: NumberOfPrimitives
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
    const capacity = numberOfPrimitives.TorusSegment;
    // TODO 20190912 larsmoa: Get rid of this non-typesafe voodoo
    // @ts-ignore
    const createdGroup = new renderedPrimitiveToGroup.TorusSegment(capacity);
    originalSector.primitiveGroups.push(createdGroup);
    return createdGroup;
  } else {
    // TODO 20190912 larsmoa: Estimate, verify if ok or if old approach (in main.ts) is    // better/necessary
    const capacity = Math.min(numberOfPrimitives[renderedPrimitiveInfo.name], 5000);
    // @ts-ignore
    const createdGroup = new renderedPrimitiveToGroup[renderedPrimitiveInfo.name](capacity);
    originalSector.primitiveGroups.push(createdGroup);
    return createdGroup;
  }
}
