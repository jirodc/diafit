/**
 * DiaBot: diabetes-focused chat. Requires OPENAI_API_KEY secret.
 * Authenticated users only (JWT validated at gateway or via getUser).
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are DiaBot, the in-app assistant for Diafit users living with diabetes.

SCOPE — ONLY answer about:
- Diabetes types, blood glucose, A1C, CGM/meters (general education)
- Nutrition patterns helpful for diabetes (not personal meal plans that replace a dietitian)
- Physical activity considerations for people with diabetes
- Medications and insulin (high-level education only; never prescribe, change doses, or tell users to stop medicines)
- Recognizing hypo/hyperglycemia and when to seek urgent care (general guidance)
- Using Diafit: logging glucose, meals, workouts, scheduled tasks/reminders

OUT OF SCOPE — If the question is not related to diabetes/metabolic health/Diafit, reply briefly and politely that you only help with diabetes-related topics. Do not answer coding, politics, unrelated hobbies, or non-diabetes medical advice in detail.

SAFETY:
- You are not a doctor. Urge users to follow their care team and seek emergency services for emergencies.
- Keep answers concise, clear, and supportive. No fear-mongering.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

const MAX_MESSAGES = 24;
const MAX_CONTENT = 8000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    return new Response(
      JSON.stringify({
        error: "DiaBot is not configured. Set the OPENAI_API_KEY secret for this Edge Function.",
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Sign in required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as { messages?: ChatMessage[] };
    const raw = Array.isArray(body.messages) ? body.messages : [];
    const trimmed: ChatMessage[] = raw
      .slice(-MAX_MESSAGES)
      .filter((m): m is ChatMessage =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
      )
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, MAX_CONTENT),
      }));

    if (trimmed.length === 0 || trimmed[trimmed.length - 1]?.role !== "user") {
      return new Response(JSON.stringify({ error: "Send a user message last." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...trimmed.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 900,
        temperature: 0.65,
      }),
    });

    const openaiJson = (await openaiRes.json()) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };

    if (!openaiRes.ok) {
      const msg = openaiJson.error?.message ?? "OpenAI request failed";
      return new Response(JSON.stringify({ error: msg }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reply = openaiJson.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return new Response(JSON.stringify({ error: "Empty response from model" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
