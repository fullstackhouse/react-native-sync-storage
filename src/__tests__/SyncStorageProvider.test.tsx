import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncStorageProvider } from '../SyncStorageProvider';
import { useSyncStorage } from '../SyncStorageContext';

const mockAsyncStorage = AsyncStorage as any;

const TestComponent: React.FC = () => {
  const { storage, loaded } = useSyncStorage();
  const [, forceUpdate] = React.useState({});

  return (
    <div>
      <div data-testid="is-loaded">{loaded.toString()}</div>
      <button
        data-testid="set-item"
        onClick={() => {
          storage.setItem('test-key', 'test-value');
          forceUpdate({});
        }}
      >
        Set Item
      </button>
      <button
        data-testid="get-item"
        onClick={() => {
          const value = storage.getItem('test-key');
          const element = document.createElement('div');
          element.setAttribute('data-testid', 'item-value');
          element.textContent = value || 'null';
          document.body.appendChild(element);
        }}
      >
        Get Item
      </button>
      <div data-testid="all-keys">
        {storage.getAllKeys().join(',')}
      </div>
    </div>
  );
};

describe('SyncStorageProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    const existingElements = document.querySelectorAll('[data-testid="item-value"]');
    existingElements.forEach(el => el.remove());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide sync storage context to children', async () => {
    mockAsyncStorage.getAllKeys.mockResolvedValue([]);
    mockAsyncStorage.multiGet.mockResolvedValue([]);

    render(
      <SyncStorageProvider>
        <TestComponent />
      </SyncStorageProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loaded')).toHaveTextContent('true');
    });
  });

  it('should initialize with existing AsyncStorage data', async () => {
    mockAsyncStorage.getAllKeys.mockResolvedValue(['existing-key']);
    mockAsyncStorage.multiGet.mockResolvedValue([['existing-key', 'existing-value']]);

    render(
      <SyncStorageProvider>
        <TestComponent />
      </SyncStorageProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loaded')).toHaveTextContent('true');
    });

    expect(screen.getByTestId('all-keys')).toHaveTextContent('existing-key');
  });

  it('should allow setting and getting items through context', async () => {
    mockAsyncStorage.getAllKeys.mockResolvedValue([]);
    mockAsyncStorage.multiGet.mockResolvedValue([]);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    render(
      <SyncStorageProvider>
        <TestComponent />
      </SyncStorageProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loaded')).toHaveTextContent('true');
    });

    const setButton = screen.getByTestId('set-item');
    const getButton = screen.getByTestId('get-item');

    setButton.click();
    getButton.click();

    await waitFor(() => {
      const valueElement = document.querySelector('[data-testid="item-value"]');
      expect(valueElement).toHaveTextContent('test-value');
    });

    await waitFor(() => {
      expect(screen.getByTestId('all-keys')).toHaveTextContent('test-key');
    });
  });

  it('should handle initialization failure gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockAsyncStorage.getAllKeys.mockRejectedValue(new Error('AsyncStorage failed'));

    render(
      <SyncStorageProvider>
        <TestComponent />
      </SyncStorageProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load sync storage:',
        expect.any(Error)
      );
    });

    expect(screen.getByTestId('is-loaded')).toHaveTextContent('false');
    consoleSpy.mockRestore();
  });

  it('should throw error when useSyncStorage is used outside provider', () => {
    const TestComponentOutsideProvider = () => {
      try {
        useSyncStorage();
        return <div>Should not render</div>;
      } catch (error) {
        return <div data-testid="error">{(error as Error).message}</div>;
      }
    };

    render(<TestComponentOutsideProvider />);

    expect(screen.getByTestId('error')).toHaveTextContent(
      'useSyncStorage must be used within a SyncStorageProvider'
    );
  });
});