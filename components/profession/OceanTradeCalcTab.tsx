'use client';

import { useState, useEffect, useMemo } from 'react';
import { OCEAN_RECIPES as RAW_OCEAN_RECIPES, OCEAN_FIXED_PRICES, getImagePath } from '@/lib/professionData';

interface Props {
  userStats: any;
}

const PATCHED_OCEAN_RECIPES = RAW_OCEAN_RECIPES.map(r => {
  if (['수호의 정수(1성)', '파동의 정수(1성)', '생명의 정수(1성)', '부식의 정수(1성)', '혼란의 정수(1성)'].includes(r.name)) {
    return { ...r, note: '1회 2개 제작' };
  }
  return r;
});

const PARSED_RECIPES = PATCHED_OCEAN_RECIPES.map(r => {
  let yieldAmount = 1;
  if (r.note && r.note.includes('2개 제작')) yieldAmount = 2;
  if (r.name.includes('(2개)')) yieldAmount = 2;

  return {
    name: r.name,
    yieldAmount,
    ingredients: r.ingredients.map(ing => {
      const match = ing.match(/(.+?)(?:\s+(\d+)개)?$/);
      return { name: match ? match[1].trim() : ing, req: match && match[2] ? parseInt(match[2], 10) : 1 };
    })
  };
});

const TIER1 = ["굴(1성)", "소라(1성)", "문어(1성)", "미역(1성)", "성게(1성)"];
const TIER2 = ["굴(2성)", "소라(2성)", "문어(2성)", "미역(2성)", "성게(2성)"];
const TIER3 = ["굴(3성)", "소라(3성)", "문어(3성)", "미역(3성)", "성게(3성)"];
const FISH = ["새우", "도미", "청어", "금붕어", "농어"];

const CORE_BASE_SHELLS = [...TIER1, ...TIER2, ...TIER3];

const VANILLA = ["점토", "모래", "자갈", "화강암", "흙", "해초", "참나무잎", "가문비나무잎", "자작나무잎", "아카시아나무잎", "벚나무잎", "켈프", "청금석 블록", "레드스톤 블록", "철 주괴", "금 주괴", "다이아몬드", "불우렁쉥이", "유리병", "네더랙", "마그마블록", "영혼 흙", "진홍빛 자루", "뒤틀린 자루", "말린 켈프", "발광 열매", "죽은 관 산호 블록", "죽은 사방산호 블록", "죽은 거품 산호 블록", "죽은 불 산호 블록", "죽은 뇌 산호 블록", ...FISH];

const ALCHEMY_T1 = ["수호의 정수(1성)", "파동의 정수(1성)", "생명의 정수(1성)", "부식의 정수(1성)", "혼란의 정수(1성)", "수호 에센스", "파동 에센스", "생명 에센스", "부식 에센스", "혼란 에센스", "수호의 엘릭서", "파동의 엘릭서", "생명의 엘릭서", "부식의 엘릭서", "혼란의 엘릭서"];
const ALCHEMY_T2 = ["물결 수호의 핵", "파동 오염의 핵", "질서 파괴의 핵", "활력 붕괴의 핵", "침식 방어의 핵", "활기 보존의 결정", "파도 침식의 결정", "격류 재생의 결정", "맹독 혼란의 결정", "방어 오염의 결정", "불멸 재생의 영약", "파동 장벽의 영약", "생명 광란의 영약", "맹독 파동의 영약", "타락 침식의 영약"];
const ALCHEMY_T3 = ["영생의 아쿠티스", "크라켄의 광란체", "리바이던의 깃털", "해구의 파동 코어", "침묵의 심해 비약", "청해룡의 날개", "아쿠아 펄스 파편", "나우틸러스의 손", "무저의 척추", "추출된 희석액"];

const CORE_ITEMS = [...CORE_BASE_SHELLS, ...ALCHEMY_T1, ...ALCHEMY_T2];

const INVENTORY_GROUPS = [
  { title: "1성 어패류", items: TIER1 },
  { title: "2성 어패류", items: TIER2 },
  { title: "3성 어패류", items: TIER3 },
  { title: "물고기", items: FISH },
  { title: "1단계 연금품", items: ALCHEMY_T1 },
  { title: "2단계 연금품", items: ALCHEMY_T2 }
];

const RECIPE_FIXES: Record<string, {ing: string, req: number, yield: number}> = {
  '깐 새우': { ing: '새우', req: 1, yield: 2 },
  '도미 회': { ing: '도미', req: 1, yield: 2 },
  '청어 회': { ing: '청어', req: 1, yield: 2 },
  '금붕어 회': { ing: '금붕어', req: 1, yield: 2 },
  '농어 회': { ing: '농어', req: 1, yield: 2 },
  '굴(2성)': { ing: '굴(1성)', req: 3, yield: 1 },
  '소라(2성)': { ing: '소라(1성)', req: 3, yield: 1 },
  '문어(2성)': { ing: '문어(1성)', req: 3, yield: 1 },
  '미역(2성)': { ing: '미역(1성)', req: 3, yield: 1 },
  '성게(2성)': { ing: '성게(1성)', req: 3, yield: 1 },
};

const ROD_BASE_DROPS = [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 10];
const O11_BONUS = [0, 0.05, 0.07, 0.10, 0.15, 0.20];
const O14_BONUS = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10];
const O17_BONUS = [0, 0.01, 0.03, 0.05, 0.07, 0.10, 0.15];

const simulateCraftPure = (targetList: Record<string, number>, initialStock: Record<string, number>, allowTierUpgrade: boolean = false) => {
  const tempStock = { ...initialStock };
  const missing: Record<string, number> = {};
  const craftedLog: Record<string, number> = {};

  const getReq = (name: string, q: number) => {
    if (q <= 0) return;
    const use = Math.min(q, tempStock[name] || 0);
    tempStock[name] = (tempStock[name] || 0) - use;
    const rem = q - use;
    if (rem <= 0) return;

    if (RECIPE_FIXES[name]) {
      const fix = RECIPE_FIXES[name];
      
      if (!allowTierUpgrade && TIER2.includes(name) && TIER1.includes(fix.ing)) {
        missing[name] = (missing[name] || 0) + rem;
        return;
      }

      const craftsNeeded = Math.ceil(rem / fix.yield);
      const leftover = (craftsNeeded * fix.yield) - rem;
      if (leftover > 0) tempStock[name] = (tempStock[name] || 0) + leftover;
      
      craftedLog[name] = (craftedLog[name] || 0) + craftsNeeded * fix.yield;
      
      getReq(fix.ing, fix.req * craftsNeeded);
      return;
    }

    const recipe = PARSED_RECIPES.find(r => r.name === name);
    if (!recipe) {
      missing[name] = (missing[name] || 0) + rem;
      return;
    }

    const yieldAmount = recipe.yieldAmount;
    const craftsNeeded = Math.ceil(rem / yieldAmount);
    const leftover = (craftsNeeded * yieldAmount) - rem;
    if (leftover > 0) tempStock[name] = (tempStock[name] || 0) + leftover;

    craftedLog[name] = (craftedLog[name] || 0) + craftsNeeded * yieldAmount;

    recipe.ingredients.forEach(ing => {
      getReq(ing.name, ing.req * craftsNeeded);
    });
  };

  Object.entries(targetList).forEach(([tItem, tQty]) => {
    getReq(tItem, tQty);
  });

  return { missing, stock: tempStock, craftedLog };
};

const ITEM_BASE_REQS: Record<string, Record<string, number>> = {};
const ALL_ITEMS = Array.from(new Set([...TIER1, ...TIER2, ...TIER3, ...FISH, ...ALCHEMY_T1, ...ALCHEMY_T2, ...ALCHEMY_T3, ...OCEAN_FIXED_PRICES.map(i=>i.name)]));
ALL_ITEMS.forEach(name => {
  ITEM_BASE_REQS[name] = simulateCraftPure({ [name]: 1 }, {}).missing;
});

type StaminaScenario = 
  | { type: 'single'; target: string; profit: number; stockConsumed: number; crafted: Record<string, number>; finalStock: Record<string, number>; totalStamina: number }
  | { type: 'split'; target1: string; stamina1: number; target2: string; stamina2: number; profit: number; stockConsumed: number; crafted: Record<string, number>; finalStock: Record<string, number> };

export default function OceanTradeCalcTab({ userStats }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'alchemy_optimal' | 'stamina_recommend' | 'trade' | 'settings'>('alchemy_optimal');
  
  const [cost, setCost] = useState<Record<string, number>>({});
  const [stock, setStock] = useState<Record<string, number>>({});
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [tradeQty, setTradeQty] = useState<Record<string, number>>({});
  const [targets, setTargets] = useState<Record<string, string>>({});
  
  const [craftInputs, setCraftInputs] = useState<Record<string, { sets: string, units: string }>>({});
  
  const [globalSetMode, setGlobalSetMode] = useState<boolean>(false);
  const [allowTierUpgrade, setAllowTierUpgrade] = useState<boolean>(false);
  const [recommendMode, setRecommendMode] = useState<'balance' | 'efficiency'>('balance');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInventoryVisible, setIsInventoryVisible] = useState(true);

  const [expandedRec, setExpandedRec] = useState<Record<string, boolean>>({});
  const [isStaminaModalOpen, setIsStaminaModalOpen] = useState(false);

  const o16Bonus = [0, 0.05, 0.07, 0.09, 0.12, 0.15, 0.20, 0.25, 0.30][userStats.o16Lv] || 0;

  useEffect(() => {
    const saved = localStorage.getItem('ocean_trade_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCost(parsed.cost || {});
        setStock(parsed.stock || {});
        setBlacklist(parsed.blacklist || []);
        if (parsed.globalSetMode !== undefined) setGlobalSetMode(parsed.globalSetMode);
        if (parsed.allowTierUpgrade !== undefined) setAllowTierUpgrade(parsed.allowTierUpgrade);
        if (parsed.recommendMode !== undefined) setRecommendMode(parsed.recommendMode);
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ocean_trade_v3', JSON.stringify({ cost, stock, blacklist, globalSetMode, allowTierUpgrade, recommendMode }));
    }
  }, [cost, stock, blacklist, globalSetMode, allowTierUpgrade, recommendMode, isLoaded]);

  const handleCostChange = (item: string, val: string) => {
    const num = parseFloat(val);
    setCost(prev => ({ ...prev, [item]: isNaN(num) ? 0 : (globalSetMode ? num / 64 : num) }));
  };

  const handleTradeQtyChange = (item: string, val: string) => {
    const num = parseFloat(val);
    setTradeQty(prev => ({ ...prev, [item]: isNaN(num) ? 0 : (globalSetMode ? num * 64 : num) }));
  };

  const handleStockChange = (item: string, val: string) => {
    const num = parseFloat(val);
    setStock(prev => ({ ...prev, [item]: isNaN(num) ? 0 : Math.round(num * (globalSetMode ? 64 : 1)) }));
  };

  const handleTargetChange = (item: string, val: string) => {
    setTargets(prev => ({ ...prev, [item]: val }));
  };

  const toggleBlacklist = (item: string) => {
    setBlacklist(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const toggleExpand = (name: string) => {
    setExpandedRec(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const clearTradeQty = () => setTradeQty({});

  const saveCostData = () => {
    localStorage.setItem('ocean_trade_v3', JSON.stringify({ cost, stock, blacklist, globalSetMode, allowTierUpgrade, recommendMode }));
    alert('입력된 설정이 성공적으로 저장되었습니다.');
  };

  const totalTradeAmount = useMemo(() => {
    if (!isLoaded) return 0;
    let sum = 0;
    Object.entries(tradeQty).forEach(([item, qty]) => {
      if (qty > 0) sum += (cost[item] || 0) * qty;
    });
    return sum;
  }, [tradeQty, cost, isLoaded]);

  const addTradeToStock = () => {
    if (!confirm('현재 거래 수량을 창고에 합산하고 수량을 초기화하시겠습니까?')) return;
    const newStock = { ...stock };
    Object.entries(tradeQty).forEach(([item, qty]) => {
      if (qty > 0) newStock[item] = (newStock[item] || 0) + qty;
    });
    setStock(newStock);
    clearTradeQty();
    alert('창고에 합산 및 수량이 초기화되었습니다.');
  };

  const clearInventory = () => {
    if (!confirm('전체 재고 수량을 0으로 초기화하시겠습니까?')) return;
    setStock({});
    alert('모든 재고가 초기화되었습니다.');
  };

  const getBaseEquivalents = (currentStock: Record<string, number>) => {
    const eq: Record<string, number> = {};
    Object.entries(currentStock).forEach(([name, qty]) => {
      if (qty > 0) {
        if (ITEM_BASE_REQS[name]) {
          Object.entries(ITEM_BASE_REQS[name]).forEach(([bName, bQty]) => {
            eq[bName] = (eq[bName] || 0) + (bQty * qty);
          });
        } else {
          eq[name] = (eq[name] || 0) + qty;
        }
      }
    });
    return eq;
  };

  const optimalCalculations = useMemo(() => {
    if (!isLoaded || activeSubTab === 'trade' || activeSubTab === 'settings') return { recommendations: [], totalExpectedProfit: 0, overallMissingVanilla: {} };
    
    const itemsWithProfit = OCEAN_FIXED_PRICES.map(item => {
      const sellPrice = Math.ceil(item.base * (1 + o16Bonus));
      const baseMats = ITEM_BASE_REQS[item.name] || {};
      let totalCost = 0;
      let hasBlacklist = false;

      Object.entries(baseMats).forEach(([mat, qty]) => {
        if (blacklist.includes(mat)) hasBlacklist = true;
        totalCost += (cost[mat] || 0) * qty;
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

      const eqStock = getBaseEquivalents(tempStock);

      for (const item of itemsWithProfit) {
        let maxPossible = Infinity;
        let possible = true;
        for (const [mat, qty] of Object.entries(item.baseMats)) {
            if (CORE_ITEMS.includes(mat)) {
                const avail = eqStock[mat] || 0;
                if (avail < qty) { possible = false; break; }
                maxPossible = Math.min(maxPossible, Math.floor(avail / qty));
            }
        }
        if (!possible) continue;

        const batchSize = Math.max(1, Math.floor(maxPossible / 10));

        const sim = simulateCraftPure({ [item.name]: batchSize }, tempStock, allowTierUpgrade);
        const missingKeys = Object.keys(sim.missing);
        const canCraft = missingKeys.every(k => !CORE_ITEMS.includes(k) && !blacklist.includes(k));

        if (canCraft) {
            let penaltyCost = 0;
            for (const mat of CORE_BASE_SHELLS) {
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
  }, [cost, stock, blacklist, o16Bonus, isLoaded, activeSubTab, allowTierUpgrade, recommendMode]);

  const applySingleCraft = (itemName: string, maxQty: number) => {
    const input = craftInputs[itemName] || { sets: '', units: '' };
    let totalQtyToCraft = 0;
    
    if (input.sets || input.units) {
        const setsVal = parseInt(input.sets) || 0;
        const unitsVal = parseInt(input.units) || 0;
        totalQtyToCraft = (setsVal * 64) + unitsVal;
    } else {
        totalQtyToCraft = maxQty; 
    }

    if (totalQtyToCraft <= 0) {
        alert('올바른 수량을 입력해 주세요.');
        return;
    }

    if (totalQtyToCraft > maxQty) {
        alert(`보유 재고로 제작할 수 있는 최대 수량(${formatQty(maxQty)})을 초과했습니다.\n최대 ${maxQty}개까지만 제작 가능합니다.`);
        return;
    }

    if (!confirm(`[${itemName}] 총 ${totalQtyToCraft}개를 제작하시겠습니까?\n(제작 시 연금에 사용된 어패류 및 하위 연금품 재고가 차감됩니다.)`)) return;
    
    const sim = simulateCraftPure({ [itemName]: totalQtyToCraft }, stock, allowTierUpgrade);
    setStock(sim.stock);
    setCraftInputs(prev => ({ ...prev, [itemName]: { sets: '', units: '' } }));
    alert('성공적으로 제작되어 재고가 차감되었습니다.');
  };

  const handleCraftInputChange = (itemName: string, field: 'sets' | 'units', value: string) => {
      setCraftInputs(prev => ({
          ...prev,
          [itemName]: {
              ...(prev[itemName] || { sets: '', units: '' }),
              [field]: value
          }
      }));
  };

  const evalStockFast = (addedStock: Record<string, number>, sortedItems: any[]) => {
    let tempStock = { ...stock };
    for(const k in addedStock) tempStock[k] = (tempStock[k] || 0) + addedStock[k];
    
    const initialEqSum = Object.values(getBaseEquivalents(tempStock)).reduce((a, b) => a + b, 0);
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

      const eqStock = getBaseEquivalents(tempStock);

      for (const item of sortedItems) {
        let maxPossible = Infinity;
        let possible = true;
        for (const [mat, count] of Object.entries(ITEM_BASE_REQS[item.name] || {})) {
            if (CORE_ITEMS.includes(mat)) {
                const avail = eqStock[mat] || 0;
                if (avail < count) { possible = false; break; }
                maxPossible = Math.min(maxPossible, Math.floor(avail / count));
            }
        }
        if (!possible) continue;

        const batchSize = Math.max(1, Math.floor(maxPossible / 5));

        const sim = simulateCraftPure({ [item.name]: batchSize }, tempStock, allowTierUpgrade);
        const missingKeys = Object.keys(sim.missing);
        const canCraft = missingKeys.every(k => VANILLA.includes(k) && !blacklist.includes(k));

        if (canCraft) {
            let penaltyCost = 0;
            for (const mat of CORE_BASE_SHELLS) {
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
    
    let totalP = 0;
    const finalSim = simulateCraftPure(crafted, { ...stock, ...addedStock }, allowTierUpgrade);
    let totalVanillaCost = 0;
    Object.entries(finalSim.missing).forEach(([m, q]) => totalVanillaCost += q * (cost[m] || 0));

    Object.entries(crafted).forEach(([m, q]) => {
        const itemDef = sortedItems.find(i => i.name === m);
        if (itemDef) totalP += itemDef.sellPrice * q;
    });
    totalP -= totalVanillaCost;

    const finalEqSum = Object.values(getBaseEquivalents(tempStock)).reduce((a, b) => a + b, 0);
    const stockConsumed = initialEqSum - finalEqSum;

    return { profit: totalP, stockConsumed, crafted, resultingStock: tempStock };
  };

  const staminaRecommendation = useMemo(() => {
    if (!isLoaded || activeSubTab !== 'stamina_recommend') return null;
    const sortedItems = OCEAN_FIXED_PRICES.map(item => {
        const sellPrice = Math.ceil(item.base * (1 + o16Bonus));
        const baseMats = ITEM_BASE_REQS[item.name] || {};
        let totalCost = 0;
        Object.entries(baseMats).forEach(([mat, qty]) => totalCost += (cost[mat] || 0) * qty);
        return { name: item.name, sellPrice, profit: sellPrice - totalCost };
    }).filter(i => i.profit > 0);

    if (userStats.stamina < 15) return null;

    const o11Mult = 1 + (O11_BONUS[userStats.o11Lv] || 0);
    const rodLevel = Math.min(15, Math.max(0, userStats.rodLv));
    const rawDropCount = ROD_BASE_DROPS[rodLevel] || 1;
    const avgDropsPerAction = rawDropCount * o11Mult;
    
    const o17Prob = O17_BONUS[userStats.o17Lv] || 0;
    const p3 = 0.10 + o17Prob;
    const p2 = 0.30;
    const p1 = Math.max(0, 1.0 - p2 - p3);

    const getYield = (stamina: number, category: string) => {
        const actions = Math.floor(stamina / 15);
        if (actions <= 0) return {};
        const totalItems = actions * avgDropsPerAction;
        
        return {
            [`${category}(1성)`]: Math.round(totalItems * p1),
            [`${category}(2성)`]: Math.round(totalItems * p2),
            [`${category}(3성)`]: Math.round(totalItems * p3),
        };
    };

    const TARGET_CATEGORIES = ['굴', '소라', '문어', '미역', '성게'];

    let bestScenario: StaminaScenario | null = null;
    let maxFoundConsumed = -1;
    let maxFoundProfitForConsumed = -1;
    
    const totalStamina = userStats.stamina;
    const maxActions = Math.floor(totalStamina / 15);
    
    const singleResults = [];
    for(const cat of TARGET_CATEGORIES) {
        const yieldA = getYield(totalStamina, cat);
        const res = evalStockFast(yieldA, sortedItems);
        singleResults.push({ cat, profit: res.profit, stockConsumed: res.stockConsumed, crafted: res.crafted, finalStock: res.resultingStock });
        
        if (res.stockConsumed > maxFoundConsumed || (res.stockConsumed === maxFoundConsumed && res.profit > maxFoundProfitForConsumed)) {
            maxFoundConsumed = res.stockConsumed;
            maxFoundProfitForConsumed = res.profit;
            bestScenario = { type: 'single', target: cat, profit: res.profit, stockConsumed: res.stockConsumed, crafted: res.crafted, finalStock: res.resultingStock, totalStamina };
        }
    }

    singleResults.sort((a, b) => b.stockConsumed !== a.stockConsumed ? b.stockConsumed - a.stockConsumed : b.profit - a.profit);
    const topCandidates = singleResults.slice(0, 4).map(r => r.cat);

    const step = Math.max(1, Math.floor(maxActions / 6)); 
    
    for(let i=0; i<topCandidates.length; i++) {
        for(let j=i+1; j<topCandidates.length; j++) {
            const cat1 = topCandidates[i];
            const cat2 = topCandidates[j];
            
            for(let a1 = step; a1 < maxActions; a1 += step) {
                const a2 = maxActions - a1;
                const yield1 = getYield(a1 * 15, cat1);
                const yield2 = getYield(a2 * 15, cat2);
                const combined = { ...yield1 };
                for(const k in yield2) combined[k] = (combined[k]||0) + yield2[k];

                const res = evalStockFast(combined, sortedItems);
                if (res.stockConsumed > maxFoundConsumed || (res.stockConsumed === maxFoundConsumed && res.profit > maxFoundProfitForConsumed)) {
                    maxFoundConsumed = res.stockConsumed;
                    maxFoundProfitForConsumed = res.profit;
                    bestScenario = { 
                        type: 'split', 
                        target1: cat1, stamina1: a1 * 15, 
                        target2: cat2, stamina2: a2 * 15,
                        profit: res.profit, stockConsumed: res.stockConsumed, crafted: res.crafted, finalStock: res.resultingStock
                    };
                }
            }
        }
    }

    return bestScenario;
  }, [stock, cost, blacklist, userStats, isLoaded, activeSubTab, allowTierUpgrade, o16Bonus, recommendMode]);

  const formatQty = (qty: number) => {
    if (qty === 0) return '0개';
    if (!globalSetMode) return `${qty.toLocaleString()}개`;
    const sets = Math.floor(qty / 64);
    const rem = qty % 64;
    if (sets === 0) return `${rem}개`;
    if (rem === 0) return `${sets.toLocaleString()}셋`;
    return `${sets.toLocaleString()}셋 ${rem}개`;
  };

  const renderTradeItem = (item: string) => {
    const c = cost[item] || 0;
    const q = tradeQty[item] || 0;
    const lineTotal = c * q;
    
    const displayCost = c === 0 ? '' : (globalSetMode ? Number((c * 64).toFixed(4)) : Number(c.toFixed(4)));
    const displayQty = q === 0 ? '' : (globalSetMode ? Number((q / 64).toFixed(4)) : Number(q.toFixed(4)));
    
    return (
      <div key={item} className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/5 rounded-[1rem] p-3 flex flex-col gap-2.5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 flex items-center justify-center bg-gray-50 dark:bg-black rounded-lg border border-gray-100 dark:border-transparent shrink-0">
              <img src={getImagePath(item) || undefined} alt="" className="w-4 h-4 object-contain drop-shadow-sm"/>
            </div>
            <span className="text-[11px] font-black text-gray-800 dark:text-gray-200 truncate tracking-tight">{item}</span>
          </div>
          <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 tracking-tight shrink-0">{lineTotal > 0 ? lineTotal.toLocaleString() : '0'} G</span>
        </div>
        <div className="flex gap-2">
          <input type="number" step="any" value={displayCost} onChange={(e) => handleCostChange(item, e.target.value)} placeholder="단가" className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-transparent rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-[11px] font-bold focus:ring-1 focus:ring-cyan-500 outline-none transition-colors" />
          <input type="number" step="any" value={displayQty} onChange={(e) => handleTradeQtyChange(item, e.target.value)} placeholder="수량" className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-transparent rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-[11px] font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-colors" />
        </div>
      </div>
    );
  };

  const SubTabButton = ({ id, label }: { id: typeof activeSubTab, label: string }) => (
    <button 
      onClick={() => setActiveSubTab(id)} 
      className={`px-4 md:px-5 py-2.5 rounded-xl font-black text-[11px] md:text-xs transition-all border whitespace-nowrap snap-start shadow-sm ${
        activeSubTab === id 
        ? 'bg-cyan-600 text-white border-transparent shadow-cyan-500/30' 
        : 'bg-white dark:bg-[#111113] border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );

  if (!isLoaded) return <div className="bg-gray-100 dark:bg-[#0a0a0a] h-64 rounded-[2rem] animate-pulse w-full border border-gray-200 dark:border-white/10 transition-colors"></div>;

  return (
    <div className="w-full flex flex-col gap-5 md:gap-7 animate-fade-in-up transition-colors duration-300">
      <style dangerouslySetInnerHTML={{__html: `
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-2 w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[1.5rem] shadow-sm transition-colors">
        <div className="flex gap-2 overflow-x-auto custom-scrollbar w-full md:w-auto snap-x">
          <SubTabButton id="alchemy_optimal" label="연금품 최적 계산" />
          <SubTabButton id="stamina_recommend" label="스태미나 추천" />
          <SubTabButton id="trade" label="거래 계산기" />
          <SubTabButton id="settings" label="단가 및 바닐라 설정" />
        </div>
        <label className="flex items-center justify-end gap-3 px-4 py-2 cursor-pointer shrink-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-white/10">
          <input type="checkbox" className="hidden" checked={globalSetMode} onChange={(e) => setGlobalSetMode(e.target.checked)} />
          <span className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest transition-colors">세트 단위 표시</span>
          <div className={`relative w-10 h-5 rounded-full transition-colors ${globalSetMode ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-md ${globalSetMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </div>
        </label>
      </div>

      {(activeSubTab === 'alchemy_optimal' || activeSubTab === 'stamina_recommend') && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[1.5rem] p-5 md:p-6 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2.5 cursor-pointer" onClick={() => setIsInventoryVisible(!isInventoryVisible)}>
              <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>간편 재고 관리 (어패류 및 연금품)
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); clearInventory(); }}
                className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 px-3 py-1.5 rounded-lg transition-colors"
              >
                전체 초기화
              </button>
              <button 
                onClick={() => setIsInventoryVisible(!isInventoryVisible)}
                className="text-xs text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg transition-colors"
              >
                {isInventoryVisible ? '접기' : '펼치기'}
              </button>
            </div>
          </div>
          
          <div className="transition-all duration-500 ease-in-out" style={{ display: 'grid', gridTemplateRows: isInventoryVisible ? '1fr' : '0fr' }}>
            <div className="overflow-hidden">
              <div className="space-y-6 pt-4 mt-2 border-t border-gray-100 dark:border-white/5">
                {INVENTORY_GROUPS.map((group) => (
                  <div key={group.title}>
                    <h4 className="text-[10px] font-black text-indigo-400/80 mb-2.5 tracking-widest uppercase">{group.title}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {group.items.map(item => (
                        <div key={item} className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-white/5 rounded-xl p-2 flex items-center justify-between hover:bg-white dark:hover:bg-black hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all shadow-sm">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <img src={getImagePath(item) || undefined} alt="" className="w-4 h-4 object-contain shrink-0"/>
                            <span className="text-[10px] text-gray-700 dark:text-gray-200 font-bold truncate tracking-tight">{item}</span>
                          </div>
                          <input type="number" step="any" value={stock[item] === 0 ? '' : (globalSetMode ? Number((stock[item] / 64).toFixed(4)) : stock[item]) || ''} onChange={(e) => handleStockChange(item, e.target.value)} placeholder="0" className="w-12 bg-white dark:bg-black border border-gray-200 dark:border-transparent rounded-lg px-1.5 py-1 text-gray-900 dark:text-white text-[10px] font-black text-right outline-none focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-gray-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'alchemy_optimal' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md relative overflow-hidden transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 border-b border-gray-200 dark:border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">연금품 최적 계산 결과</h3>
                <p className="text-[11px] text-gray-500 mt-1.5">우측 모드에 따라 현재 보유한 재고를 효율적으로 소진할 수 있는 추천 목록을 제공합니다.</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-[#16161a] rounded-lg p-1 w-max border border-gray-200 dark:border-white/10 shrink-0">
                  <button onClick={() => setRecommendMode('balance')} className={`px-4 py-2 text-[11px] font-bold rounded-md transition-all ${recommendMode === 'balance' ? 'bg-white dark:bg-[#202024] shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>재고 최대한 소진</button>
                  <button onClick={() => setRecommendMode('efficiency')} className={`px-4 py-2 text-[11px] font-bold rounded-md transition-all ${recommendMode === 'efficiency' ? 'bg-white dark:bg-[#202024] shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>수익 효율 최우선</button>
              </div>
            </div>
            
            {optimalCalculations.recommendations.length === 0 ? (
              <div className="py-16 text-center bg-gray-50 dark:bg-[#111113] rounded-[1.5rem] border border-gray-200 dark:border-transparent">
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400">보유한 재고로 만들 수 있는 연금품이 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {optimalCalculations.recommendations.map((rec) => {
                  const input = craftInputs[rec.name] || { sets: '', units: '' };
                  let targetQty = rec.actualCraftedFromGreedy;
                  let isCustomQty = false;
                  if (input.sets || input.units) {
                      const s = parseInt(input.sets) || 0;
                      const u = parseInt(input.units) || 0;
                      const total = (s * 64) + u;
                      if (total > 0 && total <= rec.actualCraftedFromGreedy) {
                          targetQty = total;
                          isCustomQty = true;
                      }
                  }

                  const dynamicSim = isCustomQty 
                      ? simulateCraftPure({ [rec.name]: targetQty }, rec.stockBeforeCraft, allowTierUpgrade)
                      : { missing: rec.missingForMax, craftedLog: rec.craftedLog };

                  return (
                    <div key={rec.name} className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-[1.5rem] p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white dark:bg-black rounded-xl p-2 shadow-sm shrink-0 border border-gray-100 dark:border-white/5">
                            <img src={getImagePath(rec.name) || undefined} className="w-full h-full object-contain" alt=""/>
                          </div>
                          <div>
                            <h4 className="text-sm md:text-base font-black text-gray-900 dark:text-white truncate">{rec.name}</h4>
                            <p className="text-[11px] font-bold text-gray-500 mt-0.5">판매가 {rec.sellPrice.toLocaleString()} G</p>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">최대 추천량</p>
                           <p className="text-lg md:text-xl font-black text-gray-900 dark:text-white mt-0.5">{formatQty(rec.actualCraftedFromGreedy)}</p>
                        </div>
                      </div>

                      <button 
                         onClick={() => toggleExpand(rec.name)}
                         className="w-full bg-white dark:bg-[#1a1a1e] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors border border-gray-200 dark:border-transparent shadow-sm mb-4 group"
                      >
                         <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                             {expandedRec[rec.name] ? '제작 가이드 닫기' : '제작 가이드 펼쳐보기'}
                         </span>
                      </button>

                      <div className={`overflow-hidden transition-all duration-300 ${expandedRec[rec.name] ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                         <div className="bg-white dark:bg-[#16161a] rounded-2xl p-4 md:p-5 mb-4 border border-gray-100 dark:border-white/5 shadow-inner">
                             <h5 className="text-xs md:text-sm font-black text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                               단계별 연금 체크리스트 <span className="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md text-[10px] ml-1">({isCustomQty ? `${targetQty}개 기준` : '최대 수량 기준'})</span>
                             </h5>
                             <div className="relative pl-5 border-l-2 border-indigo-100 dark:border-indigo-500/30 space-y-5">
                                
                                <div className="relative">
                                   <div className="absolute -left-[25px] top-1.5 w-3 h-3 rounded-full bg-amber-400 border-[3px] border-white dark:border-[#16161a] shadow-sm"></div>
                                   <p className="text-[11px] md:text-xs font-black text-amber-600 dark:text-amber-400 mb-2">STEP 1. 부족한 바닐라 재료 파악</p>
                                   {Object.keys(dynamicSim.missing).length === 0 ? (
                                      <span className="text-[11px] text-gray-500 font-bold">창고에 모든 기초 재료가 충분합니다.</span>
                                   ) : (
                                      <div className="flex flex-wrap gap-1.5">
                                         {Object.entries(dynamicSim.missing).map(([m, q]) => (
                                            <span key={m} className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 px-2 py-1 rounded-md text-[10px] md:text-[11px] font-bold text-gray-700 dark:text-gray-300 shadow-sm flex items-center gap-1">
                                               <img src={getImagePath(m)||undefined} className="w-3.5 h-3.5 object-contain" />
                                               {m} <span className="text-rose-500 font-black">{formatQty(q as number)}</span>
                                            </span>
                                         ))}
                                      </div>
                                   )}
                                </div>

                                {(() => {
                                   const s1 = Object.entries(dynamicSim.craftedLog || {}).filter(([k]) => (ALCHEMY_T1.includes(k) || TIER2.includes(k) || Object.keys(RECIPE_FIXES).includes(k)) && k !== rec.name);
                                   if(s1.length === 0) return null;
                                   return (
                                      <div className="relative">
                                         <div className="absolute -left-[25px] top-1.5 w-3 h-3 rounded-full bg-purple-400 border-[3px] border-white dark:border-[#16161a] shadow-sm"></div>
                                         <p className="text-[11px] md:text-xs font-black text-purple-600 dark:text-purple-400 mb-2">STEP 2. 하위 연금 가공</p>
                                         <div className="flex flex-wrap gap-1.5">
                                            {s1.map(([m, q]) => (
                                               <span key={m} className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 px-2 py-1 rounded-md text-[10px] md:text-[11px] font-bold text-gray-700 dark:text-gray-300 shadow-sm flex items-center gap-1">
                                                  <img src={getImagePath(m)||undefined} className="w-3.5 h-3.5 object-contain" />
                                                  {m} <span className="text-purple-500 font-black">{formatQty(q as number)} 제작</span>
                                               </span>
                                            ))}
                                         </div>
                                      </div>
                                   )
                                })()}

                                {(() => {
                                   const s2 = Object.entries(dynamicSim.craftedLog || {}).filter(([k]) => ALCHEMY_T2.includes(k) && k !== rec.name);
                                   if(s2.length === 0) return null;
                                   return (
                                      <div className="relative">
                                         <div className="absolute -left-[25px] top-1.5 w-3 h-3 rounded-full bg-rose-400 border-[3px] border-white dark:border-[#16161a] shadow-sm"></div>
                                         <p className="text-[11px] md:text-xs font-black text-rose-600 dark:text-rose-400 mb-2">STEP 3. 중급 연금 가공</p>
                                         <div className="flex flex-wrap gap-1.5">
                                            {s2.map(([m, q]) => (
                                               <span key={m} className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 px-2 py-1 rounded-md text-[10px] md:text-[11px] font-bold text-gray-700 dark:text-gray-300 shadow-sm flex items-center gap-1">
                                                  <img src={getImagePath(m)||undefined} className="w-3.5 h-3.5 object-contain" />
                                                  {m} <span className="text-rose-500 font-black">{formatQty(q as number)} 제작</span>
                                               </span>
                                            ))}
                                         </div>
                                      </div>
                                   )
                                })()}

                                <div className="relative">
                                   <div className="absolute -left-[25px] top-1.5 w-3 h-3 rounded-full bg-cyan-400 border-[3px] border-white dark:border-[#16161a] shadow-sm"></div>
                                   <p className="text-[11px] md:text-xs font-black text-cyan-600 dark:text-cyan-400 mb-2">STEP 4. 최종 연금 가공</p>
                                   <div className="flex flex-wrap gap-1.5">
                                      <span className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 px-2 py-1 rounded-md text-[10px] md:text-[11px] font-bold text-gray-700 dark:text-gray-300 shadow-sm flex items-center gap-1">
                                         <img src={getImagePath(rec.name)||undefined} className="w-3.5 h-3.5 object-contain" />
                                         {rec.name} <span className="text-cyan-500 font-black">{formatQty(targetQty)} 제작</span>
                                      </span>
                                   </div>
                                </div>
                             </div>
                         </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-end gap-2 border-t border-gray-200 dark:border-white/5 pt-4 mt-auto">
                        <div className="flex items-stretch justify-end gap-1.5 w-full sm:w-auto">
                          <div className="flex items-center bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden flex-1 sm:flex-none sm:w-[90px]">
                              <input 
                                  type="number" 
                                  min="0"
                                  value={craftInputs[rec.name]?.sets !== undefined ? craftInputs[rec.name].sets : ''} 
                                  onChange={(e) => handleCraftInputChange(rec.name, 'sets', e.target.value)}
                                  placeholder="0"
                                  className="w-full bg-transparent px-2 py-1.5 text-[11px] font-black text-center outline-none focus:bg-indigo-50 dark:focus:bg-indigo-900/20 transition-colors placeholder:font-normal"
                              />
                              <span className="text-[10px] font-bold text-gray-400 pr-2 shrink-0">셋</span>
                          </div>
                          <div className="flex items-center bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden flex-1 sm:flex-none sm:w-[90px]">
                              <input 
                                  type="number" 
                                  min="0"
                                  value={craftInputs[rec.name]?.units !== undefined ? craftInputs[rec.name].units : ''} 
                                  onChange={(e) => handleCraftInputChange(rec.name, 'units', e.target.value)}
                                  placeholder="0"
                                  className="w-full bg-transparent px-2 py-1.5 text-[11px] font-black text-center outline-none focus:bg-indigo-50 dark:focus:bg-indigo-900/20 transition-colors placeholder:font-normal"
                              />
                              <span className="text-[10px] font-bold text-gray-400 pr-2 shrink-0">개</span>
                          </div>
                          <button 
                            onClick={() => applySingleCraft(rec.name, rec.actualCraftedFromGreedy)} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black px-4 py-2.5 rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap shrink-0"
                          >
                            제작 차감
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {optimalCalculations.recommendations.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/5">
                    <h4 className="text-sm font-black text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2.5"><div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>위 연금을 모두 진행하기 위해 필요한 바닐라 재료</h4>
                    {Object.keys(optimalCalculations.overallMissingVanilla).length === 0 ? (
                        <p className="text-[11px] font-bold text-gray-500">추가로 필요한 바닐라 재료가 없습니다.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {Object.entries(optimalCalculations.overallMissingVanilla).map(([m, q]) => (
                                <div key={m} className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-transparent p-3 rounded-xl flex justify-between items-center shadow-sm">
                                    <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                        <img src={getImagePath(m) || undefined} alt="" className="w-4 h-4 object-contain shrink-0 drop-shadow-sm" />
                                        <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">{m}</span>
                                    </div>
                                    <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">{formatQty(q as number)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-6 flex justify-end">
                       <p className="text-sm font-black text-gray-600 dark:text-gray-400">총 예상 추가 수익: <span className="text-cyan-600 dark:text-cyan-400 text-xl ml-2">{optimalCalculations.totalExpectedProfit.toLocaleString()} G</span></p>
                    </div>
                </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'stamina_recommend' && (
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
                [{staminaRecommendation.type === 'single' ? staminaRecommendation.target : staminaRecommendation.target1}] 채집을 통해 재고를 우선 비축해 보세요.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-xl p-6 md:p-8 shadow-sm transition-colors text-center md:text-left">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-loose break-keep">
                현재 가용 스태미나 <span className="font-black text-gray-900 dark:text-white">{userStats.stamina.toLocaleString()}</span> 중, 창고의 재고를 분석했을 때 <br className="hidden md:block"/>
                {staminaRecommendation.type === 'single' ? (
                  <span>전체 스태미나를 <span className="font-black text-indigo-600 dark:text-indigo-400">[{staminaRecommendation.target}]</span> 채집에 집중하는 것을 추천드립니다.</span>
                ) : (
                  <span><span className="font-black text-emerald-600 dark:text-emerald-400">{staminaRecommendation.stamina1.toLocaleString()}</span> 스태미나는 <span className="font-black text-emerald-600 dark:text-emerald-400">[{staminaRecommendation.target1}]</span> 채집에 사용하고,<br className="block md:hidden"/> 나머지 <span className="font-black text-indigo-600 dark:text-indigo-400">{staminaRecommendation.stamina2.toLocaleString()}</span> 스태미나는 <span className="font-black text-indigo-600 dark:text-indigo-400">[{staminaRecommendation.target2}]</span> 채집에 사용하는 것을 추천드립니다.</span>
                )}
              </p>
              <div className="mt-6 pt-5 border-t border-gray-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap justify-center md:justify-start gap-1.5">
                  {Object.entries(staminaRecommendation.crafted).map(([item, qty]) => (
                    <span key={item} className="bg-white dark:bg-[#1a1a1e] border border-gray-200 dark:border-transparent px-2.5 py-1 rounded-md text-[10px] font-black text-gray-900 dark:text-white shadow-sm transition-colors">
                      {item} <span className="text-gray-500 ml-1">{formatQty(qty as number)}</span>
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
      )}

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
                  <li> 낚싯대 및 스킬 효과를 반영하여 1회 채집 시 드롭량을 정밀 계산했습니다.</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-[#111113] p-4 rounded-xl border border-gray-200 dark:border-transparent shadow-inner">
                <p className="text-[11px] font-black text-gray-500 mb-2 tracking-widest uppercase">2. 균등 채집 시나리오 도출 배경</p>
                {staminaRecommendation.type === 'single' ? (
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-relaxed pl-1">
                    단일 타겟 <span className="text-indigo-600 dark:text-indigo-400 font-black">[{staminaRecommendation.target}]</span> 채집 시 창고의 기존 재고 소진 밸런스와 순수익 마진율이 모두 최고점에 달하여, 스태미나를 분산시키지 않고 올인하는 것이 가장 유리하다고 판단했습니다.
                  </p>
                ) : (
                  <ul className="text-xs font-bold text-gray-700 dark:text-gray-300 space-y-2.5 pl-1">
                    <li>
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">1순위 타겟 [{staminaRecommendation.target1}]:</span> 스태미나 {staminaRecommendation.stamina1.toLocaleString()} 할당<br/>
                      <span className="text-[11px] text-gray-500">창고에 보유 중인 고가치 연금품의 부족한 기초 재료를 가장 균형 있게 채워 넣기 위한 스태미나입니다.</span>
                    </li>
                    <li>
                      <span className="text-indigo-600 dark:text-indigo-400 font-black">2순위 타겟 [{staminaRecommendation.target2}]:</span> 스태미나 {staminaRecommendation.stamina2.toLocaleString()} 할당<br/>
                      <span className="text-[11px] text-gray-500">재고 밸런스 소진 후 남은 스태미나로, 유저가 입력한 시세 기준 마진율이 가장 높은 품목을 집중 채집합니다.</span>
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

      {activeSubTab === 'trade' && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] overflow-hidden shadow-md transition-colors">
          <div className="p-6 md:p-8">
            <div className="space-y-8">
              {[{ title: '1성 어패류', list: TIER1 },
                { title: '2성 어패류', list: TIER2 },
                { title: '3성 어패류', list: TIER3 },
                { title: '물고기', list: FISH }].map((group) => (
                <div key={group.title}>
                  <div className="flex items-center gap-3 mb-4 px-1">
                    <h4 className="text-[11px] font-black text-gray-500 tracking-widest">{group.title}</h4>
                    <div className="flex-1 h-[1px] bg-gray-200 dark:bg-white/5"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">{group.list.map(renderTradeItem)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-[#111113] border-t border-gray-200 dark:border-white/10 p-5 md:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-gray-500 font-black mb-1">총 거래 금액</p>
                <p className="text-2xl md:text-3xl font-black text-cyan-600 dark:text-cyan-400">{totalTradeAmount.toLocaleString()} G</p>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
                <button onClick={clearTradeQty} className="flex-1 sm:flex-none bg-gray-200 dark:bg-white/10 hover:bg-gray-300 text-gray-700 dark:text-gray-300 text-[11px] font-black px-5 py-3 rounded-xl transition-all shadow-sm">수량 초기화</button>
                <button onClick={addTradeToStock} className="flex-[2] sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black px-6 py-3 rounded-xl transition-all shadow-md">재고에 합산</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'settings' && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md space-y-10 transition-colors">
          <div>
             <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">시스템 설정</h3>
             <label className="flex items-start md:items-center gap-3 p-5 bg-gray-50 dark:bg-[#111113] rounded-2xl cursor-pointer border border-gray-200 dark:border-transparent shadow-sm">
                <input type="checkbox" checked={allowTierUpgrade} onChange={(e) => setAllowTierUpgrade(e.target.checked)} className="w-5 h-5 mt-0.5 md:mt-0 text-cyan-600 rounded border-gray-300" />
                <div className="flex-1">
                   <p className="text-xs font-black text-gray-800 dark:text-gray-200">1성 어패류 상위 티어(2성) 변환 허용 (악성 재고 털기 용도)</p>
                   <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">체크 시, 이윤에서 손해를 보더라도 1성 어패류 3개를 2성 어패류 1개로 합치는 공식을 시뮬레이터에 포함합니다.</p>
                </div>
             </label>
          </div>
          
          <div className="pt-6 border-t border-gray-200 dark:border-white/5">
            <h3 className="text-lg font-black text-amber-600 dark:text-amber-400 mb-2">바닐라 재료 매입가 및 계산 제외(블랙리스트)</h3>
            <p className="text-[11px] font-bold text-gray-500 mb-5">캐기 귀찮은 재료는 '제외'를 체크하면 추천 루트에서 완전히 빠집니다.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {VANILLA.map(item => {
                const isBlack = blacklist.includes(item);
                return (
                  <div key={item} className={`border rounded-[1rem] p-3 flex items-center justify-between transition-colors ${isBlack ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-transparent' : 'bg-gray-50 dark:bg-[#111113] border-gray-200 dark:border-transparent hover:border-amber-300 dark:hover:border-amber-500/50'}`}>
                    <div className="flex flex-col gap-2 w-full">
                       <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-black truncate pr-2 ${isBlack ? 'text-rose-600 line-through' : 'text-gray-800 dark:text-gray-200'}`}>{item}</span>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={isBlack} onChange={() => toggleBlacklist(item)} className="w-3.5 h-3.5 rounded border-gray-300 text-rose-500" />
                            <span className="text-[9px] font-bold text-gray-500">제외</span>
                          </label>
                       </div>
                       {!isBlack && (
                          <input type="number" step="any" value={cost[item] === 0 ? '' : (globalSetMode ? Number((cost[item] * 64).toFixed(4)) : cost[item]) || ''} onChange={(e) => handleCostChange(item, e.target.value)} placeholder="단가" className="w-full bg-white dark:bg-black border border-gray-200 dark:border-transparent rounded-lg px-2.5 py-1.5 text-[10px] font-black outline-none focus:ring-1 focus:ring-amber-500 transition-colors" />
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="pt-6 flex justify-end">
             <button onClick={saveCostData} className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black px-8 py-3.5 rounded-xl transition-all shadow-md active:scale-95">설정 및 단가 저장</button>
          </div>
        </div>
      )}
    </div>
  );
}