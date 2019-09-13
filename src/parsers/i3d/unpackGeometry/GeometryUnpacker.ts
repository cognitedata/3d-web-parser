// Copyright 2019 Cognite AS

import { Sector, DataMaps } from '../../..';
import { UncompressedValues, SectorCompressedData, CompressedGeometryData } from '../sharedFileParserTypes';
import { FilterOptions } from '../../parseUtils';
import { RenderedPrimitiveNames } from '../../../geometry/PrimitiveGroupDataParameters';
import {
  addPrimitiveToGroup,
  renderedPrimitivesPerFilePrimitive,
  FileGeometryNameType,
  FilePrimitiveNameType,
  createPrimitiveGroupOfType
} from '../parserParameters';
import PropertyLoader from '../PropertyLoader';
import { assert } from '../../../utils/assert';
import PrimitiveGroup from '../../../geometry/PrimitiveGroup';
import { PrimitiveGroupMap } from '../../../geometry/PrimitiveGroupMap';

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

    // TODO 20190912 larsmoa: Original code "bubbled up" primitives to parent. I do not
    // think this is a good idea as it introduces a lot of complexities and runtime overhead.
    // Managing this in a streaming-solution will be a mess, so I would rather move the
    // responsibility to the optimizer

    // TODO 20190912 larsmoa: I think we are counting primitives for the sole purpose
    // of better estimating the 'complexity' of torus segments in findOrCreateDestinationGroup
    const numberOfPrimitives = countPrimitiveRenderCount(compressedData);

    // Create primitives for each data chunk
    const primitiveGroupMap: PrimitiveGroupMap = {};
    compressedData.primitives.forEach(data => {
      this.unpackFilePrimitive(data, numberOfPrimitives, primitiveGroupMap);
    });

    // Order by size and shrink buffers to save memory
    sector.primitiveGroups = Object.values(primitiveGroupMap);
    for (const group of sector.primitiveGroups) {
      group.consolidateAndOrderBySize();
    }
  }

  private unpackFilePrimitive(
    primitiveCompressedData: CompressedGeometryData,
    numberOfPrimitives: NumberOfPrimitives,
    primitiveGroupMap: PrimitiveGroupMap
  ) {
    for (let i = 0; i < primitiveCompressedData.count; ++i) {
      // TODO 20190912 larsmoa: Make PropertyLoader.loadData return something rather than updating state (because f*** state)
      this.dataLoader.loadData(primitiveCompressedData);
      const [treeIndex, nodeId, color] = [this.dataLoader.treeIndex, this.dataLoader.nodeId, this.dataLoader.color];

      this.dataMaps.treeIndexNodeIdMap[treeIndex] = nodeId;
      this.dataMaps.colorMap[treeIndex] = color;

      const primitiveType = primitiveCompressedData.type as FilePrimitiveNameType;
      ensurePrimitiveMapContainsType(primitiveGroupMap, primitiveType, numberOfPrimitives);
      addPrimitiveToGroup(primitiveType, primitiveGroupMap, this.dataLoader, this.filterOptions);
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

/**
 * Helper function to initialize a PrimitiveGroupMap with entries for a given primitive type.
 * This handles composite types (e.g. that a ClosedCylinder-primitive expands to <Cylinder, Circle, Circle>).
 * @param groupMap            Map to expand (if not already present) with relevant types
 * @param primitiveType       Primitive type to initialize entries for
 * @param numberOfPrimitives  Map containing information about the number of diffe
 */
function ensurePrimitiveMapContainsType(
  groupMap: PrimitiveGroupMap,
  primitiveType: FileGeometryNameType,
  numberOfPrimitives: NumberOfPrimitives
) {
  const compositeTypeMap = renderedPrimitivesPerFilePrimitive[primitiveType];
  const primitiveCount = numberOfPrimitives[primitiveType] || 1;
  assert(
    Number.isFinite(primitiveCount),
    `Encountered ${primitiveCount} when looking up number of primtives for '${primitiveType}'`
  );
  for (const part of compositeTypeMap) {
    if (!groupMap[part.name]) {
      const capacity = part.count * primitiveCount;
      const primitiveGroup = createPrimitiveGroupOfType(part.name, capacity);
      groupMap[part.name] = primitiveGroup;
    }
  }
}
