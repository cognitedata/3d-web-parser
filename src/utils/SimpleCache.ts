// Copyright 2019 Cognite AS

export interface Cache<TKey, TValue> {
  getOrAdd(id: TKey, createCb: (id: TKey) => Promise<TValue>): Promise<TValue>;
}

export class SimpleCache<TKey, TValue> implements Cache<TKey, TValue> {
  // TODO 20191016 larsmoa: idToKey seems to take a lot of memory for some reason.
  // Check memory dump in Chrome and figure out why and how to avoid (possible by just
  // replacing this bad cache).
  private readonly idToKey = new Map<TKey, object>();
  private readonly cache = new WeakMap<object, TValue>();

  async getOrAdd(id: TKey, createCb: (id: TKey) => Promise<TValue>): Promise<TValue> {
    let key = this.idToKey.get(id);
    if (key && this.cache.has(key)) {
      const valueInCache = this.cache.get(key);
      if (valueInCache) {
        return valueInCache;
      } else {
        this.cache.delete(key);
        this.idToKey.delete(id);
      }
    }
    key = { id };
    this.idToKey.set(id, key);

    const value = await createCb(id);
    this.cache.set(key, value);
    return value;
  }
}
