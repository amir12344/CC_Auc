export class BiMap<K, V> {
  private keyToValue = new Map<K, V>();
  private valueToKey = new Map<V, K>();

  set(key: K, value: V): void {
    // Remove existing mappings if they exist
    if (this.keyToValue.has(key)) {
      const oldValue = this.keyToValue.get(key)!;
      this.valueToKey.delete(oldValue);
    }
    if (this.valueToKey.has(value)) {
      const oldKey = this.valueToKey.get(value)!;
      this.keyToValue.delete(oldKey);
    }

    this.keyToValue.set(key, value);
    this.valueToKey.set(value, key);
  }

  getValue(key: K): V | undefined {
    return this.keyToValue.get(key);
  }

  getKey(value: V): K | undefined {
    return this.valueToKey.get(value);
  }

  hasKey(key: K): boolean {
    return this.keyToValue.has(key);
  }

  hasValue(value: V): boolean {
    return this.valueToKey.has(value);
  }

  deleteByKey(key: K): boolean {
    const value = this.keyToValue.get(key);
    if (value !== undefined) {
      this.keyToValue.delete(key);
      this.valueToKey.delete(value);
      return true;
    }
    return false;
  }

  deleteByValue(value: V): boolean {
    const key = this.valueToKey.get(value);
    if (key !== undefined) {
      this.keyToValue.delete(key);
      this.valueToKey.delete(value);
      return true;
    }
    return false;
  }

  get size(): number {
    return this.keyToValue.size;
  }

  clear(): void {
    this.keyToValue.clear();
    this.valueToKey.clear();
  }

  keys(): IterableIterator<K> {
    return this.keyToValue.keys();
  }

  values(): IterableIterator<V> {
    return this.keyToValue.values();
  }

  entries(): IterableIterator<[K, V]> {
    return this.keyToValue.entries();
  }
}
