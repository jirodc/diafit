# diabot-chat

Diabetes-focused in-app assistant (**DiaBot**). Calls OpenAI **`gpt-4o-mini`** with a fixed system prompt. Only **authenticated** users: the client sends the Supabase **JWT**; this function verifies the user before calling OpenAI.

## Configure

1. Set the OpenAI key on your Supabase project (see also [`../../README.md`](../../README.md)):

   ```bash
   npx supabase secrets set OPENAI_API_KEY=sk-...
   ```

2. Deploy:

   ```bash
   npx supabase functions deploy diabot-chat
   ```

## Replace the API key

Create a new key in [OpenAI API keys](https://platform.openai.com/api-keys), run `npx supabase secrets set OPENAI_API_KEY=...` again with the new value, then revoke the old key in OpenAI.

## Security

The **OpenAI API key never ships in the mobile app**. Only this Edge Function uses it.
