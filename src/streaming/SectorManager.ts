// Copyright 2019 Cognite AS

import { SectorMetadata } from './SectorMetadata';
import { SectorGeometry } from './SectorGeometry';
import { SectorMetadataProvider } from './SectorMetadataProvider';
import { SectorGeometryProvider, createSectorGeometryProvider } from './SectorGeometryProvider';
import { SectorGeometryLoader } from './SectorGeometryLoader';
import { createSectorGeometryParser } from './SectorGeometryParser';
import { setDifference } from '../utils/setUtils';
import { DefaultSectorScheduler } from './SectorScheduler';

export type SectorsReadyCallback = (source: SectorManager) => void;
export type SectorId = number;
export type SectorIdSet = Set<SectorId>;

export function createSectorIdSet(ids: Iterable<SectorId>): SectorIdSet {
  return new Set<SectorId>(ids);
}

export function createSectorManager(
  rootSectorId: SectorId,
  sectorFileVersion: number,
  metadataProvider: SectorMetadataProvider,
  geometryLoader: SectorGeometryLoader
): SectorManager {
  const scheduler = new DefaultSectorScheduler(geometryLoader);
  const callback = (id: SectorId) => scheduler.schedule(id);
  const parser = createSectorGeometryParser(rootSectorId, sectorFileVersion, callback);
  const geometryProvider = createSectorGeometryProvider(parser);
  return new DefaultSectorManager(metadataProvider, geometryProvider);
}

export type SectorDiff = {
  /**
   * Futures for sectors that are wanted, but not currently active.
   */
  newSectors: Promise<SectorGeometry>[];
  /**
   * Ids of sectors that should be discarded.
   */
  discardedSectorIds: SectorIdSet;
};

export interface SectorManager {
  initialize(): Promise<SectorMetadata>;
  findMetadata(id: SectorId): SectorMetadata | undefined;
  activateSectors(wantedSectorIds: SectorIdSet): SectorDiff;
  traverseSectorsBreadthFirst(visitor: (sector: SectorMetadata) => boolean): void;
  traverseSectorsDepthFirst(visitor: (sector: SectorMetadata) => boolean): void;
}

export class DefaultSectorManager implements SectorManager {
  private readonly metadataProvider: SectorMetadataProvider;
  private readonly geometryProvider: SectorGeometryProvider;

  private rootSector?: SectorMetadata;
  private readonly sectorById: Map<SectorId, SectorMetadata>;
  private activeSectorIds: SectorIdSet = createSectorIdSet([]);

  constructor(metadataProvider: SectorMetadataProvider, geometryProvider: SectorGeometryProvider) {
    this.metadataProvider = metadataProvider;
    this.geometryProvider = geometryProvider;
    this.sectorById = new Map<SectorId, SectorMetadata>();
  }

  async initialize(): Promise<SectorMetadata> {
    this.activeSectorIds = createSectorIdSet([]);
    const rootSector = await this.metadataProvider.readSectorTree();
    this.rootSector = rootSector;
    traverseSectorsDepthFirst(this.rootSector, sector => {
      this.sectorById.set(sector.id, sector);
      return true;
    });
    return rootSector;
  }

  findMetadata(id: SectorId): SectorMetadata | undefined {
    return this.sectorById.get(id);
  }

  activateSectors(wantedSectorIds: SectorIdSet): SectorDiff {
    const newIds = setDifference(wantedSectorIds, this.activeSectorIds);
    const discardedSectorIds = setDifference(this.activeSectorIds, wantedSectorIds);

    const promises: Promise<SectorGeometry>[] = [];
    this.geometryProvider.prefetch(newIds);
    for (const id of newIds) {
      const operation = this.geometryProvider.retrieve(id);
      promises.push(operation);
    }
    this.activeSectorIds = new Set<SectorId>(wantedSectorIds);
    return { newSectors: promises, discardedSectorIds };
  }

  traverseSectorsBreadthFirst(visitor: (sector: SectorMetadata) => boolean): void {
    if (this.rootSector) {
      traverseSectorsBreadthFirst(this.rootSector, visitor);
    }
  }

  traverseSectorsDepthFirst(visitor: (sector: SectorMetadata) => boolean): void {
    if (this.rootSector) {
      traverseSectorsDepthFirst(this.rootSector, visitor);
    }
  }
}

function traverseSectorsDepthFirst(rootSector: SectorMetadata, visitor: (sector: SectorMetadata) => boolean): void {
  if (!visitor(rootSector)) {
    return;
  }

  if (rootSector.children) {
    for (const child of rootSector.children) {
      traverseSectorsDepthFirst(child, visitor);
    }
  }
}

function traverseSectorsBreadthFirst(root: SectorMetadata, visitor: (sector: SectorMetadata) => boolean): void {
  const queue: SectorMetadata[] = [root];

  let next: SectorMetadata | undefined = queue.shift();
  while (next) {
    if (visitor(next)) {
      queue.push(...next.children);
    }
    next = queue.shift();
  }
}
