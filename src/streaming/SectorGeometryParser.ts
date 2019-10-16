// Copyright 2019 Cognite AS
import { SectorGeometry } from './SectorGeometry';
import { SectorId } from './SectorManager';
import parseProtobuf from '../parsers/protobuf/main';
import { parseRootSector, convertSector, parseSector, WasmSectorHandle } from '../parsers/i3d/parser';

export type LoadSectorDataCallback = (id: SectorId) => Promise<ArrayBuffer>;

export interface SectorGeometryParser {
  parseGeometry(id: SectorId): Promise<SectorGeometry>;
}

export const supportedGeometryFileVersions = [1, 2, 3, 7];

export function createSectorGeometryParser(
  rootSectorId: SectorId,
  formatVersion: number,
  loadSectorDataCallback: LoadSectorDataCallback
): SectorGeometryParser {
  if (!supportedGeometryFileVersions.includes(formatVersion)) {
    throw new Error(
      `Unsupported file version: ${formatVersion} (Supported versions: ${supportedGeometryFileVersions})`
    );
  }
  if (formatVersion <= 4) {
    return new ProtobufSectorGeometryParser(rootSectorId, loadSectorDataCallback);
  }
  return new I3DSectorGeometryParser(rootSectorId, loadSectorDataCallback);
}

export class ProtobufSectorGeometryParser implements SectorGeometryParser {
  private readonly loadSectorDataCallback: LoadSectorDataCallback;

  constructor(rootSectorId: SectorId, loadSectorDataCallback: LoadSectorDataCallback) {
    this.loadSectorDataCallback = loadSectorDataCallback;
  }

  async parseGeometry(id: SectorId): Promise<SectorGeometry> {
    const buffer = await this.loadSectorDataCallback(id);
    const { rootSector, sceneStats, maps } = await parseProtobuf([new Uint8Array(buffer)]);
    return Promise.resolve<SectorGeometry>({
      id: rootSector.id,
      primitiveGroups: rootSector.primitiveGroups,
      instancedMeshGroup: rootSector.instancedMeshGroup,
      dataMaps: maps
    });
  }
}

export class I3DSectorGeometryParser implements SectorGeometryParser {
  private readonly rootSectorId: SectorId;
  private readonly loadSectorDataCallback: LoadSectorDataCallback;
  private readonly rootSectorHandlePromise: Promise<WasmSectorHandle>;

  constructor(rootSectorId: SectorId, loadSectorDataCallback: LoadSectorDataCallback) {
    // Note! root sector is never freed. Probably not a big issue, but should
    // be handled if models are unloaded.
    this.rootSectorId = rootSectorId;
    this.loadSectorDataCallback = loadSectorDataCallback;
    this.rootSectorHandlePromise = this.loadRootSector();
  }

  async parseGeometry(id: SectorId): Promise<SectorGeometry> {
    const rootSectorHandle = await this.rootSectorHandlePromise;
    if (id === this.rootSectorId) {
      return await convertSector(rootSectorHandle);
    }

    const buffer = await this.loadSectorDataCallback(id);
    const sectorHandle = await parseSector(rootSectorHandle, buffer);
    try {
      const geometry = await convertSector(sectorHandle);
      return geometry;
    } finally {
      sectorHandle.free();
    }
  }

  private async loadRootSector(): Promise<WasmSectorHandle> {
    const buffer = await this.loadSectorDataCallback(this.rootSectorId);
    const handle = await parseRootSector(buffer);
    return handle;
  }
}
