import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const COOKIE_KEY = 'coal_research_auth_cookie';

export async function getCookie() {
  if (Platform.OS === 'web') {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
        return globalThis.localStorage.getItem(COOKIE_KEY);
      }
    } catch {
      return null;
    }
    return null;
  }
  try {
    return await SecureStore.getItemAsync(COOKIE_KEY);
  } catch {
    return null;
  }
}

export async function saveCookie(setCookieHeader) {
  if (!setCookieHeader) return false;
  const firstCookie = setCookieHeader.split(',')[0].split(';')[0].trim();
  if (!firstCookie.includes('=')) return false;
  if (Platform.OS === 'web') {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
        globalThis.localStorage.setItem(COOKIE_KEY, firstCookie);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }
  try {
    await SecureStore.setItemAsync(COOKIE_KEY, firstCookie);
  } catch {
    return false;
  }
  return true;
}

export async function clearCookie() {
  if (Platform.OS === 'web') {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
        globalThis.localStorage.removeItem(COOKIE_KEY);
      }
    } catch {
      // Storage may be unavailable in privacy modes or blocked contexts.
    }
    return;
  }
  try {
    await SecureStore.deleteItemAsync(COOKIE_KEY);
  } catch {
    // The in-memory auth state will still be cleared.
  }
}
