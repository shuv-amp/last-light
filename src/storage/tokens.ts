import AsyncStorage from '@react-native-async-storage/async-storage';
import { Token } from '../types';

const STORAGE_KEY = '@lastlight/tokens';

export async function loadTokens(): Promise<Token[] | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Token[];
  } catch {
    return null;
  }
}

export async function persistTokens(tokens: Token[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    // Silent fail — the user can still use the app this session.
  }
}
