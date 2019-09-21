// Copyright 2019 Cognite AS

import { SectorGeometry } from './SectorGeometry';
import { SectorId } from './SectorManager';
import { SimpleCache } from '../utils/SimpleCache';

export interface SectorGeometryCache {
  /**
   * Gets geometry from cache or adds if not available
   * @param id
   * @param createCb
   */
  getOrAdd(id: SectorId, createCb: () => Promise<SectorGeometry>): Promise<SectorGeometry>;
}

export class DefaultSectorGeometrycache extends SimpleCache<SectorId, SectorGeometry> {
  private readonly cache = new SimpleCache<SectorId, SectorGeometry>();

  async getOrAdd(id: SectorId, createCb: () => Promise<SectorGeometry>): Promise<SectorGeometry> {
    let key = this.idToKey.get(id);
    if (key && this.cache.has(key)) {
      const geometryInCache = this.cache.get(key);
      if (geometryInCache) {
        return geometryInCache;
      } else {
        this.cache.delete(key);
        this.idToKey.delete(id);
      }
    }

    const geometry = await createCb();
    key = {};
    this.cache.set(key, geometry);
    this.idToKey.set(id, key);
    return geometry;
  }
}
