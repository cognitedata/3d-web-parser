// Copyright 2019 Cognite AS

import { DataMaps, MergedMeshGroup } from '../../..';
import { UncompressedValues, SectorCompressedData, CompressedGeometryData } from '../sharedFileParserTypes';
import { FilterOptions } from '../../parseUtils';
import PropertyLoader from '../PropertyLoader';
import PrimitiveGroup from '../../../geometry/PrimitiveGroup';
import { PrimitiveGroupMap } from '../../../geometry/PrimitiveGroupMap';
import { unpackMergedMeshes } from './unpackMergedMeshes';
import { unpackFilePrimitive, countPrimitiveRenderCount } from './unpackFilePrimitive';
import { InstancedMeshGroup } from '../../../geometry/InstancedMeshGroup';
import { unpackInstancedMeshes } from './unpackInstanceMeshes';

export default class GeometryUnpacker {
  private readonly dataMaps: DataMaps;
  private readonly filterOptions?: FilterOptions;

  private readonly dataLoader: PropertyLoader;

  constructor(maps: DataMaps, uncompressedValues: UncompressedValues, filterOptions?: FilterOptions) {
    this.dataMaps = maps;
    this.filterOptions = filterOptions;
    this.dataLoader = new PropertyLoader(uncompressedValues);
  }

  public unpackPrimitives(compressedData: SectorCompressedData): PrimitiveGroup[] {
    // TODO 20190912 larsmoa: Original code "bubbled up" primitives to parent. I do not
    // think this is a good idea as it introduces a lot of complexities and runtime overhead.
    // Managing this in a streaming-solution will be a mess, so I would rather move the
    // responsibility to the optimizer
    const numberOfPrimitives = countPrimitiveRenderCount(compressedData);

    // Create primitives for each data chunk
    const primitiveGroupMap: PrimitiveGroupMap = {};
    compressedData.primitives.forEach(data => {
      unpackFilePrimitive(
        this.dataLoader,
        this.dataMaps,
        this.filterOptions,
        data,
        numberOfPrimitives,
        primitiveGroupMap
      );
    });

    // Order by size and shrink buffers to save memory
    const primitives = Object.values(primitiveGroupMap);
    for (const group of primitives) {
      group.consolidateAndOrderBySize();
    }
    return primitives;
  }

  public unpackMergedMeshes(compressedData: SectorCompressedData): MergedMeshGroup {
    if (!compressedData.mergedMesh) {
      return new MergedMeshGroup();
    }
    return unpackMergedMeshes(this.dataLoader, this.dataMaps, compressedData.mergedMesh);
  }

  public unpackInstancedMesh(compressedData: SectorCompressedData): InstancedMeshGroup {
    const geometryInfo = compressedData.instancedMesh;
    if (!geometryInfo) {
      return new InstancedMeshGroup();
    }
    return unpackInstancedMeshes(this.dataLoader, this.dataMaps, geometryInfo);
  }
}
