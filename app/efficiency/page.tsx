'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  const [targetQty, setTargetQty] = useState<number | string>(1);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("c01");
  const [isTradeCalcOpen, setIsTradeCalcOpen] = useState<boolean>(false);

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

      const marginRate = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      const costRate = totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0;

      const totalTimeSec = safeTargetQty * recipe.craftTime * (1 - f4Reduction);
      const profitPerMin = totalTimeSec > 0 ? Math.round(totalProfit / (totalTimeSec / 60)) : 0;
      const percentToMax = recipe.maxPrice === 0 ? 0 : Math.min((currentMarketPrice / recipe.maxPrice) * 100, 100);

      return { 
        ...recipe, 
        singleCost, 
        parsedCosts, 
        singleSalePrice, 
        totalRevenue,
        totalCost,
        totalProfit,
        marginRate,
        costRate,
        totalTimeSec,
        profitPerMin,
        percentToMax 
      };
    }).sort((a, b) => b.totalProfit - a.totalProfit); 
  }, [userPrices, dbPrices, profLevels, isLoaded, safeTargetQty]);

  useEffect(() => {
    if (isLoaded && analyzedData.length > 0 && !selectedRecipeId) {
      setSelectedRecipeId(analyzedData[0].id);
    }
  }, [isLoaded, analyzedData, selectedRecipeId]);

  if (!isLoaded) return <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 font-bold transition-colors duration-300">분석 데이터 로딩 중...</div>;

  const selectedData = analyzedData.find(d => d.id === selectedRecipeId) || analyzedData[0];
  const isSettingsEmpty = Object.keys(userPrices).length === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-200 dark:selection:bg-indigo-500/30 relative flex flex-col transition-colors duration-300">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none transition-colors duration-300"></div>
      <Header />

      <main className="relative z-10 flex-1 max-w-[1600px] w-full mx-auto px-4 pt-28 md:pt-36 pb-24 md:pb-20">
        <div className="mb-8 text-center w-full px-2 transition-colors">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3 transition-colors">
            요리 효율 <span className="text-indigo-600 dark:text-indigo-500 transition-colors">분석</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-base tracking-wide max-w-xl mx-auto break-keep opacity-80 transition-colors">
            재배 전문가 스킬과 최신 시세가 모두 반영된 실시간 수익 분석입니다.
          </p>
        </div>

        {isSettingsEmpty && (
          <div className="max-w-4xl mx-auto mb-8 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up">
            <div className="flex items-start md:items-center gap-4">
              <div className="w-10 h-10 shrink-0 bg-amber-200 dark:bg-amber-800/50 rounded-full flex items-center justify-center text-amber-700 dark:text-amber-400 text-xl font-black">!</div>
              <div>
                <h3 className="text-sm md:text-base font-black text-amber-900 dark:text-amber-400 mb-1">정확한 분석을 위해 개인 설정이 필요합니다</h3>
                <p className="text-xs text-amber-700/80 dark:text-amber-500/80 break-keep">
                  현재 기본 시세로만 계산되고 있습니다. <b>재료 단가</b>와 <b>재배 전문가 스킬</b>을 설정해야 완벽한 본인만의 순수익을 알 수 있습니다.
                </p>
              </div>
            </div>
            <Link href="/settings" className="shrink-0 w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white font-black text-xs md:text-sm px-6 py-3 rounded-xl text-center shadow-md transition-all active:scale-95">
              개인 설정하러 가기
            </Link>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          
          <div className="w-full md:w-[320px] lg:w-[350px] xl:w-[400px] flex flex-col gap-3 shrink-0">
            <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-black text-gray-900 dark:text-white mb-2">실시간 순수익 랭킹</h2>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                현재 입력된 목표 수량({safeTargetQty}개)을 기준으로 재료비와 판매 수수료를 모두 제외한 <span className="font-bold text-indigo-500">최종 순수익이 가장 높은 순서</span>대로 자동 정렬됩니다.
              </p>
            </div>
            
            <div className="flex flex-col gap-2.5">
              {analyzedData.map((item, index) => {
                const isSelected = selectedRecipeId === item.id;
                let rankColor = "text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-white/5";
                if (index === 0) rankColor = "text-amber-600 bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/30";
                else if (index === 1) rankColor = "text-gray-700 bg-gray-200 dark:bg-gray-400/20 border-gray-400 dark:border-gray-400/30";
                else if (index === 2) rankColor = "text-orange-700 bg-orange-100 dark:bg-orange-500/20 border-orange-300 dark:border-orange-500/30";

                return (
                  <button 
                    key={item.id}
                    onClick={() => setSelectedRecipeId(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-md transform scale-[1.02]' : 'bg-white dark:bg-[#0a0a0c] border-gray-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                  >
                    <div className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-[11px] font-black border ${rankColor}`}>
                      {index + 1}
                    </div>
                    
                    <div className="w-10 h-10 shrink-0 bg-gray-100 dark:bg-black/40 rounded-xl flex items-center justify-center p-1">
                      <Image src={`${STORAGE_BASE_URL}/foods/${ITEM_IMAGES[item.name]}.png`} alt={item.name} width={32} height={32} unoptimized={true} className="object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-black text-gray-900 dark:text-white truncate">{item.name}</span>
                        {item.isHard && <span className="text-[8px] px-1.5 py-0.5 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-md font-bold shrink-0">수급주의</span>}
                      </div>
                      <span className={`text-[11px] font-black mt-0.5 ${item.totalProfit > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`}>
                        {item.totalProfit > 0 ? '+' : ''}{item.totalProfit.toLocaleString()} G
                      </span>
                    </div>

                    <div className="shrink-0 flex flex-col items-end justify-center">
                      <span className="text-[9px] font-bold text-gray-500 mb-1">원가 {item.singleCost.toLocaleString()}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-10 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.percentToMax >= 80 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${item.percentToMax}%` }}></div>
                        </div>
                        <span className={`text-[9px] font-bold ${item.percentToMax >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>{item.percentToMax.toFixed(0)}%</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col gap-6">
            
            <div className="bg-white/80 dark:bg-[#111113]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-3xl p-4 shadow-sm sticky top-[80px] md:top-[100px] z-40">
              <div className="grid grid-cols-5 md:grid-cols-8 gap-2">
                {RECIPES.map((recipe) => (
                  <button 
                    key={recipe.id}
                    onClick={() => setSelectedRecipeId(recipe.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${selectedRecipeId === recipe.id ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-500 shadow-sm' : 'bg-gray-50 dark:bg-[#0a0a0c] border-transparent hover:bg-gray-100 dark:hover:bg-white/5'}`}
                  >
                    <div className="w-8 h-8 relative mb-1.5">
                      <Image src={`${STORAGE_BASE_URL}/foods/${ITEM_IMAGES[recipe.name]}.png`} alt={recipe.name} fill unoptimized={true} className="object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />
                    </div>
                    <span className={`text-[9px] font-bold text-center w-full truncate px-0.5 ${selectedRecipeId === recipe.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>{recipe.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/80 dark:bg-[#111113]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="w-full lg:w-auto flex flex-1 items-center bg-gray-50 dark:bg-[#0a0a0c] rounded-2xl p-2.5 px-4 border border-gray-200 dark:border-transparent">
                <span className="text-[11px] md:text-xs font-black text-indigo-600 dark:text-indigo-400 mr-4 whitespace-nowrap">제작 수량 입력</span>
                <input 
                  type="number" min="1" value={targetQty} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') setTargetQty('');
                    else setTargetQty(parseInt(val, 10));
                  }}
                  onBlur={() => { if (targetQty === '' || Number(targetQty) <= 0) setTargetQty(1); }}
                  className="flex-1 bg-transparent text-gray-900 dark:text-white text-xl md:text-2xl font-black outline-none placeholder-gray-400 w-full"
                  placeholder="1"
                />
                <span className="text-gray-500 font-bold ml-2">개</span>
              </div>

              <div className="flex w-full lg:w-auto gap-3">
                <div className="flex flex-col justify-center items-center bg-gray-50 dark:bg-[#0a0a0c] px-5 rounded-2xl border border-gray-200 dark:border-transparent py-2">
                  <span className="text-[9px] font-bold text-gray-500 mb-0.5">돈 좀 벌어볼까</span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">Lv.{profLevels['f15'] || 0}</span>
                </div>
                <button 
                  onClick={() => setIsTradeCalcOpen(!isTradeCalcOpen)} 
                  className="flex-1 lg:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-2xl font-black transition-all shadow-md active:scale-95 text-[13px] whitespace-nowrap"
                >
                  대리 판매 계산기 {isTradeCalcOpen ? '▲' : '▼'}
                </button>
              </div>
            </div>

            {isTradeCalcOpen && (
              <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-inner animate-fade-in-down">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">대리 판매 계산기</h3>
                <TradeCalculator />
              </div>
            )}

            {selectedData && (
              <div className="bg-white dark:bg-gradient-to-b dark:from-[#111113] dark:to-[#0a0a0c] border border-gray-200 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-lg flex flex-col gap-8 animate-fade-in-up">
                
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-b border-gray-200 dark:border-white/5 pb-6">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-black/50 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-transparent shadow-inner">
                      <Image src={`${STORAGE_BASE_URL}/foods/${ITEM_IMAGES[selectedData.name]}.png`} alt={selectedData.name} width={56} height={56} unoptimized={true} className="object-contain drop-shadow-md" style={{ imageRendering: 'pixelated' }} />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{selectedData.name}</h2>
                        {selectedData.isHard && <span className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] px-2 py-1 rounded-md font-bold">수급주의</span>}
                      </div>
                      <p className="text-xs font-bold text-gray-500">1개 원가: <span className="text-gray-700 dark:text-gray-300">{selectedData.singleCost.toLocaleString()} G</span></p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end w-full md:w-auto bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-gray-200 dark:border-transparent">
                    <span className="text-[10px] font-bold text-gray-500 mb-1">현재 적용 최고가 대비율</span>
                    <div className="flex items-end gap-3 w-full">
                      <div className="flex-1 md:w-48 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-1.5">
                        <div className={`h-full rounded-full transition-all duration-1000 ${selectedData.percentToMax >= 80 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${selectedData.percentToMax}%` }}></div>
                      </div>
                      <span className={`text-lg font-black ${selectedData.percentToMax >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{selectedData.percentToMax.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-5 flex flex-col justify-center shadow-sm">
                    <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">총 예상 순수익</span>
                    <span className={`text-xl md:text-2xl font-black ${selectedData.totalProfit > 0 ? 'text-indigo-700 dark:text-indigo-300' : 'text-rose-500'}`}>
                      {selectedData.totalProfit > 0 ? '+' : ''}{selectedData.totalProfit.toLocaleString()} G
                    </span>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-center shadow-sm">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1">분당 수익률 (효율)</span>
                    <span className={`text-xl md:text-2xl font-black ${selectedData.profitPerMin > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-500'}`}>
                      {selectedData.profitPerMin > 0 ? '+' : ''}{selectedData.profitPerMin.toLocaleString()} G<span className="text-xs text-emerald-600/50 dark:text-emerald-500/50 ml-1">/min</span>
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-transparent rounded-2xl p-5 flex flex-col justify-center">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">총 예상 매출</span>
                    <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{selectedData.totalRevenue.toLocaleString()} G</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-transparent rounded-2xl p-5 flex flex-col justify-center">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">총 소요 시간</span>
                    <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{formatTime(selectedData.totalTimeSec)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-[#16161a] rounded-2xl p-5 border border-gray-200 dark:border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-500 mb-1">수익성 지표 (마진율)</span>
                    <span className={`text-lg font-black ${selectedData.marginRate > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`}>{selectedData.marginRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-500 mb-1">총 재료비 (원가율)</span>
                    <span className="text-lg font-black text-gray-800 dark:text-gray-300">{selectedData.costRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex flex-col col-span-2 md:col-span-1">
                    <span className="text-[10px] font-bold text-gray-500 mb-1">1개당 실제 이윤</span>
                    <span className={`text-lg font-black ${selectedData.totalProfit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                      {safeTargetQty > 0 ? Math.round(selectedData.totalProfit / safeTargetQty).toLocaleString() : 0} G
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    필요 재료 명세서 <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md ml-2">{safeTargetQty}개 기준</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {Object.entries(selectedData.ingredients).map(([ing, count], i) => {
                      const { totalCostForThisIng } = selectedData.parsedCosts[ing];
                      const finalIngCost = Math.round(totalCostForThisIng * safeTargetQty);
                      const imgName = ITEM_IMAGES[ing] || ITEM_IMAGES[ing.replace(' 베이스', ' 씨앗')];
                      return (
                        <div key={i} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-colors ${finalIngCost === 0 ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20' : 'bg-gray-50 dark:bg-[#16161a] border-gray-200 dark:border-white/5'}`}>
                          <div className="relative w-10 h-10 mb-2">
                            <Image src={`${STORAGE_BASE_URL}/ingredients/${imgName}.png`} alt={ing} fill unoptimized={true} className="object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />
                          </div>
                          <span className={`text-[11px] font-black truncate w-full text-center mb-1 ${finalIngCost === 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'}`}>{ing}</span>
                          <div className="flex flex-col items-center gap-0.5 w-full bg-white dark:bg-black/30 rounded-lg py-1.5 mt-1">
                            <span className={`text-[11px] font-black ${finalIngCost === 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}`}>x {count * safeTargetQty}</span>
                            <span className="text-[9px] font-bold text-gray-500">{finalIngCost > 0 ? `${finalIngCost.toLocaleString()} G` : '자가 수급'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}