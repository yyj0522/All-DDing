import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { itemName, price, type } = data;

    if (!itemName || typeof price !== 'number') {
      return NextResponse.json(
        { error: '잘못된 데이터 형식입니다.' },
        { status: 400 }
      );
    }

    console.log(`[시세 업데이트 수신] 타입: ${type} | 아이템: ${itemName} | 평균가/상점가: ${price}G`);

    return NextResponse.json({ 
      success: true, 
      message: `${itemName}의 시세가 성공적으로 업데이트 되었습니다.` 
    });

  } catch (error) {
    console.error('시세 업데이트 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}