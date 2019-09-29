// Copyright 2019 Cognite AS

import { SectorGeometry } from './SectorGeometry';
import { SectorId } from './SectorManager';

/**
 * Interface for low level classes for loading sector geometry.
 */
export interface SectorGeometryLoader {
  load(id: SectorId): Promise<SectorGeometry>;
}
