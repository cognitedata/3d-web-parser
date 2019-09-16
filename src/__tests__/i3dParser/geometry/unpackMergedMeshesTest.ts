import PropertyLoader from '../../../parsers/i3d/PropertyLoader';
import { DataMaps } from '../../../parsers/parseUtils';
import { CompressedGeometryData } from '../../../parsers/i3d/sharedFileParserTypes';
import { unpackMergedMeshes } from '../../../parsers/i3d/unpackGeometry/unpackMergedMeshes';
import FibonacciDecoder from '../../../parsers/FibonacciDecoder';

describe('unpackMergedMeshes', () => {
  const MockPropertyLoader = jest.fn<PropertyLoader>(() => ({
    loadData() {}
  }));
  const MockDataMaps = jest.fn<DataMaps>(() => ({
    treeIndexNodeIdMap: {},
    colorMap: [],
    nodeIdTreeIndexMap: new Map<number, number>(),
    sectors: {}
  }));
  const MockFibonacciDecoder = jest.fn<FibonacciDecoder>(() => ({
    rewind() {}
  }));
  const MockCompressedGeometryData = jest.fn<CompressedGeometryData>(() => ({
    indices: new MockFibonacciDecoder(),
    nodeIds: new MockFibonacciDecoder()
  }));

  test('No meshes', () => {
    // Arrange
    const dataLoader = new MockPropertyLoader();
    const dataMaps = new MockDataMaps();
    const geometryInfo = new MockCompressedGeometryData();

    // Act
    const result = unpackMergedMeshes(dataLoader, dataMaps, geometryInfo);

    // Assert
    expect(result).not.toBeNull();
    expect(result.meshes).not.toBeNull();
    expect(result.meshes.length).toBe(0);
  });

  test('Single mesh', () => {
    // Arrange
    const dataLoader = new MockPropertyLoader();
    const dataMaps = new MockDataMaps();
    const geometryInfo = new MockCompressedGeometryData();
    geometryInfo.count = 1;
    dataLoader.fileId = 123;

    // Act
    const result = unpackMergedMeshes(dataLoader, dataMaps, geometryInfo);

    // Assert
    expect(result).not.toBeNull();
    expect(result.meshes).not.toBeNull();
    expect(result.meshes.length).toBe(1);
  });

  test('Two meshes with same fileId, returns one group', () => {
    // Arrange
    const dataLoader = new MockPropertyLoader();
    const dataMaps = new MockDataMaps();
    const geometryInfo = new MockCompressedGeometryData();
    geometryInfo.count = 2;
    dataLoader.fileId = 123;

    // Act
    const result = unpackMergedMeshes(dataLoader, dataMaps, geometryInfo);

    // Assert
    expect(result).not.toBeNull();
    expect(result.meshes).not.toBeNull();
    expect(result.meshes.length).toBe(1);
  });

  test('Two meshes with different fileId, returns two groups', () => {
    // Arrange
    const dataLoader = new MockPropertyLoader();
    const dataMaps = new MockDataMaps();
    const geometryInfo = new MockCompressedGeometryData();
    let fileId = 1;
    jest.spyOn(dataLoader, 'loadData').mockImplementation(() => {
      // Hack: loadData() is first called once per entry to count meshes
      // and then once per entry to actually load data.
      dataLoader.fileId = fileId;
      fileId = (fileId % 2) + 1;
    });
    geometryInfo.count = 2;

    // Act
    const result = unpackMergedMeshes(dataLoader, dataMaps, geometryInfo);

    // Assert
    expect(result).not.toBeNull();
    expect(result.meshes).not.toBeNull();
    expect(result.meshes.length).toBe(2);
  });
});
