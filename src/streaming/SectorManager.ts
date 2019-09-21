// Copyright 2019 Cognite AS

import { EventDispatcher } from 'strongly-typed-events';
import { SectorMetadata } from './SectorMetadata';
import { SectorGeometry } from './SectorGeometry';
import { SectorMetadataProvider } from './SectorMetadataProvider';
import { SectorGeometryProvider } from './SectorGeometryProvider';
import { assert } from '../utils/assert';

export type SectorsReadyCallback = (source: SectorManager) => void;
export type SectorId = number;
export type SectorIdSet = Set<SectorId>;

export function createSectorIdSet(...ids: SectorId[]): SectorIdSet {
  return new Set<number>(ids);
}

export default interface SectorManager {
  sectorLoaded: EventDispatcher<SectorManager, SectorMetadata & SectorGeometry>;
  initialize(): Promise<SectorMetadata>;
  setActiveSectors(newActiveIds: SectorIdSet): Promise<SectorGeometry[]>;
  getSectors(
    currentActive: SectorIdSet
  ): {
    activated: SectorIdSet;
    deactivated: SectorIdSet;
  };
}

// export async function createSectorManager(
//   fileVersion: number,
//   metadataBuffer: ArrayBuffer,
//   onSectorsReadyCb: SectorsReadyCallback
// ): Promise<SectorManager> {
//   const manager = new SectorManagerImpl(onSectorsReadyCb);
//   if (!(await manager.parseMetadata(fileVersion, metadataBuffer))) {
//     throw new Error('Could not parse metadata');
//   }
//   return manager;
// }

// interface SectorScheduler {
//   discard(toDiscard: SectorIdSet) : void;
//   schedule(toSchedule: SectorIdSet): void;
// }

export class SectorManagerImpl implements SectorManager {
  public readonly sectorLoaded = new EventDispatcher<SectorManager, SectorMetadata & SectorGeometry>();

  private readonly metadataProvider: SectorMetadataProvider;
  private readonly geometryProvider: SectorGeometryProvider;

  private rootSector?: SectorMetadata;
  private sectorById: Map<SectorId, SectorMetadata>;

  constructor(metadataProvider: SectorMetadataProvider, geometryProvider: SectorGeometryProvider) {
    this.metadataProvider = metadataProvider;
    this.geometryProvider = geometryProvider;
    this.sectorById = new Map<SectorId, SectorMetadata>();
  }

  async initialize(): Promise<SectorMetadata> {
    const rootSector = await this.metadataProvider.readSectorTree();
    this.rootSector = rootSector;
    traverseSectorDepthFirst(this.rootSector, sector => {
      this.sectorById.set(sector.id, sector);
    });
    return rootSector;
  }

  setActiveSectors(newActiveIds: SectorIdSet): Promise<SectorGeometry[]> {
    const promises: Promise<SectorGeometry>[] = [];
    const geometries: SectorGeometry[] = [];

    for (const id of newActiveIds) {
      const operation = this.geometryProvider.retrieve(id);
      promises.push(operation);
      operation.then(geometry => {
        const metadata = this.findMetadata(id);
        const merged = { ...metadata, ...geometry };
        this.triggerSectorLoaded(merged);
        geometries.push(geometry);
      });
    }
    return Promise.all(promises);
  }

  getSectors(currentActive: SectorIdSet): { activated: SectorIdSet; deactivated: SectorIdSet } {
    throw new Error('Method not implemented.');
  }

  private findMetadata(id: SectorId): SectorMetadata {
    assert(!!this.rootSector, 'initialize() must be called and finish before calling findMetadata');
    const result = this.sectorById.get(id);
    if (!result) {
      throw new Error(`Could not find sector with ID '${id}'`);
    }
    return result!;
  }

  private triggerSectorLoaded(sector: SectorMetadata & SectorGeometry) {
    this.sectorLoaded.dispatch(this, sector);
  }
}

function traverseSectorDepthFirst(rootSector: SectorMetadata, visitor: (sector: SectorMetadata) => void) {
  if (rootSector.children) {
    for (const child of rootSector.children) {
      traverseSectorDepthFirst(child, visitor);
    }
  }
  visitor(rootSector);
}

//   private static readonly MinFileVersion = 4;

//   private readonly onSectorsReadyCb: SectorsReadyCallback;

//   private dataMaps?: DataMaps;
//   private rootSector?: Sector;
//   private currentActiveSectors: SectorIdSet = new SectorIdSet();

//   constructor(onSectorsReadyCb: SectorsReadyCallback) {
//     this.onSectorsReadyCb = onSectorsReadyCb;
//   }

//   private get isInitialized(): boolean {
//     return !!this.dataMaps;
//   }

//   async initialize(fileVersion: number, metadataBuffer: ArrayBuffer, filterOptions?: FilterOptions): Promise<Sector> {
//     if (fileVersion < SectorManagerImpl.MinFileVersion) {
//       throw new Error(`File version must be >= ${SectorManagerImpl.MinFileVersion}, but was ${fileVersion}`);
//     }

//     const parseResult = await new Promise<ParseReturn>(() => parseFullCustomFile(metadataBuffer, filterOptions));
//     this.dataMaps = parseResult.maps;
//     this.rootSector = parseResult.rootSector;
//     return this.rootSector;
//   }

//   setActiveSectors(activeIds: SectorIdSet) {
//     const keep = intersection(this.currentActiveSectors, activeIds);
//     const discard = difference(this.currentActiveSectors, activeIds);
//     const add = difference(activeIds, this.currentActiveSectors);

//     this.currentActiveSectors = activeIds;
//   }

//   getSectors(currentActive: SectorIdSet): { activated: Set<string>; deactivated: Set<string> } {
//     throw new Error('Method not implemented.');
//   }
// }
