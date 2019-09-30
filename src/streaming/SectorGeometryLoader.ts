// Copyright 2019 Cognite AS

import { SectorId } from './SectorManager';

/**
 * Interface for low level classes for loading data for sector geometry.
 * Implementations will typically download the data from the web or look up
 * from a local datastore..
 */
export interface SectorGeometryLoader {
  load(id: SectorId): Promise<ArrayBuffer>;
}
