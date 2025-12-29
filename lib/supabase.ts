import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wistersehvzkpdrekucw.supabase.co';
const supabaseKey = 'sb_publishable_mNlqMbl5swkq4rPGRdn7Cg_epHXbZ4j';

export const supabase = createClient(supabaseUrl, supabaseKey);