import { supabase } from './supabase';

export type DiabotMessage = { role: 'user' | 'assistant'; content: string };

/**
 * Calls the `diabot-chat` Edge Function (OpenAI + diabetes-only system prompt).
 * Requires: function deployed and `OPENAI_API_KEY` set in Supabase secrets.
 */
export async function invokeDiabot(messages: DiabotMessage[]): Promise<string> {
  const { data, error } = await supabase.functions.invoke('diabot-chat', {
    body: { messages },
  });

  if (error) {
    throw new Error(error.message || 'Could not reach DiaBot. Try again later.');
  }

  const payload = data as { reply?: string; error?: string } | null;
  if (payload?.error) {
    throw new Error(payload.error);
  }
  if (!payload?.reply?.trim()) {
    throw new Error('No reply from DiaBot.');
  }
  return payload.reply.trim();
}
