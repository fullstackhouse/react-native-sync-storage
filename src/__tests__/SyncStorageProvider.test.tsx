import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
  afterEach,
} from '@jest/globals';
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react-native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncStorageProvider } from '../SyncStorageProvider';
import { useSyncStorage } from '../SyncStorageContext';

const mockAsyncStorage = AsyncStorage as any;

const TestComponent: React.FC = () => {
  const { storage, loaded } = useSyncStorage();
  const [, forceUpdate] = React.useState({});
  const [itemValue, setItemValue] = React.useState<string | null>(null);

  return (
    <View>
      <Text testID="is-loaded">{loaded.toString()}</Text>
      <TouchableOpacity
        testID="set-item"
        onPress={() => {
          storage.setItem('test-key', 'test-value');
          forceUpdate({});
        }}
      >
        <Text>Set Item</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="get-item"
        onPress={() => {
          const value = storage.getItem('test-key');
          setItemValue(value);
        }}
      >
        <Text>Get Item</Text>
      </TouchableOpacity>
      {itemValue && <Text testID="item-value">{itemValue}</Text>}
      <Text testID="all-keys">{storage.getAllKeys().join(',')}</Text>
    </View>
  );
};

describe('SyncStorageProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
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
    mockAsyncStorage.multiGet.mockResolvedValue([
      ['existing-key', 'existing-value'],
    ]);

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

    fireEvent.press(setButton);
    fireEvent.press(getButton);

    await waitFor(() => {
      expect(screen.getByTestId('item-value')).toHaveTextContent('test-value');
    });

    await waitFor(() => {
      expect(screen.getByTestId('all-keys')).toHaveTextContent('test-key');
    });
  });

  it('should handle initialization failure gracefully', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockAsyncStorage.getAllKeys.mockRejectedValue(
      new Error('AsyncStorage failed')
    );

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
        return <Text>Should not render</Text>;
      } catch (error) {
        return <Text testID="error">{(error as Error).message}</Text>;
      }
    };

    render(<TestComponentOutsideProvider />);

    expect(screen.getByTestId('error')).toHaveTextContent(
      'useSyncStorage must be used within a SyncStorageProvider'
    );
  });
});
