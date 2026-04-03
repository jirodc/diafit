/**
 * Maps Supabase Auth email errors (rate limits, etc.) to user-facing copy.
 */
export function describeAuthEmailError(err: unknown): { title: string; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();
  const isRateLimited =
    lower.includes('rate limit') ||
    lower.includes('too many') ||
    lower.includes('email rate') ||
    lower.includes('over_email_send_rate') ||
    raw.includes('429');

  if (isRateLimited) {
    return {
      title: 'Email rate limit',
      message:
        'Too many verification or reset emails were sent from this project. Wait up to about an hour, then try again.\n\n' +
        'Tip: During development, each tap on “Send” or “Resend” counts toward the limit. ' +
        'For higher limits in production, set up custom SMTP under Supabase → Project Settings → Authentication.',
    };
  }

  return { title: 'Error', message: raw };
}
