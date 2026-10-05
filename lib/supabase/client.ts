// Cliente Supabase seguro com fallback para MockStore
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.includes("your-project")) {
    return null;
  }

  // Se as variáveis estiverem configuradas, pode carregar o client oficial
  return { url, anonKey };
}
