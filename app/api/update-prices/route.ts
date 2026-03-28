import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // 추가된 부분
import { getCookingPeriod, getCraftingPeriod, FOOD_NAMES, CRAFT_NAMES } from '@/lib/professionData';

export const runtime = 'edge';

const SECRET_TOKEN = process.env.NEXT_PUBLIC_SCANNER_TOKEN || 'alldding123';

// 중요: 익명(Anon) 키가 아닌 관리자(Service Role) 키를 사용하여 클라이언트 생성
// 환경변수에 SUPABASE_SERVICE_ROLE_KEY가 설정되어 있어야 합니다.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (token !== SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized: 잘못된 토큰입니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { prices } = body; 

    if (!prices || typeof prices !== 'object') {
      return NextResponse.json({ error: 'Invalid payload: 데이터 형식이 잘못되었습니다.' }, { status: 400 });
    }

    const currentCooking = getCookingPeriod();
    const currentCrafting = getCraftingPeriod();
    const updates: any[] = [];

    for (const [itemName, price] of Object.entries(prices)) {
      let category = '';
      let period = '';

      if (FOOD_NAMES.includes(itemName)) {
        category = 'food';
        period = currentCooking;
      } else if (CRAFT_NAMES.includes(itemName)) {
        category = 'craft';
        period = currentCrafting;
      } else {
        continue; 
      }

      updates.push({
        item_name: itemName,
        price: price,
        category: category,
        period: period,
      });
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: '등록할 수 있는 요리 또는 공예품 데이터가 없습니다.' }, { status: 400 });
    }

    // 기존 supabase 대신 supabaseAdmin 사용
    // 관리자 권한이므로 RLS 정책을 무시하고 데이터를 강제로 넣거나 수정할 수 있습니다.
    const { error } = await supabaseAdmin
      .from('item_prices')
      .upsert(updates, { onConflict: 'item_name, period' });

    if (error) throw error;

    return NextResponse.json({ success: true, message: '스마트 시세 업데이트 완료!', updatedCount: updates.length });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}