import { SupabaseClient } from '@supabase/supabase-js'

const supabase = new SupabaseClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_KEY as string
)

export { supabase }