'use client';

import { useMemo, useState, useEffect, useDeferredValue } from 'react';
import {
  simulateCraftPure, CORE_ITEMS, CORE_BASE_SHELLS,
  VANILLA, BATCH_MATS, formatQty, FISH, MATCHED_BLOCKS,
  ALCHEMY_T1, TIER2, RECIPE_FIXES, ALCHEMY_T2, ALCHEMY_T3,
  PARSED_RECIPES, parseCraftTime, formatTime, O13_EFFECTS, getImagePath
} from '@/lib/oceanTradeUtils';
import { OCEAN_FIXED_PRICES } from '@/lib/professionData';

interface Props {
  stock: Record<string, number>;
  cost: Record<string, number>;
  blacklist: string[];
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

const STAR_CATEGORIES: Record<string, string[]> = {
  '0성': ['추출된 희석액'],
  '1성': ['영생의 아쿠티스', '크라켄의 광란체', '리바이던의 깃털'],
  '2성': ['해구의 파동 코어', '침묵의 심해 비약', '청해룡의 날개'],
  '3성': ['아쿠아 펄스 파편', '나우틸러스의 손', '무저의 척추']
};

const SORT_WEIGHTS: Record<string, number> = {};
const orderedItems = [
  "추출된 희석액",
  "굴(1성)", "소라(1성)", "문어(1성)", "미역(1성)", "성게(1성)",
  "굴(2성)", "소라(2성)", "문어(2성)", "미역(2성)", "성게(2성)",
  "굴(3성)", "소라(3성)", "문어(3성)", "미역(3성)", "성게(3성)",
  "수호의 정수(1성)", "파동의 정수(1성)", "혼란의 정수(1성)", "생명의 정수(1성)", "부식의 정수(1성)",
  "수호 에센스", "파동 에센스", "혼란 에센스", "생명 에센스", "부식 에센스",
  "수호의 엘릭서", "파동의 엘릭서", "혼란의 엘릭서", "생명의 엘릭서", "부식의 엘릭서",
  "물결 수호의 핵", "파동 오염의 핵", "질서 파괴의 핵", "활력 붕괴의 핵", "침식 방어의 핵",
  "활기 보존의 결정", "파도 침식의 결정", "방어 오염의 결정", "격류 재생의 결정", "맹독 혼란의 결정",
  "불멸 재생의 영약", "파동 장벽의 영약", "타락 침식의 영약", "생명 광란의 영약", "맹독 파동의 영약",
  "영생의 아쿠티스", "크라켄의 광란체", "리바이던의 깃털",
  "해구의 파동 코어", "침묵의 심해 비약", "청해룡의 날개",
  "아쿠아 펄스 파편", "나우틸러스의 손", "무저의 척추"
];

orderedItems.forEach((item, idx) => { SORT_WEIGHTS[item] = idx; });

const sortByIndex = (obj: Record<string, number>, orderArray: string[]) => {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => {
      const idxA = orderArray.indexOf(a);
      const idxB = orderArray.indexOf(b);
      if (idxA === -1 && idxB === -1) return a.localeCompare(b);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    })
  );
};

export default function OceanAlchemyOptimal({
  stock, cost, blacklist, userStats, globalSetMode,
  craftInputs, pendingCrafts, handleCraftInputChange, handleQueueCraft, handleRemovePending,
  itemBaseReqsPerUnit
}: Props) {
  
  const TABS = ['전체', '0성', '1성', '2성', '3성'] as const;
  const [activeTierTab, setActiveTierTab] = useState<typeof TABS[number]>('전체');
  const [isCraftSectionOpen, setIsCraftSectionOpen] = useState(true);
  
  const [blueprintViewMode, setBlueprintViewMode] = useState<'flow' | 'compact'>('flow');

  const o16Bonus = [0, 0.05, 0.07, 0.09, 0.12, 0.15, 0.20, 0.25, 0.30][userStats.o16Lv] || 0;
  const o13Reduction = O13_EFFECTS[userStats.o13Lv] || 0;

  const stockStr = JSON.stringify(stock);
  const costStr = JSON.stringify(cost);
  const blacklistStr = JSON.stringify(blacklist);
  const reqsStr = JSON.stringify(itemBaseReqsPerUnit);
  const craftInputsStr = JSON.stringify(craftInputs);

  const [debouncedParams, setDebouncedParams] = useState({ stockStr, costStr, blacklistStr, reqsStr, craftInputsStr });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedParams({ stockStr, costStr, blacklistStr, reqsStr, craftInputsStr });
    }, 300);
    return () => clearTimeout(timer);
  }, [stockStr, costStr, blacklistStr, reqsStr, craftInputsStr]);

  const deferredParams = useDeferredValue(debouncedParams);

  const currentDeferredStock = useMemo(() => JSON.parse(deferredParams.stockStr), [deferredParams.stockStr]);
  const currentDeferredCost = useMemo(() => JSON.parse(deferredParams.costStr), [deferredParams.costStr]);
  const currentDeferredBlacklist = useMemo(() => JSON.parse(deferredParams.blacklistStr), [deferredParams.blacklistStr]);
  const currentDeferredReqs = useMemo(() => JSON.parse(deferredParams.reqsStr), [deferredParams.reqsStr]);
  const currentDeferredCraftInputs = useMemo(() => JSON.parse(deferredParams.craftInputsStr), [deferredParams.craftInputsStr]);

  const optimalCalculations = useMemo(() => {
    const eqStock = getBaseEquivalents(currentDeferredStock, currentDeferredReqs);

    const itemsWithProfit = OCEAN_FIXED_PRICES.map(item => {
      const sellPrice = Math.ceil(item.base * (1 + o16Bonus));
      const baseMats = currentDeferredReqs[item.name] || {};
      let totalCost = 0;
      let hasBlacklist = false;

      Object.entries(baseMats).forEach(([mat, qty]) => {
        if (currentDeferredBlacklist.includes(mat)) hasBlacklist = true;
        totalCost += (currentDeferredCost[mat] || 0) * (qty as number);
      });

      return { name: item.name, sellPrice, totalCost, profit: sellPrice - totalCost, hasBlacklist, baseMats };
    }).filter(r => !r.hasBlacklist && r.profit > 0);

    let itemsToConsider = [...itemsWithProfit];
    itemsToConsider.sort((a, b) => b.profit - a.profit);

    let bestGlobalProfit = -Infinity;
    let bestGlobalCounts: Record<string, number> = {};

    const T0_NAME = '추출된 희석액';
    const T1_NAMES = ['영생의 아쿠티스', '크라켄의 광란체', '리바이던의 깃털'];
    const T2_NAMES = ['해구의 파동 코어', '침묵의 심해 비약', '청해룡의 날개'];
    const T3_NAMES = ['아쿠아 펄스 파편', '나우틸러스의 손', '무저의 척추'];

    const validT0 = itemsWithProfit.find(i => i.name === T0_NAME);
    const validT1 = T1_NAMES.map(n => itemsWithProfit.find(i => i.name === n)).filter(Boolean) as typeof itemsWithProfit;
    const validT2 = T2_NAMES.map(n => itemsWithProfit.find(i => i.name === n)).filter(Boolean) as typeof itemsWithProfit;
    const validT3 = T3_NAMES.map(n => itemsWithProfit.find(i => i.name === n)).filter(Boolean) as typeof itemsWithProfit;

    const targetMats = [...CORE_BASE_SHELLS];
    const getReqs = (item: any) => targetMats.map(m => currentDeferredReqs[item.name]?.[m] || 0);

    const reqsT0 = validT0 ? getReqs(validT0) : new Array(targetMats.length).fill(0);
    const reqsT1 = validT1.map(getReqs);
    const reqsT2 = validT2.map(getReqs);
    const reqsT3 = validT3.map(getReqs);

    const solveGroup = (validItems: any[], reqsArr: number[][], currentLimits: number[]) => {
        const usedMats: number[] = [];
        for(let m=0; m<targetMats.length; m++) {
            if (reqsArr.some(r => r[m] > 0)) usedMats.push(m);
        }

        if (validItems.length === 0) return { profit: 0, counts: [] };
        if (validItems.length === 1) {
            let max = Infinity;
            for(let m of usedMats) max = Math.min(max, Math.floor(currentLimits[m] / reqsArr[0][m] + 1e-9));
            if (max === Infinity) max = 0;
            return { profit: max * validItems[0].profit, counts: [max] };
        }
        if (validItems.length === 2) {
            let bestP = -1;
            let bestC = [0, 0];
            let max0 = Infinity;
            for(let m of usedMats) max0 = Math.min(max0, Math.floor(currentLimits[m] / reqsArr[0][m] + 1e-9));
            if (max0 === Infinity) max0 = 0;
            for (let i = 0; i <= max0; i++) {
                let max1 = Infinity;
                for(let m of usedMats) max1 = Math.min(max1, Math.floor((currentLimits[m] - reqsArr[0][m]*i) / reqsArr[1][m] + 1e-9));
                if (max1 === Infinity) max1 = 0;
                let p = i * validItems[0].profit + max1 * validItems[1].profit;
                if (p > bestP) { bestP = p; bestC = [i, max1]; }
            }
            return { profit: bestP, counts: bestC };
        }
        if (validItems.length === 3) {
            let bestP = -1;
            let bestC = [0, 0, 0];
            let max0 = Infinity;
            for(let m of usedMats) max0 = Math.min(max0, Math.floor(currentLimits[m] / reqsArr[0][m] + 1e-9));
            if (max0 === Infinity) max0 = 0;
            for (let i = 0; i <= max0; i++) {
                let max1 = Infinity;
                for(let m of usedMats) max1 = Math.min(max1, Math.floor((currentLimits[m] - reqsArr[0][m]*i) / reqsArr[1][m] + 1e-9));
                if (max1 === Infinity) max1 = 0;
                for (let j = 0; j <= max1; j++) {
                    let max2 = Infinity;
                    for(let m of usedMats) max2 = Math.min(max2, Math.floor((currentLimits[m] - reqsArr[0][m]*i - reqsArr[1][m]*j) / reqsArr[2][m] + 1e-9));
                    if (max2 === Infinity) max2 = 0;
                    let p = i * validItems[0].profit + j * validItems[1].profit + max2 * validItems[2].profit;
                    if (p > bestP) { bestP = p; bestC = [i, j, max2]; }
                }
            }
            return { profit: bestP, counts: bestC };
        }
        return { profit: 0, counts: [] };
    };

    const limits = targetMats.map(m => eqStock[m] || 0);
    let maxT0 = Infinity;
    if (validT0) {
        for(let i=0; i<targetMats.length; i++) {
            if (reqsT0[i] > 0) maxT0 = Math.min(maxT0, Math.floor(limits[i] / reqsT0[i] + 1e-9));
        }
        if (maxT0 === Infinity) maxT0 = 0;
    } else {
        maxT0 = 0;
    }

    for (let t0 = 0; t0 <= maxT0; t0++) {
        let curLimits = [...limits];
        if (validT0 && t0 > 0) {
            for(let i=0; i<targetMats.length; i++) curLimits[i] -= reqsT0[i] * t0;
        }

        let resT1 = solveGroup(validT1, reqsT1, curLimits);
        let resT2 = solveGroup(validT2, reqsT2, curLimits);
        let resT3 = solveGroup(validT3, reqsT3, curLimits);

        let totalP = (validT0 ? t0 * validT0.profit : 0) + resT1.profit + resT2.profit + resT3.profit;

        if (totalP > bestGlobalProfit) {
            bestGlobalProfit = totalP;
            bestGlobalCounts = {};
            if (validT0 && t0 > 0) bestGlobalCounts[T0_NAME] = t0;
            resT1.counts.forEach((c, idx) => { if (c > 0) bestGlobalCounts[validT1[idx].name] = c; });
            resT2.counts.forEach((c, idx) => { if (c > 0) bestGlobalCounts[validT2[idx].name] = c; });
            resT3.counts.forEach((c, idx) => { if (c > 0) bestGlobalCounts[validT3[idx].name] = c; });
        }
    }

    let trackingStock = { ...currentDeferredStock };
    const refinedRecommendations: any[] = [];

    const sortedNames = Object.keys(bestGlobalCounts).sort((a, b) => {
      const aVal = itemsWithProfit.find(i=>i.name===a)?.profit || 0;
      const bVal = itemsWithProfit.find(i=>i.name===b)?.profit || 0;
      return bVal - aVal;
    });

    for (const itemName of sortedNames) {
        let qty = bestGlobalCounts[itemName];
        const itemDef = itemsWithProfit.find(i => i.name === itemName);
        if (!itemDef) continue;

        let sim = simulateCraftPure({ [itemName]: qty }, trackingStock);

        while (qty > 0 && Object.keys(sim.missing).some(m => CORE_BASE_SHELLS.includes(m))) {
            qty--;
            sim = simulateCraftPure({ [itemName]: qty }, trackingStock);
        }

        if (qty <= 0) continue;

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
  }, [currentDeferredStock, currentDeferredCost, currentDeferredBlacklist, currentDeferredReqs, o16Bonus]);

  const activeTargets = useMemo(() => {
    const targets: Record<string, number> = {};
    optimalCalculations.recommendations.forEach(rec => {
      const input = currentDeferredCraftInputs[rec.name] || { boxes: '', sets: '', units: '' };
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
  }, [optimalCalculations.recommendations, currentDeferredCraftInputs]);

  const activeBottomRecs = useMemo(() => {
    if (activeTierTab === '전체') return optimalCalculations.recommendations;
    return optimalCalculations.recommendations.filter(rec => STAR_CATEGORIES[activeTierTab]?.includes(rec.name));
  }, [optimalCalculations.recommendations, activeTierTab]);

  const filteredTargets = useMemo(() => {
    const targets: Record<string, number> = {};
    activeBottomRecs.forEach(rec => {
      if (activeTargets[rec.name]) targets[rec.name] = activeTargets[rec.name];
    });
    return targets;
  }, [activeTargets, activeBottomRecs]);

  const globalAggregation = useMemo(() => {
    const globalSim = simulateCraftPure(activeTargets, currentDeferredStock);
    
    let totalRevenue = 0;
    let totalCost = 0;

    Object.entries(activeTargets).forEach(([name, qty]) => {
      const itemDef = optimalCalculations.recommendations.find(r => r.name === name);
      if (itemDef) totalRevenue += itemDef.sellPrice * qty;
    });

    Object.entries(globalSim.missing).forEach(([m, q]) => {
      totalCost += (currentDeferredCost[m] || 0) * (q as number);
    });

    return { 
      totalRevenue, 
      totalCost, 
      netProfit: totalRevenue - totalCost,
    };
  }, [activeTargets, currentDeferredStock, optimalCalculations.recommendations, currentDeferredCost]);

  const tabAggregation = useMemo(() => {
    if (activeTierTab === '0성') {
      const prepOther: Record<string, number> = {};
      Object.entries(filteredTargets).forEach(([name, qty]) => {
        let recipe: any = PARSED_RECIPES.find(r => r.name === name);
        if (!recipe && RECIPE_FIXES[name]) {
          recipe = { name: name, yieldAmount: RECIPE_FIXES[name].yield, time: '0초', ingredients: [{ name: RECIPE_FIXES[name].ing, req: RECIPE_FIXES[name].req }] };
        }
        if (recipe) {
          const crafts = Math.ceil(qty / recipe.yieldAmount);
          recipe.ingredients.forEach((ing: any) => {
            prepOther[ing.name] = (prepOther[ing.name] || 0) + (ing.req * crafts);
          });
        }
      });
      return { 
        tier1Crafted: {},
        tier2Crafted: {},
        prepSeafood: {},
        prepBlocks: {},
        prepFish: {},
        prepOther: sortByIndex(prepOther, orderedItems)
      };
    }

    let injectedTargets = { ...filteredTargets };
    const t0Target = activeTargets['추출된 희석액'] || 0;
    if (t0Target > 0 && activeTierTab !== '전체') {
        if (activeTierTab === '1성') injectedTargets['침식 방어의 핵'] = (injectedTargets['침식 방어의 핵'] || 0) + t0Target * 3;
        if (activeTierTab === '2성') injectedTargets['방어 오염의 결정'] = (injectedTargets['방어 오염의 결정'] || 0) + t0Target * 2;
        if (activeTierTab === '3성') injectedTargets['타락 침식의 영약'] = (injectedTargets['타락 침식의 영약'] || 0) + t0Target * 1;
    }

    const sim = simulateCraftPure(injectedTargets, currentDeferredStock);
    
    const tier1Crafted: Record<string, number> = {};
    const tier2Crafted: Record<string, number> = {};

    Object.entries(sim.craftedLog).forEach(([k, q]) => {
      if (ALCHEMY_T1.includes(k)) tier1Crafted[k] = q;
      else if (ALCHEMY_T2.includes(k)) tier2Crafted[k] = q;
    });

    const prepList: Record<string, number> = {};
    
    Object.keys(currentDeferredStock).forEach(k => {
      const consumed = (currentDeferredStock[k] || 0) - (sim.stock[k] || 0);
      if (consumed > 0) {
        prepList[k] = (prepList[k] || 0) + consumed;
      }
    });

    Object.entries(sim.missing).forEach(([k, q]) => {
      prepList[k] = (prepList[k] || 0) + (q as number);
    });

    const prepSeafood: Record<string, number> = {};
    const prepBlocks: Record<string, number> = {};
    const prepFish: Record<string, number> = {};
    const prepOther: Record<string, number> = {};

    Object.entries(prepList).forEach(([m, q]) => {
      if (CORE_BASE_SHELLS.includes(m)) {
        prepSeafood[m] = q;
      } else if (MATCHED_BLOCKS.includes(m)) {
        prepBlocks[m] = q;
      } else if (FISH.includes(m)) {
        prepFish[m] = q;
      } else {
        prepOther[m] = q;
      }
    });

    return { 
      tier1Crafted,
      tier2Crafted,
      prepSeafood: sortByIndex(prepSeafood, CORE_BASE_SHELLS),
      prepBlocks: sortByIndex(prepBlocks, MATCHED_BLOCKS),
      prepFish: sortByIndex(prepFish, FISH),
      prepOther: sortByIndex(prepOther, orderedItems)
    };
  }, [filteredTargets, currentDeferredStock, activeTierTab, activeTargets]);

  const renderCraftItemCompact = (itemName: string, qty: number) => (
    <div key={itemName} className="flex items-center justify-between bg-white dark:bg-[#1a1a1e] border border-gray-100 dark:border-white/5 rounded-lg px-2.5 py-1.5 shadow-sm">
      <div className="flex items-center gap-1.5 min-w-0">
        <img src={getImagePath(itemName)||undefined} className="w-4 h-4 object-contain opacity-90 shrink-0" />
        <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate">{itemName}</span>
      </div>
      <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 shrink-0 ml-2">{formatQty(qty, globalSetMode)}</span>
    </div>
  );

  const renderProcessNode = (itemName: string, qty: number, isFinal = false, extraTag?: string) => {
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
      <div key={itemName} className={`flex flex-col gap-2 p-3 rounded-xl border shadow-sm ${isFinal ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-500/30' : 'bg-gray-50 dark:bg-white/[0.02] border-gray-300 dark:border-white/5'}`}>
        <div className="flex items-center justify-between pb-2 border-b border-gray-300 dark:border-white/10">
          <div className="flex items-center gap-1.5">
            <img src={getImagePath(itemName)||undefined} className="w-4 h-4 object-contain" />
            <span className={`text-[11px] font-black ${isFinal ? 'text-blue-800 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>{itemName}</span>
            {extraTag && <span className="text-[9px] text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/30 font-bold ml-1 shadow-sm">{extraTag}</span>}
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

  const renderCraftStep = (itemName: string, qty: number, extraTag?: string) => {
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
            {extraTag && <span className="text-[9px] text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/30 font-bold ml-1 shadow-sm">{extraTag}</span>}
            <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 ml-1">{formatQty(qty, globalSetMode)}</span>
          </div>
          <div className="hidden xl:block w-[1px] h-3 bg-gray-400 dark:bg-gray-600"></div>
          <div className="flex flex-wrap items-center gap-1.5">
            {recipe.ingredients.map((ing: any) => (
              <span key={ing.name} className="text-[10px] font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1 bg-white dark:bg-black/30 px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/5 shadow-sm">
                <img src={getImagePath(ing.name)||undefined} className="w-3 h-3 object-contain opacity-70" />
                {ing.name} <span className="text-gray-800 dark:text-white font-bold">{formatQty(ing.req * crafts, globalSetMode)}</span>
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

  const renderAlchemyPair = (title1: string, list1: string[], title2: string, list2: string[]) => {
    const items1 = list1.filter(item => tabAggregation.tier1Crafted[item] || tabAggregation.tier2Crafted[item]);
    const items2 = list2.filter(item => tabAggregation.tier1Crafted[item] || tabAggregation.tier2Crafted[item]);
    
    if (items1.length === 0 && items2.length === 0) return null;

    const t0Target = activeTargets['추출된 희석액'] || 0;
    
    const getExtraText = (item: string) => {
        if (t0Target <= 0 || activeTierTab === '전체') return 0;
        if (activeTierTab === '1성' && item === '침식 방어의 핵') return t0Target * 3;
        if (activeTierTab === '2성' && item === '방어 오염의 결정') return t0Target * 2;
        if (activeTierTab === '3성' && item === '타락 침식의 영약') return t0Target * 1;
        return 0;
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#111113] border border-gray-300 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
           <div className="bg-gray-100 dark:bg-white/[0.02] p-3 border-b border-gray-300 dark:border-white/5">
              <h4 className="text-[12px] font-black text-blue-800 dark:text-blue-400">{title1}</h4>
           </div>
           <div className="flex flex-col">
              {items1.map((item, idx) => {
                 const totalQty = tabAggregation.tier1Crafted[item] || tabAggregation.tier2Crafted[item];
                 const extraQty = getExtraText(item);
                 return (
                 <div key={item} className={`flex items-center justify-between p-3 ${idx !== items1.length - 1 ? 'border-b border-gray-200 dark:border-white/5' : ''}`}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <img src={getImagePath(item)||undefined} className="w-4 h-4 object-contain shrink-0" />
                      <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">{item}</span>
                    </div>
                    <span className="text-[11px] font-black text-gray-900 dark:text-white shrink-0 ml-1">
                      {formatQty(totalQty, globalSetMode)}
                      {extraQty > 0 && (
                          <span className="text-amber-600 dark:text-amber-500 ml-1">
                              (0성 재료 {formatQty(extraQty, globalSetMode)} 포함)
                          </span>
                      )}
                    </span>
                 </div>
              )})}
              {items1.length === 0 && <div className="p-3 text-[10px] text-gray-500 text-center">항목 없음</div>}
           </div>
        </div>
        <div className="bg-white dark:bg-[#111113] border border-gray-300 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
           <div className="bg-gray-100 dark:bg-white/[0.02] p-3 border-b border-gray-300 dark:border-white/5">
              <h4 className="text-[12px] font-black text-blue-800 dark:text-blue-400">{title2}</h4>
           </div>
           <div className="flex flex-col">
              {items2.map((item, idx) => {
                 const totalQty = tabAggregation.tier1Crafted[item] || tabAggregation.tier2Crafted[item];
                 const extraQty = getExtraText(item);
                 return (
                 <div key={item} className={`flex items-center justify-between p-3 ${idx !== items2.length - 1 ? 'border-b border-gray-200 dark:border-white/5' : ''}`}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <img src={getImagePath(item)||undefined} className="w-4 h-4 object-contain shrink-0" />
                      <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">{item}</span>
                    </div>
                    <span className="text-[11px] font-black text-gray-900 dark:text-white shrink-0 ml-1">
                      {formatQty(totalQty, globalSetMode)}
                      {extraQty > 0 && (
                          <span className="text-amber-600 dark:text-amber-500 ml-1">
                              (0성 재료 {formatQty(extraQty, globalSetMode)} 포함)
                          </span>
                      )}
                    </span>
                 </div>
              )})}
              {items2.length === 0 && <div className="p-3 text-[10px] text-gray-500 text-center">항목 없음</div>}
           </div>
        </div>
      </div>
    );
  };

  const getReorderedOtherItems = () => {
    let baseList = Object.entries(tabAggregation.prepOther);
    let priorityItems: [string, number][] = [];
    
    if (activeTierTab === '2성') {
        const pList = ["청금석 블록", "레드스톤 블록", "철 주괴", "금 주괴", "다이아몬드"];
        priorityItems = pList.map(name => [name, tabAggregation.prepOther[name]]).filter(entry => entry[1] !== undefined) as [string, number][];
        baseList = baseList.filter(([name]) => !pList.includes(name));
    } else if (activeTierTab === '3성') {
        const pList = ["죽은 관 산호 블록", "죽은 사방산호 블록", "죽은 거품 산호 블록", "죽은 불 산호 블록", "죽은 뇌 산호 블록"];
        priorityItems = pList.map(name => [name, tabAggregation.prepOther[name]]).filter(entry => entry[1] !== undefined) as [string, number][];
        baseList = baseList.filter(([name]) => !pList.includes(name));
    }
    return { priorityItems, baseList };
  };

  if (optimalCalculations.recommendations.length === 0) {
    return (
      <div className="py-12 text-center bg-gray-50 dark:bg-[#111113] rounded-[1.5rem] border border-gray-300 dark:border-transparent">
        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">보유한 재고로 만들 수 있는 연금품이 없습니다.</p>
      </div>
    );
  }

  const sortedFilteredTargets = Object.entries(filteredTargets).sort(([a], [b]) => {
    return (SORT_WEIGHTS[a] ?? 999) - (SORT_WEIGHTS[b] ?? 999);
  });

  const displayTargets: [string, number][] = [...sortedFilteredTargets];
  const t0Target = activeTargets['추출된 희석액'] || 0;
  
  let targetParent = '';
  let extraSubItem = '';
  let extraSubQty = 0;

  if (t0Target > 0 && activeTierTab !== '전체') {
      if (activeTierTab === '1성') { targetParent = '리바이던의 깃털'; extraSubItem = '침식 방어의 핵'; extraSubQty = t0Target * 3; }
      else if (activeTierTab === '2성') { targetParent = '청해룡의 날개'; extraSubItem = '방어 오염의 결정'; extraSubQty = t0Target * 2; }
      else if (activeTierTab === '3성') { targetParent = '무저의 척추'; extraSubItem = '타락 침식의 영약'; extraSubQty = t0Target * 1; }

      if (targetParent && !displayTargets.some(t => t[0] === targetParent)) {
          displayTargets.push([targetParent, 0]);
      }
  }

  return (
    <div className="space-y-6" style={{ overflowAnchor: 'none' }}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#111113] border border-gray-300 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center shadow-md">
          <span className="text-[10px] font-black text-gray-600 dark:text-gray-500 mb-1">총 판매 골드</span>
          <span className="text-base font-black text-gray-900 dark:text-white">{globalAggregation.totalRevenue.toLocaleString()} G</span>
        </div>
        <div className="bg-white dark:bg-[#111113] border border-gray-300 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center shadow-md">
          <span className="text-[10px] font-black text-gray-600 dark:text-gray-500 mb-1">총 재료비</span>
          <span className="text-base font-black text-rose-600 dark:text-rose-500">{globalAggregation.totalCost.toLocaleString()} G</span>
        </div>
        <div className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-300 dark:border-blue-500/20 rounded-2xl p-4 flex flex-col justify-center items-center shadow-md">
          <span className="text-[11px] font-black text-blue-800 dark:text-blue-400 mb-1">예상 순수익</span>
          <span className="text-xl font-black text-blue-700 dark:text-blue-300">{globalAggregation.netProfit.toLocaleString()} G</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0c] border border-gray-300 dark:border-white/5 rounded-2xl p-5 shadow-md">
        <div 
          className="flex justify-between items-center cursor-pointer select-none group"
          onClick={() => setIsCraftSectionOpen(!isCraftSectionOpen)}
        >
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
              제작 목표 및 예약
            </h3>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:text-blue-500 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-transparent">
              {activeTierTab === '전체' ? '전체 보기' : `[${activeTierTab}] 필터 적용됨`}
            </span>
          </div>
          <button type="button" className="text-[10px] font-black text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            {isCraftSectionOpen ? '닫기 ▲' : '펼치기 ▼'}
          </button>
        </div>

        {isCraftSectionOpen && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-fade-in-up">
            {['0성', '1성', '2성', '3성'].map(tier => {
              const itemsInTier = optimalCalculations.recommendations
                .filter(rec => STAR_CATEGORIES[tier]?.includes(rec.name))
                .sort((a, b) => (SORT_WEIGHTS[a.name] ?? 999) - (SORT_WEIGHTS[b.name] ?? 999));
                
              const isActive = activeTierTab === tier;

              return (
                <div 
                  key={tier}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON') return;
                    setActiveTierTab(isActive ? '전체' : tier as any);
                  }}
                  className={`flex flex-col gap-3 p-3.5 rounded-[1.25rem] border transition-all cursor-pointer ${
                    isActive 
                    ? 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500/50 shadow-md ring-1 ring-blue-400 dark:ring-blue-500/50' 
                    : 'bg-gray-50 dark:bg-[#111113]/50 border-gray-300 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className={`text-xs font-black ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>{tier} 라인업</span>
                    {isActive && <span className="text-[9px] font-bold text-blue-600 dark:text-blue-500 animate-pulse">선택됨</span>}
                  </div>

                  {itemsInTier.length === 0 ? (
                    <div className="py-8 flex items-center justify-center bg-white/80 dark:bg-black/20 rounded-xl border border-dashed border-gray-300 dark:border-white/5">
                      <p className="text-[10px] text-gray-500 font-bold">항목 없음</p>
                    </div>
                  ) : (
                    itemsInTier.map((rec) => {
                      const input = currentDeferredCraftInputs[rec.name] || { boxes: '', sets: '', units: '' };
                      const isPending = pendingCrafts[rec.name] !== undefined;

                      return (
                        <div 
                          key={rec.name} 
                          onClick={(e) => e.stopPropagation()} 
                          className={`rounded-xl p-3 flex flex-col gap-3 border transition-all shadow-sm cursor-default ${isPending ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-300 dark:border-blue-500/30' : 'bg-white dark:bg-[#16161a] border-gray-200 dark:border-white/5'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={getImagePath(rec.name) || undefined} className="w-6 h-6 object-contain drop-shadow-md" alt=""/>
                              <div>
                                <h4 className="text-[11px] font-black text-gray-900 dark:text-white leading-tight">{rec.name}</h4>
                                <p className="text-[9px] font-bold text-gray-600 mt-0.5">최대 {formatQty(rec.actualCraftedFromGreedy, globalSetMode)}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col justify-end mt-1 h-[70px]">
                            {isPending ? (
                              <button 
                                type="button" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (e.currentTarget instanceof HTMLElement) e.currentTarget.blur();
                                  handleRemovePending(rec.name);
                                }} 
                                className="w-full h-8 bg-gray-100 dark:bg-[#1a1a1e] border border-gray-300 dark:border-white/20 text-gray-800 dark:text-gray-300 text-[11px] font-black rounded-lg shadow-sm transition-all active:scale-95"
                              >
                                예약 취소
                              </button>
                            ) : (
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-1.5 w-full">
                                  <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-white/10 rounded-lg overflow-hidden h-8 transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 shadow-sm relative">
                                      <span className="absolute top-0.5 left-1.5 text-[7px] font-bold text-gray-500">상자</span>
                                      <input type="number" min="0" placeholder="0" value={input.boxes} onChange={(e) => handleCraftInputChange(rec.name, 'boxes', e.target.value)} onClick={(e) => e.stopPropagation()} className="w-full h-full bg-transparent px-1.5 pt-3 pb-0.5 text-[11px] font-black text-center outline-none text-gray-900 dark:text-white" />
                                  </div>
                                  <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-white/10 rounded-lg overflow-hidden h-8 transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 shadow-sm relative">
                                      <span className="absolute top-0.5 left-1.5 text-[7px] font-bold text-gray-500">세트</span>
                                      <input type="number" min="0" placeholder="0" value={input.sets} onChange={(e) => handleCraftInputChange(rec.name, 'sets', e.target.value)} onClick={(e) => e.stopPropagation()} className="w-full h-full bg-transparent px-1.5 pt-3 pb-0.5 text-[11px] font-black text-center outline-none text-gray-900 dark:text-white" />
                                  </div>
                                  <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-white/10 rounded-lg overflow-hidden h-8 transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 shadow-sm relative">
                                      <span className="absolute top-0.5 left-1.5 text-[7px] font-bold text-gray-500">개</span>
                                      <input type="number" min="0" placeholder="0" value={input.units} onChange={(e) => handleCraftInputChange(rec.name, 'units', e.target.value)} onClick={(e) => e.stopPropagation()} className="w-full h-full bg-transparent px-1.5 pt-3 pb-0.5 text-[11px] font-black text-center outline-none text-gray-900 dark:text-white" />
                                  </div>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (e.currentTarget instanceof HTMLElement) e.currentTarget.blur();
                                    handleQueueCraft(rec.name, rec.actualCraftedFromGreedy);
                                  }} 
                                  className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-lg shadow-sm transition-all active:scale-95"
                                >
                                  예약하기
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeTierTab === '0성' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-4 shadow-sm flex items-start gap-3 mt-2">
          <div className="text-blue-600 dark:text-blue-400 mt-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <h4 className="text-[12px] font-black text-blue-800 dark:text-blue-400 mb-1">0성(추출된 희석액) 라인업 필터 안내</h4>
            <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
              0성 연금품은 <span className="text-blue-700 dark:text-blue-400 font-black">1성, 2성, 3성 라인업을 제작하는 과정에서 하위 재료를 함께 추가 제작</span>해 두고, 마지막에 이곳에서 결합(합성)만 진행하시는 것을 권장합니다.<br />
              타 라인업 탭에서 0성 목표 수량을 추가로 설정하면 각 탭의 연쇄 가공 과정에 0성 전용 하위 재료가 자동으로 합산되어 가이드됩니다.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {(activeTierTab === '전체' || activeTierTab === '1성') && renderAlchemyPair(
          "1티어: 정수", ["수호의 정수(1성)", "파동의 정수(1성)", "혼란의 정수(1성)", "생명의 정수(1성)", "부식의 정수(1성)"],
          "2티어: 핵", ["물결 수호의 핵", "파동 오염의 핵", "질서 파괴의 핵", "활력 붕괴의 핵", "침식 방어의 핵"]
        )}
        {(activeTierTab === '전체' || activeTierTab === '2성') && renderAlchemyPair(
          "1티어: 에센스", ["수호 에센스", "파동 에센스", "혼란 에센스", "생명 에센스", "부식 에센스"],
          "2티어: 결정", ["활기 보존의 결정", "파도 침식의 결정", "방어 오염의 결정", "격류 재생의 결정", "맹독 혼란의 결정"]
        )}
        {(activeTierTab === '전체' || activeTierTab === '3성') && renderAlchemyPair(
          "1티어: 엘릭서", ["수호의 엘릭서", "파동의 엘릭서", "혼란의 엘릭서", "생명의 엘릭서", "부식의 엘릭서"],
          "2티어: 영약", ["불멸 재생의 영약", "파동 장벽의 영약", "타락 침식의 영약", "생명 광란의 영약", "맹독 파동의 영약"]
        )}
      </div>

      <div className="bg-white dark:bg-[#0a0a0c] border border-gray-300 dark:border-white/5 rounded-2xl p-5 shadow-md">
        <h3 className="text-sm font-black text-gray-800 dark:text-gray-200 mb-5">
          {activeTierTab !== '전체' ? `[${activeTierTab}] 총 준비물(바닐라 재료는 있거나 구매한다고 가정)` : '총 준비물(바닐라 재료는 있거나 구매한다고 가정)'}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`flex flex-col gap-3 bg-white dark:bg-[#111113] border border-gray-300 dark:border-white/5 rounded-2xl p-4 shadow-sm ${activeTierTab === '2성' || activeTierTab === '3성' ? 'order-1' : ''}`}>
            <h4 className="text-[12px] font-black text-blue-800 dark:text-blue-400 mb-1 border-b border-gray-200 dark:border-white/5 pb-2">
              어패류
            </h4>
            <div className="flex flex-col gap-1.5 w-full">
              {Object.keys(tabAggregation.prepSeafood).length === 0 ? (
                 <p className="text-[10px] text-gray-500 font-medium py-2">필요한 항목이 없습니다.</p>
              ) : (
                Object.entries(tabAggregation.prepSeafood).map(([m, q]) => renderCraftItemCompact(m, q as number))
              )}
            </div>
          </div>

          <div className={`flex flex-col gap-3 bg-white dark:bg-[#111113] border border-gray-300 dark:border-white/5 rounded-2xl p-4 shadow-sm ${activeTierTab === '2성' || activeTierTab === '3성' ? 'order-2' : ''}`}>
            <h4 className="text-[12px] font-black text-blue-800 dark:text-blue-400 mb-1 border-b border-gray-200 dark:border-white/5 pb-2">
              블록
            </h4>
            <div className="flex flex-col gap-1.5 w-full">
              {Object.keys(tabAggregation.prepBlocks).length === 0 ? (
                 <p className="text-[10px] text-gray-500 font-medium py-2">필요한 항목이 없습니다.</p>
              ) : (
                Object.entries(tabAggregation.prepBlocks).map(([m, q]) => renderCraftItemCompact(m, q as number))
              )}
            </div>
          </div>

          <div className={`flex flex-col gap-3 bg-white dark:bg-[#111113] border border-gray-300 dark:border-white/5 rounded-2xl p-4 shadow-sm ${activeTierTab === '2성' || activeTierTab === '3성' ? 'order-4' : ''}`}>
            <h4 className="text-[12px] font-black text-blue-800 dark:text-blue-400 mb-1 border-b border-gray-200 dark:border-white/5 pb-2">
              회
            </h4>
            <div className="flex flex-col gap-1.5 w-full">
              {Object.keys(tabAggregation.prepFish).length === 0 ? (
                 <p className="text-[10px] text-gray-500 font-medium py-2">필요한 항목이 없습니다.</p>
              ) : (
                Object.entries(tabAggregation.prepFish).map(([m, q]) => renderCraftItemCompact(m, q as number))
              )}
            </div>
          </div>

          <div className={`flex flex-col gap-3 bg-white dark:bg-[#111113] border border-gray-300 dark:border-white/5 rounded-2xl p-4 shadow-sm ${activeTierTab === '2성' || activeTierTab === '3성' ? 'order-3' : ''}`}>
            <h4 className="text-[12px] font-black text-gray-600 dark:text-gray-400 mb-1 border-b border-gray-200 dark:border-white/5 pb-2">
              기타 재료 (연금품 포함)
            </h4>
            <div className="flex flex-col gap-1.5 w-full">
              {Object.keys(tabAggregation.prepOther).length === 0 ? (
                 <p className="text-[10px] text-gray-500 font-medium py-2">필요한 항목이 없습니다.</p>
              ) : (
                (() => {
                  const { priorityItems, baseList } = getReorderedOtherItems();
                  return (
                    <>
                      {priorityItems.map(([m, q]) => renderCraftItemCompact(m, q))}
                      {priorityItems.length > 0 && baseList.length > 0 && <div className="h-3 border-b border-dashed border-gray-300 dark:border-white/10 mb-1"></div>}
                      {baseList.map(([m, q]) => renderCraftItemCompact(m, q))}
                    </>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      </div>

      {displayTargets.length > 0 && (
        <div className="bg-white dark:bg-[#0a0a0c] border border-gray-300 dark:border-white/5 rounded-2xl p-5 shadow-md mt-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
            <h3 className="text-sm font-black text-gray-900 dark:text-white">
              {activeTierTab !== '전체' ? `[${activeTierTab}] 상세 제작 가이드` : '상세 제작 가이드'}
            </h3>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#111113] p-1 rounded-lg border border-gray-300 dark:border-white/5 shadow-inner">
              <button 
                onClick={() => setBlueprintViewMode('compact')} 
                className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${blueprintViewMode === 'compact' ? 'bg-white dark:bg-[#1a1a1e] text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-transparent' : 'text-gray-600 hover:text-gray-900 dark:hover:text-gray-300'}`}
              >
                세로 그리드
              </button>
              <button 
                onClick={() => setBlueprintViewMode('flow')} 
                className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${blueprintViewMode === 'flow' ? 'bg-white dark:bg-[#1a1a1e] text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-transparent' : 'text-gray-600 hover:text-gray-900 dark:hover:text-gray-300'}`}
              >
                가로 플로우
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayTargets.map((arr, index) => {
              const itemName = arr[0] as string;
              const targetQty = arr[1];
              const isDummy = targetQty === 0;

              let rec = optimalCalculations.recommendations.find(r => r.name === itemName);
              let stockBeforeCraft = rec ? rec.stockBeforeCraft : { ...currentDeferredStock };

              let localTarget: any = {};
              if (!isDummy) localTarget[itemName] = targetQty;
              
              let hasInjectedExtra = false;
              if (itemName === targetParent && extraSubQty > 0) {
                  localTarget[extraSubItem] = (localTarget[extraSubItem] || 0) + extraSubQty;
                  hasInjectedExtra = true;
              }

              const dynamicSim = simulateCraftPure(localTarget, stockBeforeCraft);

              const missingKeys = Object.keys(dynamicSim.missing);
              const s1 = Object.entries(dynamicSim.craftedLog || {}).filter(([k]) => !k.includes("핵") && !k.includes("결정") && !k.includes("영약") && !OCEAN_FIXED_PRICES.find(p=>p.name===k) && k !== itemName);
              const s2 = Object.entries(dynamicSim.craftedLog || {}).filter(([k]) => (k.includes("핵") || k.includes("결정") || k.includes("영약")) && k !== itemName);

              let totalSec = 0;
              Object.entries(dynamicSim.craftedLog || {}).forEach(([m, q]) => {
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

              let netProfit = 0;
              if (!isDummy) {
                  const sellPrice = Math.ceil((OCEAN_FIXED_PRICES.find(p => p.name === itemName)?.base || 0) * (1 + o16Bonus));
                  const revenue = sellPrice * targetQty;
                  let missingCost = 0;
                  Object.entries(dynamicSim.missing).forEach(([m, q]) => {
                       missingCost += (currentDeferredCost[m] || 0) * (q as number);
                  });
                  netProfit = revenue - missingCost;
              }

              const blockTitle = isDummy ? extraSubItem : itemName;
              const blockQty = isDummy ? t0Target : targetQty;

              return (
                <div key={itemName} className={`bg-white dark:bg-[#111113] border border-gray-300 dark:border-white/5 rounded-2xl p-4 shadow-md flex flex-col ${blueprintViewMode === 'flow' ? 'col-span-full' : 'h-full'}`}>
                  <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-300 dark:border-white/10">
                    <div className="flex items-center gap-2 mt-1">
                      <img src={getImagePath(blockTitle)||undefined} className="w-8 h-8 object-contain drop-shadow-md" />
                      <div>
                        <span className="text-[15px] font-black text-blue-800 dark:text-blue-400 leading-none">
                            {isDummy ? `[0성 사전 준비] ${blockTitle} 라인업` : blockTitle}
                        </span>
                        {isDummy ? (
                            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-500 mt-1">0성 재료 사전 준비 전용</p>
                        ) : (
                            <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 mt-1">목표 수량: {formatQty(blockQty, globalSetMode)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 px-2.5 py-1 rounded shadow-sm border border-gray-300 dark:border-transparent">총 소요시간: {totalTimeStr}</span>
                      {!isDummy && (
                        <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded shadow-sm border border-emerald-300 dark:border-transparent">예상 순수익: +{netProfit.toLocaleString()} G</span>
                      )}
                    </div>
                  </div>
                  
                  {activeTierTab === '0성' ? (
                    blueprintViewMode === 'flow' ? (
                        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 w-full">
                            
                            <div className="flex-1 flex flex-col min-w-[250px]">
                                <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-400 mb-1.5 uppercase tracking-widest px-1">Step 1. 사전 제작품 보관함에서 꺼내기</span>
                                <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-300 dark:border-white/5 rounded-xl p-4 h-full flex flex-col justify-center gap-3 shadow-sm">
                                    <div className="flex items-center justify-between text-[10px]">
                                        <div className="flex items-center gap-2 truncate">
                                            <img src={getImagePath('침식 방어의 핵')||undefined} className="w-4 h-4 object-contain opacity-90 shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="text-gray-800 dark:text-gray-300 font-bold truncate">침식 방어의 핵</span>
                                                <span className="text-[8px] text-gray-500 font-normal">1성 라인업 제작분</span>
                                            </div>
                                        </div>
                                        <span className="text-indigo-700 dark:text-indigo-400 font-black shrink-0 ml-1 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded border border-indigo-200 dark:border-transparent">{formatQty(targetQty * 3, globalSetMode)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px]">
                                        <div className="flex items-center gap-2 truncate">
                                            <img src={getImagePath('방어 오염의 결정')||undefined} className="w-4 h-4 object-contain opacity-90 shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="text-gray-800 dark:text-gray-300 font-bold truncate">방어 오염의 결정</span>
                                                <span className="text-[8px] text-gray-500 font-normal">2성 라인업 제작분</span>
                                            </div>
                                        </div>
                                        <span className="text-indigo-700 dark:text-indigo-400 font-black shrink-0 ml-1 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded border border-indigo-200 dark:border-transparent">{formatQty(targetQty * 2, globalSetMode)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px]">
                                        <div className="flex items-center gap-2 truncate">
                                            <img src={getImagePath('타락 침식의 영약')||undefined} className="w-4 h-4 object-contain opacity-90 shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="text-gray-800 dark:text-gray-300 font-bold truncate">타락 침식의 영약</span>
                                                <span className="text-[8px] text-gray-500 font-normal">3성 라인업 제작분</span>
                                            </div>
                                        </div>
                                        <span className="text-indigo-700 dark:text-indigo-400 font-black shrink-0 ml-1 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded border border-indigo-200 dark:border-transparent">{formatQty(targetQty * 1, globalSetMode)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden xl:flex items-center justify-center text-indigo-300 dark:text-indigo-800 shrink-0 text-xl font-black">{'>'}</div>
                            
                            <div className="flex-1 flex flex-col min-w-[220px]">
                                <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-400 mb-1.5 uppercase tracking-widest px-1">Step 2. 최종 연성 (결합)</span>
                                <div className="flex flex-col h-full justify-center">
                                    {renderProcessNode(itemName, targetQty, true)}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 flex-1 mt-2">
                            <div>
                                <p className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 mb-1.5">STEP 1. 사전 제작품 보관함에서 꺼내기</p>
                                <div className="flex flex-col gap-2">
                                    <div className="bg-gray-50 dark:bg-[#16161a] border border-gray-300 dark:border-white/5 rounded px-2.5 py-2 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <img src={getImagePath('침식 방어의 핵')||undefined} className="w-4 h-4 object-contain opacity-90" />
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">침식 방어의 핵</span>
                                                <span className="text-[9px] text-gray-500 font-normal">1성 라인업 제작분</span>
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-400">{formatQty(targetQty * 3, globalSetMode)}</span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-[#16161a] border border-gray-300 dark:border-white/5 rounded px-2.5 py-2 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <img src={getImagePath('방어 오염의 결정')||undefined} className="w-4 h-4 object-contain opacity-90" />
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">방어 오염의 결정</span>
                                                <span className="text-[9px] text-gray-500 font-normal">2성 라인업 제작분</span>
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-400">{formatQty(targetQty * 2, globalSetMode)}</span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-[#16161a] border border-gray-300 dark:border-white/5 rounded px-2.5 py-2 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <img src={getImagePath('타락 침식의 영약')||undefined} className="w-4 h-4 object-contain opacity-90" />
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">타락 침식의 영약</span>
                                                <span className="text-[9px] text-gray-500 font-normal">3성 라인업 제작분</span>
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-400">{formatQty(targetQty * 1, globalSetMode)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto pt-2">
                                <p className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 mb-1.5">STEP 2. 최종 연성 (결합)</p>
                                <div className="flex flex-col gap-2">
                                    {renderCraftStep(itemName, targetQty)}
                                </div>
                            </div>
                        </div>
                    )
                  ) : (
                    blueprintViewMode === 'flow' ? (
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
                                  <span className="text-indigo-600 font-black shrink-0 ml-1">{formatQty(dynamicSim.missing[m] as number, globalSetMode)}</span>
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
                                {s1.map(([m, q]) => renderProcessNode(m, q as number, false, (hasInjectedExtra && m === extraSubItem) ? `0성 추출된 희석액용 ${formatQty(extraSubQty, globalSetMode)} 보관` : undefined))}
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
                                {s2.map(([m, q]) => renderProcessNode(m, q as number, false, (hasInjectedExtra && m === extraSubItem) ? `0성 추출된 희석액용 ${formatQty(extraSubQty, globalSetMode)} 보관` : undefined))}
                              </div>
                            </div>
                          </>
                        )}

                        {!isDummy && (
                          <>
                            <div className="hidden xl:flex items-center justify-center text-blue-400 dark:text-blue-800 shrink-0 text-xl font-black">{'>'}</div>
                            <div className="flex-1 flex flex-col min-w-[220px]">
                              <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-400 mb-1.5 uppercase tracking-widest px-1">Step 4. 최종 연성</span>
                              <div className="flex flex-col h-full justify-center">
                                {renderProcessNode(itemName, targetQty, true)}
                              </div>
                            </div>
                          </>
                        )}

                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 flex-1 mt-2">
                        <div>
                          <p className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 mb-1.5">STEP 1. 부족한 바닐라 재료</p>
                          {missingKeys.length === 0 ? (
                            <span className="text-[10px] text-gray-500 font-bold">조달 필요 없음</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                                {missingKeys.map((m) => (
                                  <span key={m} className="bg-gray-100 dark:bg-[#16161a] border border-gray-300 dark:border-white/5 px-2 py-1 rounded text-[9px] font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1 shadow-sm">
                                      <img src={getImagePath(m)||undefined} className="w-3.5 h-3.5 object-contain" />
                                      {m} <span className="text-indigo-700 dark:text-indigo-400">{formatQty(dynamicSim.missing[m] as number, globalSetMode)}</span>
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>

                        {s1.length > 0 && (
                          <div>
                              <p className="text-[10px] font-black text-purple-700 dark:text-purple-400 mb-1.5">STEP 2. 하위 연금/가공 (창고에서 꺼내기)</p>
                              <div className="flex flex-col gap-2">
                                {s1.map(([m, q]) => renderCraftStep(m, q as number, (hasInjectedExtra && m === extraSubItem) ? `0성 추출된 희석액용 ${formatQty(extraSubQty, globalSetMode)} 보관` : undefined))}
                              </div>
                          </div>
                        )}

                        {s2.length > 0 && (
                          <div>
                              <p className="text-[10px] font-black text-rose-700 dark:text-rose-400 mb-1.5">STEP 3. 중급 연금 가공</p>
                              <div className="flex flex-col gap-2">
                                {s2.map(([m, q]) => renderCraftStep(m, q as number, (hasInjectedExtra && m === extraSubItem) ? `0성 추출된 희석액용 ${formatQty(extraSubQty, globalSetMode)} 보관` : undefined))}
                              </div>
                          </div>
                        )}

                        {!isDummy && (
                          <div className="mt-auto pt-2">
                              <p className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 mb-1.5">STEP 4. 최종 연금 가공</p>
                              <div className="flex flex-col gap-2">
                                {renderCraftStep(itemName, targetQty)}
                              </div>
                          </div>
                        )}
                      </div>
                    )
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}