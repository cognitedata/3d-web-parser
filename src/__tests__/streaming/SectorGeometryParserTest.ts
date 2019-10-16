// Copyright 2019 Cognite AS

import {
  createSectorGeometryParser,
  supportedGeometryFileVersions,
  I3DSectorGeometryParser,
  ProtobufSectorGeometryParser,
  LoadSectorDataCallback
} from '../../streaming/SectorGeometryParser';

// https://stackoverflow.com/a/21797381/167251
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

function isRunningUnderNodeJS(): boolean {
  // https://github.com/flexdinesh/browser-or-node/blob/master/src/index.js
  return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
}

describe('ProtobufSectorGeometryParser', () => {
  const base64ValidData =
    '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';
  const validProtobufSectorBuffer = base64ToArrayBuffer(base64ValidData);
  const loadCallback: LoadSectorDataCallback = jest.fn(() => validProtobufSectorBuffer);
  const parser = new ProtobufSectorGeometryParser(0, loadCallback);

  if (!isRunningUnderNodeJS()) {
    test('parseGeometry() with valid buffer returns geometry', async () => {
      const geometry = await parser.parseGeometry(1);
      expect(geometry).not.toBeNull();
      expect(loadCallback).toBeCalled();
    });
  }
});

describe('I3DSectorGeometryParser', () => {
  const base64ValidData =
    'nwUAAEkzREYFAAAAAQAAAAAAAAAAAAAA///////////7p4PE1BaxxNS3F8MqPvlCAIDtRMK9/EMRAAAADwAAAATlGhoAgP9NAGZmTQBNTWYAM8xmAIAamQD//wAA/wD/AOXl5QCZmU0AgDNNAE1mTQAA//8AAP8AAAAA/wAUAAAABNj+rEOIsI1D7trnQzuqlUPVRr1DVPvhQzXlxUM4pKlDJYmyQzNbmkPM1KVDnyOwQ+a6O0TFZ7dD8CAIRIvHwEPAJ85DDmvaQ6ES30PzTblDBAAAAASZg6E0AACWwwAAFsQAAGHECgAAAAQAAOFEAIC7RAAAlkQAAGFEAAAWRAAAlkOyfggzAACWwwAAFsQAAGHEAQAAAASBEpO1BwAAAAwAAAAAAAAAAAAAgD+BWBG/h+lKP2uWYz6BWBE/h+lKv2uWY77lZus+laamPaNhYj8AAAAAAAAAAAAAgL9DH5O+AAAAABo0dT/gkVa/YtG8PrK+zT4BAAAABAAASEMFAAAABAAASEMAgLtCAAAvQvI8aUNfzlBDBQAAAAQAAMhCAABIQgAAoEEAAKBCAADIQRUAAAAEAAAAANsPyUBlg5BA2w9JQO6HBEA5Y+0+MzOzPgAAgD7bD7lA2w+ZQBfdukDjaQ4/8zQHPyZyqDzbD8m/C+yDv9HYKz/yNIc/RX/aPypVhkAY/ynAAgAAAAS4apLDrWAXxAIAAAAEpaSTxAAAlsQCAAAABNOYkkH6pZA/AQAAAAQWk5BCAQAAAARdFrVCAQAAAATEo8pCAgAAAAgfOawLAAAAAKOKBQsAAAAAAQIAAAALCwAAAD5Kq9PfXB5K3OQcbQQag40bT7/pxOP0//wCAgAAAAgHAAAA3owYjLyBEX9yACKYjwmy2/fRlv/wAwEAAAAKBQAAAEArNtFlXxeBk/n+8AQBAAAACQUAAAA3wiYw4UkeAYec/8AFAQAAAAsHAAAAiC2CuefFBy0Yux67eYAGAQAAAAoFAAAABV+TsICQDZjbez2ABwIAAAAMDAAAAC1+2j5ZyRd23EfuQVwaVnLce++zUZh8f94zCQEAAAAJBQAAAKgwLDz3bxwO02e3gAsCAAAACQgAAABwKRqSbU4eD5z8d+a+Dhju3vYmOzf7DAIAAAAKCgAAANQioVN4SwzVe7TLM+sDkZ5x/3yzO4994A0CAAAACgwAAABYQGyNPssMGKHEJoviEgOHO09+DCcMs0/8GA4BAAAACgUAAABDz2k7L+0ahk1ue94PAQAAAAkFAAAAWPHZU6BvHQYZ3PfgEAEAAAALBwAAADBQybyvLxcrR1mPmN4wEQEAAAAKBQAAAO5KDvTbFR2TG9+ewBQBAAAACQQAAAD/0Rkn+44JC7vP3hUCAAAACwsAAAAiwnqxui4c3P5r+tQuC057veOzS5/f4xmAFgIAAAAJCAAAAHClqnzF5Q7zN6fRhG0ZNN37eRps/3gXAgAAAAcHAAAAoKMvZ5lyHBKSyB10KQtd9n6neZ+AGAIAAAAJCgAAAIiNaUBB3Bj4W37eFmUJi5xnf445w7veMB4BAAAADwcAAADgaz5t4/4bq3Tx/+5zdh8BAAAADwgAAAAtnDV4wpQIrZse/3OYtWAgAgAAABARAAAAGd1UUo3DDv+BjCSqux+mzsPfntYZddDZMw/89rDTjCECAAAAEBIAAADxbGUC1CUON6OCsaSwHhGx4f+YzWGnGLc2Hvzs1hl1gCQCAAAAEQ8AAACvs/IE3gMDq0YjAcvPC0HXmv9579tHWu173nv2wCUCAAAAERAAAADQWwqXlQUXtd5fcOVPDCYMbXvedn7ZDBh6/3mM/bBkAQAAAAUFAAAAd/YW2d2JEHpBCNYMZQIAAAAPEgAAAHqOpvOdWh+XVtKiAtESSb1CWse9GT/0N6hLWrewOHL/';
  const validI3DSectorBuffer = base64ToArrayBuffer(base64ValidData);
  const loadCallback: LoadSectorDataCallback = jest.fn(() => validI3DSectorBuffer);
  const parser = new I3DSectorGeometryParser(0, loadCallback);

  if (!isRunningUnderNodeJS()) {
    // TODO 20190930 larsmoa: WASM loading does not currently work under NodeJS (v12.10)
    // See https://rustwasm.github.io/docs/wasm-bindgen/reference/deployment.html#nodejs
    test('parseGeometry() with valid buffer returns geometry', async () => {
      const geometry = await parser.parseGeometry(1);
      expect(geometry).not.toBeNull();
      expect(loadCallback).toBeCalled();
    });
  }
});

describe('createSectorGeometryParser', () => {
  test('createSectorGeometryParser() throws error for unsupported version', () => {
    expect(() => createSectorGeometryParser(0, 4, jest.fn())).toThrowError();
  });

  test('createSectorGeometryParser() returns parser for all supported versions', () => {
    supportedGeometryFileVersions.forEach(version => {
      expect(createSectorGeometryParser(0, version, jest.fn())).not.toBeNull();
    });
  });
});
