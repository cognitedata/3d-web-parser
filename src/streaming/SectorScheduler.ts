// Copyright 2019 Cognite AS

import { EventDispatcher } from 'strongly-typed-events';
import { SectorMetadata } from './SectorMetadata';
import { SectorGeometry } from './SectorGeometry';
import { SectorId } from './SectorManager';

export interface SectorScheduler {
  sectorLoaded: EventDispatcher<SectorScheduler, SectorMetadata & SectorGeometry>;
  /**
   * Schedules the sectors provided for load and immediatly returns.
   */
  schedule(ids: SectorId[]): void;
  /**
   * Unschedules the sectors provided for load.
   */
  unschedule(ids: SectorId[]): void;
}
