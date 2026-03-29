import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, payload } = body;

    if (action === 'delete_feedback') {
      const { error } = await supabaseAdmin.from('feedbacks').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }
    
    if (action === 'read_feedback') {
      const { error } = await supabaseAdmin.from('feedbacks').update({ is_read: true }).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_poll') {
      await supabaseAdmin.from('feature_votes').delete().eq('poll_id', id);
      const { error } = await supabaseAdmin.from('polls').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle_poll') {
      const { error } = await supabaseAdmin.from('polls').update({ status: payload.status }).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'create_poll') {
      const { error } = await supabaseAdmin.from('polls').insert([payload]);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: '알 수 없는 명령입니다.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}