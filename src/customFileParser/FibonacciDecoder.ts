const fibonacciLookup = [1, 2];
for (let i = 2; i <= 77; i++) {
  fibonacciLookup.push(fibonacciLookup[i - 1] + fibonacciLookup[i - 2]);
}

export default class FibonacciDecoder {
  public numberRead: number;
  private buffer: ArrayBuffer;
  private data: Uint8Array;
  private readBitId: number;
  private currentValue: number;
  private nextFibIndex: number;

  constructor(compressedBuffer: ArrayBuffer, startByte?: number, length?: number) {
    if (!startByte) { startByte = 0; }
    if (!length) { length = compressedBuffer.byteLength - startByte; }

    this.numberRead = 0;
    this.buffer = compressedBuffer;
    this.data = new Uint8Array(this.buffer, startByte, length);

    // read first bit
    this.currentValue = (this.data[0] & (1 << 7)) >> 7;
    this.nextFibIndex = 1;
    this.readBitId = 1;
  }

  // Read next encoded value
  nextValue() {
    this.numberRead++;

    // read rest of file
    for (let i = 0; i < 100; i++) {
      const currentBit8 = this.data[Math.floor(this.readBitId / 8)] & 1 << (7 - (this.readBitId % 8));
      if (currentBit8 !== 0) {

        // check if termination bit
        const previousBit8 = this.data[Math.floor((this.readBitId - 1) / 8)] & (1 << (7 - (this.readBitId - 1) % 8));
        if ((previousBit8 !== 0) && (this.nextFibIndex !== 0)) {
          const returnValue = this.currentValue - 1;
          this.currentValue = 0;
          this.nextFibIndex = 0;
          this.readBitId++;
          return returnValue;

        // Otherwise update read value
        } else {
          this.currentValue += fibonacciLookup[this.nextFibIndex];
        }
      }
      this.nextFibIndex++;
      this.readBitId++;
    }

    throw Error('THIS IS REALLY BAD');
  }
}
