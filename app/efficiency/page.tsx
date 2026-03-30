'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Header from '@/components/header';
import Footer from '@/components/footer';
import TradeCalculator from '@/components/TradeCalculator';
import { ITEM_IMAGES } from '@/lib/skillData';
import { getCachedPrices } from '@/lib/supabase';

const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

const F8_EXPECTED_EXTRA = [0, 0.01, 0.02, 0.03, 0.04, 0.10, 0.14, 0.30];
const F9_GIANT_CHANCE = [0, 0.005, 0.01, 0.03, 0.05];
const F12_SEED_RETURN = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.10, 0.20, 0.30];

const F15_SALE_BONUS = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.10, 0.15, 0.30, 0.50];
const F5_BULK_BONUS = [0, 0.01, 0.02, 0.03, 0.04, 0.07];
const F4_TIME_REDUCTION = [0, 0.10, 0.30, 0.40, 0.60, 0.80];

const RECIPES = [
  { id: "c01", name: "토마토 스파게티", maxPrice: 864, isHard: false, craftTime: 20, ingredients: { "토마토 베이스": 1, "호박 묶음": 1 } },
  { id: "c02", name: "어니언 링", maxPrice: 1296, isHard: false, craftTime: 20, ingredients: { "양파 베이스": 1, "감자 묶음": 1 } },
  { id: "c03", name: "갈릭 케이크", maxPrice: 810, isHard: false, craftTime: 20, ingredients: { "마늘 베이스": 1, "당근 묶음": 1 } },
  { id: "c04", name: "삼겹살 토마토 찌개", maxPrice: 2039, isHard: false, craftTime: 30, ingredients: { "토마토 베이스": 2, "비트 묶음": 1, "요리용 소금": 1, "익힌 돼지고기": 1, "익힌 돼지 삼겹살": 1 } },
  { id: "c05", name: "삼색 아이스크림", maxPrice: 3022, isHard: true, craftTime: 30, ingredients: { "양파 베이스": 2, "수박 묶음": 1, "코코넛": 1, "설탕 큐브": 1, "요리용 우유": 1 } },
  { id: "c06", name: "마늘 양갈비 핫도그", maxPrice: 1832, isHard: false, craftTime: 30, ingredients: { "마늘 베이스": 2, "감자 묶음": 1, "오일": 1, "익힌 양고기": 1, "익힌 양 갈비살": 1 } },
  { id: "c07", name: "달콤 시리얼", maxPrice: 2578, isHard: true, craftTime: 30, ingredients: { "토마토 베이스": 2, "달콤한 열매 묶음": 1, "파인애플": 1, "밀가루 반죽": 1, "오일": 1 } },
  { id: "c08", name: "로스트 치킨 파이", maxPrice: 2253, isHard: false, craftTime: 30, ingredients: { "마늘 베이스": 2, "당근 묶음": 1, "버터 조각": 1, "익힌 닭고기": 1, "익힌 닭 다리살": 1 } },
  { id: "c09", name: "스윗 치킨 햄버거", maxPrice: 3612, isHard: false, craftTime: 40, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "비트 묶음": 1, "달콤한 열매 묶음": 1, "익힌 닭 가슴살": 1, "익힌 닭 다리살": 1 } },
  { id: "c10", name: "토마토 파인애플 피자", maxPrice: 3455, isHard: true, craftTime: 40, ingredients: { "토마토 베이스": 2, "마늘 베이스": 2, "파인애플": 1, "치즈 조각": 1, "스테이크": 1, "익힌 소 등심": 1 } },
  { id: "c11", name: "양파 수프", maxPrice: 3797, isHard: true, craftTime: 40, ingredients: { "양파 베이스": 2, "마늘 베이스": 1, "감자 묶음": 1, "코코넛": 1, "버터 조각": 1, "익힌 돼지 앞다리살": 1 } },
  { id: "c12", name: "허브 삼겹살 찜", maxPrice: 2982, isHard: false, craftTime: 40, ingredients: { "마늘 베이스": 2, "양파 베이스": 1, "호박 묶음": 1, "감자 묶음": 1, "익힌 돼지고기": 1, "익힌 돼지 삼겹살": 1 } },
  { id: "c13", name: "토마토 라자냐", maxPrice: 4181, isHard: false, craftTime: 50, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "당근 묶음": 1, "호박 묶음": 1, "밀가루 반죽": 1, "익힌 양 다리살": 1 } },
  { id: "c14", name: "딥 크림 빠네", maxPrice: 3837, isHard: false, craftTime: 50, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "수박 묶음": 1, "감자 묶음": 1, "치즈 조각": 1, "요리용 우유": 1 } },
  { id: "c15", name: "트리플 소갈비 꼬치", maxPrice: 4307, isHard: false, craftTime: 50, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "당근 묶음": 1, "비트 묶음": 1, "설탕 큐브": 1, "익힌 소 갈비살": 1 } },
];

export default function EfficiencySimulatorPage() {
  const [userPrices, setUserPrices] = useState<Record<string, number>>({});
  const [dbPrices, setDbPrices] = useState<Record<string, number>>({});
  const [profLevels, setProfLevels] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [targetQty, setTargetQty] = useState<number | string>(1);

  const safeTargetQty = typeof targetQty === 'number' && targetQty > 0 ? targetQty : 1;

  useEffect(() => {
    const fetchData = async () => {
      const savedPrices = localStorage.getItem('alldding_prices');
      const savedProf = localStorage.getItem('alldding_profession');
      if (savedPrices) setUserPrices(JSON.parse(savedPrices));
      if (savedProf) setProfLevels(JSON.parse(savedProf));
      const data = await getCachedPrices();
      if (data && data.length > 0) {
        const pm: Record<string, number> = {};
        data.forEach((row: any) => { pm[row.item_name] = row.price; });
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
      return (netSeedCost / expectedYield) * 8 * count;
    };
    if (ingName === "토마토 베이스") return getBaseExpectedCost("토마토 씨앗", 2.0);
    if (ingName === "양파 베이스") return getBaseExpectedCost("양파 씨앗", 1.5);
    if (ingName === "마늘 베이스") return getBaseExpectedCost("마늘 씨앗", 2.5);
    return (activePrice / 64) * count; 
  };

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds === 0) return '0초';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.round(totalSeconds % 60);
    const parts = [];
    if (h > 0) parts.push(`${h}시간`);
    if (m > 0) parts.push(`${m}분`);
    if (s > 0 || parts.length === 0) parts.push(`${s}초`);
    return parts.join(' ');
  };

  const analyzedData = useMemo(() => {
    if (!isLoaded) return [];

    const f15Lv = profLevels['f15'] || 0;
    const f5Lv = profLevels['f5'] || 0;
    const f4Lv = profLevels['f4'] || 0;

    const f15Bonus = F15_SALE_BONUS[f15Lv] || 0;
    const f5Bonus = F5_BULK_BONUS[f5Lv] || 0;
    const f4Reduction = F4_TIME_REDUCTION[f4Lv] || 0;

    return RECIPES.map(recipe => {
      let singleCost = 0;
      const parsedCosts: Record<string, number> = {};
      
      Object.entries(recipe.ingredients).forEach(([ing, count]) => {
        const cost = calculateIngredientCost(ing, count);
        parsedCosts[ing] = cost;
        singleCost += cost;
      });
      singleCost = Math.round(singleCost);
      
      const currentMarketPrice = dbPrices[recipe.name] || 0;
      
      const singleSalePrice = Math.floor(currentMarketPrice * (1 + f15Bonus));
      const bonusSalePrice = Math.floor(currentMarketPrice * (1 + f15Bonus + f5Bonus));

      const sets3 = Math.floor(safeTargetQty / 192);
      const itemsIn3Sets = sets3 * 192;
      const itemsOutside = safeTargetQty - itemsIn3Sets;

      const totalRevenue = (itemsIn3Sets * bonusSalePrice) + (itemsOutside * singleSalePrice);
      const totalCost = singleCost * safeTargetQty;
      const totalProfit = totalRevenue - totalCost;

      const totalTimeSec = safeTargetQty * recipe.craftTime * (1 - f4Reduction);
      const percentToMax = recipe.maxPrice === 0 ? 0 : Math.min((currentMarketPrice / recipe.maxPrice) * 100, 100);

      return { 
        ...recipe, 
        singleCost, 
        parsedCosts, 
        singleSalePrice, 
        totalRevenue,
        totalCost,
        totalProfit,
        totalTimeSec,
        percentToMax 
      };
    }).sort((a, b) => b.totalProfit - a.totalProfit); 
  }, [userPrices, dbPrices, profLevels, isLoaded, safeTargetQty]);

  if (!isLoaded) return <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 font-bold transition-colors duration-300">분석 데이터 로딩 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-200 dark:selection:bg-indigo-500/30 relative flex flex-col transition-colors duration-300">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none transition-colors duration-300"></div>
      <Header />

      {isCalcOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsCalcOpen(false)}></div>
          <div className="relative z-10 animate-fade-in-up">
            <button onClick={() => setIsCalcOpen(false)} className="absolute -top-10 right-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold text-sm bg-white dark:bg-black/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 transition-colors"
            >닫기 ✕</button>
            <TradeCalculator />
          </div>
        </div>
      )}

      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-4 pt-32 md:pt-40 pb-20">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-white/5 pb-8 transition-colors">
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">요리 효율 분석</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-3 leading-relaxed break-keep">
              재배 전문가 스킬(돈 좀 벌어볼까, 한 솥 가득, 불 더 올려)과 최신 시세가 모두 반영된 실시간 수익 분석입니다.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 px-5 py-4 rounded-2xl flex items-center gap-4 shadow-sm dark:shadow-lg transition-colors">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-tight shrink-0">목표 제작 수량</span>
              <div className="relative flex-1">
                <input 
                  type="number" 
                  min="1"
                  value={targetQty} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') setTargetQty('');
                    else setTargetQty(parseInt(val, 10));
                  }}
                  onBlur={() => {
                    if (targetQty === '' || Number(targetQty) <= 0) setTargetQty(1);
                  }}
                  className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-gray-900 dark:text-white text-base font-black focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors shadow-inner"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">개</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button onClick={() => setIsCalcOpen(true)} className="flex-1 bg-indigo-100 dark:bg-indigo-600/20 hover:bg-indigo-200 dark:hover:bg-indigo-600/40 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 px-5 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-sm dark:shadow-lg whitespace-nowrap"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>대리 판매 계산기</button>
              <div className="flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 px-6 py-3 rounded-2xl flex items-center justify-center gap-4 shadow-sm dark:shadow-lg transition-colors whitespace-nowrap"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest">돈 좀 벌어볼까</span><span className="text-xl font-black text-indigo-600 dark:text-indigo-400">Lv.{profLevels['f15'] || 0}</span></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {analyzedData.map((item, idx) => (
            <div key={item.id} className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 hover:border-indigo-400 dark:hover:border-indigo-500/30 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md dark:shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 bg-gray-50 dark:bg-[#111] rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative transition-colors">
                    <Image 
                      src={`${STORAGE_BASE_URL}/foods/${ITEM_IMAGES[item.name]}.png`} 
                      alt={item.name}
                      width={44}
                      height={44}
                      unoptimized={true}
                      priority={idx < 6}
                      className="object-contain" 
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-1 truncate">{item.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold whitespace-nowrap">1개 원가 {item.singleCost.toLocaleString()}G</span>
                      {item.isHard && <span className="text-[10px] text-amber-600 dark:text-amber-500 font-bold bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 rounded whitespace-nowrap">수급주의</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end shrink-0 pl-2">
                  <div className={`text-xl font-black ${item.totalProfit > 0 ? 'text-indigo-600 dark:text-indigo-400 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]' : 'text-rose-600 dark:text-rose-400'}`}>
                    {item.totalProfit > 0 ? '+' : ''}{(item.totalProfit).toLocaleString()}G
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1 whitespace-nowrap">
                    최고가 대비 <span className={item.percentToMax >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}>{item.percentToMax.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5 bg-gray-50 dark:bg-black/30 p-4 rounded-xl border border-gray-200 dark:border-white/5 transition-colors">
                {Object.entries(item.ingredients).map(([ing, count], i) => {
                  const cost = Math.round(item.parsedCosts[ing]);
                  const imgName = ITEM_IMAGES[ing] || ITEM_IMAGES[ing.replace(' 베이스', ' 씨앗')];
                  return (
                    <div key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold border transition-colors ${cost === 0 ? 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300'}`}>
                      <div className="relative w-4 h-4 flex-shrink-0">
                        <Image src={`${STORAGE_BASE_URL}/ingredients/${imgName}.png`} alt={ing} fill unoptimized={true} className="object-contain" style={{ imageRendering: 'pixelated' }} />
                      </div>
                      <span>{ing} x{count * safeTargetQty}</span>
                      {cost > 0 && <span className="text-gray-400 dark:text-gray-500 opacity-80">({(cost * safeTargetQty).toLocaleString()}G)</span>}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-gray-200 dark:border-white/5 pt-5 transition-colors">
                <div className="flex flex-col p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                  <span className="text-[10px] text-amber-600 dark:text-amber-500/80 font-bold mb-1 tracking-wider uppercase flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    예상 제작 시간
                  </span>
                  <span className="text-sm font-black text-amber-700 dark:text-amber-400">{formatTime(item.totalTimeSec)}</span>
                </div>
                <div className="flex flex-col p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 items-end text-right">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-500/80 font-bold mb-1 tracking-wider uppercase">
                    적용된 총 판매가
                  </span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{item.totalRevenue.toLocaleString()} G</span>
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