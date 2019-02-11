import CustomFileReader from './CustomFileReader';
import { IdToFileGeometryName } from './parserParameters';
import { GeometryIndexHandler } from './sharedFileParserTypes';

export default function loadGeometryIndexes(file: CustomFileReader, sectorEndLocation: number):
    GeometryIndexHandler[] {

  const geometryIndexes: GeometryIndexHandler[] = [];
  while (file.location < sectorEndLocation) {
    const name = IdToFileGeometryName[file.readUint8()];
    const count = file.readUint32();
    let attributeCount = file.readUint8();
    if (name === 'TriangleMesh') {
      attributeCount = 5;
    }
    const byteCount = file.readUint32();
    const nodeIds = file.getNodeIdReader(count);
    const indexes = file.getFibonacciDecoder(byteCount, count * attributeCount);

    const newGeometry: GeometryIndexHandler = {
      name: name,
      nodeIds: nodeIds,
      indexes: indexes,
      count: count,
      byteCount: byteCount,
      attributeCount: attributeCount,
    };

    geometryIndexes.push(newGeometry);
  }

  return geometryIndexes;
}
