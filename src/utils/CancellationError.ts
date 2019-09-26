// Copyright 2019 Cognite AS

export class CancellationError extends Error {
  constructor(message?: string) {
    super(message);

    // Hack below is to make 'instanceof' work to enable
    // unit testing.
    // Source: https://stackoverflow.com/a/48342359/167251
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      (this as any).__proto__ = actualProto;
    }
  }
}
