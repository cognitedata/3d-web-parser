// Copyright 2019 Cognite AS

import { SectorGeometryLoader } from '../../streaming/SectorGeometryLoader';
import { DefaultSectorScheduler } from '../../streaming/SectorScheduler';
import { SectorGeometry } from '../../streaming/SectorGeometry';
import { Sema } from 'async-sema';
import { CancellationError } from '../../utils/CancellationError';

describe('DefaultSectorScheduler', () => {
  const throttleSemaphore = new Sema(1);
  const loader: SectorGeometryLoader = {
    load: jest.fn<SectorGeometry>()
  };
  let scheduler: DefaultSectorScheduler;

  beforeEach(() => {
    scheduler = new DefaultSectorScheduler(loader, throttleSemaphore);
    jest.resetAllMocks();
  });

  test('schedule() initiates load', async () => {
    await scheduler.schedule(1);
    expect(loader.load).toBeCalledWith(1);
  });

  test('schedule() twice for same ID, returns same promise', async () => {
    await throttleSemaphore.acquire(); // Block loading
    try {
      const op1 = scheduler.schedule(1);
      const op2 = scheduler.schedule(1);
      expect(op1).toBe(op2);
    } finally {
      throttleSemaphore.release();
    }
  });

  test('schedule() two different sectors, returns different promises', async () => {
    await throttleSemaphore.acquire(); // Block loading
    try {
      const op1 = scheduler.schedule(1);
      const op2 = scheduler.schedule(2);
      expect(op1).not.toBe(op2);
    } finally {
      throttleSemaphore.release();
    }
  });

  test('schedule() previously loaded sector reschedules', async () => {
    // Load once
    throttleSemaphore.release();
    const op1 = scheduler.schedule(1);
    await op1;
    // Load same again
    await scheduler.schedule(1);
    expect(loader.load).toBeCalledWith(2);
  });

  test('schedule() after unschedule() triggers new load', async () => {
    await throttleSemaphore.acquire(); // Block load
    try {
      const load1 = scheduler.schedule(1);
      scheduler.unschedule(1);
      const load2 = scheduler.schedule(1);
      expect(load2).not.toBe(load1);
    } finally {
      throttleSemaphore.release();
    }
  });

  test('unschedule() before scheduled sector stats -> processing is cancelled', async () => {
    await throttleSemaphore.acquire(); // Block load
    try {
      const loaderSpy = jest.spyOn(loader, 'load');
      const load = scheduler.schedule(1);
      scheduler.unschedule(1);
      throttleSemaphore.release();
      try {
        await load;
        expect(false).toBeTruthy(); // Expect error
      } catch (e) {
        expect(e).toBeInstanceOf(CancellationError);
      }
      expect(loaderSpy).not.toHaveBeenCalled();
    } finally {
      throttleSemaphore.release();
    }
  });
});
