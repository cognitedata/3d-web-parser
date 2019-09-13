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

type PrimitiveGroupMap = { [name: string]: PrimitiveGroup };
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

    // // Sort all groups to enable combination next
    // for (const primtiveGroupMap of primitives) {
    //   for (const type of Object.keys(primtiveGroupMap)) {
    //     const group = primtiveGroupMap[type];
    //     group.sort();
    //   }
    // }

    // // Combine individual primitive maps
    // const combinedPrimitives = primitives.reduce((allPrimitives, primitivesMap) => {
    //   const types = Object.keys(primitivesMap);
    //   for (const type of types) {
    //     const group = primitivesMap[type];
    //     if (!allPrimitives[type]) {
    //       allPrimitives[type] = group;
    //     } else {
    //       allPrimitives[type].combineWith(group);
    //       // console.log(`Combine ${group}`);
    //       // allPrimitives[type]
    //     }
    //   }
    //   return allPrimitives;
    // }, {});

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

      const primitiveType = primitiveCompressedData.type;
      // const compositeTypeMap = renderedPrimitivesPerFilePrimitive[primitiveType]; // Some primitives are composite of others
      // const primitiveCount = numberOfPrimitives[primitiveType];
      // for (const part of compositeTypeMap) {
      //   // TODO 20190912 larsmoa: Be smart about how many we need of each subtype here
      //   const capacity = numberOfPrimitives[part.name] * primitiveCount;
      //   const primitiveGroup = primitivesByType[part.name] || createPrimitiveGroupOfType(part.name, capacity);
      //   primitivesByType[part.name] = primitiveGroup;
      // }
      ensurePrimitiveMapContainsType(primitiveGroupMap, primitiveType, numberOfPrimitives);
      // updateDestinationGroups(
      //   destinationPrimitiveGroups,
      //   currentSector,
      //   primitiveCompressedData.type,
      //   numberOfPrimitives
      // );
      // @ts-ignore
      renderedPrimitiveToAddFunction[primitiveType].call(this, primitiveGroupMap, this.dataLoader, this.filterOptions);
    }
  }
}

function createPrimitiveGroupOfType(typeName: string, capacity: number): PrimitiveGroup {
  // TODO 20190912 larsmoa: Get rid of this non-typesafe voodoo
  // @ts-ignore
  const group = new renderedPrimitiveToGroup[typeName](capacity);
  return group;
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

// function updateDestinationGroups(
//   destinationPrimitiveGroups: { [name: string]: PrimitiveGroup },
//   sector: Sector,
//   geometryType: FileGeometryNameType,
//   numberOfPrimitives: NumberOfPrimitives
// ) {
//   renderedPrimitivesPerFilePrimitive[geometryType].forEach(renderedPrimitiveInfo => {
//     const destinationGroup = destinationPrimitiveGroups[renderedPrimitiveInfo.name];
//     if (
//       destinationGroup === undefined ||
//       destinationGroup.capacity < destinationGroup.data.count + renderedPrimitiveInfo.count
//     ) {
//       destinationPrimitiveGroups[renderedPrimitiveInfo.name] = findOrCreateDestinationGroup(
//         sector,
//         renderedPrimitiveInfo,
//         numberOfPrimitives
//       );
//     }
//   });
// }

// function findOrCreateDestinationGroup(
//   originalSector: Sector,
//   renderedPrimitiveInfo: { name: string; count: number },
//   numberOfPrimitives: NumberOfPrimitives
// ) {
//   let searchSector: Sector | undefined = originalSector;
//   let destinationGroup: PrimitiveGroup | undefined;

//   while (searchSector !== undefined && destinationGroup === undefined) {
//     searchSector.primitiveGroups.forEach(primitiveGroup => {
//       if (primitiveGroup.type === renderedPrimitiveInfo.name) {
//         if (primitiveGroup.capacity >= primitiveGroup.data.count + renderedPrimitiveInfo.count) {
//           destinationGroup = primitiveGroup;
//         }
//       }
//     });

//     searchSector = searchSector.parent;
//   }

//   if (destinationGroup !== undefined) {
//     return destinationGroup;
//   } else if (renderedPrimitiveInfo.name === 'TorusSegment') {
//     const capacity = numberOfPrimitives.TorusSegment;
//     // TODO 20190912 larsmoa: Get rid of this non-typesafe voodoo
//     // @ts-ignore
//     const createdGroup = new renderedPrimitiveToGroup.TorusSegment(capacity);
//     originalSector.primitiveGroups.push(createdGroup);
//     return createdGroup;
//   } else {
//     // TODO 20190912 larsmoa: Estimate, verify if ok or if old approach (in main.ts) is    // better/necessary
//     const capacity = Math.min(numberOfPrimitives[renderedPrimitiveInfo.name], 5000);
//     // @ts-ignore
//     const createdGroup = new renderedPrimitiveToGroup[renderedPrimitiveInfo.name](capacity);
//     originalSector.primitiveGroups.push(createdGroup);
//     return createdGroup;
//   }
// }

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
  // const primitiveCount = numberOfPrimitives[primitiveType];
  const primitiveCount = 64; // TODO 20190912 larsmoa: Count actual
  for (const part of compositeTypeMap) {
    if (!groupMap[part.name]) {
      // TODO 20190912 larsmoa: Be smarter, or don't be smart at all
      const capacity = part.count * primitiveCount;
      const primitiveGroup = createPrimitiveGroupOfType(part.name, capacity);
      groupMap[part.name] = primitiveGroup;
    }
  }
}
