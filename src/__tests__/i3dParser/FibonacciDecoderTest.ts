// Copyright 2019 Cognite AS

import FibonacciDecoder from '../../parsers/FibonacciDecoder';

describe('FibonacciDecoder', () => {
  test('parse fibonacci encoding', async() => {
    const uncompressedData = new ArrayBuffer(12);
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
    const decoder = new FibonacciDecoder(uncompressedData, 6, 0, uncompressedView.length);
    expect(decoder.nextValue()).toBe(0);
    expect(decoder.nextValue()).toBe(0);
    expect(decoder.nextValue()).toBe(2);
    expect(decoder.nextValue()).toBe(8164540613673614);
    expect(decoder.nextValue()).toBe(0);
    expect(decoder.nextValue()).toBe(6);
  });
});
