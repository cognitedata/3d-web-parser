// Copyright 2019 Cognite AS
import { SectorGeometry } from './SectorGeometry';
import { SectorId } from './SectorManager';
import parseProtobuf from '../parsers/protobuf/main';

export interface SectorGeometryParser {
  parseGeometry(id: SectorId, buffer: ArrayBuffer): Promise<SectorGeometry>;
}

export function createSectorGeometryParser(version: number): SectorGeometryParser {
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
  parseGeometry(id: number, buffer: ArrayBuffer): Promise<SectorGeometry> {
    throw new Error('Not implemented.');
  }
}
