import React, { useEffect, useState, useMemo } from 'react';
import SyncStorage, { type SyncStorageOptions } from './SyncStorage';
import {
  SyncStorageContext,
  type SyncStorageContextValue,
} from './SyncStorageContext';

export interface SyncStorageProviderProps extends SyncStorageOptions {
  children: React.ReactNode;
}

export const SyncStorageProvider: React.FC<SyncStorageProviderProps> = ({
  children,
  ...options
}) => {
  const [storage] = useState(() => new SyncStorage(options));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadStorage = async () => {
      try {
        await storage.load();
        setLoaded(true);
      } catch (error) {
        console.error('Failed to load sync storage:', error);
      }
    };

    loadStorage();
  }, [storage]);

  const contextValue: SyncStorageContextValue = useMemo(
    () => ({
      storage,
      loaded,
    }),
    [storage, loaded]
  );

  return (
    <SyncStorageContext.Provider value={contextValue}>
      {children}
    </SyncStorageContext.Provider>
  );
};
