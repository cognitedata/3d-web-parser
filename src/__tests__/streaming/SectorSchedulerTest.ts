// Copyright 2019 Cognite AS

import { SectorGeometryLoader } from '../../streaming/SectorGeometryLoader';
import { DefaultSectorScheduler } from '../../streaming/SectorScheduler';
import { SectorGeometry } from '../../streaming/SectorGeometry';
import { SectorId } from '../../streaming/SectorManager';

describe('DefaultSectorScheduler', () => {
  const loader: SectorGeometryLoader = {
    load: jest.fn<SectorGeometry>(async (id: SectorId) => {
      const geometry: SectorGeometry = { id, primitiveGroups: [] };
      return geometry;
    })
  };
  let scheduler: DefaultSectorScheduler;

  beforeEach(() => {
    scheduler = new DefaultSectorScheduler(loader);
  });

  test('schedule one new ID, loads one on next batch', () => {
    const scheduled = scheduler.schedule([1]);
    scheduler.startLoadingNextBatch(10);

    expect(scheduled).toBe(1);
    expect(loader.load).toBeCalledWith(1);
  });

  test('schedule one two new IDs, loads both on next batch', () => {
    const scheduled = scheduler.schedule([1, 2]);
    scheduler.startLoadingNextBatch(10);

    expect(scheduled).toBe(2);
    expect(loader.load).toBeCalledWith(1);
    expect(loader.load).toBeCalledWith(2);
  });

  test('schedule two, only one new', () => {
    // Arrange
    scheduler.schedule([1]);
    scheduler.startLoadingNextBatch(10);

    // Act
    const scheduled = scheduler.schedule([2]);

    // Assert
    expect(scheduled).toBe(1);
    expect(loader.load).toBeCalledWith(2);
  });

  test('schedule several items, some already ongoing, returns new', () => {
    // Arrange
    scheduler.schedule([1, 2, 3]);

    // Act
    const newScheduled = scheduler.schedule([2, 3, 4, 5]);

    // Assert
    expect(newScheduled).toBe(2);
  });

  test('unschedule item that was not scheduled, returns zero', () => {
    const unscheduled = scheduler.unschedule([2]);
    expect(unscheduled).toBe(0);
  });

  test('unschedule item that was not scheduled, returns zero', () => {
    const unscheduled = scheduler.unschedule([2]);
    expect(unscheduled).toBe(0);
  });

  test('unschedule previously scheduled item', () => {
    // Arrange
    scheduler.schedule([1]);

    // Act
    const unscheduled = scheduler.unschedule([1]);

    // Assert
    expect(unscheduled).toBe(1);
  });

  test('unschedule already loaded elements, returns zero', () => {
    // Arrange
    scheduler.schedule([1, 2]);
    scheduler.startLoadingNextBatch(10);

    // Act
    const unscheduled = scheduler.unschedule([1, 2]);

    // Assert
    expect(unscheduled).toBe(0);
  });
});
