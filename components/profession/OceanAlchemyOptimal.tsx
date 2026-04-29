'use client';

import { useMemo, useState } from 'react';
import {
  simulateCraftPure, CORE_ITEMS, CORE_BASE_SHELLS,
  VANILLA, BATCH_MATS, formatQty, FISH,
  ALCHEMY_T1, TIER2, RECIPE_FIXES, ALCHEMY_T2,
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
    const overallMissingVanilla: Record<string, number> = {};
    let totalExpectedProfit = 0;

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

        Object.entries(sim.missing).forEach(([m, q]) => {
            overallMissingVanilla[m] = (overallMissingVanilla[m] || 0) + (q as number);
            totalExpectedProfit -= (cost[m] || 0) * (q as number);
        });
        totalExpectedProfit += (itemDef.sellPrice * qty);

        refinedRecommendations.push({
            ...itemDef,
            actualCraftedFromGreedy: qty,
            missingForMax: sim.missing,
            craftedLog: sim.craftedLog,
            stockBeforeCraft: { ...trackingStock }
        });

        trackingStock = sim.stock;
    }

    return { recommendations: refinedRecommendations, totalExpectedProfit, overallMissingVanilla };
  }, [stock, cost, blacklist, allowTierUpgrade, recommendMode, o16Bonus, itemBaseReqsPerUnit]);

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
      <div key={itemName} className="bg-[#16161a] border border-white/5 rounded-lg px-2.5 py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="flex items-center gap-1 shrink-0">
            <img src={getImagePath(itemName)||undefined} className="w-3.5 h-3.5 object-contain opacity-90" />
            <span className="text-[10px] font-bold text-gray-200">{itemName}</span>
            <span className="text-[9px] font-black text-indigo-400">{formatQty(qty, globalSetMode)} 제작</span>
          </div>
          <div className="hidden sm:block w-[1px] h-3 bg-gray-600"></div>
          <div className="flex flex-wrap items-center gap-1.5">
            {recipe.ingredients.map((ing: any) => (
              <span key={ing.name} className="text-[9px] font-medium text-gray-400 flex items-center gap-0.5 bg-black/30 px-1 py-0.5 rounded border border-white/5">
                <img src={getImagePath(ing.name)||undefined} className="w-3 h-3 object-contain opacity-70" />
                {ing.name} <span className="text-white font-bold ml-0.5">{formatQty(ing.req * crafts, globalSetMode)}</span>
              </span>
            ))}
          </div>
        </div>
        {finalSec > 0 && (
          <span className="text-[8px] font-bold text-gray-500 shrink-0 text-right">제작 시간 : {timeStr}</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-5 md:p-6 shadow-md relative overflow-hidden transition-colors">
        {optimalCalculations.recommendations.length === 0 ? (
          <div className="py-12 text-center bg-gray-50 dark:bg-[#111113] rounded-xl border border-gray-200 dark:border-transparent">
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">보유한 재고로 만들 수 있는 연금품이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
            {optimalCalculations.recommendations.map((rec) => {
              const input = craftInputs[rec.name] || { boxes: '', sets: '', units: '' };
              let targetQty = rec.actualCraftedFromGreedy;
              let isCustomQty = false;
              if (input.boxes || input.sets || input.units) {
                  const b = parseInt(input.boxes) || 0;
                  const s = parseInt(input.sets) || 0;
                  const u = parseInt(input.units) || 0;
                  const total = (b * 3456) + (s * 64) + u;
                  if (total > 0 && total <= rec.actualCraftedFromGreedy) {
                      targetQty = total;
                      isCustomQty = true;
                  }
              }

              const isPending = pendingCrafts[rec.name] !== undefined;

              const dynamicSim = isCustomQty 
                  ? simulateCraftPure({ [rec.name]: targetQty }, rec.stockBeforeCraft, allowTierUpgrade)
                  : { missing: rec.missingForMax, craftedLog: rec.craftedLog };

              return (
                <div key={rec.name} className={`border rounded-xl p-4 flex flex-col shadow-sm transition-all duration-300 ${isPending ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-500/30' : 'bg-gray-50 dark:bg-[#111113] border-gray-200 dark:border-transparent hover:shadow-md'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white dark:bg-black rounded-lg p-1 shadow-sm shrink-0 border border-gray-100 dark:border-white/5 flex items-center justify-center">
                        <img src={getImagePath(rec.name) || undefined} className="w-6 h-6 object-contain" alt=""/>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-gray-900 dark:text-white truncate">{rec.name}</h4>
                        <p className="text-[9px] font-bold text-gray-500 mt-0.5">판매가 {rec.sellPrice.toLocaleString()} G</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400">최대 추천량</p>
                       <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{formatQty(rec.actualCraftedFromGreedy, globalSetMode)}</p>
                    </div>
                  </div>

                  <button 
                     onClick={() => toggleExpand(rec.name)}
                     className={`w-full py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors border shadow-sm mb-3 group ${isPending ? 'bg-white/50 dark:bg-black/20 border-indigo-100 dark:border-indigo-500/20' : 'bg-white dark:bg-[#1a1a1e] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-gray-200 dark:border-transparent'}`}
                  >
                     <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                         {expandedRec[rec.name] ? '제작 가이드 닫기' : '제작 가이드 펼쳐보기'}
                     </span>
                  </button>

                  {expandedRec[rec.name] && (
                     <div className={`rounded-lg p-3 mb-3 border shadow-inner ${isPending ? 'bg-white/50 dark:bg-black/20 border-indigo-100 dark:border-indigo-500/20' : 'bg-white dark:bg-[#1a1a1e] border-gray-100 dark:border-white/5'}`}>
                         <h5 className="text-[10px] font-black text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-1.5">
                           단계별 연금 체크리스트 <span className="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1 py-0.5 rounded text-[8px] ml-0.5">({isCustomQty ? `${targetQty}개 기준` : '최대 수량 기준'})</span>
                         </h5>
                         <div className="relative pl-2 border-l-[1.5px] border-indigo-100 dark:border-indigo-500/30 space-y-3 mt-2">
                            
                            <div className="relative">
                               <div className="absolute -left-[11px] top-1 w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                               <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 mb-1">STEP 1. 부족한 바닐라 재료</p>
                               {Object.keys(dynamicSim.missing).length === 0 ? (
                                  <span className="text-[9px] text-gray-500 font-bold bg-white dark:bg-black px-1.5 py-0.5 rounded border border-gray-200 dark:border-transparent inline-block">창고에 모든 기초 재료가 충분합니다.</span>
                               ) : (
                                  <div className="flex flex-wrap gap-1">
                                     {Object.entries(dynamicSim.missing).map(([m, q]) => (
                                        <span key={m} className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-700 dark:text-gray-300 shadow-sm flex items-center gap-1">
                                           <img src={getImagePath(m)||undefined} className="w-2.5 h-2.5 object-contain" />
                                           {m} <span className="text-rose-500 font-black">{formatQty(q as number, globalSetMode)}</span>
                                        </span>
                                     ))}
                                  </div>
                               )}
                            </div>

                            {(() => {
                               const s1 = Object.entries(dynamicSim.craftedLog || {}).filter(([k]) => !k.includes("핵") && !k.includes("결정") && !k.includes("영약") && !OCEAN_FIXED_PRICES.find(p=>p.name===k) && k !== rec.name);
                               if(s1.length === 0) return null;
                               return (
                                  <div className="relative">
                                     <div className="absolute -left-[11px] top-1 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                                     <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 mb-1">STEP 2. 하위 연금/가공 (창고에서 꺼내기)</p>
                                     <div className="flex flex-col gap-1">
                                        {s1.map(([m, q]) => renderCraftStep(m, q as number))}
                                     </div>
                                  </div>
                               )
                            })()}

                            {(() => {
                               const s2 = Object.entries(dynamicSim.craftedLog || {}).filter(([k]) => (k.includes("핵") || k.includes("결정") || k.includes("영약")) && k !== rec.name);
                               if(s2.length === 0) return null;
                               return (
                                  <div className="relative">
                                     <div className="absolute -left-[11px] top-1 w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                                     <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 mb-1">STEP 3. 중급 연금 가공</p>
                                     <div className="flex flex-col gap-1">
                                        {s2.map(([m, q]) => renderCraftStep(m, q as number))}
                                     </div>
                                  </div>
                               )
                            })()}

                            <div className="relative">
                               <div className="absolute -left-[11px] top-1 w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                               <p className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 mb-1">STEP 4. 최종 연금 가공</p>
                               <div className="flex flex-col gap-1">
                                  {renderCraftStep(rec.name, targetQty)}
                               </div>
                            </div>
                         </div>
                     </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-1.5 border-t border-gray-200 dark:border-white/5 pt-2.5 mt-auto">
                    <div className="flex items-stretch justify-end gap-1 w-full sm:w-auto">
                      {isPending ? (
                        <button 
                          onClick={() => handleRemovePending(rec.name)} 
                          className="bg-white dark:bg-[#1a1a1e] border border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-[10px] font-black px-4 py-1.5 rounded shadow-sm transition-all active:scale-95 whitespace-nowrap"
                        >
                          예약 취소
                        </button>
                      ) : (
                        <>
                          <div className="flex items-center bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded overflow-hidden sm:w-[50px]">
                              <input 
                                  type="number" min="0" placeholder="0"
                                  value={craftInputs[rec.name]?.boxes !== undefined ? craftInputs[rec.name].boxes : ''} 
                                  onChange={(e) => handleCraftInputChange(rec.name, 'boxes', e.target.value)}
                                  className="w-full h-6 bg-transparent px-0.5 text-[10px] font-black text-center outline-none focus:bg-indigo-50 dark:focus:bg-indigo-900/20 transition-colors placeholder:font-normal"
                              />
                              <span className="text-[8px] font-bold text-gray-400 pr-1 shrink-0">상자</span>
                          </div>
                          <div className="flex items-center bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded overflow-hidden sm:w-[50px]">
                              <input 
                                  type="number" min="0" placeholder="0"
                                  value={craftInputs[rec.name]?.sets !== undefined ? craftInputs[rec.name].sets : ''} 
                                  onChange={(e) => handleCraftInputChange(rec.name, 'sets', e.target.value)}
                                  className="w-full h-6 bg-transparent px-0.5 text-[10px] font-black text-center outline-none focus:bg-indigo-50 dark:focus:bg-indigo-900/20 transition-colors placeholder:font-normal"
                              />
                              <span className="text-[8px] font-bold text-gray-400 pr-1 shrink-0">셋</span>
                          </div>
                          <div className="flex items-center bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded overflow-hidden sm:w-[50px]">
                              <input 
                                  type="number" min="0" placeholder="0"
                                  value={craftInputs[rec.name]?.units !== undefined ? craftInputs[rec.name].units : ''} 
                                  onChange={(e) => handleCraftInputChange(rec.name, 'units', e.target.value)}
                                  className="w-full h-6 bg-transparent px-0.5 text-[10px] font-black text-center outline-none focus:bg-indigo-50 dark:focus:bg-indigo-900/20 transition-colors placeholder:font-normal"
                              />
                              <span className="text-[8px] font-bold text-gray-400 pr-1 shrink-0">개</span>
                          </div>
                          <button 
                            onClick={() => handleQueueCraft(rec.name, rec.actualCraftedFromGreedy)} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black px-2.5 py-1.5 rounded shadow-sm transition-all active:scale-95 whitespace-nowrap shrink-0"
                          >
                            예약
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {optimalCalculations.recommendations.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/5">
                <h4 className="text-[10px] font-black text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5"><div className="w-1 h-3 bg-amber-500 rounded-full"></div>위 연금을 모두 진행하기 위해 필요한 바닐라 재료</h4>
                {Object.keys(optimalCalculations.overallMissingVanilla).length === 0 ? (
                    <p className="text-[9px] font-bold text-gray-500">추가로 필요한 바닐라 재료가 없습니다.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-1.5">
                        {Object.entries(optimalCalculations.overallMissingVanilla).map(([m, q]) => (
                            <div key={m} className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-transparent p-1.5 rounded-lg flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-1 min-w-0 pr-1">
                                    <img src={getImagePath(m) || undefined} alt="" className="w-3.5 h-3.5 object-contain shrink-0 drop-shadow-sm" />
                                    <span className="text-[9px] font-bold text-gray-800 dark:text-gray-200 truncate">{m}</span>
                                </div>
                                <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">{formatQty(q as number, globalSetMode)}</span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-4 flex justify-end">
                   <p className="text-[11px] font-black text-gray-600 dark:text-gray-400">총 예상 추가 수익: <span className="text-cyan-600 dark:text-cyan-400 text-sm ml-1.5">{optimalCalculations.totalExpectedProfit.toLocaleString()} G</span></p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}