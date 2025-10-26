import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  console.log('[delete-user] Function invoked, method:', req.method);
  
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    console.log('[delete-user] Getting auth header...');
    // Obtener el usuario autenticado
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[delete-user] No authorization header');
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    console.log('[delete-user] Getting current user...');
    // Verificar que el usuario es super_admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('[delete-user] User error:', userError);
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[delete-user] Current user ID:', user.id);

    // Verificar rol de super_admin
    console.log('[delete-user] Checking super_admin role...');
    const { data: roles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('[delete-user] Roles error:', rolesError);
    }

    const isSuperAdmin = roles?.some(r => r.role === 'super_admin');
    console.log('[delete-user] Is super admin:', isSuperAdmin);

    if (!isSuperAdmin) {
      return new Response(JSON.stringify({ error: 'Permisos insuficientes' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Obtener userId del body
    console.log('[delete-user] Parsing request body...');
    const { userId } = await req.json();
    console.log('[delete-user] User to delete:', userId);

    if (!userId) {
      console.error('[delete-user] No userId provided');
      return new Response(JSON.stringify({ error: 'userId es requerido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validar que no se está auto-eliminando
    if (userId === user.id) {
      console.error('[delete-user] User trying to delete themselves');
      return new Response(JSON.stringify({ error: 'No puedes eliminarte a ti mismo' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar si es el último super_admin
    console.log('[delete-user] Checking target user roles...');
    const { data: userRoles, error: userRolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (userRolesError) {
      console.error('[delete-user] Error getting target roles:', userRolesError);
    }

    const targetIsSuperAdmin = userRoles?.some(r => r.role === 'super_admin');
    console.log('[delete-user] Target is super admin:', targetIsSuperAdmin);

    if (targetIsSuperAdmin) {
      console.log('[delete-user] Counting super admins...');
      const { count, error: countError } = await supabaseClient
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'super_admin');

      if (countError) {
        console.error('[delete-user] Error counting super admins:', countError);
      }

      console.log('[delete-user] Super admin count:', count);

      if (count !== null && count <= 1) {
        console.error('[delete-user] Cannot delete last super admin');
        return new Response(
          JSON.stringify({ error: 'No se puede eliminar el último super_admin del sistema' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Usar service_role_key para eliminar usuario
    console.log('[delete-user] Creating admin client...');
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log('[delete-user] Deleting user...');
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('[delete-user] Delete error:', deleteError);
      throw deleteError;
    }

    console.log('[delete-user] User deleted successfully');
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[delete-user] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
