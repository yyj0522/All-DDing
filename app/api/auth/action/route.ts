import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function hashData(user: string, data: string) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(user.toLowerCase() + "alldding_secret" + data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, username, password, newPassword, recoveryKey, settings } = body;

    if (action === 'register') {
      const { data: existingUser } = await supabaseAdmin.from('alldding_users').select('username').eq('username', username).single();
      
      if (existingUser) {
        return NextResponse.json({ error: '이미 사용 중인 아이디입니다.' }, { status: 400 });
      }

      const hashedPassword = await hashData(username, password);
      const hashedRecoveryKey = await hashData(username, recoveryKey);

      const { error } = await supabaseAdmin.from('alldding_users').insert([{
        username,
        password: hashedPassword,
        recovery_key: hashedRecoveryKey,
        settings
      }]);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'login') {
      const { data: user, error } = await supabaseAdmin.from('alldding_users').select('password, settings').eq('username', username).single();
      const hashedInputPassword = await hashData(username, password);

      if (error || !user || user.password !== hashedInputPassword) {
        return NextResponse.json({ error: '아이디 또는 비밀번호가 일치하지 않습니다.' }, { status: 400 });
      }

      return NextResponse.json({ success: true, settings: user.settings });
    }

    if (action === 'recover') {
      const { data: user, error } = await supabaseAdmin.from('alldding_users').select('recovery_key').eq('username', username).single();
      const hashedInputKey = await hashData(username, recoveryKey);

      if (error || !user || user.recovery_key !== hashedInputKey) {
        return NextResponse.json({ error: '아이디 또는 복구 키가 일치하지 않습니다.' }, { status: 400 });
      }

      const hashedNewPassword = await hashData(username, newPassword);
      const { error: updateError } = await supabaseAdmin.from('alldding_users').update({ password: hashedNewPassword }).eq('username', username);

      if (updateError) throw updateError;
      return NextResponse.json({ success: true });
    }

    if (action === 'sync') {
      const { error } = await supabaseAdmin.from('alldding_users').update({
        settings,
        updated_at: new Date().toISOString()
      }).eq('username', username);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}