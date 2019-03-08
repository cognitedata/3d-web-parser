import CustomFileReader from './CustomFileReader';
import { IdToFileGeometryName } from './parserParameters';
import { CompressedGeometryData } from './sharedFileParserTypes';

export default function loadGeometryIndices(file: CustomFileReader, sectorEndLocation: number):
    CompressedGeometryData[] {

  const geometryIndices: CompressedGeometryData[] = [];
  while (file.location < sectorEndLocation) {
    const type = IdToFileGeometryName[file.readUint8()];
    const count = file.readUint32();
    const attributeCount = file.readUint8();
    const byteCount = file.readUint32();
    const nodeIds = file.getNodeIdReader(count);
    const indices = file.getFibonacciDecoder(byteCount, count * attributeCount);

    const newGeometry: CompressedGeometryData = {
      type,
      nodeIds,
      indices,
      count,
      byteCount,
      attributeCount,
    };

    geometryIndices.push(newGeometry);
  }

  return geometryIndices;
}
