import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = 'admin@diafit.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const bootstrapSecret = Deno.env.get('BOOTSTRAP_SECRET') ?? '';

    const body = (await req.json().catch(() => ({}))) as { password?: string; secret?: string };
    const password = typeof body.password === 'string' ? body.password : 'admin123';
    const secret = typeof body.secret === 'string' ? body.secret : '';

    if (bootstrapSecret && secret !== bootstrapSecret) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing secret' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: existingUsers } = await admin.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);

    let userId: string;
    if (existing) {
      userId = existing.id;
    } else {
      const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password,
        email_confirm: true,
      });
      if (createErr) {
        return new Response(
          JSON.stringify({ error: createErr.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      userId = newUser.user.id;
    }

    const { error: insertErr } = await admin
      .from('admins')
      .upsert({ id: userId, email: ADMIN_EMAIL }, { onConflict: 'id' });

    if (insertErr) {
      return new Response(
        JSON.stringify({ error: insertErr.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Admin ${ADMIN_EMAIL} is ready. Log in with this email and the password you set.`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
