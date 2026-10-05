// Cliente Admin Supabase (Service Role Key - NUNCA exposto ao client)
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || serviceKey.includes("your-service-role-key")) {
    return null;
  }

  return { url, serviceKey };
}
