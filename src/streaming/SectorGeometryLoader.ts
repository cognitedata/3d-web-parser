// Copyright 2019 Cognite AS

import { SectorGeometry } from './SectorGeometry';
import { SectorId } from './SectorManager';

/**
 * Interface for low level classes for loading sector geometry.
 */
export interface SectorGeometryLoader {
  load(id: SectorId): Promise<ArrayBuffer>;
}

// export class DefaultSectorGeometryLoader implements SectorGeometryLoader {
//   async load(id: SectorId): Promise<SectorGeometry> {
//     console.log(`Load ${id}`);
//     try {
//       const file = sectorFiles.get(id);
//       if (!file) {
//         throw new Error(`Sector ${id} does not have a file mapping`);
//       }
//       const buffer = await sdk.files3D.retrieve(file!.fileId);
//       const { rootSector, sceneStats, maps } =
//         file.version >= 4 ? parseMultipleCustomFiles([buffer], null) : await parseProtobuf([new Uint8Array(buffer)]);
//       console.log(`Sector ${id} success`);
//       return Promise.resolve<SectorGeometry>({
//         id: rootSector.id,
//         primitiveGroups: rootSector.primitiveGroups,
//         instancedMeshGroup: rootSector.instancedMeshGroup
//       });
//     } catch (error) {
//       console.log(`Failed to load sector ${id}: '${error}'`);
//       throw error;
//     }
//   }
// }
