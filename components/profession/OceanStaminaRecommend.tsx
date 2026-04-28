'use client';

import { useEffect, useState } from 'react';
import {
  simulateCraftPure, CORE_ITEMS, CORE_BASE_SHELLS,
  VANILLA, BATCH_MATS, formatQty, getCombinations, FISH
} from '@/lib/oceanTradeUtils';
import { OCEAN_FIXED_PRICES } from '@/lib/professionData';

interface Props {
  stock: Record<string, number>;
  cost: Record<string, number>;
  blacklist: string[];
  allowTierUpgrade: boolean;
  recommendMode: 'balance' | 'efficiency';
  userStats: any;
  toolImprints: any;
  globalSetMode: boolean;
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

export default function OceanStaminaRecommend({
  stock, cost, blacklist, allowTierUpgrade, recommendMode, userStats, toolImprints, globalSetMode,
  itemBaseReqsPerUnit
}: Props) {
  const [isStaminaModalOpen, setIsStaminaModalOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [staminaRecommendation, setStaminaRecommendation] = useState<any>(null);

  useEffect(() => {
    setIsCalculating(true);

    const timer = setTimeout(() => {
      const evalStockFast = (addedStock: Record<string, number>, sortedItems: any[]) => {
        let tempStock = { ...stock };
        for(const k in addedStock) tempStock[k] = (tempStock[k] || 0) + addedStock[k];
        
        const initialEqSum = Object.values(getBaseEquivalents(tempStock, itemBaseReqsPerUnit)).reduce((a: number, b: number) => a + b, 0);
        const crafted: Record<string, number> = {};
        const baseInvSnapshot = { ...tempStock };
        
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

          for (const item of sortedItems) {
            let maxPossible = Infinity;
            let possible = true;
            for (const [mat, count] of Object.entries(itemBaseReqsPerUnit[item.name] || {})) {
                const countNum = count as number;
                if (CORE_BASE_SHELLS.includes(mat) || FISH.includes(mat)) {
                    const avail = eqStock[mat] || 0;
                    if (avail < countNum) { possible = false; break; }
                    maxPossible = Math.min(maxPossible, Math.floor(avail / countNum));
                }
            }
            if (!possible) continue;

            const batchSize = Math.max(1, Math.floor(maxPossible / 5));

            const sim = simulateCraftPure({ [item.name]: batchSize }, tempStock, allowTierUpgrade);
            const missingKeys = Object.keys(sim.missing);
            const canCraft = missingKeys.every(k => VANILLA.includes(k) && !blacklist.includes(k));

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
              crafted[bestItem.name] = (crafted[bestItem.name] || 0) + bestBatchSize;
              keepGoing = true;
          }
        }

        let trimmed = true;
        let loopSafetyTrim = 0;
        while (trimmed && loopSafetyTrim < 1000) {
          trimmed = false;
          loopSafetyTrim++;

          const currentSim = simulateCraftPure(crafted, { ...stock, ...addedStock }, allowTierUpgrade);
          const badMats = BATCH_MATS.filter(mat => (currentSim.stock[mat] || 0) > ((stock[mat] || 0) + (addedStock[mat] || 0) + 1));

          if (badMats.length > 0) {
            const candidates = Object.keys(crafted).filter(k => crafted[k] > 0).sort((a, b) => {
              const pA = sortedItems.find(i=>i.name===a)?.sellPrice || 0;
              const pB = sortedItems.find(i=>i.name===b)?.sellPrice || 0;
              return pA - pB; 
            });

            for (const itemName of candidates) {
              const testCounts = { ...crafted };
              testCounts[itemName]--;
              if (testCounts[itemName] === 0) delete testCounts[itemName];

              const testSim = simulateCraftPure(testCounts, { ...stock, ...addedStock }, allowTierUpgrade);
              let oldLeftover = 0;
              let newLeftover = 0;
              badMats.forEach(mat => {
                oldLeftover += Math.max(0, (currentSim.stock[mat] || 0) - ((stock[mat] || 0) + (addedStock[mat] || 0)));
                newLeftover += Math.max(0, (testSim.stock[mat] || 0) - ((stock[mat] || 0) + (addedStock[mat] || 0)));
              });

              if (newLeftover < oldLeftover) {
                crafted[itemName]--;
                if (crafted[itemName] === 0) delete crafted[itemName];
                trimmed = true;
                break; 
              }
            }
            if (!trimmed) break;
          }
        }
        
        let totalP = 0;
        const finalSim = simulateCraftPure(crafted, { ...stock, ...addedStock }, allowTierUpgrade);
        let totalVanillaCost = 0;
        Object.entries(finalSim.missing).forEach(([m, q]) => totalVanillaCost += (q as number) * (cost[m] || 0));

        Object.entries(crafted).forEach(([m, q]) => {
            const itemDef = sortedItems.find(i => i.name === m);
            if (itemDef) totalP += itemDef.sellPrice * (q as number);
        });
        totalP -= totalVanillaCost;

        const finalEqSum = Object.values(getBaseEquivalents(tempStock, itemBaseReqsPerUnit)).reduce((a: number, b: number) => a + b, 0);
        const stockConsumed = initialEqSum - finalEqSum;

        return { profit: totalP, stockConsumed, crafted, resultingStock: tempStock };
      };

      const o16Bonus = [0, 0.05, 0.07, 0.09, 0.12, 0.15, 0.20, 0.25, 0.30][userStats.o16Lv] || 0;
      const sortedItems = OCEAN_FIXED_PRICES.map(item => {
          const sellPrice = Math.ceil(item.base * (1 + o16Bonus));
          const baseMats = itemBaseReqsPerUnit[item.name] || {};
          let totalCost = 0;
          Object.entries(baseMats).forEach(([mat, qty]) => totalCost += (cost[mat] || 0) * (qty as number));
          return { name: item.name, sellPrice, profit: sellPrice - totalCost };
      }).filter(i => i.profit > 0);

      if (!userStats.stamina || userStats.stamina < 15) {
        setStaminaRecommendation(null);
        setIsCalculating(false);
        return;
      }

      const o11Mult = 1 + ([0, 0.05, 0.07, 0.10, 0.15, 0.20][userStats.o11Lv] || 0);
      const rodLevel = Math.min(15, Math.max(0, userStats.rodLv));
      const rawDropCount = [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 10][rodLevel] || 1;
      
      const rodShell = [0, 0.25, 0.5, 0.75, 1][toolImprints?.['rod']?.['rod_shell'] || 0] || 0;
      const rodRoulette = [0, 0.01, 0.02, 0.03, 0.04, 0.05][toolImprints?.['rod']?.['rod_roulette'] || 0] || 0;

      const o17Prob = [0, 0.01, 0.03, 0.05, 0.07, 0.10, 0.15][userStats.o17Lv] || 0;
      const p3 = 0.10 + o17Prob;
      const p2 = 0.30;
      const p1 = Math.max(0, 1.0 - p2 - p3);

      const getYield = (stamina: number, category: string) => {
          const actions = Math.floor(stamina / 15);
          if (actions <= 0) return {};
          const totalItems = (actions * rawDropCount * o11Mult) + (actions * rodShell) + (actions * rodRoulette * 19.25);
          
          return {
              [`${category}(1성)`]: Math.round(totalItems * p1),
              [`${category}(2성)`]: Math.round(totalItems * p2),
              [`${category}(3성)`]: Math.round(totalItems * p3),
          };
      };

      const TARGET_CATEGORIES = ['굴', '소라', '문어', '미역', '성게'];
      const totalStamina = userStats.stamina;
      const maxActions = Math.floor(totalStamina / 15);

      let bestScenario: any = null;
      let maxFoundConsumed = -1;
      let maxFoundProfitForConsumed = -1;

      if (maxActions > 0) {
          const NUM_CHUNKS = Math.min(maxActions, 6);
          const actionsPerChunk = Math.floor(maxActions / NUM_CHUNKS);
          const remainderActions = maxActions % NUM_CHUNKS;

          const chunksCombos = getCombinations(5, NUM_CHUNKS);

          for (let c = 0; c < chunksCombos.length; c++) {
              const combo = chunksCombos[c];
              let combinedYield: Record<string, number> = {};
              let distribution: Record<string, number> = {};

              let maxChunkVal = Math.max(...combo);
              let remainderAdded = false;

              for (let i = 0; i < 5; i++) {
                  let actions = combo[i] * actionsPerChunk;
                  if (!remainderAdded && combo[i] === maxChunkVal) {
                      actions += remainderActions;
                      remainderAdded = true;
                  }

                  if (actions > 0) {
                      const cat = TARGET_CATEGORIES[i];
                      distribution[cat] = actions * 15;
                      const catYield = getYield(actions * 15, cat);
                      for (const k in catYield) combinedYield[k] = (combinedYield[k] || 0) + catYield[k];
                  }
              }

              const res = evalStockFast(combinedYield, sortedItems);

              if (res.stockConsumed > maxFoundConsumed || (res.stockConsumed === maxFoundConsumed && res.profit > maxFoundProfitForConsumed)) {
                  maxFoundConsumed = res.stockConsumed;
                  maxFoundProfitForConsumed = res.profit;
                  bestScenario = {
                      type: 'multi',
                      distribution,
                      profit: res.profit,
                      stockConsumed: res.stockConsumed,
                      crafted: res.crafted,
                      finalStock: res.resultingStock
                  };
              }
          }
      }
      
      setStaminaRecommendation(bestScenario);
      setIsCalculating(false);

    }, 50);

    return () => clearTimeout(timer);
  }, [stock, cost, blacklist, userStats, toolImprints, allowTierUpgrade, recommendMode, itemBaseReqsPerUnit]);


  if (isCalculating) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md transition-colors">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-white/5 pb-4">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">스태미나 추천</h3>
            <p className="text-[11px] text-gray-500 mt-1.5">현재 창고에 보유 중인 재고를 가장 효율적으로 소모할 수 있는 채집 경로입니다.</p>
          </div>
        </div>
        <div className="py-20 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#111113] rounded-[1.5rem] border border-gray-200 dark:border-transparent">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-black text-gray-700 dark:text-gray-300">최적의 채집 경로를 계산하고 있습니다...</p>
          <p className="text-[10px] font-bold text-gray-500 mt-2">보유 재고량에 따라 수 초가 소요될 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md transition-colors">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-white/5 pb-4">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">스태미나 추천</h3>
            <p className="text-[11px] text-gray-500 mt-1.5">현재 창고에 보유 중인 재고를 가장 효율적으로 소모할 수 있는 채집 경로입니다.</p>
          </div>
          {staminaRecommendation && staminaRecommendation.profit > 0 && (
            <button onClick={() => setIsStaminaModalOpen(true)} className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 text-[10px] font-black px-3 py-1.5 rounded border border-gray-200 dark:border-transparent transition-colors">자세히 보기</button>
          )}
        </div>
        
        {!userStats.stamina || userStats.stamina < 15 ? (
          <div className="py-16 text-center bg-gray-50 dark:bg-[#111113] rounded-[1.5rem] border border-gray-200 dark:border-transparent">
            <p className="text-sm font-bold text-rose-500">가용 스태미나가 15 미만입니다. 우측 상단 개인설정에서 스태미나를 올바르게 입력해 주세요.</p>
          </div>
        ) : !staminaRecommendation ? (
          <div className="py-16 text-center bg-gray-50 dark:bg-[#111113] rounded-[1.5rem] border border-gray-200 dark:border-transparent">
            <p className="text-sm font-bold text-gray-500">분석 가능한 데이터를 찾을 수 없습니다.</p>
          </div>
        ) : staminaRecommendation.profit === 0 ? (
          <div className="py-16 text-center bg-gray-50 dark:bg-[#111113] rounded-[1.5rem] border border-gray-200 dark:border-transparent flex flex-col items-center justify-center">
            <p className="text-[11px] font-bold text-gray-500 mb-2">현재 가용 스태미나와 재고로는 어떤 완성품도 제작할 수 없습니다.</p>
            <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-transparent">
              기초 재료를 채집하여 재고를 비축해 보세요.
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-xl p-6 md:p-8 shadow-sm transition-colors text-center md:text-left">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-loose break-keep">
              현재 가용 스태미나 <span className="font-black text-gray-900 dark:text-white">{userStats.stamina.toLocaleString()}</span> 중, 창고의 재고를 분석했을 때 <br className="hidden md:block"/>
              {Object.keys(staminaRecommendation.distribution).length === 1 ? (
                <span>전체 스태미나를 <span className="font-black text-indigo-600 dark:text-indigo-400">[{Object.keys(staminaRecommendation.distribution)[0]}]</span> 채집에 집중하는 것을 추천드립니다.</span>
              ) : (
                <span>
                  {Object.entries(staminaRecommendation.distribution).map(([cat, stam], idx, arr) => (
                      <span key={cat}>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">{(stam as number).toLocaleString()}</span> 스태미나는 <span className="font-black text-emerald-600 dark:text-emerald-400">[{cat}]</span> 채집에{idx === arr.length - 1 ? ' 사용하는 것을 추천드립니다.' : ', '}
                      </span>
                  ))}
                </span>
              )}
            </p>
            <div className="mt-6 pt-5 border-t border-gray-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap justify-center md:justify-start gap-1.5">
                {Object.entries(staminaRecommendation.crafted).map(([item, qty]) => (
                  <span key={item} className="bg-white dark:bg-[#1a1a1e] border border-gray-200 dark:border-transparent px-2.5 py-1 rounded-md text-[10px] font-black text-gray-900 dark:text-white shadow-sm transition-colors">
                    {item} <span className="text-gray-500 ml-1">{formatQty(qty as number, globalSetMode)}</span>
                  </span>
                ))}
              </div>
              <div className="text-center sm:text-right shrink-0">
                <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase mb-0.5">총 예상 순수익</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{Math.round(staminaRecommendation.profit).toLocaleString()} G</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {isStaminaModalOpen && staminaRecommendation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsStaminaModalOpen(false)}></div>
          <div className="relative z-10 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-xl dark:shadow-2xl max-w-lg w-full transition-colors animate-fade-in-up">
            <div className="flex justify-between items-center mb-5 border-b border-gray-100 dark:border-white/5 pb-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">스태미나 추천 알고리즘 상세</h3>
              <button onClick={() => setIsStaminaModalOpen(false)} className="text-sm font-black text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">닫기</button>
            </div>
            
            <div className="space-y-5">
              <div className="bg-gray-50 dark:bg-[#111113] p-4 rounded-xl border border-gray-200 dark:border-transparent shadow-inner">
                <p className="text-[11px] font-black text-gray-500 mb-2 tracking-widest uppercase">1. 나의 현재 스펙 기준 예상 획득량</p>
                <ul className="text-xs font-bold text-gray-700 dark:text-gray-300 space-y-1.5 pl-1">
                  <li> 가용 스태미나: <span className="text-gray-900 dark:text-white font-black">{userStats.stamina.toLocaleString()}</span> (총 {Math.floor(userStats.stamina / 15)}회 액션)</li>
                  <li> 각인석 옵션(어패 행운/어부 룰렛) 및 스킬 효과를 모두 반영하여 기댓값을 정밀 계산했습니다.</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-[#111113] p-4 rounded-xl border border-gray-200 dark:border-transparent shadow-inner">
                <p className="text-[11px] font-black text-gray-500 mb-2 tracking-widest uppercase">2. 채집 시나리오 도출 배경</p>
                {Object.keys(staminaRecommendation.distribution).length === 1 ? (
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-relaxed pl-1">
                    단일 타겟 <span className="text-indigo-600 dark:text-indigo-400 font-black">[{Object.keys(staminaRecommendation.distribution)[0]}]</span> 채집 시 창고의 기존 재고 소진 밸런스와 순수익 마진율이 모두 최고점에 달하여, 스태미나를 분산시키지 않고 올인하는 것이 가장 유리하다고 판단했습니다.
                  </p>
                ) : (
                  <ul className="text-xs font-bold text-gray-700 dark:text-gray-300 space-y-2.5 pl-1">
                    {Object.entries(staminaRecommendation.distribution).map(([cat, stam], idx) => (
                      <li key={cat}>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">{idx + 1}순위 타겟 [{cat}]:</span> 스태미나 {(stam as number).toLocaleString()} 할당
                      </li>
                    ))}
                    <li className="text-[11px] text-gray-500 mt-2">
                      창고에 보유 중인 고가치 연금품의 부족한 기초 재료를 가장 균형 있게 채워 넣기 위한 다중 분할 스태미나 최적화 결과입니다.
                    </li>
                  </ul>
                )}
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-transparent shadow-sm">
                <p className="text-[11px] font-black text-amber-700 dark:text-amber-400 mb-1.5 tracking-widest uppercase">3. 특이사항: 희소성 가중치 적용</p>
                <p className="text-[11px] font-bold text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                  재고를 소진할 때 특정 어패류가 고갈되지 않도록, 희소성이 높아진 재료를 사용하는 레시피에는 페널티를 부여하여 남는 재료가 최소화되도록 설계되었습니다.
                </p>
              </div>
            </div>
            <button onClick={() => setIsStaminaModalOpen(false)} className="w-full mt-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black py-3 rounded-xl transition-all active:scale-95 shadow-md">확인</button>
          </div>
        </div>
      )}
    </>
  );
}