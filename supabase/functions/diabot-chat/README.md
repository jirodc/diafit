# diabot-chat

Diabetes-focused DiaBot replies via OpenAI (`gpt-4o-mini`). **Set the secret:**

```bash
npx supabase secrets set OPENAI_API_KEY=sk-...
```

Deploy:

```bash
npx supabase functions deploy diabot-chat
```

The mobile app calls this with the signed-in user’s JWT. No API key in the app.
