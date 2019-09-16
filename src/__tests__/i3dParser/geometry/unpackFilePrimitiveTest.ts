import PropertyLoader from '../../../parsers/i3d/PropertyLoader';
import { DataMaps } from '../../../parsers/parseUtils';
import { PrimitiveGroupMap } from '../../../geometry/PrimitiveGroupMap';
import { CompressedGeometryData } from '../../../parsers/i3d/sharedFileParserTypes';
import FibonacciDecoder from '../../../parsers/FibonacciDecoder';
import { unpackFilePrimitive, NumberOfPrimitives } from '../../../parsers/i3d/unpackGeometry/unpackFilePrimitive';
import * as THREE from 'three';

describe('unpackMergedMeshes', () => {
  const MockPropertyLoader = jest.fn<PropertyLoader>(() => ({
    loadData() {},
    nodeId: 10,
    center: new THREE.Vector3(),
    normal: new THREE.Vector3(),
    delta: new THREE.Vector3()
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

  test('No primitives adds no groups', () => {
    // Arrange
    const dataLoader = new MockPropertyLoader();
    const dataMaps = new MockDataMaps();
    const primitiveData = new MockCompressedGeometryData();
    const primitiveCount: NumberOfPrimitives = {};

    // Act
    const primitivesMap: PrimitiveGroupMap = {};
    unpackFilePrimitive(dataLoader, dataMaps, undefined, primitiveData, primitiveCount, primitivesMap);

    // Assert
    expect(Object.keys(primitivesMap)).toEqual([]);
  });

  test('10 box primitives, adds single group', () => {
    // Arrange
    const dataLoader = new MockPropertyLoader();
    const dataMaps = new MockDataMaps();
    const primitiveData = new MockCompressedGeometryData();
    primitiveData.count = 1;
    primitiveData.type = 'Box';
    const primitiveCount: NumberOfPrimitives = {};

    // Act
    const primitivesMap: PrimitiveGroupMap = {};
    unpackFilePrimitive(dataLoader, dataMaps, undefined, primitiveData, primitiveCount, primitivesMap);

    // Assert
    expect(Object.keys(primitivesMap)).toEqual(['Box']);
  });

  test('ClosedCone primitives, adds composite groups', () => {
    // Arrange
    const dataLoader = new MockPropertyLoader();
    const dataMaps = new MockDataMaps();
    const primitiveData = new MockCompressedGeometryData();
    primitiveData.count = 1;
    primitiveData.type = 'ClosedCone';
    const primitiveCount: NumberOfPrimitives = {};

    // Act
    const primitivesMap: PrimitiveGroupMap = {};
    unpackFilePrimitive(dataLoader, dataMaps, undefined, primitiveData, primitiveCount, primitivesMap);

    // Assert
    expect(Object.keys(primitivesMap).sort()).toEqual(['Cone', 'Circle'].sort());
  });
});
