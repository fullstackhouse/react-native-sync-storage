import { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  SyncStorageProvider,
  useSyncStorage,
} from '@fullstackhouse/react-native-sync-storage';

function StorageDemo() {
  const { storage, loaded } = useSyncStorage();
  const [key, setKey] = useState('test-key');
  const [value, setValue] = useState('test-value');
  const [retrievedValue, setRetrievedValue] = useState<string | null>(null);

  const handleSetItem = () => {
    storage.setItem(key, value);
    setRetrievedValue(storage.getItem(key));
  };

  const handleGetItem = () => {
    const val = storage.getItem(key);
    setRetrievedValue(val);
  };

  const handleClear = () => {
    storage.clear();
    setRetrievedValue(null);
  };

  if (!loaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>React Native Sync Storage Demo</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Key:</Text>
        <TextInput
          style={styles.input}
          value={key}
          onChangeText={setKey}
          placeholder="Enter key"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Value:</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder="Enter value"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSetItem}>
        <Text style={styles.buttonText}>Set Item</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleGetItem}>
        <Text style={styles.buttonText}>Get Item</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.clearButton]}
        onPress={handleClear}
      >
        <Text style={styles.buttonText}>Clear Storage</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.label}>Retrieved Value:</Text>
        <Text style={styles.result}>{retrievedValue || 'null'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>All Keys:</Text>
        <Text style={styles.result}>
          {storage.getAllKeys().join(', ') || 'none'}
        </Text>
      </View>
    </View>
  );
}

export function App() {
  return (
    <SyncStorageProvider>
      <StorageDemo />
    </SyncStorageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  result: {
    fontSize: 16,
    color: '#333',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});
