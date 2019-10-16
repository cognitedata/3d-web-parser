// Copyright 2019 Cognite AS

import { SectorGeometry } from './SectorGeometry';
import { SectorId, SectorIdSet } from './SectorManager';
import { Cache, SimpleCache } from '../utils/SimpleCache';
import { SectorScheduler, DefaultSectorScheduler } from './SectorScheduler';
import { SectorGeometryLoader } from './SectorGeometryLoader';
import { SectorGeometryParser } from './SectorGeometryParser';

/**
 * Interface for classes that provide sector geometry given ID. The provider
 * may cache geometry and schedule reading for eventually completion.
 */
export interface SectorGeometryProvider {
  /**
   * Instruct the provider about what sectors it should
   * expect required for retrieval in the near future.
   * This is stritcly a hint - retrieval without prefect
   * will work, albeit might be slower.
   * @param sectorIds
   */
  prefetch(sectorIds: SectorIdSet): void; // TODO 20190929 larsmoa: Does this make sense? Why not retrieve() all?
  /**
   * Reads geometry for the sector provided.
   */
  retrieve(sectorId: SectorId): Promise<SectorGeometry>;
}

export function createSectorGeometryProvider(parser: SectorGeometryParser): SectorGeometryProvider {
  return new DefaultSectorGeometryProvider(parser);
}

export class DefaultSectorGeometryProvider implements SectorGeometryProvider {
  private readonly cache: Cache<SectorId, SectorGeometry>;
  private readonly parser: SectorGeometryParser;

  constructor(parser: SectorGeometryParser, cache?: Cache<SectorId, SectorGeometry>) {
    this.parser = parser;
    this.cache = cache || new SimpleCache<SectorId, SectorGeometry>();
  }

  prefetch(sectorIds: Set<SectorId>): void {
    // Schedule all expected sectors for retrieval
    sectorIds.forEach(id => this.retrieve(id));
  }

  async retrieve(sectorId: SectorId): Promise<SectorGeometry> {
    return await this.cache.getOrAdd(sectorId, async (id: SectorId) => {
      const geometry = await this.parser.parseGeometry(id);
      return geometry;
    });
  }
}
