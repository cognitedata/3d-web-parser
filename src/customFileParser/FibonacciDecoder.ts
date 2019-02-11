const FIBONACCI_MAX_LENGTH = 77; // Any 53 bit integer will take at most 77 bits in a fibonacci encoding.

const fibonacciLookup = [1, 2];
for (let i = 2; i <= FIBONACCI_MAX_LENGTH; i++) {
  fibonacciLookup.push(fibonacciLookup[i - 1] + fibonacciLookup[i - 2]);
}

export default class FibonacciDecoder {
  public numberRead = -1;
  public readonly numberOfValues: number;
  private buffer: ArrayBuffer;
  private data: Uint8Array;
  private readBitId = -1;
  private currentValue = -1;
  private nextFibIndex = -1;

  constructor(compressedBuffer: ArrayBuffer, numberOfValues: number, startByte?: number, length?: number) {
    this.numberOfValues = numberOfValues;
    if (!startByte) { startByte = 0; }
    if (!length) { length = compressedBuffer.byteLength - startByte; }

    this.buffer = compressedBuffer;
    this.data = new Uint8Array(this.buffer, startByte, length);
    this.rewind();
  }

  // Get ready to read the first value
  rewind() {
    this.numberRead = 0;
    // load first bit
    this.currentValue = (this.data[0] & (1 << 7)) >> 7;
    this.nextFibIndex = 1;
    this.readBitId = 1;
  }

  // Read next encoded value
  nextValue() {
    if (this.numberRead >= this.numberOfValues) { throw Error('Reading past end of FibonacciDecoder'); }

    this.numberRead++;

    for (let i = 0; i < FIBONACCI_MAX_LENGTH; i++) {
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

    throw Error('Did not find termination bit');
  }
}
