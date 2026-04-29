'use client';

import { useMemo, useState } from 'react';
import {
  simulateCraftPure, CORE_ITEMS, CORE_BASE_SHELLS,
  VANILLA, BATCH_MATS, formatQty, FISH,
  ALCHEMY_T1, TIER2, RECIPE_FIXES, ALCHEMY_T2, ALCHEMY_T3,
  PARSED_RECIPES, parseCraftTime, formatTime, O13_EFFECTS
} from '@/lib/oceanTradeUtils';
import { OCEAN_FIXED_PRICES, getImagePath } from '@/lib/professionData';

interface Props {
  stock: Record<string, number>;
  cost: Record<string, number>;
  blacklist: string[];
  allowTierUpgrade: boolean;
  recommendMode: 'balance' | 'efficiency';
  userStats: any;
  globalSetMode: boolean;
  craftInputs: Record<string, { boxes: string; sets: string; units: string }>;
  pendingCrafts: Record<string, number>;
  handleCraftInputChange: (itemName: string, field: 'boxes' | 'sets' | 'units', value: string) => void;
  handleQueueCraft: (itemName: string, maxQty: number) => void;
  handleRemovePending: (itemName: string) => void;
  itemBaseReqsPerUnit: Record<string, Record<string, number>>;
}

const getBaseEquivalents = (currentStock: Record<string, number>, itemBaseReqsPerUnit: Record<string, Record<string, number>>) => {
  const eq: Record<string, number> = {};
  Object.entries(currentStock).forEach(([name, qty]) => {
    if (qty > 0) {
      if (itemBaseReqsPerUnit[name] && Object.keys(itemBaseReqsPerUnit[name]).length > 0) {
        Object.entries(itemBaseReqsPerUnit[name]).forEach(([bName, bQty]) => {
          eq[bName] = (eq[bName] || 0) + (bQty * qty);
        });
      } else {
        eq[name] = (eq[name] || 0) + qty;
      }
    }
  });
  return eq;
};

const SEAFOOD_LIST = [
  "굴(1성)", "소라(1성)", "문어(1성)", "미역(1성)", "성게(1성)",
  "굴(2성)", "소라(2성)", "문어(2성)", "미역(2성)", "성게(2성)",
  "굴(3성)", "소라(3성)", "문어(3성)", "미역(3성)", "성게(3성)"
];

const FISH_SASHIMI_LIST = [
  ...FISH, '깐 새우', '도미 회', '청어 회', '금붕어 회', '농어 회'
];

export default function OceanAlchemyOptimal({
  stock, cost, blacklist, allowTierUpgrade, recommendMode, userStats, globalSetMode,
  craftInputs, pendingCrafts, handleCraftInputChange, handleQueueCraft, handleRemovePending,
  itemBaseReqsPerUnit
}: Props) {
  const [expandedRec, setExpandedRec] = useState<Record<string, boolean>>({});
  const o16Bonus = [0, 0.05, 0.07, 0.09, 0.12, 0.15, 0.20, 0.25, 0.30][userStats.o16Lv] || 0;
  const o13Reduction = O13_EFFECTS[userStats.o13Lv] || 0;

  const toggleExpand = (name: string) => {
    setExpandedRec(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const optimalCalculations = useMemo(() => {
    const itemsWithProfit = OCEAN_FIXED_PRICES.map(item => {
      const sellPrice = Math.ceil(item.base * (1 + o16Bonus));
      const baseMats = itemBaseReqsPerUnit[item.name] || {};
      let totalCost = 0;
      let hasBlacklist = false;

      Object.entries(baseMats).forEach(([mat, qty]) => {
        if (blacklist.includes(mat)) hasBlacklist = true;
        totalCost += (cost[mat] || 0) * (qty as number);
      });

      return { name: item.name, sellPrice, totalCost, profit: sellPrice - totalCost, hasBlacklist, baseMats };
    }).filter(r => !r.hasBlacklist && r.profit > 0).sort((a, b) => b.profit - a.profit);

    let tempStock = { ...stock };
    let optimalCounts: Record<string, number> = {};
    const baseInvSnapshot = { ...stock }; 

    let keepGoing = true;
    let loopSafety = 0;
    
    while(keepGoing && loopSafety < 1000) {
      keepGoing = false;
      loopSafety++;
      let bestItem = null;
      let bestScore = -Infinity;
      let bestSim = null;
      let bestBatchSize = 1;

      const eqStock = getBaseEquivalents(tempStock, itemBaseReqsPerUnit);

      for (const item of itemsWithProfit) {
        let maxPossible = Infinity;
        let possible = true;
        for (const [mat, count] of Object.entries(item.baseMats)) {
            const countNum = count as number;
            if (CORE_BASE_SHELLS.includes(mat) || FISH.includes(mat)) {
                const avail = eqStock[mat] || 0;
                if (avail < countNum) { possible = false; break; }
                maxPossible = Math.min(maxPossible, Math.floor(avail / countNum));
            }
        }
        if (!possible) continue;

        const batchSize = Math.max(1, Math.floor(maxPossible / 10));

        const sim = simulateCraftPure({ [item.name]: batchSize }, tempStock, allowTierUpgrade);
        const missingKeys = Object.keys(sim.missing);
        const canCraft = missingKeys.every(k => !CORE_ITEMS.includes(k) && !blacklist.includes(k));

        if (canCraft) {
            let penaltyCost = 0;
            for (const mat of CORE_ITEMS) {
                const before = tempStock[mat] || 0;
                const after = sim.stock[mat] || 0;
                const consumed = before - after;
                if (consumed > 0) {
                    const initial = Math.max(1, baseInvSnapshot[mat] || 1);
                    const ratio = initial / (after + 1); 
                    
                    if (recommendMode === 'balance') {
                        penaltyCost += consumed * Math.pow(ratio, 10);
                    } else {
                        penaltyCost += consumed * Math.pow(ratio, 3);
                    }
                }
            }

            if (penaltyCost === 0) penaltyCost = 0.001; 
            const score = (item.profit * batchSize) / penaltyCost;

            if (score > bestScore) {
                bestScore = score;
                bestItem = item;
                bestSim = sim;
                bestBatchSize = batchSize;
            }
        }
      }

      if (bestItem && bestSim) {
          tempStock = bestSim.stock;
          optimalCounts[bestItem.name] = (optimalCounts[bestItem.name] || 0) + bestBatchSize;
          keepGoing = true;
      }
    }

    let trimmed = true;
    let loopSafetyTrim = 0;
    while (trimmed && loopSafetyTrim < 1000) {
      trimmed = false;
      loopSafetyTrim++;

      const currentSim = simulateCraftPure(optimalCounts, stock, allowTierUpgrade);
      const badMats = BATCH_MATS.filter(mat => (currentSim.stock[mat] || 0) > ((stock[mat] || 0) + 1));

      if (badMats.length > 0) {
        const candidates = Object.keys(optimalCounts).filter(k => optimalCounts[k] > 0).sort((a, b) => {
          const pA = itemsWithProfit.find(i=>i.name===a)?.profit || 0;
          const pB = itemsWithProfit.find(i=>i.name===b)?.profit || 0;
          return pA - pB; 
        });

        for (const itemName of candidates) {
          const testCounts = { ...optimalCounts };
          testCounts[itemName]--;
          if (testCounts[itemName] === 0) delete testCounts[itemName];

          const testSim = simulateCraftPure(testCounts, stock, allowTierUpgrade);
          let oldLeftover = 0;
          let newLeftover = 0;
          badMats.forEach(mat => {
            oldLeftover += Math.max(0, (currentSim.stock[mat] || 0) - (stock[mat] || 0));
            newLeftover += Math.max(0, (testSim.stock[mat] || 0) - (stock[mat] || 0));
          });

          if (newLeftover < oldLeftover) {
            optimalCounts[itemName]--;
            if (optimalCounts[itemName] === 0) delete optimalCounts[itemName];
            trimmed = true;
            break; 
          }
        }
        if (!trimmed) break;
      }
    }

    let trackingStock = { ...stock };
    const refinedRecommendations = [];

    const sortedTargetNames = Object.keys(optimalCounts).sort((a, b) => {
        const itemA = itemsWithProfit.find(i=>i.name===a);
        const itemB = itemsWithProfit.find(i=>i.name===b);
        return (itemB?.profit||0) - (itemA?.profit||0);
    });

    for (const itemName of sortedTargetNames) {
        const qty = optimalCounts[itemName];
        const itemDef = itemsWithProfit.find(i => i.name === itemName);
        if (!itemDef) continue;

        const sim = simulateCraftPure({ [itemName]: qty }, trackingStock, allowTierUpgrade);

        refinedRecommendations.push({
            ...itemDef,
            actualCraftedFromGreedy: qty,
            missingForMax: sim.missing,
            craftedLog: sim.craftedLog,
            stockBeforeCraft: { ...trackingStock }
        });

        trackingStock = sim.stock;
    }

    return { recommendations: refinedRecommendations };
  }, [stock, cost, blacklist, allowTierUpgrade, recommendMode, o16Bonus, itemBaseReqsPerUnit]);

  const activeTargets = useMemo(() => {
    const targets: Record<string, number> = {};
    optimalCalculations.recommendations.forEach(rec => {
      const input = craftInputs[rec.name] || { boxes: '', sets: '', units: '' };
      let targetQty = rec.actualCraftedFromGreedy;
      if (input.boxes || input.sets || input.units) {
          const b = parseInt(input.boxes) || 0;
          const s = parseInt(input.sets) || 0;
          const u = parseInt(input.units) || 0;
          const total = (b * 3456) + (s * 64) + u;
          if (total > 0 && total <= rec.actualCraftedFromGreedy) {
              targetQty = total;
          }
      }
      if (targetQty > 0) targets[rec.name] = targetQty;
    });
    return targets;
  }, [optimalCalculations.recommendations, craftInputs]);

  const globalAggregation = useMemo(() => {
    const globalSim = simulateCraftPure(activeTargets, stock, allowTierUpgrade);
    
    let totalRevenue = 0;
    let totalCost = 0;

    Object.entries(activeTargets).forEach(([name, qty]) => {
      const itemDef = optimalCalculations.recommendations.find(r => r.name === name);
      if (itemDef) totalRevenue += itemDef.sellPrice * qty;
    });

    Object.entries(globalSim.missing).forEach(([m, q]) => {
      totalCost += (cost[m] || 0) * (q as number);
    });

    const tier1Crafted: Record<string, number> = {};
    const tier2Crafted: Record<string, number> = {};

    Object.entries(globalSim.craftedLog).forEach(([k, q]) => {
      if (ALCHEMY_T1.includes(k)) tier1Crafted[k] = q;
      else if (ALCHEMY_T2.includes(k)) tier2Crafted[k] = q;
    });

    const prepList: Record<string, number> = {};
    
    Object.keys(stock).forEach(k => {
      const consumed = (stock[k] || 0) - (globalSim.stock[k] || 0);
      if (consumed > 0) {
        prepList[k] = (prepList[k] || 0) + consumed;
      }
    });

    Object.entries(globalSim.missing).forEach(([k, q]) => {
      prepList[k] = (prepList[k] || 0) + (q as number);
    });

    const prepSeafood: Record<string, number> = {};
    const prepAlchemy: Record<string, number> = {};
    const prepVanilla: Record<string, number> = {};

    Object.entries(prepList).forEach(([m, q]) => {
      if (SEAFOOD_LIST.includes(m) || FISH_SASHIMI_LIST.includes(m)) {
        prepSeafood[m] = q;
      } else if ([...ALCHEMY_T1, ...ALCHEMY_T2, ...ALCHEMY_T3].includes(m)) {
        prepAlchemy[m] = q;
      } else {
        prepVanilla[m] = q;
      }
    });

    const sortObj = (obj: Record<string, number>) => {
      return Object.fromEntries(Object.entries(obj).sort(([,a], [,b]) => b - a));
    };

    return { 
      totalRevenue, 
      totalCost, 
      netProfit: totalRevenue - totalCost,
      tier1Crafted,
      tier2Crafted,
      prepSeafood: sortObj(prepSeafood),
      prepAlchemy: sortObj(prepAlchemy),
      prepVanilla: sortObj(prepVanilla)
    };
  }, [activeTargets, stock, allowTierUpgrade, optimalCalculations.recommendations, cost]);

  const renderCraftStep = (itemName: string, qty: number) => {
    let recipe: any = PARSED_RECIPES.find(r => r.name === itemName);
    if (!recipe && RECIPE_FIXES[itemName]) {
      const fixIng = RECIPE_FIXES[itemName].ing;
      const fixReq = RECIPE_FIXES[itemName].req;
      recipe = { name: itemName, yieldAmount: RECIPE_FIXES[itemName].yield, time: '0초', ingredients: [{ name: fixIng, req: fixReq }] };
    }
    if (!recipe) return null;

    const crafts = Math.ceil(qty / recipe.yieldAmount);
    const baseSec = parseCraftTime(recipe.time || '0초') * crafts;
    const finalSec = Math.floor(baseSec * (1 - o13Reduction));
    const timeStr = formatTime(finalSec);

    return (
      <div key={itemName} className="bg-[#16161a] border border-white/5 rounded px-2.5 py-2 flex flex-col xl:flex-row xl:items-center justify-between gap-1.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <img src={getImagePath(itemName)||undefined} className="w-3.5 h-3.5 object-contain opacity-90" />
            <span className="text-[11px] font-bold text-gray-200">{itemName}</span>
            <span className="text-[10px] font-black text-indigo-400">{formatQty(qty, globalSetMode)}</span>
          </div>
          <div className="hidden xl:block w-[1px] h-3 bg-gray-600"></div>
          <div className="flex flex-wrap items-center gap-1.5">
            {recipe.ingredients.map((ing: any) => (
              <span key={ing.name} className="text-[10px] font-medium text-gray-400 flex items-center gap-1 bg-black/30 px-1.5 py-0.5 rounded border border-white/5">
                <img src={getImagePath(ing.name)||undefined} className="w-3 h-3 object-contain opacity-70" />
                {ing.name} <span className="text-white font-bold">{formatQty(ing.req * crafts, globalSetMode)}</span>
              </span>
            ))}
          </div>
        </div>
        {finalSec > 0 && (
          <span className="text-[9px] font-bold text-gray-500 shrink-0 xl:text-right mt-1 xl:mt-0">{timeStr}</span>
        )}
      </div>
    );
  };

  if (optimalCalculations.recommendations.length === 0) {
    return (
      <div className="py-12 text-center bg-gray-50 dark:bg-[#111113] rounded-[1.5rem] border border-gray-200 dark:border-transparent">
        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">보유한 재고로 만들 수 있는 연금품이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center shadow-sm">
          <span className="text-[10px] font-black text-gray-500 mb-1">총 판매 골드</span>
          <span className="text-base font-black text-gray-900 dark:text-white">{globalAggregation.totalRevenue.toLocaleString()} G</span>
        </div>
        <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center shadow-sm">
          <span className="text-[10px] font-black text-gray-500 mb-1">총 재료비</span>
          <span className="text-base font-black text-rose-500">{globalAggregation.totalCost.toLocaleString()} G</span>
        </div>
        <div className="col-span-2 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-200 dark:border-cyan-500/20 rounded-2xl p-4 flex flex-col justify-center items-center shadow-sm">
          <span className="text-[11px] font-black text-cyan-700 dark:text-cyan-400 mb-1">예상 순수익</span>
          <span className="text-xl font-black text-cyan-600 dark:text-cyan-300">{globalAggregation.netProfit.toLocaleString()} G</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0c] border border-gray-300 dark:border-white/5 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-black text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          제작 목표 및 예약
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {optimalCalculations.recommendations.map((rec) => {
            const input = craftInputs[rec.name] || { boxes: '', sets: '', units: '' };
            const isPending = pendingCrafts[rec.name] !== undefined;

            return (
              <div key={rec.name} className={`rounded-xl p-4 flex flex-col gap-3 border transition-all shadow-sm ${isPending ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-500/30' : 'bg-gray-50 dark:bg-[#111113] border-gray-200 dark:border-transparent'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={getImagePath(rec.name) || undefined} className="w-7 h-7 object-contain drop-shadow-sm" alt=""/>
                    <div>
                      <h4 className="text-xs font-black text-gray-900 dark:text-white">{rec.name}</h4>
                      <p className="text-[10px] font-bold text-gray-500 mt-0.5">최대 {formatQty(rec.actualCraftedFromGreedy, globalSetMode)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 mt-1">
                  {isPending ? (
                    <button onClick={() => handleRemovePending(rec.name)} className="w-full h-9 bg-white dark:bg-[#1a1a1e] border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 text-xs font-black rounded-lg shadow-sm transition-all active:scale-95">예약 취소</button>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 w-full">
                        <div className="flex-1 flex items-center bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden h-9 transition-colors focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 shadow-sm">
                            <input type="number" min="0" placeholder="0" value={input.boxes} onChange={(e) => handleCraftInputChange(rec.name, 'boxes', e.target.value)} className="w-full bg-transparent px-2 text-xs font-black text-center outline-none" />
                            <span className="text-[10px] font-bold text-gray-500 pr-2 shrink-0">상자</span>
                        </div>
                        <div className="flex-1 flex items-center bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden h-9 transition-colors focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 shadow-sm">
                            <input type="number" min="0" placeholder="0" value={input.sets} onChange={(e) => handleCraftInputChange(rec.name, 'sets', e.target.value)} className="w-full bg-transparent px-2 text-xs font-black text-center outline-none" />
                            <span className="text-[10px] font-bold text-gray-500 pr-2 shrink-0">셋</span>
                        </div>
                        <div className="flex-1 flex items-center bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden h-9 transition-colors focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 shadow-sm">
                            <input type="number" min="0" placeholder="0" value={input.units} onChange={(e) => handleCraftInputChange(rec.name, 'units', e.target.value)} className="w-full bg-transparent px-2 text-xs font-black text-center outline-none" />
                            <span className="text-[10px] font-bold text-gray-500 pr-2 shrink-0">개</span>
                        </div>
                      </div>
                      <button onClick={() => handleQueueCraft(rec.name, rec.actualCraftedFromGreedy)} className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black rounded-lg shadow-sm transition-all active:scale-95">
                        예약하기
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0a0a0c] border border-gray-300 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <h3 className="text-[11px] font-black text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-1.5">
            1단계 하위 연금/가공 (총합)
          </h3>
          {Object.keys(globalAggregation.tier1Crafted).length === 0 ? (
            <p className="text-[10px] text-gray-500 text-center py-4 bg-gray-50 dark:bg-[#111113] rounded-lg">하위 가공이 필요하지 않습니다.</p>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-1.5">
              {Object.entries(globalAggregation.tier1Crafted).map(([item, qty]) => (
                <div key={item} className="bg-gray-50 dark:bg-[#111113] border border-gray-100 dark:border-white/5 rounded px-2 py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <img src={getImagePath(item)||undefined} className="w-3.5 h-3.5 object-contain" />
                    <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200">{item}</span>
                  </div>
                  <span className="text-[10px] font-black text-indigo-500">{formatQty(qty, globalSetMode)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#0a0a0c] border border-gray-300 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <h3 className="text-[11px] font-black text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-1.5">
            2단계 중급 연금 (총합)
          </h3>
          {Object.keys(globalAggregation.tier2Crafted).length === 0 ? (
            <p className="text-[10px] text-gray-500 text-center py-4 bg-gray-50 dark:bg-[#111113] rounded-lg">중급 연금이 필요하지 않습니다.</p>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-1.5">
              {Object.entries(globalAggregation.tier2Crafted).map(([item, qty]) => (
                <div key={item} className="bg-gray-50 dark:bg-[#111113] border border-gray-100 dark:border-white/5 rounded px-2 py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <img src={getImagePath(item)||undefined} className="w-3.5 h-3.5 object-contain" />
                    <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200">{item}</span>
                  </div>
                  <span className="text-[10px] font-black text-purple-500">{formatQty(qty, globalSetMode)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0c] border border-gray-300 dark:border-white/5 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-black text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          총 준비물 리스트 (창고 출고 + 추가 필요)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-blue-50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4">
            <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 mb-3 border-b border-blue-200 dark:border-blue-800/30 pb-2">어패류 및 생선류</h4>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-1.5">
              {Object.keys(globalAggregation.prepSeafood).length === 0 ? <p className="text-[10px] text-gray-500">필요 없음</p> : 
                Object.entries(globalAggregation.prepSeafood).map(([m, q]) => (
                  <div key={m} className="flex items-center justify-between text-[11px] bg-white dark:bg-black/20 px-2 py-1.5 rounded border border-blue-100 dark:border-transparent">
                    <div className="flex items-center gap-1.5"><img src={getImagePath(m)||undefined} className="w-3.5 h-3.5 object-contain" /><span className="font-bold text-gray-800 dark:text-gray-300">{m}</span></div>
                    <span className="font-black text-blue-700 dark:text-blue-400">{formatQty(q, globalSetMode)}</span>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/30 rounded-xl p-4">
            <h4 className="text-xs font-black text-purple-600 dark:text-purple-400 mb-3 border-b border-purple-200 dark:border-purple-800/30 pb-2">연금품 및 가공품</h4>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-1.5">
              {Object.keys(globalAggregation.prepAlchemy).length === 0 ? <p className="text-[10px] text-gray-500">필요 없음</p> : 
                Object.entries(globalAggregation.prepAlchemy).map(([m, q]) => (
                  <div key={m} className="flex items-center justify-between text-[11px] bg-white dark:bg-black/20 px-2 py-1.5 rounded border border-purple-100 dark:border-transparent">
                    <div className="flex items-center gap-1.5"><img src={getImagePath(m)||undefined} className="w-3.5 h-3.5 object-contain" /><span className="font-bold text-gray-800 dark:text-gray-300">{m}</span></div>
                    <span className="font-black text-purple-700 dark:text-purple-400">{formatQty(q, globalSetMode)}</span>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4">
            <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 mb-3 border-b border-amber-200 dark:border-amber-800/30 pb-2">바닐라 재료 및 블록</h4>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-1.5">
              {Object.keys(globalAggregation.prepVanilla).length === 0 ? <p className="text-[10px] text-gray-500">필요 없음</p> : 
                Object.entries(globalAggregation.prepVanilla).map(([m, q]) => (
                  <div key={m} className="flex items-center justify-between text-[11px] bg-white dark:bg-black/20 px-2 py-1.5 rounded border border-amber-100 dark:border-transparent">
                    <div className="flex items-center gap-1.5"><img src={getImagePath(m)||undefined} className="w-3.5 h-3.5 object-contain" /><span className="font-bold text-gray-800 dark:text-gray-300">{m}</span></div>
                    <span className="font-black text-amber-700 dark:text-amber-400">{formatQty(q, globalSetMode)}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      {Object.keys(activeTargets).length > 0 && (
        <div className="bg-white dark:bg-[#0a0a0c] border border-gray-300 dark:border-white/5 rounded-2xl p-5 shadow-sm mt-4">
          <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            개별 제작 가이드 상세
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(activeTargets).map(([itemName, targetQty]) => {
              const rec = optimalCalculations.recommendations.find(r => r.name === itemName);
              if (!rec) return null;
              const dynamicSim = simulateCraftPure({ [itemName]: targetQty }, rec.stockBeforeCraft, allowTierUpgrade);

              return (
                <div key={itemName} className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-white/5 rounded-xl p-4 shadow-sm flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <img src={getImagePath(itemName)||undefined} className="w-5 h-5 object-contain drop-shadow-sm" />
                      <span className="text-xs font-black text-gray-900 dark:text-white">{itemName}</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">{formatQty(targetQty, globalSetMode)} 기준</span>
                  </div>
                  
                  <div className="flex flex-col gap-4 flex-1">
                    <div>
                      <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 mb-1.5">STEP 1. 부족한 바닐라 재료</p>
                      {Object.keys(dynamicSim.missing).length === 0 ? (
                        <span className="text-[10px] text-gray-500 font-bold">재고 충분</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {Object.entries(dynamicSim.missing).map(([m, q]) => (
                              <span key={m} className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 px-1.5 py-1 rounded text-[9px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1 shadow-sm">
                                  <img src={getImagePath(m)||undefined} className="w-3 h-3 object-contain" />
                                  {m} <span className="text-rose-500">{formatQty(q as number, globalSetMode)}</span>
                              </span>
                            ))}
                        </div>
                      )}
                    </div>

                    {(() => {
                        const s1 = Object.entries(dynamicSim.craftedLog || {}).filter(([k]) => !k.includes("핵") && !k.includes("결정") && !k.includes("영약") && !OCEAN_FIXED_PRICES.find(p=>p.name===k) && k !== itemName);
                        if(s1.length === 0) return null;
                        return (
                          <div>
                              <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 mb-1.5">STEP 2. 하위 연금/가공 (창고에서 꺼내기)</p>
                              <div className="flex flex-col gap-1.5">
                                {s1.map(([m, q]) => renderCraftStep(m, q as number))}
                              </div>
                          </div>
                        )
                    })()}

                    {(() => {
                        const s2 = Object.entries(dynamicSim.craftedLog || {}).filter(([k]) => (k.includes("핵") || k.includes("결정") || k.includes("영약")) && k !== itemName);
                        if(s2.length === 0) return null;
                        return (
                          <div>
                              <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 mb-1.5">STEP 3. 중급 연금 가공</p>
                              <div className="flex flex-col gap-1.5">
                                {s2.map(([m, q]) => renderCraftStep(m, q as number))}
                              </div>
                          </div>
                        )
                    })()}

                    <div className="mt-auto pt-2">
                        <p className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 mb-1.5">STEP 4. 최종 연금 가공</p>
                        <div className="flex flex-col gap-1.5">
                          {renderCraftStep(itemName, targetQty)}
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}