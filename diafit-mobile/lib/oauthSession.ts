import * as Linking from 'expo-linking';
import type { SupabaseClient } from '@supabase/supabase-js';
import { parseAuthFragment } from './authDeepLink';

function queryParam(
  params: Record<string, string | string[] | undefined> | null | undefined,
  key: string
): string | undefined {
  if (!params) return undefined;
  const v = params[key];
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && v[0]) return v[0];
  return undefined;
}

function decodeOAuthErrorDescription(raw: string): string {
  try {
    return decodeURIComponent(raw.replace(/\+/g, ' '));
  } catch {
    return raw;
  }
}

export type OAuthRedirectResult =
  | { ok: true; navigate: 'home' | 'reset-password' }
  | { ok: false; message: string }
  | null;

/**
 * Finishes OAuth / magic-link redirects: implicit tokens in hash, PKCE `?code=`, or password recovery.
 * Returns `null` if the URL does not look like an auth callback (ignore unrelated deep links).
 */
export async function completeOAuthRedirect(
  supabase: SupabaseClient,
  url: string
): Promise<OAuthRedirectResult> {
  const lower = url.toLowerCase();
  const hashIdx = url.indexOf('#');
  const hashPart = hashIdx >= 0 ? url.slice(hashIdx + 1) : '';
  const hashParams = new URLSearchParams(hashPart);
  const hashError = hashParams.get('error');
  if (hashError) {
    const desc = hashParams.get('error_description');
    return {
      ok: false,
      message: desc ? decodeOAuthErrorDescription(desc) : hashError,
    };
  }

  const parsed = parseAuthFragment(url);
  if (parsed?.type === 'recovery') {
    const { error } = await supabase.auth.setSession({
      access_token: parsed.access_token,
      refresh_token: parsed.refresh_token,
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true, navigate: 'reset-password' };
  }

  const link = Linking.parse(url);
  const qError = queryParam(link.queryParams, 'error');
  const qDesc = queryParam(link.queryParams, 'error_description');
  if (qError) {
    return {
      ok: false,
      message: qDesc ? decodeOAuthErrorDescription(qDesc) : qError,
    };
  }

  if (parsed) {
    const { error } = await supabase.auth.setSession({
      access_token: parsed.access_token,
      refresh_token: parsed.refresh_token,
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true, navigate: 'home' };
  }

  const code = queryParam(link.queryParams, 'code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { ok: false, message: error.message };
    return { ok: true, navigate: 'home' };
  }

  const looksAuthRelated =
    lower.includes('auth/callback') ||
    lower.includes('access_token') ||
    lower.includes('refresh_token') ||
    (lower.includes('code=') && (lower.includes('diafitmobile://') || lower.includes('exp://')));

  if (!looksAuthRelated) return null;

  return {
    ok: false,
    message:
      'Could not complete sign-in. Add your OAuth redirect URL in Supabase (Authentication → URL Configuration) and enable Google/Facebook under Sign In / Providers.',
  };
}
