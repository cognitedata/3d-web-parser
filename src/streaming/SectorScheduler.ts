// Copyright 2019 Cognite AS

import { Sema } from 'async-sema';
import { SectorGeometry } from './SectorGeometry';
import { SectorId } from './SectorManager';
import { SectorGeometryLoader } from './SectorGeometryLoader';

export interface SectorScheduler {
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
  private readonly scheduled = new Map<SectorId, Promise<SectorGeometry>>();

  private readonly throttleSemaphore: Sema;

  constructor(loader: SectorGeometryLoader, throttleSemaphore?: Sema) {
    this.loader = loader;
    this.throttleSemaphore = throttleSemaphore || new Sema(DefaultSectorScheduler.DefaultConcurrentSectorsProcessings);
  }

  schedule(id: SectorId): Promise<SectorGeometry> {
    const alreadyScheduledPromise = this.scheduled.get(id);
    if (alreadyScheduledPromise) {
      return alreadyScheduledPromise;
    }

    const operation = this.awaitTimeslotAndFetch(id);
    this.scheduled.set(id, operation);
    return operation;
  }

  unschedule(id: SectorId): boolean {
    // TODO 20190923 larsmoa: No way of canceling an ongoing promise. Could use
    // bluebird.js or check a flag 'shouldCancel' within the promise logic.
    if (this.scheduled.has(id)) {
      this.scheduled.delete(id);
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
}
