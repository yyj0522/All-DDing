'use client';

import { useState, useEffect, useMemo } from 'react';

const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main/barista";
const ROOT_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

const CUSTOMERS = [
  { lv: 0, name: 'C급 샐리', id: 'npc_sally', grade: 'RARE', color: 'text-blue-600 dark:text-blue-400', border: 'border-blue-300 dark:border-transparent', bg: 'bg-blue-50 dark:bg-blue-500/10', glow: 'from-blue-200 dark:from-blue-500/20', greet: '반가워요! 오늘은 산뜻하고 가벼운 기본 커피들이 당기네요.' },
  { lv: 1, name: 'B급 빈센트', id: 'npc_vincent', grade: 'EPIC', color: 'text-purple-600 dark:text-purple-400', border: 'border-purple-300 dark:border-transparent', bg: 'bg-purple-50 dark:bg-purple-500/10', glow: 'from-purple-200 dark:from-purple-500/20', greet: '어서 오십시오. 부드러운 우유와 풍미 깊은 라떼류 주문을 준비했습니다.' },
  { lv: 2, name: 'A급 웬디', id: 'npc_wendy', grade: 'LEGENDARY', color: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-400 dark:border-transparent', bg: 'bg-yellow-50 dark:bg-yellow-500/10', glow: 'from-yellow-200 dark:from-yellow-500/20', greet: '안녕? 달콤하고 시원하게 갈아낸 카푸치노와 블렌디드가 필요해!' },
  { lv: 3, name: 'S급 아이비', id: 'npc_ivy', grade: 'MYTHIC', color: 'text-red-600 dark:text-red-400', border: 'border-red-300 dark:border-transparent', bg: 'bg-red-50 dark:bg-red-500/10', glow: 'from-red-200 dark:from-red-500/20', greet: '기다리고 있었습니다. 최고 등급의 프라페와 아인슈페너를 제조해 주시죠.' }
];

const INGREDIENT_IMAGES: Record<string, string> = {
  "머그컵": "mug_cup", "유리컵": "glass_cup", "커피 가루": "coffee_powder",
  "뜨거운 큐브": "hot_cube", "차가운 큐브": "cold_cube", "스팀 우유": "steam_milk",
  "검정 분말": "black_powder", "초코 분말": "choco_powder", "순백 분말": "white_powder",
  "눈꽃 분말": "snow_powder", "숯 분말": "charcoal_powder", "버섯 분말": "mushroom_powder",
  "돌 분말": "stone_powder", "녹색 분말": "green_powder", "키 작은 잔디": "short-grass",
  "벚나무 원목": "Cherry_Log", "섬록암": "Diorite", "철 문": "iron-door",
  "자수정 블록": "Block_of_Amethyst", "황금 당근": "Golden_Carrot", "마그마 블록": "magma-block",
  "얼음": "Ice", "먹물 주머니": "Ink_Sac", "코코아 콩": "Cocoa_Beans",
  "뼛가루": "Bone_Meal", "사탕수수": "Sugar_Cane", "숯": "Charcoal",
  "갈색 버섯": "Brown_Mushroom", "돌": "Stone", "대나무": "bamboo", "원두": "coffee_beans"
};

const MIXER_RECIPES: Record<string, { item: string, qty: number }> = {
  "뜨거운 큐브": { item: "마그마 블록", qty: 4 }, "차가운 큐브": { item: "얼음", qty: 4 },
  "검정 분말": { item: "먹물 주머니", qty: 4 }, "초코 분말": { item: "코코아 콩", qty: 16 },
  "순백 분말": { item: "뼛가루", qty: 8 }, "눈꽃 분말": { item: "사탕수수", qty: 8 },
  "숯 분말": { item: "숯", qty: 4 }, "버섯 분말": { item: "갈색 버섯", qty: 4 },
  "돌 분말": { item: "돌", qty: 16 }, "녹색 분말": { item: "대나무", qty: 16 },
  "커피 가루": { item: "원두", qty: 1 }, "스팀 우유": { item: "요리용 우유", qty: 2 }
};

const COFFEES = [
  { name: '블랙 커피', id: 'black_coffee', price: 37171, reqLv: 0, req: ['머그컵 1개', '커피 가루 3개', '뜨거운 큐브 2개', '검정 분말 3개'] },
  { name: '카페 모카', id: 'cafe_mocha', price: 27878, reqLv: 0, req: ['머그컵 1개', '커피 가루 3개', '뜨거운 큐브 2개', '초코 분말 3개'] },
  { name: '화이트 모카', id: 'white_mocha', price: 23232, reqLv: 0, req: ['머그컵 1개', '커피 가루 3개', '뜨거운 큐브 2개', '순백 분말 3개'] },
  { name: '드립 커피', id: 'drip_coffee', price: 32525, reqLv: 0, req: ['유리컵 1개', '커피 가루 3개', '차가운 큐브 1개', '눈꽃 분말 3개'] },
  { name: '콜드 브루', id: 'cold_brew', price: 46464, reqLv: 0, req: ['유리컵 1개', '커피 가루 3개', '차가운 큐브 1개', '숯 분말 3개'] },
  { name: '아메리카노', id: 'americano', price: 41818, reqLv: 0, req: ['유리컵 1개', '커피 가루 3개', '차가운 큐브 1개', '버섯 분말 3개'] },
  { name: '플랫 마끼아또', id: 'flat_macchiato', price: 66792, reqLv: 1, req: ['머그컵 1개', '커피 가루 8개', '뜨거운 큐브 4개', '스팀 우유 2개', '순백 분말 8개'] },
  { name: '머쉬룸 마끼아또', id: 'mushroom_macchiato', price: 74052, reqLv: 1, req: ['머그컵 1개', '커피 가루 8개', '뜨거운 큐브 4개', '스팀 우유 2개', '버섯 분말 8개'] },
  { name: '코코아 마끼아또', id: 'cocoa_macchiato', price: 45012, reqLv: 1, req: ['머그컵 1개', '커피 가루 8개', '뜨거운 큐브 4개', '스팀 우유 2개', '초코 분말 8개'] },
  { name: '돌체 라떼', id: 'dolce_latte', price: 55176, reqLv: 1, req: ['유리컵 1개', '커피 가루 8개', '차가운 큐브 4개', '스팀 우유 2개', '돌 분말 8개'] },
  { name: '그린티 라떼', id: 'greentea_latte', price: 36300, reqLv: 1, req: ['유리컵 1개', '커피 가루 8개', '차가운 큐브 4개', '스팀 우유 2개', '녹색 분말 8개'] },
  { name: '우드 라떼', id: 'wood_latte', price: 82764, reqLv: 1, req: ['유리컵 1개', '커피 가루 8개', '차가운 큐브 4개', '스팀 우유 2개', '숯 분말 8개'] },
  { name: '플라워 카푸치노', id: 'flower_cappuccino', price: 53724, reqLv: 2, req: ['머그컵 1개', '커피 가루 12개', '뜨거운 큐브 6개', '스팀 우유 4개', '눈꽃 분말 12개'] },
  { name: '썬더 카푸치노', id: 'thunder_cappuccino', price: 103092, reqLv: 2, req: ['머그컵 1개', '커피 가루 12개', '뜨거운 큐브 6개', '스팀 우유 4개', '숯 분말 12개'] },
  { name: '가든 카푸치노', id: 'garden_cappuccino', price: 65340, reqLv: 2, req: ['머그컵 1개', '커피 가루 12개', '뜨거운 큐브 6개', '스팀 우유 4개', '녹색 분말 12개'] },
  { name: '스톤 블렌디드', id: 'stone_blended', price: 92928, reqLv: 2, req: ['유리컵 1개', '커피 가루 12개', '차가운 큐브 6개', '스팀 우유 4개', '돌 분말 12개'] },
  { name: '쿠키 블렌디드', id: 'cookie_blended', price: 76956, reqLv: 2, req: ['유리컵 1개', '커피 가루 12개', '차가운 큐브 6개', '스팀 우유 4개', '초코 분말 12개'] },
  { name: '다크 블렌디드', id: 'dark_blended', price: 113256, reqLv: 2, req: ['유리컵 1개', '커피 가루 12개', '차가운 큐브 6개', '스팀 우유 4개', '검정 분말 12개'] },
  { name: '그린트리 프라페', id: 'greentree_frappe', price: 81312, reqLv: 3, req: ['유리컵 1개', '커피 가루 16개', '차가운 큐브 8개', '스팀 우유 6개', '녹색 분말 16개', '키 작은 잔디 4개'] },
  { name: '체리 블로썸', id: 'cherryblossom_frappe', price: 65340, reqLv: 3, req: ['유리컵 1개', '커피 가루 16개', '차가운 큐브 8개', '스팀 우유 6개', '순백 분말 16개', '벚나무 원목 4개'] },
  { name: '프로즌 스노우 프라페', id: 'frozensnow_frappe', price: 132422, reqLv: 3, req: ['유리컵 1개', '커피 가루 16개', '차가운 큐브 8개', '스팀 우유 6개', '순백 분말 16개', '섬록암 4개'] },
  { name: '실버문 아인슈페너', id: 'silvermoon_einspanner', price: 97284, reqLv: 3, req: ['머그컵 1개', '커피 가루 16개', '뜨거운 큐브 8개', '스팀 우유 6개', '돌 분말 16개', '철 문 1개'] },
  { name: '오로라 아인슈페너', id: 'aurora_einspanner', price: 146362, reqLv: 3, req: ['머그컵 1개', '커피 가루 16개', '뜨거운 큐브 8개', '스팀 우유 6개', '검정 분말 16개', '자수정 블록 2개'] },
  { name: '골든 아인슈페너', id: 'golden_einspanner', price: 118483, reqLv: 3, req: ['머그컵 1개', '커피 가루 16개', '뜨거운 큐브 8개', '스팀 우유 6개', '버섯 분말 16개', '황금 당근 4개'] }
];

const F22_PRICE_BUFF = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.10, 0.15, 0.30, 0.50];

const getIngImage = (name: string) => {
  if (name === "요리용 우유") return `${ROOT_URL}/ingredients/cooking_milk.png`;
  const imgId = INGREDIENT_IMAGES[name];
  if (imgId) return `${STORAGE_BASE_URL}/${imgId}.png`;
  return `${STORAGE_BASE_URL}/default.png`;
};

export default function BaristaTab() {
  const [loaded, setLoaded] = useState(false);
  const [profLevels, setProfLevels] = useState<Record<string, number>>({});
  const [soldData, setSoldData] = useState<Record<string, number>>({});
  const [selectedNpcTab, setSelectedNpcTab] = useState<number>(0);
  
  const [guideViewMode, setGuideViewMode] = useState<'npc' | 'coffee'>('npc');
  const [selectedGuideNpc, setSelectedGuideNpc] = useState<number>(0);
  const [selectedGuideCoffee, setSelectedGuideCoffee] = useState<string>('');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(true);

  useEffect(() => {
    const savedProf = localStorage.getItem('alldding_profession');
    if (savedProf) {
      setProfLevels(JSON.parse(savedProf));
    }
    setLoaded(true);
  }, []);

  const f18Lv = profLevels['f18'] || 0;
  const f19Lv = profLevels['f19'] || 0;
  const f20Lv = profLevels['f20'] || 0;
  const f22Lv = profLevels['f22'] || 0;

  const slotsPerNpc = f20Lv + 1;
  const priceMultiplier = 1 + (F22_PRICE_BUFF[f22Lv] || 0);
  const unlockedCustomers = useMemo(() => CUSTOMERS.filter(c => c.lv <= f19Lv), [f19Lv]);

  const handleSoldChange = (coffeeId: string, delta: number) => {
    setSoldData(prev => {
      const cur = prev[coffeeId] || 0;
      return { ...prev, [coffeeId]: Math.max(0, cur + delta) };
    });
  };

  const activeNpcData = useMemo(() => CUSTOMERS.find(c => c.lv === selectedNpcTab) || CUSTOMERS[0], [selectedNpcTab]);
  const currentNpcCoffees = COFFEES.filter(c => c.reqLv === selectedNpcTab);
  const totalSoldForSelectedNpc = currentNpcCoffees.reduce((acc, c) => acc + (soldData[c.id] || 0), 0);
  const canAddMoreCoffee = totalSoldForSelectedNpc < slotsPerNpc;

  const npcGuides = useMemo(() => {
    return CUSTOMERS.map(cust => {
      const mMaterials: Record<string, number> = {};
      const mMixer: Record<string, number> = {};
      const mCoffees: { name: string; id: string; qty: number; req: string[] }[] = [];
      let mSales = 0;
      let mCups = 0;

      COFFEES.filter(c => c.reqLv === cust.lv).forEach(coffee => {
        const qty = soldData[coffee.id] || 0;
        if (qty > 0) {
          mSales += Math.floor(coffee.price * priceMultiplier) * qty;
          mCups += qty;
          mCoffees.push({ name: coffee.name, id: coffee.id, qty, req: coffee.req });

          coffee.req.forEach(reqStr => {
            const match = reqStr.match(/(.+)\s(\d+)개/);
            if (match) {
              const name = match[1];
              const count = Number(match[2]) * qty;
              if (MIXER_RECIPES[name]) {
                mMixer[name] = (mMixer[name] || 0) + count;
                const rawName = MIXER_RECIPES[name].item;
                const rawQty = MIXER_RECIPES[name].qty * count;
                mMaterials[rawName] = (mMaterials[rawName] || 0) + rawQty;
              } else {
                mMaterials[name] = (mMaterials[name] || 0) + count;
              }
            }
          });
        }
      });

      return { lv: cust.lv, name: cust.name, id: cust.id, coffees: mCoffees, materials: mMaterials, mixerItems: mMixer, sales: mSales, cups: mCups };
    });
  }, [soldData, priceMultiplier]);

  const coffeeGuides = useMemo(() => {
    const list: Record<string, { name: string; id: string; qty: number; sales: number; materials: Record<string, number>; mixerItems: Record<string, number> }> = {};
    
    COFFEES.forEach(coffee => {
      const qty = soldData[coffee.id] || 0;
      if (qty > 0) {
        const mMaterials: Record<string, number> = {};
        const mMixer: Record<string, number> = {};
        const sales = Math.floor(coffee.price * priceMultiplier) * qty;

        coffee.req.forEach(reqStr => {
          const match = reqStr.match(/(.+)\s(\d+)개/);
          if (match) {
            const name = match[1];
            const count = Number(match[2]) * qty;
            if (MIXER_RECIPES[name]) {
              mMixer[name] = (mMixer[name] || 0) + count;
              mMaterials[MIXER_RECIPES[name].item] = (mMaterials[MIXER_RECIPES[name].item] || 0) + MIXER_RECIPES[name].qty * count;
            } else {
              mMaterials[name] = (mMaterials[name] || 0) + count;
            }
          }
        });

        list[coffee.id] = { name: coffee.name, id: coffee.id, qty, sales, materials: mMaterials, mixerItems: mMixer };
      }
    });
    return list;
  }, [soldData, priceMultiplier]);

  const globalTotalSales = useMemo(() => npcGuides.reduce((sum, g) => sum + g.sales, 0), [npcGuides]);
  const globalTotalCups = useMemo(() => npcGuides.reduce((sum, g) => sum + g.cups, 0), [npcGuides]);
  const hasOrders = globalTotalCups > 0;

  const activeGuideData = useMemo(() => npcGuides.find(g => g.lv === selectedGuideNpc), [npcGuides, selectedGuideNpc]);
  const activeCoffeeGuideData = useMemo(() => coffeeGuides[selectedGuideCoffee], [coffeeGuides, selectedGuideCoffee]);

  useEffect(() => {
    if (hasOrders && !selectedGuideCoffee) {
      const activeIds = Object.keys(coffeeGuides);
      if (activeIds.length > 0) setSelectedGuideCoffee(activeIds[0]);
    }
  }, [hasOrders, coffeeGuides, selectedGuideCoffee]);

  const executeDownloadReceipt = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 700; canvas.height = 1100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#111113'; ctx.fillRect(0, 0, 700, 1100);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center';
    
    const dateStr = new Date().toISOString().split('T')[0];
    ctx.fillText(`${dateStr} 바리스타 영수증`, 350, 70);
    ctx.strokeStyle = '#333333'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(50, 100); ctx.lineTo(650, 100); ctx.stroke();

    ctx.textAlign = 'left';
    let y = 150; const lineH = 38;

    unlockedCustomers.forEach(cust => {
      const guide = npcGuides.find(g => g.lv === cust.lv);
      if (guide && guide.cups > 0) {
        ctx.font = 'bold 20px sans-serif'; ctx.fillStyle = '#8b5cf6';
        ctx.fillText(`${cust.name} 님 납품 내역`, 50, y);
        y += lineH;

        COFFEES.filter(c => c.reqLv === cust.lv).forEach(coffee => {
          const qty = soldData[coffee.id] || 0;
          if (qty > 0) {
            const bp = Math.floor(coffee.price * priceMultiplier);
            ctx.font = '18px sans-serif'; ctx.fillStyle = '#dddddd';
            ctx.fillText(`▶ ${coffee.name}`, 50, y);
            ctx.font = '16px sans-serif'; ctx.fillStyle = '#999999';
            ctx.fillText(`${qty}잔 x ${bp.toLocaleString()} G`, 320, y);
            ctx.textAlign = 'right'; ctx.fillStyle = '#ffffff';
            ctx.fillText(`${(bp * qty).toLocaleString()} G`, 650, y);
            ctx.textAlign = 'left';
            y += lineH;
          }
        });
        ctx.font = 'bold 16px sans-serif'; ctx.fillStyle = '#a78bfa';
        ctx.fillText(`소계 매출: ${guide.sales.toLocaleString()} G`, 50, y);
        y += lineH * 1.2;
      }
    });

    if (globalTotalCups === 0) {
      ctx.font = '18px sans-serif'; ctx.fillStyle = '#999999';
      ctx.fillText(`판매된 커피 내역이 존재하지 않습니다.`, 50, y);
      y += lineH;
    }

    y = Math.max(y, 780);
    
    ctx.font = '16px sans-serif'; ctx.fillStyle = '#a78bfa';
    ctx.fillText(`적용 스킬: 오늘 좀 한가하네? Lv.${f20Lv} / 커피값이 밥 값 Lv.${f22Lv}`, 50, y);
    y += lineH;

    ctx.strokeStyle = '#333333'; ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(650, y); ctx.stroke();
    y += 45;

    ctx.font = '22px sans-serif'; ctx.fillStyle = '#dddddd';
    ctx.fillText(`총 판매 잔 수: ${globalTotalCups} 잔`, 50, y);
    ctx.font = 'bold 34px sans-serif'; ctx.fillStyle = '#8b5cf6'; ctx.textAlign = 'right';
    ctx.fillText(`총 매출 합계: ${globalTotalSales.toLocaleString()} G`, 650, y + 45);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a'); a.href = url; a.download = `${dateStr}_바리스타_영수증.png`; a.click();
  };

  const renderIngredientNode = (name: string, count: number) => {
    return (
      <div key={name} className="flex items-center justify-between bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/5 px-4 py-3 rounded-xl shadow-sm transition-colors w-full">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={getIngImage(name)} alt="" className="w-5 h-5 object-contain shrink-0 drop-shadow-sm" style={{imageRendering: 'pixelated'}} />
          <span className="text-[11px] sm:text-xs font-black text-gray-800 dark:text-gray-200 truncate">{name}</span>
        </div>
        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 shrink-0">{count}개</span>
      </div>
    );
  };

  if (!loaded) return null;

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in-up mt-4 transition-colors pb-10" style={{ overflowAnchor: 'none' }}>
      
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[1.5rem] p-6 md:p-8 shadow-sm transition-colors">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 pb-6 border-b border-gray-200 dark:border-white/5 gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">실제 바리스타 정산</h3>
            <p className="text-[11px] md:text-xs font-bold text-gray-500 mt-1">인게임 주문에 맞춰 판매 수량을 기록하세요. 가이드라인에 실시간 연동됩니다.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-gray-50 dark:bg-black/50 p-4 rounded-2xl border border-gray-200 dark:border-white/5 shadow-inner w-full xl:w-auto">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 sm:flex sm:items-center sm:gap-6 pr-2">
              <div className="flex flex-col sm:items-end">
                <span className="text-[10px] font-bold text-gray-400">총 판매 잔 수</span>
                <span className="text-lg font-black text-gray-900 dark:text-white">{globalTotalCups} 잔</span>
              </div>
              <div className="flex flex-col sm:items-end">
                <span className="text-[10px] font-bold text-gray-400">당일 정산 총 매출액</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{globalTotalSales.toLocaleString()} G</span>
              </div>
            </div>
            <button type="button" onClick={executeDownloadReceipt} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-black px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 text-center whitespace-nowrap">
              영수증 이미지 출력
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          
          <div className="w-full lg:w-[320px] bg-gray-50 dark:bg-[#111113] rounded-3xl p-6 border border-gray-200 dark:border-white/5 flex flex-col items-center shrink-0 shadow-inner relative justify-between">
            <div className="flex flex-col items-center w-full mt-2">
              <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-4">현재 응대 손님</span>
              <div className="w-full h-64 sm:h-80 flex items-center justify-center mb-6 relative mt-4">
                <img src={`${STORAGE_BASE_URL}/${activeNpcData.id}.png`} alt={activeNpcData.name} className="w-full h-full object-contain relative z-10 drop-shadow-xl scale-[1.3] sm:scale-[1.5] -translate-x-6" style={{imageRendering:'pixelated'}} />
              </div>
              <span className={`text-[11px] sm:text-xs font-black px-4 py-1.5 rounded-full border shadow-sm ${activeNpcData.bg} ${activeNpcData.border} ${activeNpcData.color} mb-5`}>
                {activeNpcData.name}
              </span>
              
              <div className="bg-white dark:bg-black p-5 rounded-2xl border border-gray-200 dark:border-white/10 relative w-full text-center shadow-sm">
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-relaxed break-keep">
                  "{activeNpcData.greet}"
                </p>
                <p className="text-[10px] font-black text-indigo-500 mt-3">
                  주문 한도: <span className="underline font-black text-indigo-600 dark:text-indigo-400">{totalSoldForSelectedNpc}</span> / {slotsPerNpc}잔 납품 중
                </p>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto custom-scrollbar w-full mt-6 pt-4 border-t border-gray-200 dark:border-white/5 pb-2">
              {CUSTOMERS.map((cust) => {
                const isSelected = selectedNpcTab === cust.lv;
                return (
                  <button
                    type="button"
                    key={cust.lv}
                    onClick={() => setSelectedNpcTab(cust.lv)}
                    className={`py-2.5 px-4 rounded-xl font-black text-center text-xs tracking-tight transition-all border whitespace-nowrap flex-1 ${
                      isSelected
                        ? `${cust.bg} border-transparent ${cust.color} shadow-sm`
                        : 'bg-white dark:bg-[#0a0a0c] border-gray-200 dark:border-white/5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    {cust.name.split(' ')[1]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {currentNpcCoffees.map(coffee => {
              const buffedPrice = Math.floor(coffee.price * priceMultiplier);
              const qty = soldData[coffee.id] || 0;
              return (
                <div key={coffee.id} className={`bg-gray-50 dark:bg-[#111113] rounded-3xl p-5 border transition-all flex flex-col h-full ${qty > 0 ? 'border-indigo-400 dark:border-indigo-500/50 shadow-md' : 'border-gray-200 dark:border-white/5 shadow-sm'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-transparent p-1.5 flex items-center justify-center shadow-sm">
                        <img src={`${STORAGE_BASE_URL}/${coffee.id}.png`} alt="" className="w-full h-full object-contain drop-shadow-sm" style={{imageRendering: 'pixelated'}} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-black tracking-tight text-gray-900 dark:text-white">{coffee.name}</span>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">단가 {buffedPrice.toLocaleString()}G</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-5">
                    {coffee.req.map(r => {
                      const match = r.match(/(.+)\s(\d+)개/);
                      if (match) {
                        const name = match[1];
                        const count = match[2];
                        return (
                          <div key={r} className="flex items-center justify-between text-[10px] font-bold bg-white dark:bg-black/40 text-gray-700 dark:text-gray-300 px-2.5 py-1.5 rounded border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="flex items-center gap-1.5">
                                <img src={getIngImage(name)} className="w-3.5 h-3.5 object-contain drop-shadow-sm" style={{imageRendering:'pixelated'}} alt="" />
                                <span>{name}</span>
                            </div>
                            <span className="text-gray-900 dark:text-white">{count}개</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <div className="mt-auto pt-3 border-t border-gray-200 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-black text-gray-500">오늘 납품 수량</span>
                    <div className="flex items-center gap-1 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/10 p-1 shadow-inner">
                      <button type="button" onClick={() => handleSoldChange(coffee.id, -1)} disabled={qty === 0} className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-[#1a1a1e] hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-600 dark:text-gray-400 disabled:opacity-30 transition-colors cursor-pointer border border-gray-200 dark:border-transparent active:scale-95">
                        <span className="text-lg font-black leading-none mb-0.5">-</span>
                      </button>
                      <span className="text-[13px] font-black text-indigo-600 dark:text-indigo-400 w-8 text-center">{qty}</span>
                      <button type="button" onClick={() => handleSoldChange(coffee.id, 1)} disabled={!canAddMoreCoffee} className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-[#1a1a1e] hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-600 dark:text-gray-400 disabled:opacity-30 transition-colors cursor-pointer border border-gray-200 dark:border-transparent active:scale-95">
                        <span className="text-lg font-black leading-none mb-0.5">+</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {hasOrders && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[1.5rem] p-5 md:p-6 shadow-md dark:shadow-2xl transition-colors">
          <div 
            className="flex justify-between items-center cursor-pointer select-none group mb-2"
            onClick={() => setIsGuideOpen(!isGuideOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
              <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                바리스타 제조 가이드
              </h3>
            </div>
            <button type="button" className="text-[11px] font-black text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors">
              {isGuideOpen ? '가이드 접기' : '가이드 펼치기'}
            </button>
          </div>

          <div className={`transition-all duration-300 overflow-hidden ${isGuideOpen ? 'max-h-[8000px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20 flex-1 flex flex-col justify-center">
                <span className="text-xs font-black text-indigo-800 dark:text-indigo-300">오늘 좀 한가하네? Lv.{f20Lv}</span>
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-1 break-keep">NPC당 최대 납품 한도가 {slotsPerNpc}잔으로 확장 적용 중입니다.</p>
              </div>
              <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-500/20 flex-1 flex flex-col justify-center">
                <span className="text-xs font-black text-amber-800 dark:text-amber-300">커피값이 밥 값 Lv.{f22Lv}</span>
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1 break-keep">모든 커피 판매 금액에 +{Math.round((priceMultiplier - 1) * 100)}% 추가 수익이 적용 중입니다.</p>
              </div>
            </div>

            <div className="flex bg-gray-50 dark:bg-[#111113] p-1.5 rounded-xl border border-gray-200 dark:border-white/5 shadow-inner w-max mb-6">
              <button type="button" onClick={() => setGuideViewMode('npc')} className={`px-5 py-2 rounded-lg text-[11px] font-black transition-all ${guideViewMode === 'npc' ? 'bg-white dark:bg-[#1a1a1e] text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-transparent' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>손님별 정산 보기</button>
              <button type="button" onClick={() => setGuideViewMode('coffee')} className={`px-5 py-2 rounded-lg text-[11px] font-black transition-all ${guideViewMode === 'coffee' ? 'bg-white dark:bg-[#1a1a1e] text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-transparent' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>커피 종류별 레시피 보기</button>
            </div>

            {guideViewMode === 'npc' && (
              <>
                <div className="flex gap-2 overflow-x-auto custom-scrollbar w-full mb-6 border-b border-gray-200 dark:border-white/5 pb-4">
                  {unlockedCustomers.map(cust => {
                    const guide = npcGuides.find(g => g.lv === cust.lv);
                    if (!guide || guide.cups === 0) return null;
                    const isSelected = selectedGuideNpc === cust.lv;
                    return (
                      <button
                        type="button"
                        key={cust.lv}
                        onClick={() => setSelectedGuideNpc(cust.lv)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black transition-all border whitespace-nowrap ${
                          isSelected ? `${cust.bg} border-transparent ${cust.color} shadow-sm` : 'bg-gray-50 dark:bg-[#111113] border-gray-200 dark:border-white/5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                      >
                        <img src={`${STORAGE_BASE_URL}/${cust.id}.png`} alt="" className="w-5 h-5 rounded-full object-contain" />
                        <span>{cust.name} ({guide.cups}잔)</span>
                      </button>
                    );
                  })}
                </div>

                {activeGuideData && activeGuideData.cups > 0 ? (
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-inner">
                      <h4 className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg w-max border border-indigo-200 dark:border-transparent mb-4">확정된 주문 내역</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                        {activeGuideData.coffees.map(item => {
                          const coffeeInfo = COFFEES.find(c => c.id === item.id);
                          const bp = coffeeInfo ? Math.floor(coffeeInfo.price * priceMultiplier) : 0;
                          return (
                            <div key={item.id} className="bg-white dark:bg-black/40 p-3.5 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col justify-between shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors">
                              <div className="flex items-center gap-2.5 min-w-0 mb-2">
                                <div className="w-7 h-7 bg-gray-50 dark:bg-white/5 rounded-lg flex items-center justify-center p-1 shrink-0">
                                  <img src={`${STORAGE_BASE_URL}/${item.id}.png`} alt="" className="w-full h-full object-contain drop-shadow-sm" style={{imageRendering:'pixelated'}} />
                                </div>
                                <span className="text-[11px] font-black text-gray-900 dark:text-white truncate">{item.name}</span>
                              </div>
                              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-white/5">
                                <span className="text-[10px] font-bold text-gray-500">단가 {bp.toLocaleString()}G</span>
                                <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400">{item.qty} 잔</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <div className="bg-gray-50 dark:bg-[#111113] p-5 rounded-2xl border border-gray-200 dark:border-transparent flex flex-col shadow-inner">
                        <h5 className="text-[11px] font-black text-gray-800 dark:text-gray-200 mb-4 pb-3 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
                          <span className="w-4 h-4 rounded bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">1</span>
                          필요 바닐라 재료
                        </h5>
                        <div className="flex flex-col gap-2 flex-1">
                          {Object.entries(activeGuideData.materials).map(([name, count]) => renderIngredientNode(name, count))}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-[#111113] p-5 rounded-2xl border border-gray-200 dark:border-transparent flex flex-col shadow-inner">
                        <h5 className="text-[11px] font-black text-gray-800 dark:text-gray-200 mb-4 pb-3 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
                          <span className="w-4 h-4 rounded bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">2</span>
                          믹서기 & 스티머 1차 가공 (몽글몽글 적용: {4 + f18Lv}칸)
                        </h5>
                        <div className="flex flex-col gap-2 flex-1">
                          {Object.entries(activeGuideData.mixerItems).map(([name, count]) => renderIngredientNode(name, count))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 bg-gray-50 dark:bg-[#111113] rounded-2xl border border-dashed border-gray-200 dark:border-white/5">
                    <p className="text-[11px] text-gray-400 font-bold">주문 수량을 기록한 뒤 가이드를 활성화할 손님 버튼을 선택해 주세요.</p>
                  </div>
                )}
              </>
            )}

            {guideViewMode === 'coffee' && (
              <>
                <div className="flex gap-2 overflow-x-auto custom-scrollbar w-full mb-6 border-b border-gray-200 dark:border-white/5 pb-4">
                  {Object.values(coffeeGuides).map(coffee => {
                    const isSelected = selectedGuideCoffee === coffee.id;
                    return (
                      <button
                        type="button"
                        key={coffee.id}
                        onClick={() => setSelectedGuideCoffee(coffee.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black transition-all border whitespace-nowrap ${
                          isSelected ? 'bg-indigo-50 border-transparent text-indigo-600 shadow-sm dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-50 dark:bg-[#111113] border-gray-200 dark:border-white/5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                      >
                        <img src={`${STORAGE_BASE_URL}/${coffee.id}.png`} alt="" className="w-5 h-5 object-contain" style={{imageRendering:'pixelated'}} />
                        <span>{coffee.name} ({coffee.qty}잔)</span>
                      </button>
                    );
                  })}
                </div>

                {activeCoffeeGuideData ? (
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="bg-indigo-50 dark:bg-[#111113] border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-5 flex justify-between items-center px-6 shadow-sm">
                      <span className="text-[11px] font-black text-indigo-800 dark:text-indigo-300">해당 커피 품목 예상 매출액</span>
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{activeCoffeeGuideData.sales.toLocaleString()} G</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <div className="bg-gray-50 dark:bg-[#111113] p-5 rounded-2xl border border-gray-200 dark:border-transparent flex flex-col shadow-inner">
                        <h5 className="text-[11px] font-black text-gray-800 dark:text-gray-200 mb-4 pb-3 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
                          <span className="w-4 h-4 rounded bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">1</span>
                          필수 하위 기초 재료 리스트
                        </h5>
                        <div className="flex flex-col gap-2 flex-1">
                          {Object.entries(activeCoffeeGuideData.materials).map(([name, count]) => renderIngredientNode(name, count))}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-[#111113] p-5 rounded-2xl border border-gray-200 dark:border-transparent flex flex-col shadow-inner">
                        <h5 className="text-[11px] font-black text-gray-800 dark:text-gray-200 mb-4 pb-3 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
                          <span className="w-4 h-4 rounded bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">2</span>
                          믹서기 전용 가공 가이드 수량
                        </h5>
                        <div className="flex flex-col gap-2 flex-1">
                          {Object.entries(activeCoffeeGuideData.mixerItems).map(([name, count]) => renderIngredientNode(name, count))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 bg-gray-50 dark:bg-[#111113] rounded-2xl border border-dashed border-gray-200 dark:border-white/5">
                    <p className="text-[11px] text-gray-400 font-bold">분석 가이드를 조회할 커피 품목 버튼을 선택해 주세요.</p>
                  </div>
                )}
              </>
            )}

            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20 text-[11px] font-bold text-emerald-800 dark:text-emerald-400 mt-6 shadow-sm">
              안내: 제작 완료된 재료들을 인벤토리에 지참하여 커피 머신 모듈에서 최종 제작 후 납품을 완료하세요!
            </div>
          </div>
        </div>
      )}

    </div>
  );
}