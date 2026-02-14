import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

export const SUPABASE_URL = 'https://cpkcskwkoafopqfnznkd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_vgBzlndGmP3N-vyjoIMTKg_R85-51aU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
