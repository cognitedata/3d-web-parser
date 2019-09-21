// Copyright 2019 Cognite AS

import { SectorGeometry } from './SectorGeometry';
import { SectorId } from './SectorManager';

export interface SectorGeometryProvider {
  /**
   * Reads geometry for the sector provided.
   */
  retrieve(sectorId: SectorId): Promise<SectorGeometry>;
}

export class SectorGeometryProviderImpl implements SectorGeometryProvider {
  constructor() {}

  async retrieve(sectorId: number): Promise<SectorGeometry> {
    throw new Error();
  }
}
