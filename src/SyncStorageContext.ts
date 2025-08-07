import { createContext, useContext } from 'react';
import SyncStorage from './SyncStorage';

export interface SyncStorageContextValue {
  storage: SyncStorage;
  loaded: boolean;
}

export const SyncStorageContext = createContext<SyncStorageContextValue | null>(
  null
);

export const useSyncStorage = (): SyncStorageContextValue => {
  const context = useContext(SyncStorageContext);
  if (!context) {
    throw new Error('useSyncStorage must be used within a SyncStorageProvider');
  }
  return context;
};
