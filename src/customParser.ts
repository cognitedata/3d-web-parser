let debug = false;

let lookup = [1,2];
for (let i=2; i<=77; i++) {
  lookup.push(lookup[i-1] + lookup[i-2])
}

function decodeFibonacciEncoding(compressedBuffer: ArrayBuffer, numberOfValues: number) {
  let compressedView = new Uint8Array(compressedBuffer);
  let uncompressedData = new ArrayBuffer(numberOfValues*8);
  let uncompressedView = new Float64Array(uncompressedData);

  if (debug) {
    console.log(compressedBuffer);
    console.log(numberOfValues); 
    console.log(compressedView.length);
    for (let i=0; i<10; i++) {
      console.log(compressedView[i].toString(2))
    }
  }

  // read first bit
  let newNumberId = 0;
  let currentValue = (compressedView[0]&(1<<7))>>7;
  
    let nextFibIndex = 1;
  let lengthRead;

  // read rest of file
  for (let bitId=1; bitId<compressedView.length*8; bitId++) {
    let currentBit = compressedView[Math.floor(bitId/8)] & 1<<(7-(bitId%8));
    if (currentBit != 0) {
      // check if termination bit
      let terminationBit = compressedView[Math.floor((bitId-1)/8)] & (1<<(7-(bitId-1)%8))
      if ((terminationBit != 0) && (nextFibIndex != 0)) {
        uncompressedView[newNumberId] = currentValue-1;
        if (newNumberId == numberOfValues-1) {
          lengthRead = Math.ceil(bitId/8);
          if (debug) {
            console.log("...")
            console.log(lengthRead);
            console.log(compressedView.length);
          }

          break;
        }
        currentValue = 0;
        newNumberId += 1;
        nextFibIndex = 0;
        continue;
      }

      // Otherwise update read value
      else {
        currentValue += lookup[nextFibIndex];
        if (debug) {
          console.log("FIB: " + lookup[nextFibIndex])
          console.log(currentValue);
        }
      }
    }
    nextFibIndex += 1;
  }

  return uncompressedView;
}

function toHex(yourNumber: number): string {
  let hexString = yourNumber.toString(16);
  if (hexString.length % 2) {
    hexString = '0' + hexString;
  }
  return hexString;
}

class BufferReader {
  private arrayBuffer: ArrayBuffer;
  public dataView: DataView;
  public location: number;
  private flip: boolean;

  constructor(arrayBuffer: ArrayBuffer, flip: boolean) {
    this.arrayBuffer = arrayBuffer;
    this.dataView = new DataView(arrayBuffer);
    this.location = 0;
    //FLIP ONLY IF READING A NODE FILE
    this.flip = Boolean(flip);
  }

  readUint32() {
    this.location += 4;
    return this.dataView.getUint32(this.location-4, this.flip)
  }

  readUint32Array(numberOfValues: number) {
  let newArray = [];
  for (let i=0; i<numberOfValues; i++) {
    newArray.push(this.dataView.getUint32(this.location+i*4, this.flip))
  }
  this.location += numberOfValues*4;
  return newArray;
  }

  readUint16Array(numberOfValues: number) {
  let newArray = [];
  for (let i=0; i<numberOfValues; i++) {
    newArray.push(this.dataView.getUint16(this.location+i*2, this.flip))
  }
  this.location += numberOfValues*2;
  return newArray;
  }

  readUint8Array(numberOfValues: number) {
  let newArray = [];
  for (let i=0; i<numberOfValues; i++) {
    newArray.push(this.dataView.getUint8(this.location+i))
  }
  this.location += numberOfValues;
  return newArray;
  }

  readFloat32Array(numberOfValues: number) {
  let newArray = [];
  for (let i=0; i<numberOfValues; i++) {
    newArray.push(this.dataView.getFloat32(this.location+i*4, this.flip))
  }
  this.location += numberOfValues*4;
  return newArray;
  }

  readFibonacci(numberOfBytes: number, numberOfValues: number) {
    let decoded = decodeFibonacciEncoding(this.arrayBuffer.slice(this.location), numberOfValues)
    this.location += numberOfBytes;
    return decoded;
  }
}

function parseArrayBuffer(asArrayBuffer: ArrayBuffer, flip: boolean) {
  let fileReader = new BufferReader(asArrayBuffer, true);
  
  let infoHeader = fileReader.readUint32Array(4);
  let magicBytes = infoHeader[0];
  let formatVersion = infoHeader[1];
  let optimizerVersion = infoHeader[2];
  let arrayCount = infoHeader[3]; 

  if (debug) {
    console.log(magicBytes);
    console.log(toHex(magicBytes));
    console.log(formatVersion);
    console.log(optimizerVersion);
    console.log(arrayCount);
  }

  let arraysList = ['colors', 'x_values', 'y_values', 'z_values', 'normals', 'deltas', 'heights', 'radii', 'angles', 'matrixes', 'x_translations', 'y_translations', 'z_translations']
  let arraysDictionary: any = {};
  for (let array_id=0; array_id<arrayCount;  array_id++) {
    let clusterCount = fileReader.readUint32();
    let bytesForOneValue = fileReader.readUint32();
    let type = arraysList[array_id];
    
    if ((type === 'colors') && (bytesForOneValue === 4)) {
      let colorValues = fileReader.readUint8Array(clusterCount*4);
      arraysDictionary[type] = [];
      for (let j=0; j<clusterCount; j++) {
        arraysDictionary[type].push([]);
        for (let k=0; k<4; k++) {
          arraysDictionary[type][j].push(colorValues[j*4+k]);
        }
      }
    } else if ((type === 'normals') && (bytesForOneValue === 12)) {
      let normalValues = fileReader.readFloat32Array(clusterCount*3);
      arraysDictionary[type] = [];
      for (let j=0; j<clusterCount; j++) {
        arraysDictionary[type].push([]);
        for (let k=0; k<3; k++) {
          arraysDictionary[type][j].push(normalValues[j*3+k]);
        }
      }
    } else if (bytesForOneValue === 4) {
      arraysDictionary[type] = fileReader.readFloat32Array(clusterCount);
    } else {
      console.log("Well this is unexpected. bytesForOneValue is " + bytesForOneValue);
    }
    if (debug) {
      console.log(type)
      console.log(clusterCount);
      console.log(bytesForOneValue);
      console.log(arraysDictionary[type].slice(0,20));
    }
  }

  let geometryAttributes = []
  while (true) {
    let geometryType = fileReader.readUint32();
    let geometryCount = fileReader.readUint32();
    let attributeCount = fileReader.readUint32();
    let byteCount = fileReader.readUint32();

    let indexes = fileReader.readFibonacci(byteCount, geometryCount*attributeCount);

    if (debug) {
      console.log(geometryType);
      console.log(geometryCount);
      console.log(attributeCount);
      console.log(byteCount);
      console.log(indexes);
    }

    geometryAttributes.push({"type": geometryType, "indexes": indexes})

    if (fileReader.location == asArrayBuffer.byteLength) {
      break;
    }
  }

  return {"magicBytes": magicBytes, "formatVersion": formatVersion, "optimizerVersion": optimizerVersion, "arrayCount": arrayCount, "arrays": arraysDictionary, "geometries": geometryAttributes};
}

export { parseArrayBuffer, decodeFibonacciEncoding }