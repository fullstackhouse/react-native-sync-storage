import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncStorage } from '../SyncStorage';

const mockAsyncStorage = AsyncStorage as any;

describe('SyncStorage', () => {
  let syncStorage: SyncStorage;

  beforeEach(() => {
    syncStorage = new SyncStorage();
    jest.clearAllMocks();
  });

  describe('load', () => {
    it('should load existing data from AsyncStorage', async () => {
      mockAsyncStorage.getAllKeys.mockResolvedValue(['key1', 'key2']);
      mockAsyncStorage.multiGet.mockResolvedValue([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]);

      await syncStorage.load();

      expect(syncStorage.getItem('key1')).toBe('value1');
      expect(syncStorage.getItem('key2')).toBe('value2');
      expect(syncStorage.loaded).toBe(true);
    });

    it('should handle null values from AsyncStorage', async () => {
      mockAsyncStorage.getAllKeys.mockResolvedValue(['key1', 'key2']);
      mockAsyncStorage.multiGet.mockResolvedValue([
        ['key1', 'value1'],
        ['key2', null],
      ]);

      await syncStorage.load();

      expect(syncStorage.getItem('key1')).toBe('value1');
      expect(syncStorage.getItem('key2')).toBeNull();
    });

    it('should not reload if already loaded', async () => {
      mockAsyncStorage.getAllKeys.mockResolvedValue(['key1']);
      mockAsyncStorage.multiGet.mockResolvedValue([['key1', 'value1']]);

      await syncStorage.load();
      expect(mockAsyncStorage.getAllKeys).toHaveBeenCalledTimes(1);

      await syncStorage.load();
      expect(mockAsyncStorage.getAllKeys).toHaveBeenCalledTimes(1);
    });

    it('should throw error if AsyncStorage fails', async () => {
      const error = new Error('AsyncStorage failed');
      mockAsyncStorage.getAllKeys.mockRejectedValue(error);

      await expect(syncStorage.load()).rejects.toThrow('AsyncStorage failed');
    });
  });

  describe('getItem', () => {
    it('should return value from memory', () => {
      syncStorage.setItem('key1', 'value1');
      expect(syncStorage.getItem('key1')).toBe('value1');
    });

    it('should return null for non-existent key', () => {
      expect(syncStorage.getItem('nonExistent')).toBeNull();
    });
  });

  describe('setItem', () => {
    it('should store value in memory and persist to AsyncStorage', () => {
      syncStorage.setItem('key1', 'value1');

      expect(syncStorage.getItem('key1')).toBe('value1');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('key1', 'value1');
    });

    it('should handle AsyncStorage persistence failure silently', () => {
      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      mockAsyncStorage.setItem.mockRejectedValue(
        new Error('Persistence failed')
      );

      syncStorage.setItem('key1', 'value1');

      expect(syncStorage.getItem('key1')).toBe('value1');

      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to persist item to AsyncStorage:',
          expect.any(Error)
        );
        consoleSpy.mockRestore();
      }, 0);
    });
  });

  describe('removeItem', () => {
    it('should remove value from memory and AsyncStorage', () => {
      syncStorage.setItem('key1', 'value1');
      syncStorage.removeItem('key1');

      expect(syncStorage.getItem('key1')).toBeNull();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('key1');
    });
  });

  describe('clear', () => {
    it('should clear all values from memory and AsyncStorage', () => {
      syncStorage.setItem('key1', 'value1');
      syncStorage.setItem('key2', 'value2');
      syncStorage.clear();

      expect(syncStorage.getItem('key1')).toBeNull();
      expect(syncStorage.getItem('key2')).toBeNull();
      expect(syncStorage.getAllKeys()).toHaveLength(0);
      expect(mockAsyncStorage.clear).toHaveBeenCalled();
    });
  });

  describe('getAllKeys', () => {
    it('should return all keys from memory', () => {
      syncStorage.setItem('key1', 'value1');
      syncStorage.setItem('key2', 'value2');

      const keys = syncStorage.getAllKeys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toHaveLength(2);
    });

    it('should return empty array when no keys exist', () => {
      expect(syncStorage.getAllKeys()).toHaveLength(0);
    });
  });

  describe('multiGet', () => {
    it('should return multiple key-value pairs', () => {
      syncStorage.setItem('key1', 'value1');
      syncStorage.setItem('key2', 'value2');

      const result = syncStorage.multiGet(['key1', 'key2', 'key3']);
      expect(result).toEqual([
        ['key1', 'value1'],
        ['key2', 'value2'],
        ['key3', null],
      ]);
    });
  });

  describe('multiSet', () => {
    it('should set multiple key-value pairs in memory and AsyncStorage', () => {
      const keyValuePairs: Array<[string, string]> = [
        ['key1', 'value1'],
        ['key2', 'value2'],
      ];

      syncStorage.multiSet(keyValuePairs);

      expect(syncStorage.getItem('key1')).toBe('value1');
      expect(syncStorage.getItem('key2')).toBe('value2');
      expect(mockAsyncStorage.multiSet).toHaveBeenCalledWith(keyValuePairs);
    });
  });

  describe('multiRemove', () => {
    it('should remove multiple keys from memory and AsyncStorage', () => {
      syncStorage.setItem('key1', 'value1');
      syncStorage.setItem('key2', 'value2');
      syncStorage.setItem('key3', 'value3');

      syncStorage.multiRemove(['key1', 'key2']);

      expect(syncStorage.getItem('key1')).toBeNull();
      expect(syncStorage.getItem('key2')).toBeNull();
      expect(syncStorage.getItem('key3')).toBe('value3');
      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        'key1',
        'key2',
      ]);
    });
  });
});
