# @fullstackhouse/react-native-sync-storage

A synchronous storage library for React Native that provides immediate access to persisted data while maintaining async persistence in the background.

[![npm version](https://badge.fury.io/js/@fullstackhouse%2Freact-native-sync-storage.svg)](https://badge.fury.io/js/@fullstackhouse%2Freact-native-sync-storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Synchronous API**: Access stored data immediately without `await`
- **Async Persistence**: Background persistence to AsyncStorage
- **React Integration**: Built-in React Context and hooks
- **Cross-Platform**: Works on iOS, Android, and Web
- **TypeScript Support**: Fully typed with TypeScript
- **Prefix Support**: Namespace your storage keys
- **Comprehensive Testing**: 100% test coverage with Jest and Playwright

## Installation

```sh
npm install @fullstackhouse/react-native-sync-storage
# or
yarn add @fullstackhouse/react-native-sync-storage
```

### Dependencies

This library depends on `@react-native-async-storage/async-storage`. If you don't have it installed:

```sh
npm install @react-native-async-storage/async-storage
# or
yarn add @react-native-async-storage/async-storage
```

Follow the [AsyncStorage installation guide](https://react-native-async-storage.github.io/async-storage/docs/install/) for platform-specific setup.

## Usage

### With React Context (Recommended)

```jsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SyncStorageProvider, useSyncStorage } from '@fullstackhouse/react-native-sync-storage';

function MyComponent() {
  const { storage, loaded } = useSyncStorage();

  const handleSave = () => {
    // Synchronously set data
    storage.setItem('user_preference', 'dark_mode');
  };

  const handleLoad = () => {
    // Synchronously get data
    const preference = storage.getItem('user_preference');
    console.log('Preference:', preference); // 'dark_mode' or null
  };

  if (!loaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <TouchableOpacity onPress={handleSave}>
        <Text>Save Preference</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLoad}>
        <Text>Load Preference</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <SyncStorageProvider prefix="myapp_">
      <MyComponent />
    </SyncStorageProvider>
  );
}
```

### Direct Usage

```jsx
import { SyncStorage } from '@fullstackhouse/react-native-sync-storage';

const storage = new SyncStorage({ prefix: 'myapp_' });

// Initialize storage (load from AsyncStorage)
await storage.load();

// Now use synchronously
storage.setItem('key', 'value');
const value = storage.getItem('key'); // 'value'

// Multiple operations
storage.multiSet([
  ['key1', 'value1'],
  ['key2', 'value2']
]);

const values = storage.multiGet(['key1', 'key2']);
// [['key1', 'value1'], ['key2', 'value2']]

// Get all keys
const keys = storage.getAllKeys(); // ['key1', 'key2']

// Clear all data
storage.clear();
```

## API Reference

### SyncStorage Class

#### Constructor

```typescript
new SyncStorage(options?: SyncStorageOptions)
```

Options:
- `prefix?: string` - Optional prefix for all keys

#### Methods

- `load(): Promise<void>` - Load data from AsyncStorage (call once at app start)
- `getItem(key: string): string | null` - Get value synchronously
- `setItem(key: string, value: string): void` - Set value synchronously
- `removeItem(key: string): void` - Remove value synchronously
- `clear(): void` - Clear all data synchronously
- `getAllKeys(): string[]` - Get all keys synchronously
- `multiGet(keys: string[]): Array<[string, string | null]>` - Get multiple values
- `multiSet(keyValuePairs: Array<[string, string]>): void` - Set multiple values
- `multiRemove(keys: string[]): void` - Remove multiple values
- `loaded: boolean` - Whether storage has been loaded from AsyncStorage

### React Hooks

#### useSyncStorage()

```typescript
const { storage, loaded } = useSyncStorage();
```

Returns:
- `storage: SyncStorage` - The storage instance
- `loaded: boolean` - Whether storage has been loaded

### React Components

#### SyncStorageProvider

```typescript
<SyncStorageProvider prefix?: string>
  {children}
</SyncStorageProvider>
```

Props:
- `prefix?: string` - Optional prefix for all keys
- `children: ReactNode` - Child components

## How It Works

1. **Initialization**: Call `storage.load()` or use `SyncStorageProvider` to load existing data from AsyncStorage into memory
2. **Synchronous Access**: All read operations (`getItem`, `multiGet`, etc.) work immediately from memory
3. **Async Persistence**: All write operations (`setItem`, `multiSet`, etc.) update memory immediately and persist to AsyncStorage in the background
4. **Error Handling**: Persistence errors are logged but don't affect the synchronous operations

## Platform Support

- ✅ **iOS**: Full support with AsyncStorage
- ✅ **Android**: Full support with AsyncStorage  
- ✅ **Web**: Full support with localStorage fallback
- ✅ **Expo**: Full support with Expo AsyncStorage

## Testing

The library includes comprehensive tests:

```sh
# Unit tests
yarn test

# Web integration tests
yarn playwright test
```

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

### Development Setup

```sh
git clone https://github.com/fullstackhouse/react-native-sync-storage.git
cd react-native-sync-storage
yarn install

# Run tests
yarn test
yarn playwright test

# Run example
yarn example ios    # or android, web
```

## License

MIT © [FullStackHouse](https://fullstackhouse.com)

## Support

- 📧 Email: [hello@fullstackhouse.com](mailto:hello@fullstackhouse.com)
- 🐛 Issues: [GitHub Issues](https://github.com/fullstackhouse/react-native-sync-storage/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/fullstackhouse/react-native-sync-storage/discussions)

---

Made with ❤️ by [FullStackHouse](https://fullstackhouse.com)
