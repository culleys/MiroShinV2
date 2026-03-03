import fs from 'fs';
import path from 'path';

// Use /tmp on Vercel as process.cwd() is read-only
const isVercel = process.env.VERCEL === '1';
const SETTINGS_FILE = isVercel 
  ? path.join('/tmp', 'settings.json') 
  : path.join(process.cwd(), 'data', 'settings.json');

export interface AppSettings {
  databaseUrl: string;
  adminPattern: number[];
}

const defaultSettings: AppSettings = {
  databaseUrl: process.env.DATABASE_URL || '',
  adminPattern: process.env.ADMIN_PATTERN 
    ? JSON.parse(process.env.ADMIN_PATTERN) 
    : [0, 1, 2, 5, 8],
};

export function getSettings(): AppSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Failed to read settings:', error);
  }
  return defaultSettings;
}

export function saveSettings(settings: Partial<AppSettings>) {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const current = getSettings();
    const updated = { ...current, ...settings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2));
    return updated;
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
}
