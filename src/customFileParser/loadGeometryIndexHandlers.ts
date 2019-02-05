import CustomFileReader from './CustomFileReader';
import { IdToFileGeometryName } from './parserParameters';
import { GeometryIndexHandler } from './sharedFileParserTypes';

export default function loadGeometryIndexes(file: CustomFileReader, sectorEndLocation: number):
    GeometryIndexHandler[] {

  const geometryIndexes: GeometryIndexHandler[] = [];
  while (file.location < sectorEndLocation) {
    const name = IdToFileGeometryName[file.readUint32()];
    const geometryCount = file.readUint32();
    const attributeCount = file.readUint32();
    const byteCount = file.readUint32();
    const nodeIds = file.getNodeIdReader(geometryCount);
    const indexes = file.getFibonacciDecoder(byteCount);

    const newGeometry: GeometryIndexHandler = {
      name: name,
      nodeIds: nodeIds,
      indexes: indexes,
      geometryCount: geometryCount,
      byteCount: byteCount,
      attributeCount: attributeCount,
    };

    geometryIndexes.push(newGeometry);
  }

  return geometryIndexes;
}
