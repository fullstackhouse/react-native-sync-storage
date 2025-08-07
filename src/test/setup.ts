import { vi } from 'vitest';
import '@testing-library/jest-dom';

const mockAsyncStorage = {
  getItem: vi.fn(() => Promise.resolve(null)),
  setItem: vi.fn(() => Promise.resolve()),
  removeItem: vi.fn(() => Promise.resolve()),
  getAllKeys: vi.fn(() => Promise.resolve([])),
  multiGet: vi.fn(() => Promise.resolve([])),
  multiSet: vi.fn(() => Promise.resolve()),
  multiRemove: vi.fn(() => Promise.resolve()),
  clear: vi.fn(() => Promise.resolve()),
};

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: mockAsyncStorage,
}));

export { mockAsyncStorage };