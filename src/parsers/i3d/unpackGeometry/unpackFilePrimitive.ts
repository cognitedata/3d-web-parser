import { DataMaps } from '../../..';
import { CompressedGeometryData, SectorCompressedData } from '../sharedFileParserTypes';
import { FilterOptions } from '../../parseUtils';
import {
  addPrimitiveToGroup,
  FilePrimitiveNameType,
  FileGeometryNameType,
  renderedPrimitivesPerFilePrimitive,
  createPrimitiveGroupOfType
} from '../parserParameters';
import PropertyLoader from '../PropertyLoader';
import { PrimitiveGroupMap } from '../../../geometry/PrimitiveGroupMap';
import { assert } from '../../../utils/assert';
import { RenderedPrimitiveNames } from '../../../geometry/PrimitiveGroupDataParameters';

export type NumberOfPrimitives = { [renderedPrimitive: string]: number };

/**
 * Returns the "render complexity" of primitives in the provided sector data.
 * @param compressedData
 */
export function countPrimitiveRenderCount(compressedData: SectorCompressedData) {
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

/**
 * Unpacks primitives and adds them to the provided PrimitiveGroupMap by type.
 * @param dataLoader
 * @param dataMaps
 * @param filterOptions
 * @param primitiveCompressedData
 * @param numberOfPrimitives
 * @param primitiveGroupMap The map to add the primitives to.
 */
export function unpackFilePrimitive(
  dataLoader: PropertyLoader,
  dataMaps: DataMaps,
  filterOptions: FilterOptions | undefined,
  primitiveCompressedData: CompressedGeometryData,
  numberOfPrimitives: NumberOfPrimitives,
  primitiveGroupMap: PrimitiveGroupMap
) {
  for (let i = 0; i < primitiveCompressedData.count; ++i) {
    // TODO 20190912 larsmoa: Make PropertyLoader.loadData return something rather than updating state (because f*** state)
    dataLoader.loadData(primitiveCompressedData);
    const [treeIndex, nodeId, color] = [dataLoader.treeIndex, dataLoader.nodeId, dataLoader.color];
    dataMaps.treeIndexNodeIdMap[treeIndex] = nodeId;
    dataMaps.colorMap[treeIndex] = color;
    const primitiveType = primitiveCompressedData.type as FilePrimitiveNameType;
    ensurePrimitiveMapContainsType(primitiveGroupMap, primitiveType, numberOfPrimitives);
    addPrimitiveToGroup(primitiveType, primitiveGroupMap, dataLoader, filterOptions);
  }
}

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
  const primitiveCount = numberOfPrimitives[primitiveType] || 16;
  assert(
    Number.isFinite(primitiveCount),
    `Encountered ${primitiveCount} when looking up number of primtives for '${primitiveType}'`
  );
  // Add new types to groupMap
  for (const part of compositeTypeMap.filter(x => !groupMap[x.name])) {
    const capacity = part.count * primitiveCount;
    const primitiveGroup = createPrimitiveGroupOfType(part.name, capacity);
    groupMap[part.name] = primitiveGroup;
  }
}
