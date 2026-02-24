import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qwvgzdijiwfgrrauxkws.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dmd6ZGlqaXdmZ3JyYXV4a3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5Mzk0ODAsImV4cCI6MjA3NzUxNTQ4MH0.vP9qYpK8Z03Odwwhu0aGxL-fqzNSTW3uDz8nGjhDAgg';

if (!supabaseUrl || !supabaseAnonKey) {
  // This check is kept just in case the values are accidentally removed.
  throw new Error("Supabase URL and Anon Key must be provided.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
