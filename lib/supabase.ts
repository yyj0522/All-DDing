import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CACHE_EXPIRE_MS = 3 * 60 * 60 * 1000; 

export async function getCachedPrices() {
  if (typeof window === 'undefined') {
    const { data } = await supabase.from('item_prices').select('*').order('created_at', { ascending: true });
    return data || [];
  }

  const cached = localStorage.getItem('alldding_prices_cache');
  
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const now = new Date();
      const nowMs = now.getTime();
      
      const kstMs = nowMs + (9 * 60 * 60 * 1000);
      const kstDate = new Date(kstMs);
      const y = kstDate.getUTCFullYear();
      const m = kstDate.getUTCMonth();
      const d = kstDate.getUTCDate();
      const h = kstDate.getUTCHours();

      const recentResetKstMs = Date.UTC(y, m, h < 3 ? d - 1 : d, 3, 0, 0, 0);
      const recentResetMs = recentResetKstMs - (9 * 60 * 60 * 1000);

      if (nowMs - timestamp < CACHE_EXPIRE_MS && timestamp >= recentResetMs) {
        return data;
      }
    } catch (e) {
      console.error('Cache parsing error:', e);
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