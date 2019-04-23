// Copyright 2019 Cognite AS

import CustomFileReader from './CustomFileReader';
import { IdToFileGeometryName } from './parserParameters';
import { CompressedGeometryData } from './sharedFileParserTypes';

export default function loadGeometryIndices(
  file: CustomFileReader,
  sectorEndLocation: number
): CompressedGeometryData[] {
  const geometryIndices: CompressedGeometryData[] = [];
  while (file.location < sectorEndLocation) {
    const typeId = file.readUint8();
    const type = IdToFileGeometryName[typeId];
    if (type === undefined) {
      // This will happen if file type 4 is used
      // tslint:disable-next-line:no-console
      console.warn('Unknown typeId ', typeId);
    }
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
      attributeCount
    };

    geometryIndices.push(newGeometry);
  }

  return geometryIndices;
}
