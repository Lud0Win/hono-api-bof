import { createClient } from '@supabase/supabase-js';
import { Hono } from 'hono';

// Hono's bindings are used to get environment variables in Vercel.
// We define a type for our environment variables for type safety.
type Env = {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
}

// This is a placeholder app to get the context and environment variables.
// In a real application, you might use Hono's context more extensively.
const app = new Hono<{ Bindings: Env }>();

// We need to pass the context (c) to get the environment variables.
// This function will be called from our main index.ts file.
// However, for simplicity in this setup, we will read them directly
// when deploying to Vercel, which injects them.
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// Initialize and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
