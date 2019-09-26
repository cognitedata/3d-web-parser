// Copyright 2019 Cognite AS

import { Sema } from 'async-sema';
import { SectorGeometry } from './SectorGeometry';
import { SectorId, SectorIdSet, createSectorIdSet } from './SectorManager';
import { SectorGeometryLoader } from './SectorGeometryLoader';
import { CancellationError } from '../utils/CancellationError';

export interface SectorScheduler {
  /**
   * Returns a list of currently scheduled, unfinished
   * sectors.
   */
  readonly scheduled: SectorIdSet;
  /**
   * Schedules the sector provided for load and immediatly returns.
   */
  schedule(id: SectorId): Promise<SectorGeometry>;
  /**
   * Unschedules the sector provided for load. Returns true if
   * the operation had any effect (i.e. it actually unscheduled
   * an operation).
   */
  unschedule(id: SectorId): boolean;
}

export class DefaultSectorScheduler implements SectorScheduler {
  private static readonly DefaultConcurrentSectorsProcessings = 5;

  private readonly loader: SectorGeometryLoader;
  private readonly scheduledOperations = new Map<SectorId, Promise<SectorGeometry>>();

  private readonly throttleSemaphore: Sema;

  get scheduled(): SectorIdSet {
    return createSectorIdSet(this.scheduledOperations.keys());
  }

  constructor(loader: SectorGeometryLoader, throttleSemaphore?: Sema) {
    this.loader = loader;
    this.throttleSemaphore = throttleSemaphore || new Sema(DefaultSectorScheduler.DefaultConcurrentSectorsProcessings);
  }

  schedule(id: SectorId): Promise<SectorGeometry> {
    const alreadyScheduledPromise = this.scheduledOperations.get(id);
    if (alreadyScheduledPromise) {
      return alreadyScheduledPromise;
    }

    const operation = this.awaitTimeslotAndFetch(id);
    this.scheduledOperations.set(id, operation);
    return operation;
  }

  unschedule(id: SectorId): boolean {
    // TODO 20190923 larsmoa: No way of canceling an ongoing promise. Could use
    // bluebird.js or check a flag 'shouldCancel' within the promise logic.
    if (this.scheduledOperations.has(id)) {
      this.scheduledOperations.delete(id);
      return true;
    }
    return false; // Not scheduled
  }

  private async awaitTimeslotAndFetch(id: SectorId): Promise<SectorGeometry> {
    await this.throttleSemaphore.acquire();
    try {
      // TODO 20190923 larsmoa: Decide to use bluebird.js and use "promisify"
      // to create a promise for load. Also: web worker.
      const operation = new Promise<SectorGeometry>((resolve, reject) => {
        try {
          if (!this.isScheduled(id)) {
            throw new CancellationError(`Sector ${id} has been unscheduled for load`);
          }
          resolve(this.loader.load(id));
        } catch (error) {
          reject(error);
        }
      });
      return await operation;
    } finally {
      this.throttleSemaphore.release();
    }
  }

  private isScheduled(id: SectorId): boolean {
    return this.scheduledOperations.has(id);
  }
}
