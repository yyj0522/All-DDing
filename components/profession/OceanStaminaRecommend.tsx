'use client';

import { useEffect, useState } from 'react';
import {
  simulateCraftPure, CORE_ITEMS, CORE_BASE_SHELLS,
  VANILLA, BATCH_MATS, formatQty, getCombinations, FISH, getImagePath,
  PARSED_RECIPES, RECIPE_FIXES, parseCraftTime, formatTime, O13_EFFECTS
} from '@/lib/oceanTradeUtils';
import { OCEAN_FIXED_PRICES } from '@/lib/professionData';
import { SAGE_TOOL_EFFECTS } from '@/lib/sageData';

interface Props {
  stock: Record<string, number>;
  cost: Record<string, number>;
  blacklist: string[];
  recommendMode: 'balance' | 'max_profit';
  userStats: any;
  toolImprints: any;
  globalSetMode: boolean;
  itemBaseReqsPerUnit: Record<string, Record<string, number>>;
}

const IMPRINT_ROD_SHELL_CHANCE = [0, 0.25, 0.50, 0.75, 1.00];
const IMPRINT_ROD_ROULETTE_CHANCE = [0, 0.01, 0.02, 0.03, 0.04, 0.05];

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
  stock, cost, blacklist, recommendMode, userStats, toolImprints, globalSetMode,
  itemBaseReqsPerUnit
}: Props) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [staminaRecommendation, setStaminaRecommendation] = useState<any>(null);
  const [blueprintViewMode, setBlueprintViewMode] = useState<'flow' | 'compact'>('flow');
  const [isPhase3Open, setIsPhase3Open] = useState(false); 
  const [actualYields, setActualYields] = useState<Record<string, number>>({});

  const o13Reduction = O13_EFFECTS[userStats.o13Lv || 0] || 0;

  useEffect(() => {
    if (staminaRecommendation?.combinedYield) {
      setActualYields(staminaRecommendation.combinedYield);
    }
  }, [staminaRecommendation]);

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
                if (CORE_BASE_SHELLS.includes(mat)) {
                    const avail = eqStock[mat] || 0;
                    if (avail < countNum) { possible = false; break; }
                    maxPossible = Math.min(maxPossible, Math.floor(avail / countNum));
                }
            }
            if (!possible) continue;

            const batchSize = Math.max(1, Math.floor(maxPossible / 5));

            const sim = simulateCraftPure({ [item.name]: batchSize }, tempStock);
            const missingKeys = Object.keys(sim.missing);
            const canCraft = missingKeys.every(k => VANILLA.includes(k) && !blacklist.includes(k));

            if (canCraft) {
                let penaltyCost = 0;
                if (recommendMode === 'balance') {
                    for (const mat of CORE_ITEMS) {
                        const before = tempStock[mat] || 0;
                        const after = sim.stock[mat] || 0;
                        const consumed = before - after;
                        if (consumed > 0) {
                            const initial = Math.max(1, baseInvSnapshot[mat] || 1);
                            const ratio = initial / (after + 1); 
                            penaltyCost += consumed * Math.pow(ratio, 10);
                        }
                    }
                } else {
                    penaltyCost = 1;
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

        if (recommendMode === 'balance') {
            let trimmed = true;
            let loopSafetyTrim = 0;
            while (trimmed && loopSafetyTrim < 1000) {
              trimmed = false;
              loopSafetyTrim++;

              const currentSim = simulateCraftPure(crafted, { ...stock, ...addedStock });
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

                  const testSim = simulateCraftPure(testCounts, { ...stock, ...addedStock });
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
        }
        
        let totalP = 0;
        const finalSim = simulateCraftPure(crafted, { ...stock, ...addedStock });
        let totalVanillaCost = 0;
        Object.entries(finalSim.missing).forEach(([m, q]) => totalVanillaCost += (q as number) * (cost[m] || 0));

        Object.entries(crafted).forEach(([m, q]) => {
            const itemDef = sortedItems.find(i => i.name === m);
            if (itemDef) totalP += itemDef.sellPrice * (q as number);
        });
        totalP -= totalVanillaCost;

        const finalEqSum = Object.values(getBaseEquivalents(tempStock, itemBaseReqsPerUnit)).reduce((a: number, b: number) => a + b, 0);
        const stockConsumed = initialEqSum - finalEqSum;

        return { profit: totalP, totalVanillaCost, stockConsumed, crafted, resultingStock: tempStock };
      };

      const o16Bonus = [0, 0.05, 0.07, 0.09, 0.12, 0.15, 0.20, 0.25, 0.30][userStats.o16Lv || 0] || 0;
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

      const o11Bonus = [0, 0.05, 0.07, 0.10, 0.15, 0.20][userStats.o11Lv || 0] || 0;
      const rodData = userStats.rodLv > 0 ? SAGE_TOOL_EFFECTS.rod[userStats.rodLv - 1] : { '어패류 드롭 수': '1' };
      const baseDrop = parseInt(rodData['어패류 드롭 수']) || 1;
      
      const shellImprintLv = toolImprints?.['rod']?.['rod_shell'] || 0;
      const rouletteImprintLv = toolImprints?.['rod']?.['rod_roulette'] || 0;

      const expectedDropPerAction = baseDrop + o11Bonus + IMPRINT_ROD_SHELL_CHANCE[shellImprintLv] + (IMPRINT_ROD_ROULETTE_CHANCE[rouletteImprintLv] * 19.25);

      const o17Bonus = [0, 0.01, 0.03, 0.05, 0.07, 0.10, 0.15][userStats.o17Lv || 0] || 0;
      const p3 = 0.10 + o17Bonus;
      const p2 = 0.30 - (o17Bonus * (1 / 3));
      const p1 = 0.60 - (o17Bonus * (2 / 3));

      const getYield = (stamina: number, category: string) => {
          const actions = Math.floor(stamina / 15);
          if (actions <= 0) return {};
          const totalItems = actions * expectedDropPerAction;
          
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
                      combinedYield,
                      profit: res.profit,
                      totalVanillaCost: res.totalVanillaCost,
                      stockConsumed: res.stockConsumed,
                      crafted: res.crafted,
                      finalStock: res.resultingStock
                  };
              }
          }
      }
      
      if (bestScenario) {
          const baseRes = evalStockFast({}, sortedItems);
          bestScenario.baseProfit = baseRes.profit;
          bestScenario.addedProfit = bestScenario.profit - baseRes.profit;

          const addedStock = bestScenario.combinedYield;
          let trackingStock = { ...stock };
          for(const k in addedStock) trackingStock[k] = (trackingStock[k] || 0) + addedStock[k];

          const sortedCraftedNames = Object.keys(bestScenario.crafted).sort((a, b) => {
              const pA = sortedItems.find(i=>i.name===a)?.profit || 0;
              const pB = sortedItems.find(i=>i.name===b)?.profit || 0;
              return pB - pA;
          });

          const flowDetails = [];
          for (const itemName of sortedCraftedNames) {
              const qty = bestScenario.crafted[itemName];
              const sim = simulateCraftPure({ [itemName]: qty }, trackingStock);
              flowDetails.push({
                  name: itemName,
                  qty: qty,
                  missing: sim.missing,
                  craftedLog: sim.craftedLog,
                  stockBeforeCraft: { ...trackingStock }
              });
              trackingStock = sim.stock;
          }
          bestScenario.flowDetails = flowDetails;
      }

      setStaminaRecommendation(bestScenario);
      setIsCalculating(false);

    }, 300);

    return () => clearTimeout(timer);
  }, [stock, cost, blacklist, userStats, toolImprints, recommendMode, itemBaseReqsPerUnit]);

  const handleMergeStock = () => {
    if (confirm('입력하신 실제 획득량을 내 창고 재고에 합산하시겠습니까?')) {
      const savedV3 = localStorage.getItem('ocean_trade_v3');
      const parsedV3 = savedV3 ? JSON.parse(savedV3) : { stock: {} };
      if (!parsedV3.stock) parsedV3.stock = { ...stock };
      
      let hasUpdates = false;
      Object.entries(actualYields).forEach(([item, qty]) => {
        if (qty > 0) {
          parsedV3.stock[item] = (parsedV3.stock[item] || 0) + qty;
          hasUpdates = true;
        }
      });
      
      if (hasUpdates) {
        localStorage.setItem('ocean_trade_v3', JSON.stringify(parsedV3));
        
        const savedV2 = localStorage.getItem('ocean_trade_v2');
        if (savedV2) {
            const parsedV2 = JSON.parse(savedV2);
            if (parsedV2.stock) {
              Object.entries(actualYields).forEach(([item, qty]) => {
                if (qty > 0) {
                  parsedV2.stock[item] = (parsedV2.stock[item] || 0) + qty;
                }
              });
              localStorage.setItem('ocean_trade_v2', JSON.stringify(parsedV2));
            }
        }

        alert('성공적으로 재고에 합산되었습니다!\n변경사항을 적용하기 위해 페이지를 새로고침합니다.');
        window.location.reload();
      } else {
        alert('합산할 재고가 없습니다.');
      }
    }
  };

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
      <div key={itemName} className="bg-gray-100 dark:bg-[#16161a] border border-gray-300 dark:border-white/5 rounded px-2.5 py-2 flex flex-col xl:flex-row xl:items-center justify-between gap-1.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <img src={getImagePath(itemName)||undefined} className="w-3.5 h-3.5 object-contain opacity-90" />
            <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">{itemName}</span>
            <span className="text-[10px] font-black text-blue-700 dark:text-blue-400">{formatQty(qty, globalSetMode)}</span>
          </div>
          <div className="hidden xl:block w-[1px] h-3 bg-gray-400 dark:bg-gray-600"></div>
          <div className="flex flex-wrap items-center gap-1.5">
            {recipe.ingredients.map((ing: any) => (
              <span key={ing.name} className="text-[10px] font-medium text-gray-700 dark:text-gray-400 flex items-center gap-1 bg-white dark:bg-black/30 px-1.5 py-0.5 rounded border border-gray-300 dark:border-white/5 shadow-sm">
                <img src={getImagePath(ing.name)||undefined} className="w-3 h-3 object-contain opacity-70" />
                {ing.name} <span className="text-gray-900 dark:text-white font-bold">{formatQty(ing.req * crafts, globalSetMode)}</span>
              </span>
            ))}
          </div>
        </div>
        {finalSec > 0 && (
          <span className="text-[9px] font-bold text-gray-600 dark:text-gray-500 shrink-0 xl:text-right mt-1 xl:mt-0">{timeStr}</span>
        )}
      </div>
    );
  };

  const renderProcessNode = (itemName: string, qty: number, isFinal = false) => {
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
      <div key={itemName} className={`flex flex-col gap-2 p-3 rounded-xl border shadow-sm ${isFinal ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-500/30' : 'bg-gray-100 dark:bg-white/[0.02] border-gray-300 dark:border-white/5'}`}>
        <div className="flex items-center justify-between pb-2 border-b border-gray-300 dark:border-white/10">
          <div className="flex items-center gap-1.5">
            <img src={getImagePath(itemName)||undefined} className="w-4 h-4 object-contain" />
            <span className={`text-[11px] font-black ${isFinal ? 'text-blue-800 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>{itemName}</span>
          </div>
          <span className={`text-[10px] font-black ${isFinal ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-400'}`}>{formatQty(qty, globalSetMode)}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {recipe.ingredients.map((ing: any) => (
            <span key={ing.name} className="text-[9px] font-medium text-gray-700 dark:text-gray-400 flex items-center gap-1 bg-white dark:bg-black/30 px-1.5 py-0.5 rounded shadow-sm border border-gray-300 dark:border-transparent">
              <img src={getImagePath(ing.name)||undefined} className="w-3 h-3 object-contain opacity-80" />
              {ing.name} <span className="font-bold text-gray-900 dark:text-white">{formatQty(ing.req * crafts, globalSetMode)}</span>
            </span>
          ))}
        </div>
        {finalSec > 0 && (
          <div className="text-right mt-1">
            <span className="text-[8px] font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-white/5 px-1.5 py-0.5 rounded border border-gray-300 dark:border-transparent">소요시간: {timeStr}</span>
          </div>
        )}
      </div>
    );
  };

  if (isCalculating && !staminaRecommendation) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-5 md:p-6 shadow-md transition-colors">
        <div className="flex justify-between items-center mb-5 border-b border-gray-200 dark:border-white/5 pb-4">
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tighter">스태미나 추천</h3>
            <p className="text-[10px] text-gray-500 mt-1">현재 창고에 보유 중인 재고를 가장 효율적으로 소모할 수 있는 채집 경로입니다.</p>
          </div>
        </div>
        <div className="py-16 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#111113] rounded-xl border border-gray-300 dark:border-transparent">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-[11px] font-black text-gray-700 dark:text-gray-300">최적의 채집 경로를 분석 및 시뮬레이션하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-5 md:p-6 shadow-md transition-colors">
      <div className="flex justify-between items-center mb-5 border-b border-gray-200 dark:border-white/5 pb-4">
        <div>
          <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-2">
            스태미나 추천
            {isCalculating && <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
          </h3>
          <p className="text-[10px] text-gray-500 mt-1">현재 창고에 보유 중인 재고를 가장 효율적으로 소모할 수 있는 채집 경로입니다.</p>
        </div>
      </div>
      
      {!userStats.stamina || userStats.stamina < 15 ? (
        <div className="py-12 text-center bg-gray-50 dark:bg-[#111113] rounded-xl border border-gray-300 dark:border-transparent">
          <p className="text-[10px] font-bold text-rose-600 dark:text-rose-500">가용 스태미나가 15 미만입니다. 우측 상단 개인설정에서 스태미나를 올바르게 입력해 주세요.</p>
        </div>
      ) : !staminaRecommendation ? (
        <div className="py-12 text-center bg-gray-50 dark:bg-[#111113] rounded-xl border border-gray-300 dark:border-transparent">
          <p className="text-[10px] font-bold text-gray-600 dark:text-gray-500">분석 가능한 데이터를 찾을 수 없습니다.</p>
        </div>
      ) : staminaRecommendation.profit === 0 ? (
        <div className="py-12 text-center bg-gray-50 dark:bg-[#111113] rounded-xl border border-gray-300 dark:border-transparent flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold text-gray-600 dark:text-gray-500 mb-1.5">현재 가용 스태미나와 재고로는 어떤 완성품도 제작할 수 없습니다.</p>
          <p className="text-[10px] font-black text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded border border-blue-300 dark:border-transparent shadow-sm">
            기초 재료를 채집하여 재고를 비축해 보세요.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-transparent rounded-xl p-5 shadow-sm transition-colors md:text-left">
            <p className="text-[11px] font-bold text-gray-800 dark:text-gray-300 leading-loose break-keep text-center md:text-left">
              현재 가용 스태미나 <span className="font-black text-gray-900 dark:text-white">{userStats.stamina.toLocaleString()}</span>, 창고의 재고를 분석했을 때 <br className="hidden md:block"/>
              {Object.keys(staminaRecommendation.distribution).length === 1 ? (
                <span className="flex items-center gap-1 mt-1 justify-center md:justify-start">
                  전체 스태미나를
                  <span className="flex items-center gap-1 font-black text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-200 dark:border-transparent">
                    <img src={getImagePath(`${Object.keys(staminaRecommendation.distribution)[0]}(1성)`)||undefined} className="w-3.5 h-3.5 object-contain" />
                    {Object.keys(staminaRecommendation.distribution)[0]}
                  </span>
                  채집에 전량 사용하는 것을 추천드립니다.
                </span>
              ) : (
                <span className="flex flex-wrap items-center gap-1 mt-1 justify-center md:justify-start">
                  {Object.entries(staminaRecommendation.distribution).map(([cat, stam], idx, arr) => (
                      <span key={cat} className="flex items-center gap-1">
                          <span className="font-black text-blue-700 dark:text-blue-400">{(stam as number).toLocaleString()}</span> 스태미나는 
                          <span className="flex items-center gap-1 font-black text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-200 dark:border-transparent">
                            <img src={getImagePath(`${cat}(1성)`)||undefined} className="w-3.5 h-3.5 object-contain" />
                            {cat}
                          </span>
                          채집에{idx === arr.length - 1 ? ' 사용하는 것을 추천드립니다.' : ', '}
                      </span>
                  ))}
                </span>
              )}
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <h4 className="text-[13px] font-black text-gray-900 dark:text-white tracking-tight mb-2 ml-1">스태미나 분배 상세 리포트</h4>
            
            <div className="bg-white dark:bg-[#0a0a0c] border border-gray-300 dark:border-white/5 rounded-2xl overflow-hidden shadow-md">
              <div className="p-4 border-b border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-white/[0.02]">
                <p className="text-[11px] font-black text-blue-800 dark:text-blue-400 flex items-center gap-1.5 mb-1.5">
                  Phase 1. 채집 플랜 및 등급별 예상 획득량
                </p>
                <p className="text-[10px] font-bold text-gray-700 dark:text-gray-400 leading-relaxed">
                  현재 사용자님의 해양 스킬 확률을 반영한 채집 예측치입니다. 해당 재료들을 통해 최고 수익을 낼 수 있는 경우의 수를 찾습니다.
                </p>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(staminaRecommendation.distribution).map(([cat, stam]) => {
                  const y1 = staminaRecommendation.combinedYield[`${cat}(1성)`] || 0;
                  const y2 = staminaRecommendation.combinedYield[`${cat}(2성)`] || 0;
                  const y3 = staminaRecommendation.combinedYield[`${cat}(3성)`] || 0;
                  const total = y1 + y2 + y3;
                  
                  return (
                    <div key={cat} className="flex flex-col bg-white dark:bg-[#111113] p-3 rounded-xl border border-gray-300 dark:border-white/5 shadow-sm">
                      <div className="flex items-center justify-between mb-3 border-b border-gray-200 dark:border-white/5 pb-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <img src={getImagePath(`${cat}(1성)`)||undefined} className="w-5 h-5 object-contain" />
                            <span className="text-[12px] font-black text-gray-900 dark:text-white">{cat} 채집</span>
                          </div>
                          <span className="text-[9px] font-bold text-gray-600 dark:text-gray-500">{(stam as number).toLocaleString()} 스태미나 소모</span>
                        </div>
                        <span className="text-[12px] font-black text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-transparent shadow-sm">총 {formatQty(total, globalSetMode)} 획득</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center bg-gray-100 dark:bg-white/[0.02] p-1.5 rounded-lg border border-gray-200 dark:border-transparent">
                          <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold mb-0.5">1성 등급</p>
                          <p className="text-[10px] font-black text-gray-800 dark:text-gray-300">{formatQty(y1, globalSetMode)}</p>
                        </div>
                        <div className="text-center bg-gray-100 dark:bg-white/[0.02] p-1.5 rounded-lg border border-gray-200 dark:border-transparent">
                          <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold mb-0.5">2성 등급</p>
                          <p className="text-[10px] font-black text-gray-800 dark:text-gray-300">{formatQty(y2, globalSetMode)}</p>
                        </div>
                        <div className="text-center bg-gray-100 dark:bg-white/[0.02] p-1.5 rounded-lg border border-gray-200 dark:border-transparent">
                          <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold mb-0.5">3성 등급</p>
                          <p className="text-[10px] font-black text-gray-800 dark:text-gray-300">{formatQty(y3, globalSetMode)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0c] border border-gray-300 dark:border-white/5 rounded-2xl overflow-hidden shadow-md mt-4">
              <div className="p-4 border-b border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-white/[0.02] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-[11px] font-black text-purple-800 dark:text-purple-400 flex items-center gap-1.5 mb-1.5">
                    Phase 2. 획득 재료와 기존 재고의 합산
                  </p>
                  <p className="text-[10px] font-bold text-gray-700 dark:text-gray-400 leading-relaxed">
                    예상 획득량 대신 <strong className="text-purple-600 dark:text-purple-400">실제 획득한 수량</strong>을 입력하고 창고 재고에 바로 합산할 수 있습니다.
                  </p>
                </div>
                <button 
                  onClick={handleMergeStock} 
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-black px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap shrink-0"
                >
                  내 재고에 합산하기
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {Object.keys(staminaRecommendation.combinedYield).filter(k => staminaRecommendation.combinedYield[k] > 0 || actualYields[k] > 0).map(item => {
                  const expected = staminaRecommendation.combinedYield[item] || 0;
                  const currentStock = stock[item] || 0;
                  const actual = actualYields[item] !== undefined ? actualYields[item] : expected;
                  const total = currentStock + (Number(actual) || 0);
                  
                  return (
                    <div key={item} className="flex flex-col gap-2 bg-white dark:bg-[#111113] p-3 rounded-xl border border-gray-300 dark:border-white/5 shadow-sm transition-colors focus-within:border-purple-400 dark:focus-within:border-purple-500/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <img src={getImagePath(item)||undefined} className="w-4 h-4 object-contain" />
                        <span className="text-[11px] font-black text-gray-900 dark:text-white">{item}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] bg-gray-50 dark:bg-black/30 p-1.5 rounded-lg border border-gray-200 dark:border-transparent">
                         <span className="font-bold text-gray-600 dark:text-gray-400 truncate pr-1">기존 재고: {formatQty(currentStock, globalSetMode)}</span>
                         <span className="font-black text-purple-700 dark:text-purple-500 shrink-0">
                           <span className="text-gray-500 font-bold mr-1">예상 획득량</span>
                           +{formatQty(expected, globalSetMode)}
                         </span>
                      </div>
                      
                      <div className="flex flex-col justify-between text-[10px] mt-0.5 gap-1.5">
                         <span className="font-bold text-gray-700 dark:text-gray-300">실제 획득 수량 입력</span>
                         {globalSetMode ? (
                           <div className="grid grid-cols-3 gap-1 w-full">
                             <input 
                               type="number" 
                               min="0" 
                               placeholder="상자"
                               value={actual >= 3456 ? Math.floor(actual / 3456) : ''} 
                               onChange={(e) => {
                                 const val = parseInt(e.target.value) || 0;
                                 const s = Math.floor((actual % 3456) / 64);
                                 const u = actual % 64;
                                 setActualYields(prev => ({...prev, [item]: (val * 3456) + (s * 64) + u}));
                               }}
                               className="w-full bg-gray-100 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-md px-1 py-1 text-center text-[10px] font-black text-purple-700 dark:text-purple-400 outline-none focus:border-purple-500 transition-colors placeholder:font-normal placeholder:text-gray-400"
                             />
                             <input 
                               type="number" 
                               min="0" 
                               placeholder="세트"
                               value={(actual % 3456) >= 64 ? Math.floor((actual % 3456) / 64) : ''} 
                               onChange={(e) => {
                                 const val = parseInt(e.target.value) || 0;
                                 const b = Math.floor(actual / 3456);
                                 const u = actual % 64;
                                 setActualYields(prev => ({...prev, [item]: (b * 3456) + (val * 64) + u}));
                               }}
                               className="w-full bg-gray-100 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-md px-1 py-1 text-center text-[10px] font-black text-purple-700 dark:text-purple-400 outline-none focus:border-purple-500 transition-colors placeholder:font-normal placeholder:text-gray-400"
                             />
                             <input 
                               type="number" 
                               min="0" 
                               placeholder="개"
                               value={actual % 64 !== 0 ? actual % 64 : ''} 
                               onChange={(e) => {
                                 const val = parseInt(e.target.value) || 0;
                                 const b = Math.floor(actual / 3456);
                                 const s = Math.floor((actual % 3456) / 64);
                                 setActualYields(prev => ({...prev, [item]: (b * 3456) + (s * 64) + val}));
                               }}
                               className="w-full bg-gray-100 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-md px-1 py-1 text-center text-[10px] font-black text-purple-700 dark:text-purple-400 outline-none focus:border-purple-500 transition-colors placeholder:font-normal placeholder:text-gray-400"
                             />
                           </div>
                         ) : (
                           <div className="flex items-center gap-1 w-full justify-end">
                             <input 
                               type="number" 
                               min="0"
                               value={actual === 0 && actualYields[item] === 0 ? '' : actual} 
                               onChange={(e) => {
                                 const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                 setActualYields(prev => ({...prev, [item]: isNaN(val) ? 0 : val}));
                               }}
                               className="w-full sm:w-20 bg-gray-100 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-md px-1.5 py-1 text-right text-[11px] font-black text-purple-700 dark:text-purple-400 outline-none focus:border-purple-500 transition-colors"
                             />
                             <span className="text-gray-500 font-bold shrink-0">개</span>
                           </div>
                         )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-200 dark:border-white/5">
                         <span className="text-[10px] font-bold text-gray-700 dark:text-gray-400">합산 후 총 재고</span>
                         <span className="text-[11px] font-black text-gray-900 dark:text-white">{formatQty(total, globalSetMode)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0c] border border-gray-300 dark:border-white/5 rounded-2xl p-5 shadow-md mt-4 transition-all">
              <div 
                className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-3 cursor-pointer group"
                onClick={() => setIsPhase3Open(!isPhase3Open)}
              >
                <div>
                  <p className="text-[11px] font-black text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5 mb-1.5">
                    Phase 3. 예상 제작 가이드
                  </p>
                  <p className="text-[10px] font-bold text-gray-700 dark:text-gray-400 leading-relaxed">
                    통합된 재고를 바탕으로 바닐라 블록을 조달하여 최종 수익품을 제작합니다.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#111113] p-1 rounded-lg border border-gray-300 dark:border-white/5 shadow-inner" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => setBlueprintViewMode('compact')} 
                      className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${blueprintViewMode === 'compact' ? 'bg-white dark:bg-[#1a1a1e] text-indigo-700 dark:text-indigo-400 shadow-sm border border-gray-300 dark:border-transparent' : 'text-gray-600 hover:text-gray-900 dark:hover:text-gray-300'}`}
                    >
                      세로 그리드
                    </button>
                    <button 
                      onClick={() => setBlueprintViewMode('flow')} 
                      className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${blueprintViewMode === 'flow' ? 'bg-white dark:bg-[#1a1a1e] text-indigo-700 dark:text-indigo-400 shadow-sm border border-gray-300 dark:border-transparent' : 'text-gray-600 hover:text-gray-900 dark:hover:text-gray-300'}`}
                    >
                      가로 플로우
                    </button>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors">
                     <svg className={`w-4 h-4 transition-transform duration-300 ${isPhase3Open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              
              <div className={`transition-all duration-300 overflow-hidden ${isPhase3Open ? 'max-h-[5000px] opacity-100 mt-5' : 'max-h-0 opacity-0 mt-0'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {staminaRecommendation.flowDetails && staminaRecommendation.flowDetails.map((flow: any) => {
                    const itemName = flow.name;
                    const targetQty = flow.qty;
                    const missingKeys = Object.keys(flow.missing);
                    const s1 = Object.entries(flow.craftedLog || {}).filter(([k]) => !k.includes("핵") && !k.includes("결정") && !k.includes("영약") && !OCEAN_FIXED_PRICES.find(p=>p.name===k) && k !== itemName);
                    const s2 = Object.entries(flow.craftedLog || {}).filter(([k]) => (k.includes("핵") || k.includes("결정") || k.includes("영약")) && k !== itemName);

                    let totalSec = 0;
                    Object.entries(flow.craftedLog || {}).forEach(([m, q]) => {
                        let recipe: any = PARSED_RECIPES.find(r => r.name === m);
                        if (!recipe && RECIPE_FIXES[m]) {
                            recipe = { yieldAmount: RECIPE_FIXES[m].yield, time: '0초' };
                        }
                        if (recipe) {
                            const crafts = Math.ceil((q as number) / recipe.yieldAmount);
                            const baseSec = parseCraftTime(recipe.time || '0초') * crafts;
                            totalSec += Math.floor(baseSec * (1 - o13Reduction));
                        }
                    });
                    const totalTimeStr = formatTime(totalSec);

                    const o16Bonus = [0, 0.05, 0.07, 0.09, 0.12, 0.15, 0.20, 0.25, 0.30][userStats.o16Lv || 0] || 0;
                    const sellPrice = Math.ceil((OCEAN_FIXED_PRICES.find(p => p.name === itemName)?.base || 0) * (1 + o16Bonus));
                    const revenue = sellPrice * targetQty;
                    let missingCost = 0;
                    Object.entries(flow.missing).forEach(([m, q]) => {
                         missingCost += (cost[m] || 0) * (q as number);
                    });
                    const netProfit = revenue - missingCost;

                    return (
                      <div key={itemName} className={`bg-white dark:bg-[#111113] border border-gray-300 dark:border-white/5 rounded-2xl p-4 shadow-md flex flex-col ${blueprintViewMode === 'flow' ? 'col-span-full' : 'h-full'}`}>
                        <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-300 dark:border-white/10">
                          <div className="flex items-center gap-2 mt-1">
                            <img src={getImagePath(itemName)||undefined} className="w-8 h-8 object-contain drop-shadow-md" />
                            <div>
                              <span className="text-[15px] font-black text-indigo-800 dark:text-indigo-400 leading-none">{itemName}</span>
                              <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 mt-1">최종 연성 수량: {formatQty(targetQty, globalSetMode)}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 px-2.5 py-1 rounded shadow-sm border border-gray-300 dark:border-transparent">총 소요시간: {totalTimeStr}</span>
                            <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded shadow-sm border border-emerald-300 dark:border-transparent">예상 순수익: +{netProfit.toLocaleString()} G</span>
                          </div>
                        </div>
                        
                        {blueprintViewMode === 'flow' ? (
                          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 w-full">
                            
                            <div className="flex-1 flex flex-col min-w-[200px]">
                              <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-400 mb-1.5 uppercase tracking-widest px-1">Step 1. 바닐라 조달</span>
                              <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-300 dark:border-white/5 rounded-xl p-3 h-full flex flex-col justify-center gap-1.5 shadow-sm">
                                {missingKeys.length === 0 ? (
                                  <span className="text-[10px] text-gray-500 font-bold italic">조달 필요 없음</span>
                                ) : (
                                  missingKeys.map((m) => (
                                    <div key={m} className="flex items-center justify-between text-[10px]">
                                      <div className="flex items-center gap-1.5 truncate">
                                        <img src={getImagePath(m)||undefined} className="w-3.5 h-3.5 object-contain opacity-80 shrink-0" />
                                        <span className="text-gray-800 dark:text-gray-300 font-bold truncate">{m}</span>
                                      </div>
                                      <span className="text-indigo-600 font-black shrink-0 ml-1">{formatQty(flow.missing[m] as number, globalSetMode)}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            {s1.length > 0 && (
                              <>
                                <div className="hidden xl:flex items-center justify-center text-gray-400 dark:text-gray-700 shrink-0 text-xl font-black">{'>'}</div>
                                <div className="flex-1 flex flex-col min-w-[220px]">
                                  <span className="text-[9px] font-black text-purple-700 dark:text-purple-400 mb-1.5 uppercase tracking-widest px-1">Step 2. 1차 가공</span>
                                  <div className="flex flex-col gap-2 h-full justify-center">
                                    {s1.map(([m, q]) => renderProcessNode(m, q as number))}
                                  </div>
                                </div>
                              </>
                            )}

                            {s2.length > 0 && (
                              <>
                                <div className="hidden xl:flex items-center justify-center text-gray-400 dark:text-gray-700 shrink-0 text-xl font-black">{'>'}</div>
                                <div className="flex-1 flex flex-col min-w-[220px]">
                                  <span className="text-[9px] font-black text-rose-700 dark:text-rose-400 mb-1.5 uppercase tracking-widest px-1">Step 3. 2차 가공</span>
                                  <div className="flex flex-col gap-2 h-full justify-center">
                                    {s2.map(([m, q]) => renderProcessNode(m, q as number))}
                                  </div>
                                </div>
                              </>
                            )}

                            <div className="hidden xl:flex items-center justify-center text-indigo-400 dark:text-indigo-800 shrink-0 text-xl font-black">{'>'}</div>
                            
                            <div className="flex-1 flex flex-col min-w-[220px]">
                              <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-400 mb-1.5 uppercase tracking-widest px-1">Step 4. 최종 연성</span>
                              <div className="flex flex-col h-full justify-center">
                                {renderProcessNode(itemName, targetQty, true)}
                              </div>
                            </div>

                          </div>
                        ) : (
                          <div className="flex flex-col gap-4 flex-1 mt-2">
                            <div>
                              <p className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 mb-1.5">Step 1. 바닐라 조달</p>
                              {missingKeys.length === 0 ? (
                                <span className="text-[10px] text-gray-500 font-bold">조달 필요 없음</span>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                    {missingKeys.map((m) => (
                                      <span key={m} className="bg-gray-100 dark:bg-[#16161a] border border-gray-300 dark:border-white/5 px-2 py-1 rounded text-[9px] font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1 shadow-sm">
                                          <img src={getImagePath(m)||undefined} className="w-3.5 h-3.5 object-contain" />
                                          {m} <span className="text-indigo-700 dark:text-indigo-400">{formatQty(flow.missing[m] as number, globalSetMode)}</span>
                                      </span>
                                    ))}
                                </div>
                              )}
                            </div>

                            {s1.length > 0 && (
                              <div>
                                  <p className="text-[10px] font-black text-purple-700 dark:text-purple-400 mb-1.5">Step 2. 하위 연금/가공 (창고에서 꺼내기)</p>
                                  <div className="flex flex-col gap-2">
                                    {s1.map(([m, q]) => renderCraftStep(m, q as number))}
                                  </div>
                              </div>
                            )}

                            {s2.length > 0 && (
                              <div>
                                  <p className="text-[10px] font-black text-rose-700 dark:text-rose-400 mb-1.5">Step 3. 중급 연금 가공</p>
                                  <div className="flex flex-col gap-2">
                                    {s2.map(([m, q]) => renderCraftStep(m, q as number))}
                                  </div>
                              </div>
                            )}

                            <div className="mt-auto pt-2">
                                <p className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 mb-1.5">Step 4. 최종 연금 가공</p>
                                <div className="flex flex-col gap-2">
                                  {renderCraftStep(itemName, targetQty)}
                                </div>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-[#111113] dark:to-[#0a0a0c] p-6 rounded-2xl border border-gray-300 dark:border-transparent shadow-md mt-6">
              <p className="text-[12px] font-black text-gray-800 dark:text-gray-200 mb-4 tracking-widest uppercase border-b border-gray-300 dark:border-white/5 pb-3">Phase 4. 최종 수익계산 결과</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#1a1a1e] p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm text-center flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-gray-600 dark:text-gray-500 mb-1.5">기존 창고 재고 가치</p>
                  <p className="text-sm font-black text-gray-800 dark:text-gray-300">{Math.round(staminaRecommendation.baseProfit).toLocaleString()} G</p>
                </div>
                <div className="bg-white dark:bg-[#1a1a1e] p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm text-center flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-500/10"></div>
                  <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 mb-1.5 relative z-10">스태미나 시너지 가치</p>
                  <p className="text-sm font-black text-blue-700 dark:text-blue-400 relative z-10">+{Math.round(staminaRecommendation.addedProfit).toLocaleString()} G</p>
                </div>
                <div className="bg-white dark:bg-[#1a1a1e] p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm text-center flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-gray-600 dark:text-gray-500 mb-1.5">바닐라 매입 지출액</p>
                  <p className="text-sm font-black text-rose-600 dark:text-rose-500">-{Math.round(staminaRecommendation.totalVanillaCost).toLocaleString()} G</p>
                </div>
                <div className="bg-blue-600 dark:bg-blue-900/40 p-4 rounded-xl border border-blue-500 dark:border-blue-500/30 shadow-md text-center flex flex-col justify-center">
                  <p className="text-[11px] font-bold text-blue-100 dark:text-blue-300 mb-1">최종 예상 순수익</p>
                  <p className="text-lg font-black text-white">{Math.round(staminaRecommendation.profit).toLocaleString()} G</p>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}