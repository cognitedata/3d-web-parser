// Copyright 2019 Cognite AS

import { EventDispatcher } from 'strongly-typed-events';
import { SectorGeometry } from './SectorGeometry';
import { SectorId } from './SectorManager';
import { difference } from '../utils/setUtils';
import { SectorGeometryLoader } from './SectorGeometryLoader';

export interface SectorScheduler {
  sectorLoaded: EventDispatcher<SectorScheduler, SectorGeometry>;
  /**
   * Schedules the sectors provided for load and immediatly returns.
   */
  schedule(ids: SectorId[]): number;
  /**
   * Unschedules the sectors provided for load.
   */
  unschedule(ids: SectorId[]): number;
}

export class DefaultSectorScheduler implements SectorScheduler {
  public sectorLoaded = new EventDispatcher<SectorScheduler, SectorGeometry>();

  private readonly loader: SectorGeometryLoader;

  // Queued for processing
  private queue: SectorId[] = [];
  private queuedSet = new Set<SectorId>();

  // Currently processing
  private ongoing = new Set<SectorId>();

  constructor(loader: SectorGeometryLoader) {
    this.loader = loader;
  }

  schedule(ids: SectorId[]): number {
    const newIds = difference(new Set<SectorId>(ids), this.queuedSet);
    this.queue.push(...newIds);
    for (const id of newIds) {
      this.queuedSet.add(id);
    }
    return newIds.size;
  }

  unschedule(ids: number[]): number {
    const asSet = new Set<SectorId>(ids);
    const countBeforeUnschedule = this.queuedSet.size;
    this.queuedSet = difference(this.queuedSet, asSet);
    this.queue = Array.from(this.queuedSet);
    return countBeforeUnschedule - this.queuedSet.size;
  }

  startLoadingNextBatch(concurrentOngoing: number): number {
    const toLoadCount = Math.max(0, Math.min(concurrentOngoing - this.ongoing.size, this.queue.length));

    for (let i = 0; i < toLoadCount; ++i) {
      const nextId = this.queue.pop()!;
      this.queuedSet.delete(nextId);
      this.ongoing.add(nextId);

      this.loader.load(nextId).then(geometry => {}, error => {});
    }
    return toLoadCount;
  }
}
