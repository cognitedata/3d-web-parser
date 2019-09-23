// Copyright 2019 Cognite AS

export interface Cache<TKey, TValue> {
  getOrAdd(id: TKey, createCb: (id: TKey) => Promise<TValue>): Promise<TValue>;
}

export class SimpleCache<TKey, TValue> implements Cache<TKey, TValue> {
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
    const value = await createCb(id);
    key = { id };
    this.cache.set(key, value);
    this.idToKey.set(id, key);
    return value;
  }
}
