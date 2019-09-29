// Copyright 2019 Cognite AS
import { SectorGeometry } from './SectorGeometry';
import { parseProtobuf, SectorId } from '..';

export interface SectorGeometryParser {
  parseGeometry(id: SectorId, buffer: ArrayBuffer): Promise<SectorGeometry>;
}

export function createSectorGeometryParser(version: number): SectorGeometryParser {
  if (version <= 4) {
    return new ProtobufSectorGeometryParser();
  }
  throw new Error(`Unsupported file format version: ${version}`);
}

export class ProtobufSectorGeometryParser implements SectorGeometryParser {
  async parseGeometry(id: SectorId, buffer: ArrayBuffer): Promise<SectorGeometry> {
    try {
      const { rootSector, sceneStats, maps } = await parseProtobuf([new Uint8Array(buffer)]);
      return Promise.resolve<SectorGeometry>({
        id: rootSector.id,
        primitiveGroups: rootSector.primitiveGroups,
        instancedMeshGroup: rootSector.instancedMeshGroup
      });
    } catch (error) {
      console.log(`Failed to parse sector ${id}: '${error}'`);
      throw error;
    }
  }
}
