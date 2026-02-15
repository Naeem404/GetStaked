import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export const SUPABASE_URL = 'https://cpkcskwkoafopqfnznkd.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_vgBzlndGmP3N-vyjoIMTKg_R85-51aU'

export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
}

export const supabase = createClient()
