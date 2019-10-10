// Copyright 2019 Cognite AS
import { SectorGeometry } from './SectorGeometry';
import { SectorId } from './SectorManager';
import parseProtobuf from '../parsers/protobuf/main';
import { parseSceneI3D } from '../parsers/i3d/main';

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
  async parseGeometry(id: number, buffer: ArrayBuffer): Promise<SectorGeometry> {
    const { rootSector, sceneStats, maps } = await parseSceneI3D(buffer);
    // TODO 20191009 larsmoa: Horrible hack to account for that we always read sector 0 first.
    const maxId = Math.max(...Object.values(maps.sectors).map(s => s.id));
    const sector = maps.sectors[maxId];
    return Promise.resolve<SectorGeometry>({
      id: sector.id,
      primitiveGroups: sector.primitiveGroups,
      instancedMeshGroup: sector.instancedMeshGroup,
      dataMaps: maps
    });
  }
}
