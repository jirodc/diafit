import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

/**
 * Parse Supabase auth redirect URLs (hash fragment: access_token, refresh_token, type).
 */
export function parseAuthFragment(url: string): {
  access_token: string;
  refresh_token: string;
  type: string | null;
} | null {
  try {
    const hashIdx = url.indexOf('#');
    const fragment = hashIdx >= 0 ? url.substring(hashIdx + 1) : '';
    const queryFallback = url.split('?')[1]?.split('#')[0];
    const params = new URLSearchParams(fragment || queryFallback || '');
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const type = params.get('type');
    if (access_token && refresh_token) {
      return { access_token, refresh_token, type };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Password-reset email redirect. Add this exact URL in Supabase → Authentication → URL Configuration → Redirect URLs.
 */
export function getPasswordResetRedirectUrl(): string {
  const isExpoGo = Constants.appOwnership === 'expo';
  if (isExpoGo) {
    return Linking.createURL('/reset-password');
  }
  return Linking.createURL('/reset-password', { scheme: 'diafitmobile' });
}
