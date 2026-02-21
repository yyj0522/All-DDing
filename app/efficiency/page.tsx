'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

const SKILL_BONUS = [0.0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.1, 0.15, 0.3, 0.5];

const RECIPES = [
  { id: "c01", name: "토마토 스파게티", basePrice: 576, maxPrice: 864, isHard: false, ingredients: { "토마토 베이스": 1, "호박 묶음": 1 } },
  { id: "c02", name: "어니언 링", basePrice: 864, maxPrice: 1296, isHard: false, ingredients: { "양파 베이스": 1, "감자 묶음": 1 } },
  { id: "c03", name: "갈릭 케이크", basePrice: 540, maxPrice: 810, isHard: false, ingredients: { "마늘 베이스": 1, "당근 묶음": 1 } },
  { id: "c04", name: "삼겹살 토마토 찌개", basePrice: 1359, maxPrice: 2039, isHard: false, ingredients: { "토마토 베이스": 2, "비트 묶음": 1, "요리용 소금": 1, "익힌 돼지고기": 1, "익힌 돼지 삼겹살": 1 } },
  { id: "c05", name: "삼색 아이스크림", basePrice: 2014, maxPrice: 3022, isHard: true, ingredients: { "양파 베이스": 2, "수박 묶음": 1, "코코넛": 1, "설탕 큐브": 1, "요리용 우유": 1 } },
  { id: "c06", name: "마늘 양갈비 핫도그", basePrice: 1221, maxPrice: 1832, isHard: false, ingredients: { "마늘 베이스": 2, "감자 묶음": 1, "오일": 1, "익힌 양고기": 1, "익힌 양 갈비살": 1 } },
  { id: "c07", name: "달콤 시리얼", basePrice: 1718, maxPrice: 2578, isHard: true, ingredients: { "토마토 베이스": 2, "달콤한 열매 묶음": 1, "파인애플": 1, "밀가루 반죽": 1, "오일": 1 } },
  { id: "c08", name: "로스트 치킨 파이", basePrice: 1502, maxPrice: 2253, isHard: false, ingredients: { "마늘 베이스": 2, "당근 묶음": 1, "버터 조각": 1, "익힌 닭고기": 1, "익힌 닭 다리살": 1 } },
  { id: "c09", name: "스윗 치킨 햄버거", basePrice: 2408, maxPrice: 3612, isHard: false, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "비트 묶음": 1, "달콤한 열매 묶음": 1, "익힌 닭 가슴살": 1, "익힌 닭 다리살": 1 } },
  { id: "c10", name: "토마토 파인애플 피자", basePrice: 2303, maxPrice: 3455, isHard: true, ingredients: { "토마토 베이스": 2, "마늘 베이스": 2, "파인애플": 1, "치즈 조각": 1, "스테이크": 1, "익힌 소 등심": 1 } },
  { id: "c11", name: "양파 수프", basePrice: 2531, maxPrice: 3797, isHard: true, ingredients: { "양파 베이스": 2, "마늘 베이스": 1, "감자 묶음": 1, "코코넛": 1, "버터 조각": 1, "익힌 돼지 앞다리살": 1 } },
  { id: "c12", name: "허브 삼겹살 찜", basePrice: 1988, maxPrice: 2982, isHard: false, ingredients: { "마늘 베이스": 2, "양파 베이스": 1, "호박 묶음": 1, "감자 묶음": 1, "익힌 돼지고기": 1, "익힌 돼지 삼겹살": 1 } },
  { id: "c13", name: "토마토 라자냐", basePrice: 2787, maxPrice: 4181, isHard: false, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "당근 묶음": 1, "호박 묶음": 1, "밀가루 반죽": 1, "익힌 양 다리살": 1 } },
  { id: "c14", name: "딥 크림 빠네", basePrice: 2558, maxPrice: 3837, isHard: false, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "수박 묶음": 1, "감자 묶음": 1, "치즈 조각": 1, "요리용 우유": 1 } },
  { id: "c15", name: "트리플 소갈비 꼬치", basePrice: 2871, maxPrice: 4307, isHard: false, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "당근 묶음": 1, "비트 묶음": 1, "설탕 큐브": 1, "익힌 소 갈비살": 1 } },
];

export default function EfficiencySimulatorPage() {
  const [skillLevel, setSkillLevel] = useState<number>(0);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedSkill = localStorage.getItem('alldding_skill');
    const savedPrices = localStorage.getItem('alldding_prices');
    if (savedSkill) setSkillLevel(Number(savedSkill));
    if (savedPrices) setPrices(JSON.parse(savedPrices));
    setIsLoaded(true);
  }, []);

  const analyzedData = useMemo(() => {
    return RECIPES.map(recipe => {
      let totalCost = 0;
      Object.entries(recipe.ingredients).forEach(([ing, count]) => {
        totalCost += (prices[ing] || 0) * count;
      });

      const skillSalePrice = Math.floor(recipe.basePrice * (1 + SKILL_BONUS[skillLevel]));
      const lv10SalePrice = Math.floor(recipe.basePrice * (1 + SKILL_BONUS[10]));

      const currentProfit = skillSalePrice - totalCost;
      const lv10Profit = lv10SalePrice - totalCost;
      
      const percentToMax = (skillSalePrice / recipe.maxPrice) * 100;

      return {
        ...recipe, totalCost, skillSalePrice, lv10SalePrice, currentProfit, lv10Profit, percentToMax
      };
    }).sort((a, b) => b.currentProfit - a.currentProfit); 
  }, [prices, skillLevel]);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-indigo-500/30 relative flex flex-col">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <Header />

      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-4 pt-32 md:pt-40 pb-20">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white">마진 분석 보드</h1>
            <p className="text-gray-500 text-sm mt-2">개인 설정에 입력된 데이터에 따라 실시간으로 마진이 계산되어 순위가 변경됩니다.</p>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold text-gray-300">
            적용된 스킬 레벨: <span className="text-indigo-400 ml-1">{skillLevel}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {analyzedData.map((item) => (
            <div key={item.id} className="bg-[#0a0a0a] border border-white/5 hover:border-indigo-500/30 rounded-2xl p-6 flex flex-col justify-between transition-colors shadow-lg">
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-[10px] text-gray-600 font-bold flex-shrink-0">IMG</div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight mb-1">{item.name}</h3>
                    <div className="flex gap-2">
                      <span className="text-[11px] text-gray-500 font-bold">원가 {item.totalCost.toLocaleString()}G</span>
                      {item.isHard && <span className="text-[11px] text-amber-500 font-bold bg-amber-500/10 px-1.5 rounded">수급주의</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-black tracking-tight ${item.currentProfit > 0 ? 'text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.4)]' : 'text-rose-400'}`}>
                    {item.currentProfit > 0 ? '+' : ''}{item.currentProfit.toLocaleString()}G
                  </div>
                  <div className="text-[11px] font-bold text-gray-400 mt-1">
                    최고가 대비 {item.percentToMax.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 bg-black/50 p-4 rounded-xl border border-white/5">
                {Object.entries(item.ingredients).map(([ing, count], i) => {
                  const cost = (prices[ing] || 0) * count;
                  return (
                    <div key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold border ${cost === 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-300'}`}>
                      <span>{ing} x{count}</span>
                      {cost > 0 && <span className="text-gray-500 opacity-80">({cost}G)</span>}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-500 font-bold mb-1">현재 적용 판매가</span>
                  <span className="text-base font-bold text-gray-200">{item.skillSalePrice.toLocaleString()} G</span>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] text-gray-500 font-bold mb-1">10렙 기준 판매가</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-500/80">순수익 +{item.lv10Profit.toLocaleString()}</span>
                    <span className="text-base font-black text-amber-400">{item.lv10SalePrice.toLocaleString()} G</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}