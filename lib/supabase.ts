import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CACHE_EXPIRE_MS = 24 * 60 * 60 * 1000; 

export async function getCachedPrices() {
  if (typeof window === 'undefined') {
    const { data } = await supabase.from('item_prices').select('*').order('created_at', { ascending: true });
    return data || [];
  }

  const cached = localStorage.getItem('alldding_prices_cache');
  
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const now = new Date().getTime();
      
      if (now - timestamp < CACHE_EXPIRE_MS) {
        return data;
      }
    } catch (e) {
      console.error('캐시 파싱 오류:', e);
    }
  }

  const { data, error } = await supabase.from('item_prices').select('*').order('created_at', { ascending: true });
  
  if (data && !error) {
    localStorage.setItem('alldding_prices_cache', JSON.stringify({
      data: data,
      timestamp: new Date().getTime()
    }));
    return data;
  }
  
  return [];
}