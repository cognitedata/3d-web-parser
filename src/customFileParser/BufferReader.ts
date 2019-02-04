export default class BufferReader {
  public dataView: DataView;
  public location: number;

  private flip: boolean;

  constructor(arrayBuffer: ArrayBuffer, start: number, length: number, flip: boolean) {
    this.dataView = new DataView(arrayBuffer, start, length);
    this.location = 0;
    // FLIP ONLY IF READING A NODE FILE
    this.flip = Boolean(flip);
  }

  readUint32(): number {
    const value = this.dataView.getUint32(this.location, this.flip);
    this.location += 4;
    return value;
  }

  readUint64() {
    let value = this.dataView.getUint32(this.location, this.flip);
    value = value << 8;
    value += this.dataView.getUint32(this.location + 4, this.flip);
    this.location += 8;
    return value;
  }

  readFloat32() {
    const value = this.dataView.getFloat32(this.location, this.flip);
    this.location += 4;
    return value;
  }

  readUint32Array(numberOfValues: number): number[] {
    const newArray = [];
    for (let i = 0; i < numberOfValues; i++) {
      newArray.push(this.dataView.getUint32(this.location + i * 4, this.flip));
    }
    this.location += numberOfValues * 4;
    return newArray;
  }

  readUint16Array(numberOfValues: number): number[] {
    const newArray = [];
    for (let i = 0; i < numberOfValues; i++) {
      newArray.push(this.dataView.getUint16(this.location + i * 2, this.flip));
    }
    this.location += numberOfValues * 2;
    return newArray;
  }

  readUint8Array(numberOfValues: number): number[] {
    const newArray = [];
    for (let i = 0; i < numberOfValues; i++) {
      newArray.push(this.dataView.getUint8(this.location + i));
    }
    this.location += numberOfValues;
    return newArray;
  }

  readFloat32Array(numberOfValues: number): number[] {
    const newArray = [];
    for (let i = 0; i < numberOfValues; i++) {
      newArray.push(this.dataView.getFloat32(this.location + i * 4, this.flip));
    }
    this.location += numberOfValues * 4;
    return newArray;
  }

  skip(numberOfBytes: number) {
    this.location += numberOfBytes;
  }
}
