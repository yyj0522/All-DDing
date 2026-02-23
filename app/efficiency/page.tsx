'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import TradeCalculator from '@/components/TradeCalculator';
import { ITEM_IMAGES } from '@/lib/skillData';
import { getCachedPrices } from '@/lib/supabase';

const SKILL_BONUS = [0.0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.1, 0.15, 0.3, 0.5];

const F8_EXPECTED_EXTRA = [0, 0.01, 0.02, 0.03, 0.04, 0.10, 0.14, 0.30];
const F9_GIANT_CHANCE = [0, 0.005, 0.01, 0.03, 0.05];
const F12_SEED_RETURN = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.10, 0.20, 0.30];

const RECIPES = [
  { id: "c01", name: "토마토 스파게티", maxPrice: 864, isHard: false, ingredients: { "토마토 베이스": 1, "호박 묶음": 1 } },
  { id: "c02", name: "어니언 링", maxPrice: 1296, isHard: false, ingredients: { "양파 베이스": 1, "감자 묶음": 1 } },
  { id: "c03", name: "갈릭 케이크", maxPrice: 810, isHard: false, ingredients: { "마늘 베이스": 1, "당근 묶음": 1 } },
  { id: "c04", name: "삼겹살 토마토 찌개", maxPrice: 2039, isHard: false, ingredients: { "토마토 베이스": 2, "비트 묶음": 1, "요리용 소금": 1, "익힌 돼지고기": 1, "익힌 돼지 삼겹살": 1 } },
  { id: "c05", name: "삼색 아이스크림", maxPrice: 3022, isHard: true, ingredients: { "양파 베이스": 2, "수박 묶음": 1, "코코넛": 1, "설탕 큐브": 1, "요리용 우유": 1 } },
  { id: "c06", name: "마늘 양갈비 핫도그", maxPrice: 1832, isHard: false, ingredients: { "마늘 베이스": 2, "감자 묶음": 1, "오일": 1, "익힌 양고기": 1, "익힌 양 갈비살": 1 } },
  { id: "c07", name: "달콤 시리얼", maxPrice: 2578, isHard: true, ingredients: { "토마토 베이스": 2, "달콤한 열매 묶음": 1, "파인애플": 1, "밀가루 반죽": 1, "오일": 1 } },
  { id: "c08", name: "로스트 치킨 파이", maxPrice: 2253, isHard: false, ingredients: { "마늘 베이스": 2, "당근 묶음": 1, "버터 조각": 1, "익힌 닭고기": 1, "익힌 닭 다리살": 1 } },
  { id: "c09", name: "스윗 치킨 햄버거", maxPrice: 3612, isHard: false, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "비트 묶음": 1, "달콤한 열매 묶음": 1, "익힌 닭 가슴살": 1, "익힌 닭 다리살": 1 } },
  { id: "c10", name: "토마토 파인애플 피자", maxPrice: 3455, isHard: true, ingredients: { "토마토 베이스": 2, "마늘 베이스": 2, "파인애플": 1, "치즈 조각": 1, "스테이크": 1, "익힌 소 등심": 1 } },
  { id: "c11", name: "양파 수프", maxPrice: 3797, isHard: true, ingredients: { "양파 베이스": 2, "마늘 베이스": 1, "감자 묶음": 1, "코코넛": 1, "버터 조각": 1, "익힌 돼지 앞다리살": 1 } },
  { id: "c12", name: "허브 삼겹살 찜", maxPrice: 2982, isHard: false, ingredients: { "마늘 베이스": 2, "양파 베이스": 1, "호박 묶음": 1, "감자 묶음": 1, "익힌 돼지고기": 1, "익힌 돼지 삼겹살": 1 } },
  { id: "c13", name: "토마토 라자냐", maxPrice: 4181, isHard: false, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "당근 묶음": 1, "호박 묶음": 1, "밀가루 반죽": 1, "익힌 양 다리살": 1 } },
  { id: "c14", name: "딥 크림 빠네", maxPrice: 3837, isHard: false, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "수박 묶음": 1, "감자 묶음": 1, "치즈 조각": 1, "요리용 우유": 1 } },
  { id: "c15", name: "트리플 소갈비 꼬치", maxPrice: 4307, isHard: false, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "당근 묶음": 1, "비트 묶음": 1, "설탕 큐브": 1, "익힌 소 갈비살": 1 } },
];

export default function EfficiencySimulatorPage() {
  const [skillLevel, setSkillLevel] = useState<number>(0);
  const [userPrices, setUserPrices] = useState<Record<string, number>>({});
  const [dbPrices, setDbPrices] = useState<Record<string, number>>({});
  const [profLevels, setProfLevels] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const savedSkill = localStorage.getItem('alldding_skill');
      const savedPrices = localStorage.getItem('alldding_prices');
      const savedProf = localStorage.getItem('alldding_profession');
      
      if (savedSkill) setSkillLevel(Number(savedSkill));
      if (savedPrices) setUserPrices(JSON.parse(savedPrices));
      if (savedProf) setProfLevels(JSON.parse(savedProf));
      
      const data = await getCachedPrices();
      if (data && data.length > 0) {
        const pm: Record<string, number> = {};
        const latestPrices = data.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        latestPrices.forEach((row: any) => { pm[row.item_name] = row.price; });
        setDbPrices(pm);
      }
      setIsLoaded(true);
    };
    fetchData();
  }, []);

  const calculateIngredientCost = (ingName: string, count: number) => {
    const activePrice = userPrices[ingName] !== undefined ? userPrices[ingName] : (dbPrices[ingName] || 0);

    const getBaseExpectedCost = (seedName: string, baseYield: number) => {
      const seedPrice = userPrices[seedName] !== undefined ? userPrices[seedName] : (dbPrices[seedName] || 0);
      const unitSeedCost = seedPrice / 64;
      
      const f8Lv = profLevels['f8'] || 0;
      const f9Lv = profLevels['f9'] || 0;
      const f12Lv = profLevels['f12'] || 0;

      const extraCrop = F8_EXPECTED_EXTRA[f8Lv] || 0;
      const giantChance = F9_GIANT_CHANCE[f9Lv] || 0;
      const seedReturn = F12_SEED_RETURN[f12Lv] || 0;

      const netSeedCost = unitSeedCost * (1 - seedReturn);
      const expectedYield = (baseYield * (1 + 6 * giantChance)) + extraCrop;
      
      const costPerCrop = netSeedCost / expectedYield;
      return costPerCrop * 8 * count;
    };

    if (ingName === "토마토 베이스") return getBaseExpectedCost("토마토 씨앗", 2.0);
    if (ingName === "양파 베이스") return getBaseExpectedCost("양파 씨앗", 1.5);
    if (ingName === "마늘 베이스") return getBaseExpectedCost("마늘 씨앗", 2.5);
    
    return (activePrice / 64) * count;
  };

  const analyzedData = useMemo(() => {
    if (!isLoaded) return [];
    return RECIPES.map(recipe => {
      let totalCost = 0;
      const parsedCosts: Record<string, number> = {};

      Object.entries(recipe.ingredients).forEach(([ing, count]) => {
        const cost = calculateIngredientCost(ing, count);
        parsedCosts[ing] = cost;
        totalCost += cost;
      });

      totalCost = Math.round(totalCost);

      const currentMarketPrice = dbPrices[recipe.name] || 0;

      const skillSalePrice = Math.floor(currentMarketPrice * (1 + SKILL_BONUS[skillLevel]));
      const lv10SalePrice = Math.floor(currentMarketPrice * (1 + SKILL_BONUS[10]));
      
      const currentProfit = skillSalePrice - totalCost;
      const lv10Profit = lv10SalePrice - totalCost;
      const percentToMax = recipe.maxPrice === 0 ? 0 : Math.min((currentMarketPrice / recipe.maxPrice) * 100, 100);

      return {
        ...recipe, totalCost, parsedCosts, skillSalePrice, lv10SalePrice, currentProfit, lv10Profit, percentToMax
      };
    }).sort((a, b) => b.currentProfit - a.currentProfit); 
  }, [userPrices, dbPrices, skillLevel, profLevels, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col relative">
        <Header />
        <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-4 pt-32 md:pt-40 pb-20">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8">
            <div className="space-y-4">
              <div className="w-64 h-12 bg-white/5 animate-pulse rounded-2xl"></div>
              <div className="w-96 h-4 bg-white/5 animate-pulse rounded-full"></div>
            </div>
            <div className="w-48 h-14 bg-white/5 animate-pulse rounded-2xl"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 h-64 animate-pulse flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/5 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="w-24 h-5 bg-white/5 rounded-md"></div>
                      <div className="w-16 h-3 bg-white/5 rounded-md"></div>
                    </div>
                  </div>
                  <div className="w-20 h-8 bg-white/5 rounded-md"></div>
                </div>
                <div className="w-full h-16 bg-white/5 rounded-xl"></div>
                <div className="w-full h-10 bg-white/5 rounded-md"></div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-indigo-500/30 relative flex flex-col">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <Header />

      {isCalcOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCalcOpen(false)}
          ></div>
          <div className="relative z-10 animate-fade-in-up">
            <button 
              onClick={() => setIsCalcOpen(false)} 
              className="absolute -top-10 right-0 text-gray-400 hover:text-white font-bold text-sm bg-black/50 px-3 py-1.5 rounded-lg border border-white/10"
            >
              닫기 ✕
            </button>
            <TradeCalculator />
          </div>
        </div>
      )}

      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-4 pt-32 md:pt-40 pb-20">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">요리 효율 분석</h1>
            <p className="text-gray-400 text-sm mt-3">개인 설정에 입력된 데이터가 연동되어 모든 요리의 순수익을 실시간으로 제공합니다.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button 
              onClick={() => setIsCalcOpen(true)}
              className="bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-400 px-5 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.15)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              대리 판매 계산기
            </button>
            <div className="bg-[#0a0a0a] border border-white/10 px-6 py-3 rounded-2xl flex items-center justify-between sm:justify-start gap-4 shadow-lg">
              <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">현재 적용 요리 스킬</span>
              <span className="text-2xl font-black text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]">Lv.{skillLevel}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {analyzedData.map((item) => (
            <div key={item.id} className="bg-[#0a0a0a] border border-white/5 hover:border-indigo-500/30 rounded-3xl p-6 flex flex-col justify-between transition-colors shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-black rounded-xl border border-white/10 flex items-center justify-center flex-shrink-0 shadow-inner overflow-hidden">
                    <img 
                      src={`/foods/${ITEM_IMAGES[item.name]}.png`} 
                      alt={item.name}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" 
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight mb-1">{item.name}</h3>
                    <div className="flex gap-2">
                      <span className="text-[11px] text-gray-500 font-bold">총 원가 {item.totalCost.toLocaleString()}G</span>
                      {item.isHard && <span className="text-[11px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">수급주의</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className={`text-xl font-black tracking-tight ${item.currentProfit > 0 ? 'text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.4)]' : 'text-rose-400'}`}>
                    {item.currentProfit > 0 ? '+' : ''}{item.currentProfit.toLocaleString()}G
                  </div>
                  <div className="text-[11px] font-bold text-gray-400 mt-1.5 flex items-center gap-1.5">
                    최고가 대비
                    <span className={item.percentToMax >= 80 ? 'text-emerald-400' : 'text-white'}>{item.percentToMax.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 bg-black/50 p-4 rounded-xl border border-white/5">
                {Object.entries(item.ingredients).map(([ing, count], i) => {
                  const cost = Math.round(item.parsedCosts[ing]);
                  return (
                    <div key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold border ${cost === 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-300'}`}>
                      <img 
                        src={`/ingredients/${ITEM_IMAGES[ing] || ITEM_IMAGES[ing.replace(' 베이스', ' 씨앗')]}.png`} 
                        alt={ing}
                        className="w-4 h-4 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <span>{ing} x{count}</span>
                      {cost > 0 && <span className="text-gray-500 opacity-80">({cost}G)</span>}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-5">
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-500 font-bold mb-1">10렙 기준 판매가</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-gray-200">{item.lv10SalePrice.toLocaleString()} G</span>
                    <span className="text-[10px] font-bold text-gray-500">({item.lv10Profit > 0 ? '+' : ''}{item.lv10Profit.toLocaleString()})</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] text-amber-500/80 font-bold mb-1 tracking-wider uppercase">나의 적용 판매가</span>
                  <span className="text-lg font-black text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">{item.skillSalePrice.toLocaleString()} G</span>
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