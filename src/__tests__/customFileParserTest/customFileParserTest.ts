import { parseCustomFileFormat, FibonacciDecoder, generateGeometryGroups } from '../../customParser';
import * as THREE from 'three';
// @ts-ignore
const fs = require('fs');

function checkFloatArrayMatch(arrayA: any, arrayB: any) {
  expect(arrayA.length).toBe(arrayB.length);
  for (let i = 0; i < arrayA.length; i++) {
    expect(arrayA[i]).toBeCloseTo(arrayB[i]);
  }
}

function checkIntArrayMatch(arrayA: any, arrayB: any) {
  expect(arrayA.length).toBe(arrayB.length);
  for (let i = 0; i < arrayA.length; i++) {
    expect(arrayA[i]).toBe(arrayB[i]);
  }
}

describe('customFileParser', () => {
  test('parse fibonacci encoding', async() => {
    const uncompressedData = new ArrayBuffer(13);
    const uncompressedView = new Uint8Array(uncompressedData);
    uncompressedView[0] = parseInt('11110011', 2);
    uncompressedView[1] = parseInt('10001000', 2);
    uncompressedView[2] = parseInt('10001000', 2);
    uncompressedView[3] = parseInt('00000010', 2);
    uncompressedView[4] = parseInt('00101001', 2);
    uncompressedView[5] = parseInt('00000001', 2);
    uncompressedView[6] = parseInt('01000000', 2);
    uncompressedView[7] = parseInt('10010001', 2);
    uncompressedView[8] = parseInt('00010101', 2);
    uncompressedView[9] = parseInt('00000010', 2);
    uncompressedView[10] = parseInt('01011110', 2);
    uncompressedView[11] = parseInt('10110000', 2);
    const decoder = new FibonacciDecoder(uncompressedData);
    expect(decoder.nextValue()).toBe(0);
    expect(decoder.nextValue()).toBe(0);
    expect(decoder.nextValue()).toBe(2);
    expect(decoder.nextValue()).toBe(8164540613673614);
    expect(decoder.nextValue()).toBe(0);
    expect(decoder.nextValue()).toBe(6);
  });

  test('parse file 42', async() => {
    const incomingFile = fs.readFileSync('./src/__tests__/customFileParserTest/Pipes.c3d', null);

    const asArrayBuffer = new ArrayBuffer(incomingFile.length);
    const arrayBufferCopier = new Uint8Array(asArrayBuffer);
    for (let i = 0; i < incomingFile.length; i++) {
      arrayBufferCopier[i] = incomingFile[i];
    }

    const parsedFile = parseCustomFileFormat(asArrayBuffer, true);

    expect(parsedFile.magicBytes).toBe(1178874739);
    expect(parsedFile.formatVersion).toBe(1);
    expect(parsedFile.optimizerVersion).toBe(1);
    expect(parsedFile.arrayCount).toBe(13);
    expect(parsedFile.arrays.colors.length).toBe(7);

    const expectedColors = [[ 30, 144, 255, 255 ], [ 255, 0, 0, 255 ], [ 255, 255, 255, 255 ],
    [ 142, 92, 0, 255 ], [ 50, 205, 50, 255 ], [ 0, 255, 255, 255 ], [ 255, 255, 0, 255 ]];
    const expectedXValues = [290.4921, 282.7001, 288.9621, 281.4592, 286.4021, 289.89, 290.05, 287.707, 295.9749,
      284.3424, 286.2073, 290.9632, 293.3277, 287.9075, 284.691, 287.8749, 288.3569, 284.6376, 290.561, 289.53];
    const expectedYValues = [93.71999, 90.49236, 86.76433, 110.37, 87.23443, 89.99999, 108.66, 94.14565, 103.466,
      109.8561, 101.1051, 106.3237, 106.9305, 95.52113, 96.43997, 100.0974, 101.8245, 101.6237, 94.92494, 97.18592];
    const expectedZValues = [529, 528.85, 528.4, 528.7, 528.6, 527.8, 528.8, 528.75, 528.5, 528.45, 528.9973,
      528.78, 528.3, 528.35, 528.8402, 529.1, 528.55, 528.99, 529.05, 525.9815];
    const expectedNormals = [
      new THREE.Vector3(0, 0, 1 ),
      new THREE.Vector3(0, 1, 0 ),
      new THREE.Vector3(0, -1, 0 ),
      new THREE.Vector3(1, 0, 0 ),
      new THREE.Vector3(-1, 0, 0 ),
      new THREE.Vector3(0.707072377204895, 0, 0.7071411609649658 ),
      new THREE.Vector3(0, -0.8660270571708679, 0.49999716877937317 ),
      new THREE.Vector3(0, 0.8628952503204346, 0.5053828358650208 ),
      new THREE.Vector3(0, -0.7072240114212036, 0.7069895267486572 ),
      new THREE.Vector3(0.8660598397254944, 0, 0.4999403953552246 ),
      new THREE.Vector3(-0.5000000596046448, -0.8660253882408142, 0 ),
      new THREE.Vector3(-0.4999999403953552, 0.866025447845459, 0 ),
      new THREE.Vector3(0, 0.563718855381012, 0.8259667158126831 ),
      new THREE.Vector3(-0.7071261405944824, 0, 0.7070874571800232 ),
      new THREE.Vector3(0, 0.49998918175697327, 0.8660316467285156 ),
      new THREE.Vector3(0, 0.7069307565689087, 0.7072827219963074 ),
      new THREE.Vector3(-0.7963610291481018, -0.6048215627670288, 0 ),
      new THREE.Vector3(-0.561081051826477, -0.8277608752250671, 0 ),
      new THREE.Vector3(0, -0.8260104060173035, 0.5636548399925232 ),
      new THREE.Vector3(0, -0.5024152398109436, 0.8646264672279358 )];
    const expectedDeltas = [0.6, 0.4, 0.06, 0.04, 0.004, 0.46, 0.015, 0.007, 0.2, 1.4, 0.05, 0.5, 1.46,
      0.01, 0.623, 0.543, 1.2, 0.451, 0.411, 0.097];
    const expectedHeights = [0.002, 0.003, 0.02100002, 0.4, 0.05, 0.004000001, 0.056292, 0.3, 0.04000005,
      0.006100481, 0.02500007, 0.02050001, 0.034641, 0.03990259, 0.043301, 0.073612, 0.0149983, 0.36, 0.01, 0.48];
    const expectedRadiuses = [0.1249847, 0.1999946, 0.09999415, 0.06249976, 0.07999946, 0.1574976, 0.1299997,
      0.2299984, 0.1550003, 0.0595, 0.02499999, 0.1219649, 0.1099979, 0.1124228, 0.2499941, 0.1769338, 0.07700001,
      0.05939444, 0.0635, 0.1874982];
    const expectedAngles = [0, 1.570796, 3.141593, 0.7853982, 4.712389, 0.5235988, 1.590028, 1.047198, 2.617994,
      6.283185, 5.759586, 2.356194, 4.693129, 5.497787, 3.926991, 0.1308997, 5.235988, 2.96706, 1.550322, 2.094395];
    const expectedMatrixes: any = [];
    const expectedXTranslations: any = [];
    const expectedYTranslations: any = [];
    const expectedZTranslations: any = [];

    expect(parsedFile.arrays.colors.length).toBe(7);
    expect(parsedFile.arrays.colors.toString()).toBe(expectedColors.toString());
    expect(parsedFile.arrays.x_values.length).toBe(791);
    checkFloatArrayMatch(parsedFile.arrays.x_values.slice(0, 20), expectedXValues);
    expect(parsedFile.arrays.y_values.length).toBe(858);
    checkFloatArrayMatch(parsedFile.arrays.y_values.slice(0, 20), expectedYValues);
    expect(parsedFile.arrays.z_values.length).toBe(334);
    checkFloatArrayMatch(parsedFile.arrays.z_values.slice(0, 20), expectedZValues);
    expect(parsedFile.arrays.normals.length).toBe(38);
    for (let i = 0; i < 20; i++) {
      expect(parsedFile.arrays.normals[i].distanceToSquared(expectedNormals[i])).toBeCloseTo(0);
    }

    expect(parsedFile.arrays.deltas.length).toBe(125);
    checkFloatArrayMatch(parsedFile.arrays.deltas.slice(0, 20), expectedDeltas);
    expect(parsedFile.arrays.heights.length).toBe(408);
    checkFloatArrayMatch(parsedFile.arrays.heights.slice(0, 20), expectedHeights);
    expect(parsedFile.arrays.radiuses.length).toBe(76);
    checkFloatArrayMatch(parsedFile.arrays.radiuses.slice(0, 20), expectedRadiuses);
    expect(parsedFile.arrays.angles.length).toBe(29);
    checkFloatArrayMatch(parsedFile.arrays.angles.slice(0, 20), expectedAngles);
    expect(parsedFile.arrays.matrixes.length).toBe(0);
    checkFloatArrayMatch(parsedFile.arrays.matrixes.slice(0, 20), expectedMatrixes);
    expect(parsedFile.arrays.x_translations.length).toBe(0);
    checkFloatArrayMatch(parsedFile.arrays.x_translations.slice(0, 20), expectedXTranslations);
    expect(parsedFile.arrays.y_translations.length).toBe(0);
    checkFloatArrayMatch(parsedFile.arrays.y_translations.slice(0, 20), expectedYTranslations);
    expect(parsedFile.arrays.z_translations.length).toBe(0);
    checkFloatArrayMatch(parsedFile.arrays.z_translations.slice(0, 20), expectedZTranslations);

    const expectedGeometryIndexes: any = {
      1: [7060329795587960, 1043, 1, 36, 34, 47, 0, 0, 0, 10, 0, 2920898236136174, 2420, 4, 97, 707, 50, 0, 3, 4],
      2: [8164540613673614, 2631, 2, 313, 112, 13, 3, 10, 2332139652741056, 3137, 2, 48, 258, 1, 2, 10,
        5768382459793153, 1355, 1, 106],
      3: [927342382680797, 2778, 2, 15, 287, 2, 2, 0, 4, 16, 2412602947335905, 3516, 2, 80, 105, 9, 11, 14, 8, 6],
      4: [5869005083795563, 3346, 2, 3, 121, 0, 1, 7, 34, 7392096689693635, 3167, 2, 75, 260, 1, 1, 150, 2,
        83056106740777, 4630],
      13: [1776196732743416, 1625, 1, 61, 853, 0, 2, 40, 65, 0, 2556907504057857, 375, 1, 774, 73, 0, 4, 40, 65, 5],
      14: [2409675612804526, 2419, 4, 97, 708, 16, 1, 4, 21, 20, 1396465678319174, 1569, 1, 406, 120, 3, 3, 4, 21, 20],
      15: [8922988493723012, 2092, 5, 55, 158, 90, 0, 54, 24, 1828017180807764, 2172, 4, 4, 63, 0, 2, 9, 1,
        2317576119257839, 2171],
      19: [9000406793629980, 2969, 2, 2, 518, 221, 32, 258, 0, 0, 73, 0, 9, 15, 15, 4, 1],
      21: [5829254376003860, 1433, 1, 20, 453, 181, 3, 0, 3, 0, 1, 6050315401479636, 1435, 1, 20, 411, 34, 4, 0, 3],
      22: [1080060884278809, 4305, 3, 22, 52, 77, 0, 43, 30, 7160316963937309, 2962, 2, 161, 618, 10, 1, 4, 0,
        6626953872348268, 4931],
      100: [4820468089466959, 3425, 2, 2, 2373107104903371, 1340, 40, 1, 2740906351331585, 3084, 2, 2,
        7453191589183843, 4760, 12, 3, 7022047152622673, 1243, 20, 1],
    };

    for (let k = 0; k < parsedFile.geometries.length; k++) {
      const type = parsedFile.geometries[k].type;
      const indexes = parsedFile.geometries[k].indexes;
      for (let m = 0; m < Math.min(20, expectedGeometryIndexes[type].length); m++) {
        expect(indexes.nextValue() === expectedGeometryIndexes[type][m]);
      }
    }
  });

  test('generate groups', async() => {
    const incomingFile = fs.readFileSync('./src/__tests__/customFileParserTest/Pipes.c3d', null);

    const asArrayBuffer = new ArrayBuffer(incomingFile.length);
    const arrayBufferCopier = new Uint8Array(asArrayBuffer);
    for (let i = 0; i < incomingFile.length; i++) {
      arrayBufferCopier[i] = incomingFile[i];
    }

    const parsedFile = parseCustomFileFormat(asArrayBuffer, true);
    const geometryGroups = generateGeometryGroups(parsedFile);

    expect(geometryGroups).toBeDefined();

    expect(geometryGroups.boxGroup.capacity).toBe(327);
    expect(geometryGroups.circleGroup.capacity).toBe(251 + 2 * 435 + 2 * 913);
    expect(geometryGroups.coneGroup.capacity).toBe(435 + 913);

    const boxes = geometryGroups.boxGroup;
    expect(boxes.getNodeId(0)).toBe(7060329795587960);
    expect(boxes.getTreeIndex(0)).toBe(1043);
    // checkIntArrayMatch(boxes.getColor(), [1, 36, 34, 47]);
    const test = new THREE.Vector3();
    boxes.getCenter(test, 0);
    expect(test.x).toBeCloseTo(282.05499267578125);
    expect(test.y).toBeCloseTo(105.20599365234375);
    expect(test.z).toBeCloseTo(527.9949951171875);
  });
});
