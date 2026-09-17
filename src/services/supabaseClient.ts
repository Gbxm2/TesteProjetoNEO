import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

let client: SupabaseClient | null = null;

// Verifica se as variáveis de ambiente foram fornecidas e não são placeholders
const isValidSupabaseConfig = 
  Boolean(supabaseUrl) && 
  Boolean(supabaseAnonKey) && 
  supabaseUrl.startsWith("http") &&
  !supabaseUrl.includes("seu-projeto.supabase.co") &&
  !supabaseAnonKey.includes("sua-chave-anon");

if (isValidSupabaseConfig) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    console.log("[Supabase] Conexão com banco de dados Supabase inicializada com sucesso em:", supabaseUrl);
  } catch (error) {
    console.error("[Supabase] Falha ao inicializar o cliente Supabase:", error);
    client = null;
  }
} else {
  console.info(
    "[Supabase] Chaves de API não configuradas no .env. Operando em modo de Armazenamento Local Inteligente (LocalStorage + WebSocket)."
  );
}

export const supabase = client;

export function isSupabaseConfigured(): boolean {
  return client !== null;
}

export function getSupabaseConfigDetails() {
  return {
    configured: isSupabaseConfigured(),
    url: supabaseUrl || null,
    hasKey: Boolean(supabaseAnonKey),
  };
}
