'use client';

import { useState } from 'react';

const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main/barista";

const CUSTOMERS = [
  { lv: 0, name: 'C급 샐리', id: 'npc_sally', grade: 'RARE', color: 'text-blue-500 dark:text-blue-400', border: 'border-blue-500/20 dark:border-blue-500/30', bg: 'bg-blue-100 dark:bg-blue-500/10', glow: 'from-blue-200 dark:from-blue-500/20' },
  { lv: 1, name: 'B급 빈센트', id: 'npc_vincent', grade: 'EPIC', color: 'text-purple-500 dark:text-purple-400', border: 'border-purple-500/20 dark:border-purple-500/30', bg: 'bg-purple-100 dark:bg-purple-500/10', glow: 'from-purple-200 dark:from-purple-500/20' },
  { lv: 2, name: 'A급 웬디', id: 'npc_wendy', grade: 'LEGENDARY', color: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/30 dark:border-yellow-500/30', bg: 'bg-yellow-100 dark:bg-yellow-500/10', glow: 'from-yellow-200 dark:from-yellow-500/20' },
  { lv: 3, name: 'S급 아이비', id: 'npc_ivy', grade: 'MYTHIC', color: 'text-red-500 dark:text-red-400', border: 'border-red-500/20 dark:border-red-500/30', bg: 'bg-red-100 dark:bg-red-500/10', glow: 'from-red-200 dark:from-red-500/20' }
];

const INGREDIENT_IMAGES: Record<string, string> = {
  "머그컵": "mug_cup",
  "유리컵": "glass_cup",
  "커피 가루": "coffee_powder",
  "뜨거운 큐브": "hot_cube",
  "차가운 큐브": "cold_cube",
  "스팀 우유": "steam_milk",
  "검정 분말": "black_powder",
  "초코 분말": "choco_powder",
  "순백 분말": "white_powder",
  "눈꽃 분말": "snow_powder",
  "숯 분말": "charcoal_powder",
  "버섯 분말": "mushroom_powder",
  "돌 분말": "stone_powder",
  "녹색 분말": "green_powder",
  "키 작은 잔디": "short-grass",
  "벚나무 원목": "Cherry_Log",
  "섬록암": "Diorite",
  "철 문": "iron-door",
  "자수정 블록": "Block_of_Amethyst",
  "황금 당근": "Golden_Carrot",
  "마그마 블록": "magma-block",
  "얼음": "Ice",
  "먹물 주머니": "Ink_Sac",
  "코코아 콩": "Cocoa_Beans",
  "뼛가루": "Bone_Meal",
  "사탕수수": "Sugar_Cane",
  "숯": "Charcoal",
  "갈색 버섯": "Brown_Mushroom",
  "돌": "Stone",
  "대나무": "bamboo"
};

const COFFEES = [
  { name: '블랙 커피', id: 'black_coffee', price: 25600, reqLv: 0, req: ['머그컵 1개', '커피 가루 3개', '뜨거운 큐브 2개', '검정 분말 3개'] },
  { name: '카페 모카', id: 'cafe_mocha', price: 19200, reqLv: 0, req: ['머그컵 1개', '커피 가루 3개', '뜨거운 큐브 2개', '초코 분말 3개'] },
  { name: '화이트 모카', id: 'white_mocha', price: 16000, reqLv: 0, req: ['머그컵 1개', '커피 가루 3개', '뜨거운 큐브 2개', '순백 분말 3개'] },
  { name: '드립 커피', id: 'drip_coffee', price: 22400, reqLv: 0, req: ['유리컵 1개', '커피 가루 3개', '차가운 큐브 1개', '눈꽃 분말 3개'] },
  { name: '콜드 브루', id: 'cold_brew', price: 32000, reqLv: 0, req: ['유리컵 1개', '커피 가루 3개', '차가운 큐브 1개', '숯 분말 3개'] },
  { name: '아메리카노', id: 'americano', price: 28800, reqLv: 0, req: ['유리컵 1개', '커피 가루 3개', '차가운 큐브 1개', '버섯 분말 3개'] },
  { name: '플랫 마끼아또', id: 'flat_macchiato', price: 46000, reqLv: 1, req: ['머그컵 1개', '커피 가루 8개', '뜨거운 큐브 4개', '스팀 우유 2개', '순백 분말 8개'] },
  { name: '머쉬룸 마끼아또', id: 'mushroom_macchiato', price: 51000, reqLv: 1, req: ['머그컵 1개', '커피 가루 8개', '뜨거운 큐브 4개', '스팀 우유 2개', '버섯 분말 8개'] },
  { name: '코코아 마끼아또', id: 'cocoa_macchiato', price: 31000, reqLv: 1, req: ['머그컵 1개', '커피 가루 8개', '뜨거운 큐브 4개', '스팀 우유 2개', '초코 분말 8개'] },
  { name: '돌체 라떼', id: 'dolce_latte', price: 38000, reqLv: 1, req: ['유리컵 1개', '커피 가루 8개', '차가운 큐브 4개', '스팀 우유 2개', '돌 분말 8개'] },
  { name: '그린티 라떼', id: 'greentea_latte', price: 25000, reqLv: 1, req: ['유리컵 1개', '커피 가루 8개', '차가운 큐브 4개', '스팀 우유 2개', '녹색 분말 8개'] },
  { name: '우드 라떼', id: 'wood_latte', price: 57000, reqLv: 1, req: ['유리컵 1개', '커피 가루 8개', '차가운 큐브 4개', '스팀 우유 2개', '숯 분말 8개'] },
  { name: '플라워 카푸치노', id: 'flower_cappuccino', price: 37000, reqLv: 2, req: ['머그컵 1개', '커피 가루 12개', '뜨거운 큐브 6개', '스팀 우유 4개', '눈꽃 분말 12개'] },
  { name: '썬더 카푸치노', id: 'thunder_cappuccino', price: 71000, reqLv: 2, req: ['머그컵 1개', '커피 가루 12개', '뜨거운 큐브 6개', '스팀 우유 4개', '숯 분말 12개'] },
  { name: '가든 카푸치노', id: 'garden_cappuccino', price: 45000, reqLv: 2, req: ['머그컵 1개', '커피 가루 12개', '뜨거운 큐브 6개', '스팀 우유 4개', '녹색 분말 12개'] },
  { name: '스톤 블렌디드', id: 'stone_blended', price: 64000, reqLv: 2, req: ['유리컵 1개', '커피 가루 12개', '차가운 큐브 6개', '스팀 우유 4개', '돌 분말 12개'] },
  { name: '쿠키 블렌디드', id: 'cookie_blended', price: 53000, reqLv: 2, req: ['유리컵 1개', '커피 가루 12개', '차가운 큐브 6개', '스팀 우유 4개', '초코 분말 12개'] },
  { name: '다크 블렌디드', id: 'dark_blended', price: 78000, reqLv: 2, req: ['유리컵 1개', '커피 가루 12개', '차가운 큐브 6개', '스팀 우유 4개', '검정 분말 12개'] },
  { name: '그린트리 프라페', id: 'greentree_frappe', price: 56000, reqLv: 3, req: ['유리컵 1개', '커피 가루 16개', '차가운 큐브 8개', '스팀 우유 6개', '녹색 분말 16개', '키 작은 잔디 4개'] },
  { name: '체리 블로썸', id: 'cherryblossom_frappe', price: 45000, reqLv: 3, req: ['유리컵 1개', '커피 가루 16개', '차가운 큐브 8개', '스팀 우유 6개', '순백 분말 16개', '벚나무 원목 4개'] },
  { name: '프로즌 스노우 프라페', id: 'frozensnow_frappe', price: 91200, reqLv: 3, req: ['유리컵 1개', '커피 가루 16개', '차가운 큐브 8개', '스팀 우유 6개', '순백 분말 16개', '섬록암 4개'] },
  { name: '실버문 아인슈페너', id: 'silvermoon_einspanner', price: 67000, reqLv: 3, req: ['머그컵 1개', '커피 가루 16개', '뜨거운 큐브 8개', '스팀 우유 6개', '돌 분말 16개', '철 문 1개'] },
  { name: '오로라 아인슈페너', id: 'aurora_einspanner', price: 100800, reqLv: 3, req: ['머그컵 1개', '커피 가루 16개', '뜨거운 큐브 8개', '스팀 우유 6개', '검정 분말 16개', '자수정 블록 2개'] },
  { name: '골든 아인슈페너', id: 'golden_einspanner', price: 81600, reqLv: 3, req: ['머그컵 1개', '커피 가루 16개', '뜨거운 큐브 8개', '스팀 우유 6개', '버섯 분말 16개', '황금 당근 4개'] }
];

export default function BaristaTab() {
  const [selectedNpc, setSelectedNpc] = useState<number>(0);

  const renderIngredient = (reqStr: string) => {
    const match = reqStr.match(/(.+)\s(\d+)개/);
    if (match) {
      const name = match[1];
      const count = match[2];
      const imgId = INGREDIENT_IMAGES[name];
      if (imgId) {
        return (
          <span key={reqStr} className="flex items-center gap-1.5 text-[10px] sm:text-xs bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 transition-colors">
            <img src={`${STORAGE_BASE_URL}/${imgId}.png`} alt={name} className="w-4 h-4 object-contain" style={{imageRendering: 'pixelated'}} onError={(e) => e.currentTarget.style.display='none'} />
            <span>{name} <span className="text-amber-600 dark:text-amber-400 font-bold">{count}</span></span>
          </span>
        );
      }
      return (
        <span key={reqStr} className="flex items-center gap-1 text-[10px] sm:text-xs bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 transition-colors">
          <span>{name} <span className="text-gray-700 dark:text-gray-300 font-bold">{count}</span></span>
        </span>
      );
    }
    return <span key={reqStr} className="text-[10px] sm:text-xs bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/5 transition-colors">{reqStr}</span>;
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in-up mt-4 transition-colors">
      <div className="flex flex-wrap justify-center gap-3 w-full mb-2">
        {CUSTOMERS.map((cust) => (
          <button
            key={cust.lv}
            onClick={() => setSelectedNpc(cust.lv)}
            className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-3 rounded-2xl font-bold transition-all duration-300 border ${
              selectedNpc === cust.lv
                ? `${cust.bg} ${cust.border} ${cust.color} shadow-sm dark:shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-105`
                : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10'
            }`}
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/10 flex items-center justify-center p-0.5 transition-colors">
              <img src={`${STORAGE_BASE_URL}/${cust.id}.png`} alt={cust.name} className="w-full h-full object-contain rounded-full" onError={(e) => e.currentTarget.style.display='none'} />
            </div>
            <span className="text-sm sm:text-base">{cust.name}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {CUSTOMERS.filter(c => c.lv === selectedNpc).map((cust) => (
          <div key={cust.lv} className={`bg-white dark:bg-[#0a0a0a] border ${cust.border} rounded-[2rem] flex flex-col shadow-sm dark:shadow-2xl overflow-hidden relative transition-colors`}>
            <div className={`absolute top-0 left-0 w-full h-48 sm:h-64 bg-gradient-to-b ${cust.glow} to-transparent opacity-40 pointer-events-none transition-colors`}></div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 sm:gap-6 py-4 px-6 sm:px-12 relative z-10 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20 transition-colors">
              <div className="w-32 h-32 sm:w-40 sm:h-40 relative flex-shrink-0 drop-shadow-md dark:drop-shadow-[0_15px_20px_rgba(0,0,0,0.8)]">
                <img 
                  src={`${STORAGE_BASE_URL}/${cust.id}.png`} 
                  alt={cust.name} 
                  className="w-full h-full object-contain relative z-10" 
                  onError={(e) => e.currentTarget.style.display='none'} 
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
                <h4 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white transition-colors">{cust.name}</h4>
                <span className={`text-[10px] sm:text-xs font-black tracking-widest ${cust.color} ${cust.bg} px-4 py-1.5 sm:py-2 rounded-full border ${cust.border} whitespace-nowrap transition-colors`}>
                  {cust.grade} 등급 전용 커피
                </span>
              </div>
            </div>

            <div className="p-6 md:p-10 bg-white dark:bg-[#0a0a0a] relative z-10 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {COFFEES.filter(c => c.reqLv === cust.lv).map(coffee => (
                  <div key={coffee.id} className="bg-gray-50 dark:bg-[#111] rounded-2xl p-5 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-colors group shadow-sm flex flex-col h-full">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-2 flex items-center justify-center shadow-sm dark:shadow-inner group-hover:scale-110 transition-transform">
                          <img src={`${STORAGE_BASE_URL}/${coffee.id}.png`} alt={coffee.name} className="w-full h-full object-contain" style={{imageRendering: 'pixelated'}} onError={(e) => e.currentTarget.style.display='none'} />
                        </div>
                        <span className="text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{coffee.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-500/10 px-2 sm:px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-500/20 whitespace-nowrap transition-colors">{coffee.price.toLocaleString()} G</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {coffee.req.map((r) => renderIngredient(r))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm dark:shadow-2xl relative overflow-hidden transition-colors">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2 relative z-10 transition-colors">
            믹서기 가공 레시피
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 relative z-10">
            {[
              { n: '뜨거운 큐브', r: '마그마 블록 4개' }, { n: '차가운 큐브', r: '얼음 4개' },
              { n: '검정 분말', r: '먹물 주머니 4개' }, { n: '초코 분말', r: '코코아 콩 16개' },
              { n: '순백 분말', r: '뼛가루 8개' }, { n: '눈꽃 분말', r: '사탕수수 8개' },
              { n: '숯 분말', r: '숯 4개' }, { n: '버섯 분말', r: '갈색 버섯 4개' },
              { n: '돌 분말', r: '돌 16개' }, { n: '녹색 분말', r: '대나무 16개' }
            ].map((mix, idx) => {
              const imgId = INGREDIENT_IMAGES[mix.n];
              return (
                <div key={idx} className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center text-center hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all duration-300 group hover:bg-emerald-50 dark:hover:bg-emerald-900/10 shadow-sm dark:shadow-lg h-full">
                  {imgId && (
                    <div className="w-12 h-12 mb-3 bg-white dark:bg-black/50 rounded-xl p-2 flex items-center justify-center border border-gray-200 dark:border-white/10 group-hover:scale-110 group-hover:border-emerald-300 dark:group-hover:border-emerald-500/50 transition-all shadow-sm dark:shadow-inner flex-shrink-0">
                      <img src={`${STORAGE_BASE_URL}/${imgId}.png`} alt={mix.n} className="w-full h-full object-contain" style={{imageRendering: 'pixelated'}} onError={(e) => e.currentTarget.style.display='none'} />
                    </div>
                  )}
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mb-3 flex-grow transition-colors">{mix.n}</span>
                  {renderIngredient(mix.r)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}