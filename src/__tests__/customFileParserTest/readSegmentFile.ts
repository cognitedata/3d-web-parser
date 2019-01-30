import readSegmentFile from '../../customFileParser/readSegmentFile';
import * as THREE from 'three';

// @ts-ignore
const fs = require('fs');

function checkFloatArrayMatch(arrayA: any, arrayB: any) {
  expect(arrayA.length).toBe(arrayB.length);
  for (let i = 0; i < arrayA.length; i++) {
    expect(arrayA[i]).toBeCloseTo(arrayB[i]);
  }
}

describe('readSegmentFile', () => {
  test('parse file', async() => {
    const incomingFile = fs.readFileSync('./src/__tests__/customFileParserTest/Pipes.c3d', null);

    const asArrayBuffer = new ArrayBuffer(incomingFile.length);
    const arrayBufferCopier = new Uint8Array(asArrayBuffer);
    for (let i = 0; i < incomingFile.length; i++) {
      arrayBufferCopier[i] = incomingFile[i];
    }

    const parsedFile = readSegmentFile(asArrayBuffer, true);

    expect(parsedFile.magicBytes).toBe(1178874697);
    expect(parsedFile.formatVersion).toBe(2147483647);
    expect(parsedFile.optimizerVersion).toBe(1);
    expect(parsedFile.arrayCount).toBe(15);

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
    const expectedAngles = [0, 1.570796, -1.570796, 3.141593, 0.7853982, -3.141593, -0.7853982, 2.356194, 4.712389,
      0.5232517, 2.213884, 1.590028, -2.356194, 2.571795, 2.286052, -0.5703254, 1.047198, -3.108799, 2.260528,
      2.617994];
    const expectedXTranslations = [288.962, 290.492, 290.0499, 289.89, 290.5654, 293.7307, 282.3539, 293.606, 293.0495,
      292.3434, 281.7559, 294.2871, 287.7069, 286.402, 290.9631, 290.561, 284.6376, 287.9075, 287.4949, 294.8363];
    const expectedYTranslations = [93.71992, 101.105, 106.3236, 105.416, 92.20289, 90.77325, 94.80109, 94.20309,
      90.21677, 105.4112, 104.8596, 104.8547, 92.80089, 101.6237, 108.6599, 100.0974, 107.5106, 101.8245, 87.23434,
      110.3699];
    const expectedZTranslations = [529, 528.4, 528.7219, 529.1733, 528.8268, 528.7, 528.8499, 528.7502, 527.8, 528.4498,
      528.3449, 529.1789, 528.7449, 528.5, 529.1503, 528.7483, 528.4018, 528.8205, 528.7559, 528.8212];
    const expectedScaleX = [0.002000001, 0.01104454, 0.003306948, 0.001558394, 0.001521246, 0.001499994, 0.00247395,
      0.01179837, 0.004393744, 0.004374321, 0.00264512, 0.004335349, 0.004296725, 0.004670055, 0.1167854, 0.07812029,
      0.1614777, 0.004681752, 0.2204943, 0.1413652];
    const expectedScaleY = [0.01104454, 0.00336583, 0.07669443, 0.02150858, 0.07700483, 0.1535382, 0.0757935, 0.1248211,
      0.1225594, 0.09826083, 0.2438963, 0.02413065, 0.08001006, 0.1523218, 0.0481353, 0.09705284, 0.02189519,
      0.02159662, 0.245256, 0.0471525];
    const expectedScaleZ = [0.0150531, 0.3089999, 0.006999993, 0.07671702, 0.07701103, 0.125248, 0.1535522, 0.07580495,
      0.1226172, 0.09828943, 0.08020528, 0.2440531, 0.08379909, 0.152331, 0.0970596, 0.0481386, 0.2452613, 0.2204745,
      0.04781299, 0.04801606];

    expect(parsedFile.propertyTrueValues.color.length).toBe(8);
    // expect(parsedFile.propertyTrueValues.color.toString()).toBe(expectedColors.toString());
    expect(parsedFile.propertyTrueValues.centerX.length).toBe(791);
    checkFloatArrayMatch(parsedFile.propertyTrueValues.centerX.slice(0, 20), expectedXValues);
    expect(parsedFile.propertyTrueValues.centerY.length).toBe(858);
    checkFloatArrayMatch(parsedFile.propertyTrueValues.centerY.slice(0, 20), expectedYValues);
    expect(parsedFile.propertyTrueValues.centerZ.length).toBe(334);
    checkFloatArrayMatch(parsedFile.propertyTrueValues.centerZ.slice(0, 20), expectedZValues);
    expect(parsedFile.propertyTrueValues.normal.length).toBe(38);
    for (let i = 0; i < 20; i++) {
      expect(parsedFile.propertyTrueValues.normal[i].distanceToSquared(expectedNormals[i])).toBeCloseTo(0);
    }

    expect(parsedFile.propertyTrueValues.delta.length).toBe(125);
    checkFloatArrayMatch(parsedFile.propertyTrueValues.delta.slice(0, 20), expectedDeltas);
    expect(parsedFile.propertyTrueValues.height.length).toBe(408);
    checkFloatArrayMatch(parsedFile.propertyTrueValues.height.slice(0, 20), expectedHeights);
    expect(parsedFile.propertyTrueValues.radius.length).toBe(76);
    checkFloatArrayMatch(parsedFile.propertyTrueValues.radius.slice(0, 20), expectedRadiuses);
    expect(parsedFile.propertyTrueValues.angle.length).toBe(102);
    checkFloatArrayMatch(parsedFile.propertyTrueValues.angle.slice(0, 20), expectedAngles);

    expect(parsedFile.propertyTrueValues.translationX.length).toBe(268);
    checkFloatArrayMatch(parsedFile.propertyTrueValues.translationX.slice(0, 20), expectedXTranslations);
    expect(parsedFile.propertyTrueValues.translationY.length).toBe(219);
    checkFloatArrayMatch(parsedFile.propertyTrueValues.translationY.slice(0, 20), expectedYTranslations);
    expect(parsedFile.propertyTrueValues.translationZ.length).toBe(90);
    checkFloatArrayMatch(parsedFile.propertyTrueValues.translationZ.slice(0, 20), expectedZTranslations);

    expect(parsedFile.propertyTrueValues.scaleX.length).toBe(55);
    checkFloatArrayMatch(parsedFile.propertyTrueValues.scaleX.slice(0, 20), expectedScaleX);
    expect(parsedFile.propertyTrueValues.scaleY.length).toBe(60);
    checkFloatArrayMatch(parsedFile.propertyTrueValues.scaleY.slice(0, 20), expectedScaleY);
    expect(parsedFile.propertyTrueValues.scaleZ.length).toBe(53);
    checkFloatArrayMatch(parsedFile.propertyTrueValues.scaleZ.slice(0, 20), expectedScaleZ);

    const expectedGeometryIndexes: any = {
      'Box': [7060329795587960, 1043, 1, 36, 34, 47, 0, 0, 0, 10, 0, 2920898236136174, 2420, 4, 97, 707, 50, 0, 3, 4],
      'Circle': [8164540613673614, 2631, 2, 313, 112, 13, 3, 10, 2332139652741056, 3137, 2, 48, 258, 1, 2, 10,
        5768382459793153, 1355, 1, 106],
      'ClosedCone': [927342382680797, 2778, 2, 15, 287, 2, 2, 0, 4, 16, 2412602947335905, 3516, 2, 80, 105, 9,
        11, 14, 8, 6],
      'ClosedCylinder': [5869005083795563, 3346, 2, 3, 121, 0, 1, 7, 34, 7392096689693635, 3167, 2, 75, 260, 1,
        1, 150, 2, 83056106740777, 4630],
    };

    for (let k = 0; k < 3; k++) {
      const name = parsedFile.geometryIndexes[k].name;
      const indexes = parsedFile.geometryIndexes[k].indexes;
      for (let m = 0; m < Math.min(20, expectedGeometryIndexes[name].length); m++) {
        // @ts-ignore
        expect(indexes.nextValue() === expectedGeometryIndexes[name][m]);
      }
    }
  });
});
