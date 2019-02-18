import CustomFileReader from './CustomFileReader';
import { IdToFileGeometryName } from './parserParameters';
import { CompressedGeometryData } from './sharedFileParserTypes';

export default function loadGeometryIndexes(file: CustomFileReader, sectorEndLocation: number):
    CompressedGeometryData[] {

  const geometryIndexes: CompressedGeometryData[] = [];
  while (file.location < sectorEndLocation) {
    const type = IdToFileGeometryName[file.readUint8()];
    const count = file.readUint32();
    const attributeCount = file.readUint8();
    const byteCount = file.readUint32();
    const nodeIds = file.getNodeIdReader(count);
    const indexes = file.getFibonacciDecoder(byteCount, count * attributeCount);

    const newGeometry: CompressedGeometryData = {
      type: type,
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
