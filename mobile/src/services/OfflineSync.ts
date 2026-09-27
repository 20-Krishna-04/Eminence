import * as SQLite from 'expo-sqlite';
import NetInfo from '@react-native-community/netinfo';
import api from './api';

const db = SQLite.openDatabaseSync('eminence_offline.db');

export const initOfflineDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS pending_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT,
      method TEXT,
      payload TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const queueOfflineRequest = (url: string, method: string, payload: any) => {
  db.runSync(
    'INSERT INTO pending_requests (url, method, payload) VALUES (?, ?, ?)',
    url,
    method,
    JSON.stringify(payload)
  );
  console.log(`[Offline Sync] Queued ${method} ${url} to local SQLite queue`);
};

export const syncOfflineQueue = async () => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  const rows = db.getAllSync<{ id: number; url: string; method: string; payload: string }>('SELECT * FROM pending_requests ORDER BY id ASC');
  
  if (rows.length === 0) return;

  console.log(`[Offline Sync] Network restored. Syncing ${rows.length} pending items...`);

  for (const row of rows) {
    try {
      if (row.method === 'POST') {
        await api.post(row.url, JSON.parse(row.payload));
      } else if (row.method === 'PATCH') {
        await api.patch(row.url, JSON.parse(row.payload));
      } else if (row.method === 'PUT') {
        await api.put(row.url, JSON.parse(row.payload));
      }
      
      // Success, remove from queue
      db.runSync('DELETE FROM pending_requests WHERE id = ?', row.id);
      console.log(`[Offline Sync] Successfully synced ID ${row.id}`);
    } catch (err) {
      console.warn(`[Offline Sync] Failed to sync ID ${row.id}, will retry later`, err);
      // Stop syncing on first error to maintain order and avoid spamming server
      break; 
    }
  }
};
