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
  { id: "c10", name: "토마토 파인애플 피자", maxPrice: 3077, isHard: true, craftTime: 40, ingredients: { "토마토 베이스": 2, "마늘 베이스": 1, "파인애플": 1, "치즈 조각": 1, "스테이크": 1, "익힌 소 등심": 1 } },
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
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

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

  const calculateIngredientCost = (ingName: string) => {
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
      return (netSeedCost / expectedYield) * 8; 
    };
    if (ingName === "토마토 베이스") return getBaseExpectedCost("토마토 씨앗", 2.0);
    if (ingName === "양파 베이스") return getBaseExpectedCost("양파 씨앗", 1.5);
    if (ingName === "마늘 베이스") return getBaseExpectedCost("마늘 씨앗", 2.5);
    return activePrice / 64; 
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

  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
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
      const parsedCosts: Record<string, { unitCost: number, totalCostForThisIng: number }> = {};
      
      Object.entries(recipe.ingredients).forEach(([ing, count]) => {
        const unitCost = calculateIngredientCost(ing);
        const totalCostForThisIng = unitCost * count;
        parsedCosts[ing] = { unitCost, totalCostForThisIng };
        singleCost += totalCostForThisIng;
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
            <button onClick={() => setIsCalcOpen(false)} className="absolute -top-10 right-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold text-sm bg-white dark:bg-black/50 px-4 py-2 rounded-xl border border-gray-300 dark:border-transparent transition-colors shadow-sm"
            >닫기 ✕</button>
            <TradeCalculator />
          </div>
        </div>
      )}

      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-4 pt-28 md:pt-40 pb-24 md:pb-20">
        <div className="mb-8 text-center w-full px-2 transition-colors">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3 transition-colors">
            요리 효율 <span className="text-indigo-600 dark:text-indigo-500 transition-colors">분석</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-base tracking-wide max-w-xl mx-auto break-keep opacity-80 transition-colors">
            재배 전문가 스킬과 최신 시세가 모두 반영된 실시간 수익 분석입니다.
          </p>
        </div>

        <div className="w-full max-w-3xl mx-auto mb-8 md:mb-12 sticky top-[80px] md:top-[100px] z-40 transition-colors">
          <div className="bg-white/85 dark:bg-[#0a0a0a]/85 backdrop-blur-xl border border-gray-300 dark:border-transparent rounded-[2rem] p-4 md:p-6 shadow-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col md:flex-row items-stretch md:items-center gap-4 transition-colors">
            <div className="flex-1 flex items-center bg-gray-100 dark:bg-[#111113] rounded-[1.25rem] p-2 pr-4 border border-gray-300 dark:border-transparent transition-colors">
              <div className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] md:text-xs px-3 py-2 rounded-xl whitespace-nowrap mr-3 transition-colors">
                목표 수량
              </div>
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
                className="w-full bg-transparent text-gray-900 dark:text-white text-lg md:text-xl font-black focus:outline-none placeholder-gray-400 dark:placeholder-gray-700"
                placeholder="1"
              />
              <span className="text-gray-500 dark:text-gray-500 font-bold ml-2">개</span>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col justify-center items-center bg-gray-100 dark:bg-[#111113] px-4 rounded-[1.25rem] border border-gray-300 dark:border-transparent transition-colors min-w-[100px]">
                <span className="text-[9px] font-bold text-gray-500 mb-0.5">돈 좀 벌어볼까</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">Lv.{profLevels['f15'] || 0}</span>
              </div>
              <button onClick={() => setIsCalcOpen(true)} className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded-[1.25rem] flex items-center justify-center gap-2 font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 whitespace-nowrap">
                <span className="hidden sm:inline">대리 판매</span> 계산기
              </button>
            </div>
          </div>
        </div>

        {/* 👇 해결의 핵심인 items-start 속성 추가 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 items-start">
          {analyzedData.map((item, idx) => (
            <div key={item.id} className="bg-white dark:bg-gradient-to-b dark:from-[#111113] dark:to-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] overflow-hidden flex flex-col transition-all duration-300 shadow-md hover:shadow-lg dark:shadow-2xl group">
              <div className="p-5 md:p-6 pb-4">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 dark:bg-black/50 rounded-2xl border border-gray-300 dark:border-transparent flex items-center justify-center flex-shrink-0 shadow-inner transition-colors group-hover:scale-105 duration-300">
                      <Image 
                        src={`${STORAGE_BASE_URL}/foods/${ITEM_IMAGES[item.name]}.png`} 
                        alt={item.name}
                        width={48}
                        height={48}
                        unoptimized={true}
                        priority={idx < 6}
                        className="object-contain drop-shadow-md" 
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white tracking-tight mb-1">{item.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] md:text-[11px] text-gray-600 dark:text-gray-400 font-bold">1개 원가 {item.singleCost.toLocaleString()}G</span>
                        {item.isHard && <span className="text-[9px] text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 px-1.5 py-0.5 rounded-md font-black border border-amber-200 dark:border-transparent">수급주의</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 dark:bg-black/30 rounded-2xl p-4 mb-3 border border-gray-300 dark:border-transparent transition-colors shadow-inner dark:shadow-none">
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-500 uppercase tracking-widest">총 예상 순수익</span>
                    <div className={`text-2xl md:text-3xl font-black tracking-tighter ${item.totalProfit > 0 ? 'text-indigo-600 dark:text-indigo-400 drop-shadow-sm' : 'text-rose-600 dark:text-rose-400'}`}>
                      {item.totalProfit > 0 ? '+' : ''}{(item.totalProfit).toLocaleString()}<span className="text-lg md:text-xl ml-1">G</span>
                    </div>
                  </div>
                  
                  <div className="w-full mt-3">
                    <div className="flex justify-between text-[10px] font-bold mb-1.5">
                      <span className="text-gray-600 dark:text-gray-500">최고가 도달율</span>
                      <span className={item.percentToMax >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-400'}>{item.percentToMax.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-300 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${item.percentToMax >= 80 ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-indigo-500 dark:bg-indigo-500/60'}`}
                        style={{ width: `${item.percentToMax}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-white/5 pt-3 mt-1">
                  <button 
                    onClick={() => toggleCard(item.id)}
                    className="w-full flex items-center justify-between py-1 text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <span>필요 재료 (총 {safeTargetQty}개 기준)</span>
                    <span className="text-[10px] bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md border border-gray-200 dark:border-transparent transition-colors">{expandedCards[item.id] ? '접기 ▲' : '펼치기 ▼'}</span>
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCards[item.id] ? 'max-h-[500px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-3 gap-2 pb-2">
                      {Object.entries(item.ingredients).map(([ing, count], i) => {
                        const { totalCostForThisIng } = item.parsedCosts[ing];
                        const finalIngCost = Math.round(totalCostForThisIng * safeTargetQty);
                        const imgName = ITEM_IMAGES[ing] || ITEM_IMAGES[ing.replace(' 베이스', ' 씨앗')];
                        return (
                          <div key={i} className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-colors ${finalIngCost === 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-transparent' : 'bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-transparent'}`}>
                            <div className="relative w-6 h-6 mb-1">
                              <Image src={`${STORAGE_BASE_URL}/ingredients/${imgName}.png`} alt={ing} fill unoptimized={true} className="object-contain" style={{ imageRendering: 'pixelated' }} />
                            </div>
                            <span className={`text-[10px] font-bold truncate w-full text-center ${finalIngCost === 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-300'}`}>{ing}</span>
                            <div className="flex flex-col items-center gap-0.5 mt-0.5">
                              <span className={`text-[9px] font-black ${finalIngCost === 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-900 dark:text-white'}`}>x{count * safeTargetQty}</span>
                              {finalIngCost > 0 && <span className="text-[9px] font-bold text-gray-500">({finalIngCost.toLocaleString()}G)</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 mt-auto border-t border-gray-300 dark:border-white/5">
                <div className="flex flex-col p-4 bg-amber-50 dark:bg-amber-950/20 border-r border-gray-300 dark:border-white/5 transition-colors">
                  <span className="text-[9px] text-amber-700 dark:text-amber-500/80 font-bold mb-1 tracking-widest">
                    제작 소요 시간
                  </span>
                  <span className="text-sm font-black text-amber-700 dark:text-amber-400">{formatTime(item.totalTimeSec)}</span>
                </div>
                <div className="flex flex-col p-4 bg-indigo-50 dark:bg-indigo-950/20 transition-colors">
                  <span className="text-[9px] text-indigo-700 dark:text-indigo-400/80 font-bold mb-1 tracking-widest">
                    적용 판매가
                  </span>
                  <span className="text-sm font-black text-indigo-700 dark:text-indigo-400">{item.totalRevenue.toLocaleString()} G</span>
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