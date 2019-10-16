// Copyright 2019 Cognite AS
import { SectorGeometry } from './SectorGeometry';
import { SectorId } from './SectorManager';
import parseProtobuf from '../parsers/protobuf/main';
import { parseRootSector, convertSector, parseSector, WasmSectorHandle } from '../parsers/i3d/parser';

export interface SectorGeometryParser {
  parseGeometry(id: SectorId, buffer: ArrayBuffer): Promise<SectorGeometry>;
}

export const supportedGeometryFileVersions = [1, 2, 3, 7];

export function createSectorGeometryParser(version: number): SectorGeometryParser {
  if (!supportedGeometryFileVersions.includes(version)) {
    throw new Error(`Unsupported file version: ${version} (Supported versions: ${supportedGeometryFileVersions})`);
  }
  if (version <= 4) {
    return new ProtobufSectorGeometryParser();
  }
  return new I3DSectorGeometryParser();
}

export class ProtobufSectorGeometryParser implements SectorGeometryParser {
  async parseGeometry(id: SectorId, buffer: ArrayBuffer): Promise<SectorGeometry> {
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
  private rootSectorHandle?: WasmSectorHandle;

  async parseGeometry(id: number, buffer: ArrayBuffer): Promise<SectorGeometry> {
    if (!this.rootSectorHandle) {
      // Note! root sector is never freed. Probably not a big issue, but should
      // be handled if models are unloaded.
      this.rootSectorHandle = await parseRootSector(buffer);
      return await convertSector(this.rootSectorHandle!);
    }

    const sectorHandle = await parseSector(this.rootSectorHandle, buffer);
    try {
      const geometry = await convertSector(sectorHandle);
      return geometry;
    } finally {
      sectorHandle.free();
    }
  }
}
