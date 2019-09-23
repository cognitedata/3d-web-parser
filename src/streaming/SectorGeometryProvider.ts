// Copyright 2019 Cognite AS

import { SectorGeometry } from './SectorGeometry';
import { SectorId } from './SectorManager';
import { Cache, SimpleCache } from '../utils/SimpleCache';
import { DefaultSectorScheduler, SectorScheduler } from './SectorScheduler';
import { SectorGeometryLoader } from './SectorGeometryLoader';

/**
 * Interface for classes that provide sector geometry given ID. The provider
 * may cache geometry and schedule reading for eventually completion.
 */
export interface SectorGeometryProvider {
  /**
   * Reads geometry for the sector provided.
   */
  retrieve(sectorId: SectorId): Promise<SectorGeometry>;
}

export class DefaultSectorGeometryProvider implements SectorGeometryProvider {
  private readonly cache: Cache<SectorId, SectorGeometry>;
  private readonly scheduler: SectorScheduler;

  constructor(scheduler: SectorScheduler, cache?: Cache<SectorId, SectorGeometry>) {
    this.scheduler = scheduler;
    this.cache = cache || new SimpleCache<SectorId, SectorGeometry>();
  }

  async retrieve(sectorId: SectorId): Promise<SectorGeometry> {
    return await this.cache.getOrAdd(sectorId, this.scheduler.schedule);
  }
}
