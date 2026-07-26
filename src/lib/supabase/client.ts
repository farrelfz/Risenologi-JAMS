import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnvironment } from "@/lib/env";

export function createClient() {
  const env = getPublicEnvironment();

  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
