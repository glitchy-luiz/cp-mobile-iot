import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '../types/mqtt';

const KEY_BROKER_URL = '@iotcontrol:brokerUrl';
const KEY_THEME = '@iotcontrol:theme';

export async function loadBrokerUrl(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEY_BROKER_URL);
  } catch {
    return null;
  }
}

export async function saveBrokerUrl(url: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_BROKER_URL, url);
  } catch {
    // falha de persistência não deve derrubar o app
  }
}

export async function loadTheme(): Promise<ThemeMode | null> {
  try {
    const value = await AsyncStorage.getItem(KEY_THEME);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export async function saveTheme(mode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_THEME, mode);
  } catch {
    // ignorado
  }
}
