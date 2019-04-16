// Copyright 2019 Cognite AS

// tslint:disable:no-bitwise

const FIBONACCI_MAX_LENGTH = 77; // Any 53 bit integer will take at most 77 bits in a fibonacci encoding.

const fibonacciLookup = [1, 2];
for (let i = 2; i <= FIBONACCI_MAX_LENGTH; i++) {
  fibonacciLookup.push(fibonacciLookup[i - 1] + fibonacciLookup[i - 2]);
}

export default class FibonacciDecoder {
  public numberOfValuesRead = -1;
  public readonly numberOfValues: number;
  private buffer: ArrayBuffer;
  private data: Uint8Array;
  private readBitId = -1;
  private currentValue = -1;
  private nextFibIndex = -1;
  private previousBit8 = -1;

  constructor(compressedBuffer: ArrayBuffer, numberOfValues: number, startByte: number, length: number) {
    this.numberOfValues = numberOfValues;
    this.buffer = compressedBuffer;
    this.data = new Uint8Array(this.buffer, startByte, length);
    this.rewind();
  }

  rewind() {
    this.numberOfValuesRead = 0;
    this.currentValue = 0;
    this.previousBit8 = 0;
    this.nextFibIndex = 0;
    this.readBitId = 0;
  }

  nextValue() {
    if (this.numberOfValuesRead >= this.numberOfValues) {
      throw Error('Reading past end of FibonacciDecoder');
    }
    this.numberOfValuesRead++;

    // Read until you find two 1 bits in a row. Before then, each 1 corresponds to the (n+1)th fibinacci number.
    // For example, 0010011 is read as 0*1 + 0*2 + 1*3 + 0*5 + 0*8 + 1*13 = 16. Subtract 1 to get the final value.
    for (let i = 0; i < FIBONACCI_MAX_LENGTH; i++) {
      const currentByte = this.data[Math.floor(this.readBitId / 8)];
      const currentBit8 = currentByte & (1 << (7 - (this.readBitId % 8)));
      if (currentBit8 !== 0) {
        if (this.previousBit8 !== 0 && this.nextFibIndex !== 0) {
          this.previousBit8 = currentBit8;
          const returnValue = this.currentValue - 1;
          this.currentValue = 0;
          this.nextFibIndex = 0;
          this.readBitId++;
          return returnValue;
        } else {
          this.currentValue += fibonacciLookup[this.nextFibIndex];
        }
      }
      this.previousBit8 = currentBit8;
      this.nextFibIndex++;
      this.readBitId++;
    }

    throw Error('Did not find termination bit');
  }
}
