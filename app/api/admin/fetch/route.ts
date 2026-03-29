import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target');

  try {
    if (target === 'feedbacks') {
      const { data } = await supabaseAdmin.from('feedbacks').select('*').order('created_at', { ascending: false });
      return NextResponse.json(data || []);
    }

    if (target === 'statistics') {
      const { count: farmCount } = await supabaseAdmin.from('image_download_logs').select('*', { count: 'exact', head: true }).eq('category', 'farming');
      const { count: ocCount } = await supabaseAdmin.from('image_download_logs').select('*', { count: 'exact', head: true }).eq('category', 'ocean');
      const { count: fbCount } = await supabaseAdmin.from('file_download_logs').select('*', { count: 'exact', head: true }).eq('file_type', 'fabric');
      const { count: neoCount } = await supabaseAdmin.from('file_download_logs').select('*', { count: 'exact', head: true }).eq('file_type', 'neoforge');
      
      return NextResponse.json({ farmCount, ocCount, fbCount, neoCount });
    }

    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}