import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCookingPeriod, getCraftingPeriod, FOOD_NAMES, CRAFT_NAMES } from '@/lib/professionData';

export const runtime = 'edge';

const SECRET_TOKEN = process.env.NEXT_PUBLIC_SCANNER_TOKEN || 'alldding123';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (token !== SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON Syntax' }, { status: 400 });
    }

    const { prices } = body; 

    if (!prices || typeof prices !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const currentCooking = getCookingPeriod();
    const currentCrafting = getCraftingPeriod();
    const updates: any[] = [];

    for (const [itemName, rawPrice] of Object.entries(prices)) {
      const priceStr = String(rawPrice).replace(/,/g, '').replace(/[^0-9]/g, '');
      const numericPrice = parseInt(priceStr, 10);

      if (isNaN(numericPrice)) continue;

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
        price: numericPrice,
        category: category,
        period: period,
      });
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid items found' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('item_prices')
      .upsert(updates, { onConflict: 'item_name, period' });

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updatedCount: updates.length });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}