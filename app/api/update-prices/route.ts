import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCookingPeriod, getCraftingPeriod } from '@/lib/professionData';

const SECRET_TOKEN = process.env.NEXT_PUBLIC_SCANNER_TOKEN || 'alldding123';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (token !== SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized: 잘못된 토큰입니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { category, prices } = body;

    if (!category || !prices || typeof prices !== 'object') {
      return NextResponse.json({ error: 'Invalid payload: 데이터 형식이 잘못되었습니다.' }, { status: 400 });
    }

    let period = 'current';
    if (category === 'food') {
      period = getCookingPeriod();
    } else if (category === 'craft') {
      period = getCraftingPeriod();
    }

    const updates = Object.entries(prices).map(([itemName, price]) => ({
      item_name: itemName,
      price: price,
      category: category,
      period: period,
    }));

    const { error } = await supabase
      .from('item_prices')
      .upsert(updates, { onConflict: 'item_name, period' });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: '시세 업데이트 완료!', updatedCount: updates.length });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}