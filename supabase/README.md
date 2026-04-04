# Supabase (Diafit)

This folder holds migrations, config, and **Edge Functions**. The mobile app talks to your Supabase project URL; sensitive keys (for example OpenAI) stay on the server as **secrets**, not in the app.

## CLI

From the **repository root** (`diafit/`), where this `supabase/` folder lives:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
```

`project-ref` is the id in your Supabase dashboard URL (for example `https://supabase.com/dashboard/project/<project-ref>`).

## Secrets (Edge Functions)

Functions read secrets via `Deno.env.get("NAME")`. For DiaBot you need:

| Secret | Used by |
|--------|---------|
| `OPENAI_API_KEY` | `diabot-chat` |

**Set or replace** (overwrites the previous value for that name):

```bash
npx supabase secrets set OPENAI_API_KEY=sk-your-key-here
```

To avoid putting the key in shell history, add or edit the secret in the dashboard: **Project → Edge Functions → Manage secrets** (wording may vary slightly).

After changing a secret you usually **do not** need to redeploy; new invocations pick up the update (allow a short delay).

## Deploy a function

```bash
npx supabase functions deploy diabot-chat
```

If you see `WARNING: Docker is not running`, cloud deploy can still succeed; Docker is mainly for **local** `supabase functions serve`.

## Function docs

- [`functions/diabot-chat/README.md`](functions/diabot-chat/README.md) — DiaBot chat endpoint
