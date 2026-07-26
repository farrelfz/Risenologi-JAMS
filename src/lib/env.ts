type PublicEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
};

const publicEnvironmentKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

function readRequiredEnvironmentValue(key: (typeof publicEnvironmentKeys)[number]) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getPublicEnvironment(): PublicEnvironment {
  return {
    NEXT_PUBLIC_SUPABASE_URL: readRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: readRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}
