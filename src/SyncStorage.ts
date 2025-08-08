import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SyncStorageOptions {
  prefix?: string;
}

class SyncStorage {
  private storage: Map<string, string> = new Map();
  private isLoaded: boolean = false;
  private prefix: string;

  constructor(options: SyncStorageOptions = {}) {
    this.prefix = options.prefix || '';
  }

  private getStorageKey(key: string): string {
    return this.prefix ? `${this.prefix}${key}` : key;
  }

  async load(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const keys = await AsyncStorage.getAllKeys();
      const prefixedKeys = this.prefix
        ? keys.filter((key: string) => key.startsWith(this.prefix))
        : keys;
      const items = await AsyncStorage.multiGet(prefixedKeys);

      for (const [storageKey, value] of items) {
        if (value !== null) {
          const userKey =
            this.prefix && storageKey.startsWith(this.prefix)
              ? storageKey.slice(this.prefix.length)
              : storageKey;
          this.storage.set(userKey, value);
        }
      }

      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load SyncStorage:', error);
      throw error;
    }
  }

  getItem(key: string): string | null {
    return this.storage.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);

    AsyncStorage.setItem(this.getStorageKey(key), value).catch((error: any) => {
      console.warn('Failed to persist item to AsyncStorage:', error);
    });
  }

  removeItem(key: string): void {
    this.storage.delete(key);

    AsyncStorage.removeItem(this.getStorageKey(key)).catch((error: any) => {
      console.warn('Failed to remove item from AsyncStorage:', error);
    });
  }

  clear(): void {
    this.storage.clear();

    AsyncStorage.clear().catch((error: any) => {
      console.warn('Failed to clear AsyncStorage:', error);
    });
  }

  getAllKeys(): string[] {
    return Array.from(this.storage.keys());
  }

  multiGet(keys: string[]): Array<[string, string | null]> {
    return keys.map((key) => [key, this.getItem(key)]);
  }

  multiSet(keyValuePairs: Array<[string, string]>): void {
    for (const [key, value] of keyValuePairs) {
      this.storage.set(key, value);
    }

    const prefixedPairs: Array<[string, string]> = keyValuePairs.map(
      ([key, value]) => [this.getStorageKey(key), value]
    );

    AsyncStorage.multiSet(prefixedPairs).catch((error: any) => {
      console.warn('Failed to persist items to AsyncStorage:', error);
    });
  }

  multiRemove(keys: string[]): void {
    for (const key of keys) {
      this.storage.delete(key);
    }

    const prefixedKeys = keys.map((key) => this.getStorageKey(key));

    AsyncStorage.multiRemove(prefixedKeys).catch((error: any) => {
      console.warn('Failed to remove items from AsyncStorage:', error);
    });
  }

  get loaded(): boolean {
    return this.isLoaded;
  }
}

export { SyncStorage };
