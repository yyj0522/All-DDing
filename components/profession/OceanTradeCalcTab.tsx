'use client';

import { useState, useEffect, useMemo } from 'react';
import { OCEAN_RECIPES, OCEAN_FIXED_PRICES, getImagePath } from '@/lib/professionData';

interface Props {
  userStats: any;
}

const TIER1 = ["굴(1성)", "소라(1성)", "문어(1성)", "미역(1성)", "성게(1성)"];
const TIER2 = ["굴(2성)", "소라(2성)", "문어(2성)", "미역(2성)", "성게(2성)"];
const TIER3 = ["굴(3성)", "소라(3성)", "문어(3성)", "미역(3성)", "성게(3성)"];
const FISH = ["새우", "도미", "청어", "금붕어", "농어"];
const VANILLA = ["점토", "모래", "자갈", "화강암", "흙", "해초", "참나무잎", "가문비나무잎", "자작나무잎", "아카시아나무잎", "벚나무잎", "켈프", "청금석 블록", "레드스톤 블록", "철 주괴", "금 주괴", "다이아몬드", "불우렁쉥이", "유리병", "네더랙", "마그마블록", "영혼 흙", "진홍빛 자루", "뒤틀린 자루", "말린 켈프", "발광 열매", "죽은 관 산호 블록", "죽은 사방산호 블록", "죽은 거품 산호 블록", "죽은 불 산호 블록", "죽은 뇌 산호 블록"];

const ALCHEMY_T1 = ["수호의 정수(1성)", "파동의 정수(1성)", "생명의 정수(1성)", "부식의 정수(1성)", "혼란의 정수(1성)", "수호 에센스", "파동 에센스", "생명 에센스", "부식 에센스", "혼란 에센스", "수호의 엘릭서", "파동의 엘릭서", "생명의 엘릭서", "부식의 엘릭서", "혼란의 엘릭서"];
const ALCHEMY_T2 = ["물결 수호의 핵", "파동 오염의 핵", "질서 파괴의 핵", "활력 붕괴의 핵", "침식 방어의 핵", "활기 보존의 결정", "파도 침식의 결정", "격류 재생의 결정", "맹독 혼란의 결정", "방어 오염의 결정", "불멸 재생의 영약", "파동 장벽의 영약", "생명 광란의 영약", "맹독 파동의 영약", "타락 침식의 영약"];
const ALCHEMY_T3 = ["영생의 아쿠티스", "크라켄의 광란체", "리바이던의 깃털", "해구의 파동 코어", "침묵의 심해 비약", "청해룡의 날개", "아쿠아 펄스 파편", "나우틸러스의 손", "무저의 척추", "추출된 희석액"];

// 재고 관리 UI 그룹화 데이터
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
};

const ROD_BASE_DROPS = [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 10];
const O11_BONUS = [0, 0.05, 0.07, 0.10, 0.15, 0.20];
const O14_BONUS = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10];
const O17_BONUS = [0, 0.01, 0.03, 0.05, 0.07, 0.10, 0.15];

const simulateCraftPure = (targetList: Record<string, number>, initialStock: Record<string, number>, allowTierUpgrade: boolean = false) => {
  const tempStock = { ...initialStock };
  const missing: Record<string, number> = {};

  const getReq = (name: string, q: number) => {
    if (q <= 0) return;
    const use = Math.min(q, tempStock[name] || 0);
    tempStock[name] = (tempStock[name] || 0) - use;
    const rem = q - use;
    if (rem <= 0) return;

    if (RECIPE_FIXES[name]) {
      const fix = RECIPE_FIXES[name];
      const craftsNeeded = Math.ceil(rem / fix.yield);
      const leftover = (craftsNeeded * fix.yield) - rem;
      if (leftover > 0) tempStock[name] = (tempStock[name] || 0) + leftover;
      getReq(fix.ing, fix.req * craftsNeeded);
      return;
    }

    const recipe = OCEAN_RECIPES.find(r => r.name === name);
    if (!recipe) {
      missing[name] = (missing[name] || 0) + rem;
      return;
    }

    if (!allowTierUpgrade && TIER2.includes(name) && recipe.ingredients.some(ing => TIER1.some(t1 => ing.includes(t1)))) {
       missing[name] = (missing[name] || 0) + rem;
       return;
    }

    let yieldAmount = 1;
    if (recipe.note && recipe.note.includes('2개 제작')) yieldAmount = 2;
    if (recipe.name.includes('(2개)')) yieldAmount = 2;

    const craftsNeeded = Math.ceil(rem / yieldAmount);
    const leftover = (craftsNeeded * yieldAmount) - rem;
    if (leftover > 0) tempStock[name] = (tempStock[name] || 0) + leftover;

    recipe.ingredients.forEach((ing: string) => {
      const match = ing.match(/(.+?)(?:\s+(\d+)개)?$/);
      if (match) getReq(match[1].trim(), (match[2] ? parseInt(match[2], 10) : 1) * craftsNeeded);
    });
  };

  Object.entries(targetList).forEach(([tItem, tQty]) => {
    getReq(tItem, tQty);
  });

  return { missing, stock: tempStock };
};

type StaminaScenario = 
  | { type: 'single'; target: string; profit: number; stockConsumed: number; crafted: Record<string, number>; finalStock: Record<string, number> }
  | { type: 'split'; target1: string; stamina1: number; target2: string; stamina2: number; profit: number; stockConsumed: number; crafted: Record<string, number>; finalStock: Record<string, number> };

export default function OceanTradeCalcTab({ userStats }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'alchemy_optimal' | 'stamina_recommend' | 'trade' | 'settings'>('alchemy_optimal');
  
  const [cost, setCost] = useState<Record<string, number>>({});
  const [stock, setStock] = useState<Record<string, number>>({});
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [tradeQty, setTradeQty] = useState<Record<string, number>>({});
  
  const [globalSetMode, setGlobalSetMode] = useState<boolean>(false);
  const [allowTierUpgrade, setAllowTierUpgrade] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedRec, setExpandedRec] = useState<Record<string, boolean>>({});
  const [isInventoryVisible, setIsInventoryVisible] = useState(true);

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
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ocean_trade_v3', JSON.stringify({ cost, stock, blacklist, globalSetMode, allowTierUpgrade }));
    }
  }, [cost, stock, blacklist, globalSetMode, allowTierUpgrade, isLoaded]);

  const ITEM_BASE_REQS = useMemo(() => {
    const reqs: Record<string, Record<string, number>> = {};
    const ALL_ITEMS = Array.from(new Set([...TIER1, ...TIER2, ...TIER3, ...FISH, ...ALCHEMY_T1, ...ALCHEMY_T2, ...ALCHEMY_T3, ...OCEAN_FIXED_PRICES.map(i=>i.name)]));
    ALL_ITEMS.forEach(name => {
      reqs[name] = simulateCraftPure({ [name]: 1 }, {}, allowTierUpgrade).missing;
    });
    return reqs;
  }, [allowTierUpgrade]);

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

  const toggleBlacklist = (item: string) => {
    setBlacklist(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const toggleExpand = (name: string) => {
    setExpandedRec(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const clearTradeQty = () => setTradeQty({});

  const saveCostData = () => {
    localStorage.setItem('ocean_trade_v3', JSON.stringify({ cost, stock, blacklist, globalSetMode, allowTierUpgrade }));
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

  const optimalCalculations = useMemo(() => {
    if (!isLoaded || activeSubTab === 'trade' || activeSubTab === 'settings') return { recommendations: [], totalExpectedProfit: 0, overallMissingVanilla: {}, finalStockResult: {} };
    
    const CORE_ITEMS = [...TIER1, ...TIER2, ...TIER3, ...FISH, ...ALCHEMY_T1, ...ALCHEMY_T2];
    const baseEq = getBaseEquivalents(stock);
    
    let recommendations = OCEAN_FIXED_PRICES.map(item => {
      const sellPrice = Math.ceil(item.base * (1 + o16Bonus));
      const baseMats = ITEM_BASE_REQS[item.name] || {};
      let totalCost = 0;
      let hasBlacklist = false;
      let maxCrafts = Infinity;

      Object.entries(baseMats).forEach(([mat, qty]) => {
        if (blacklist.includes(mat)) hasBlacklist = true;
        totalCost += (cost[mat] || 0) * qty;
        
        if (CORE_ITEMS.includes(mat)) {
          maxCrafts = Math.min(maxCrafts, Math.floor((baseEq[mat] || 0) / qty));
        }
      });

      if (maxCrafts === Infinity) maxCrafts = 0;

      const simResult = simulateCraftPure({ [item.name]: maxCrafts }, stock, allowTierUpgrade);
      
      return { 
        name: item.name, 
        sellPrice, 
        totalCost, 
        profit: sellPrice - totalCost, 
        hasBlacklist, 
        materials: baseMats,
        maxCrafts,
        missingForMax: simResult.missing,
        resultingStock: simResult.stock
      };
    }).sort((a, b) => b.profit - a.profit).filter(r => !r.hasBlacklist && r.maxCrafts > 0);

    let currentTempStock = { ...stock };
    const overallMissingVanilla: Record<string, number> = {};
    let totalExpectedProfit = 0;

    const refinedRecommendations = recommendations.map(rec => {
        const sim = simulateCraftPure({ [rec.name]: rec.maxCrafts }, currentTempStock, allowTierUpgrade);
        currentTempStock = sim.stock;
        
        Object.entries(sim.missing).forEach(([m, q]) => {
            overallMissingVanilla[m] = (overallMissingVanilla[m] || 0) + q;
            totalExpectedProfit -= (cost[m] || 0) * q; 
        });
        totalExpectedProfit += (rec.sellPrice * rec.maxCrafts);

        return { ...rec, actualCraftedFromGreedy: rec.maxCrafts, missingForMax: sim.missing };
    });

    return { recommendations: refinedRecommendations, totalExpectedProfit, overallMissingVanilla, finalStockResult: currentTempStock };
  }, [cost, stock, blacklist, o16Bonus, isLoaded, activeSubTab, allowTierUpgrade, ITEM_BASE_REQS]);

  const applyCraftingResult = () => {
      if (!confirm('계산된 최적 연금을 모두 완료 처리하고 재고를 차감하시겠습니까? (바닐라 재료는 제외되며, 사용된 어패류 및 하위 연금품만 차감됩니다.)')) return;
      setStock(optimalCalculations.finalStockResult);
      alert('재고가 성공적으로 차감되었습니다.');
  };

  const evalStockFast = (addedStock: Record<string, number>, sortedItems: any[]) => {
    let tempStock = { ...stock };
    for(const k in addedStock) tempStock[k] = (tempStock[k] || 0) + addedStock[k];
    
    const initialEqSum = Object.values(getBaseEquivalents(tempStock)).reduce((a, b) => a + b, 0);

    let totalP = 0;
    const crafted: Record<string, number> = {};
    const CORE_ITEMS = [...TIER1, ...TIER2, ...TIER3, ...FISH, ...ALCHEMY_T1, ...ALCHEMY_T2];
    
    for (const item of sortedItems) {
       const stockEq = getBaseEquivalents(tempStock);
       let high = 10000;
       let limitFound = false;
       for (const [mat, count] of Object.entries(ITEM_BASE_REQS[item.name] || {})) {
           if (CORE_ITEMS.includes(mat)) {
               high = Math.min(high, Math.floor((stockEq[mat] || 0) / count));
               limitFound = true;
           }
       }
       if (!limitFound) high = 10000;
       if (high <= 0) continue;

       let low = 0;
       let bestQty = 0;
       let resultingStock = tempStock;
       
       while(low <= high) {
          let mid = Math.floor((low + high) / 2);
          if (mid === 0) break;
          const sim = simulateCraftPure({[item.name]: mid}, tempStock, allowTierUpgrade);
          const missingKeys = Object.keys(sim.missing);
          const canCraft = missingKeys.every(k => VANILLA.includes(k) && !blacklist.includes(k));

          if (canCraft) {
             bestQty = mid;
             resultingStock = sim.stock;
             low = mid + 1;
          } else {
             high = mid - 1;
          }
       }

       if (bestQty > 0) {
          const simMissing = simulateCraftPure({[item.name]: bestQty}, tempStock, allowTierUpgrade).missing;
          let costForThis = 0;
          Object.entries(simMissing).forEach(([m, q]) => { costForThis += q * (cost[m] || 0); });
          const profit = (item.sellPrice * bestQty) - costForThis;
          
          totalP += profit;
          crafted[item.name] = bestQty;
          tempStock = resultingStock;
       }
    }
    
    const finalEqSum = Object.values(getBaseEquivalents(tempStock)).reduce((a, b) => a + b, 0);
    const stockConsumed = initialEqSum - finalEqSum;

    return { profit: totalP, stockConsumed, crafted, resultingStock: tempStock };
  };

  const staminaRecommendation = useMemo(() => {
    if (!isLoaded || activeSubTab !== 'stamina_recommend') return null;
    const sortedItems = OCEAN_FIXED_PRICES.map(item => {
        const sellPrice = Math.ceil(item.base * (1 + o16Bonus));
        return { name: item.name, sellPrice };
    });

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
        
        if (FISH.includes(category)) {
            return { [category]: Math.round(totalItems) };
        } else {
            return {
                [`${category}(1성)`]: Math.round(totalItems * p1),
                [`${category}(2성)`]: Math.round(totalItems * p2),
                [`${category}(3성)`]: Math.round(totalItems * p3),
            };
        }
    };

    const TARGET_CATEGORIES = ['굴', '소라', '문어', '미역', '성게', ...FISH];

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
            bestScenario = { type: 'single', target: cat, profit: res.profit, stockConsumed: res.stockConsumed, crafted: res.crafted, finalStock: res.resultingStock };
        }
    }

    singleResults.sort((a, b) => b.stockConsumed !== a.stockConsumed ? b.stockConsumed - a.stockConsumed : b.profit - a.profit);
    const topCandidates = singleResults.slice(0, 4).map(r => r.cat);

    const ratios = [0.25, 0.5, 0.75];
    for(let i=0; i<topCandidates.length; i++) {
        for(let j=i+1; j<topCandidates.length; j++) {
            const cat1 = topCandidates[i];
            const cat2 = topCandidates[j];
            
            for(const r of ratios) {
                const a1 = Math.floor(maxActions * r);
                const a2 = maxActions - a1;
                if (a1 <= 0 || a2 <= 0) continue;

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
  }, [stock, cost, blacklist, userStats, isLoaded, activeSubTab, allowTierUpgrade, ITEM_BASE_REQS, o16Bonus]);

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
              <img src={getImagePath(item)||''} alt="" className="w-4 h-4 object-contain drop-shadow-sm"/>
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
          <span className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest transition-colors">세트(64개) 단위 모드</span>
          <div className={`relative w-10 h-5 rounded-full transition-colors ${globalSetMode ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-md ${globalSetMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </div>
        </label>
      </div>

      {(activeSubTab === 'alchemy_optimal' || activeSubTab === 'stamina_recommend') && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[1.5rem] p-5 md:p-6 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setIsInventoryVisible(!isInventoryVisible)}>
             <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2.5">
               <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>간편 재고 관리 (어패류 및 연금품)
             </h3>
             <span className="text-xs text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-lg transition-colors">{isInventoryVisible ? '접기 ▲' : '펼치기 ▼'}</span>
          </div>
          
          {isInventoryVisible && (
            <div className="space-y-6 pt-2 border-t border-gray-100 dark:border-white/5">
              {INVENTORY_GROUPS.map((group, gIdx) => (
                <div key={group.title}>
                  <h4 className="text-[10px] font-black text-indigo-400/80 mb-2.5 tracking-widest uppercase">{group.title}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {group.items.map(item => (
                      <div key={item} className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-white/5 rounded-xl p-2 flex items-center justify-between hover:bg-white dark:hover:bg-black hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all shadow-sm">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <img src={getImagePath(item)||''} alt="" className="w-4 h-4 object-contain shrink-0"/>
                          <span className="text-[10px] text-gray-700 dark:text-gray-200 font-bold truncate tracking-tight">{item.replace('(1성)','1').replace('(2성)','2').replace('(3성)','3')}</span>
                        </div>
                        <input type="number" step="any" value={stock[item] === 0 ? '' : (globalSetMode ? Number((stock[item] / 64).toFixed(4)) : stock[item]) || ''} onChange={(e) => handleStockChange(item, e.target.value)} placeholder="0" className="w-12 bg-white dark:bg-black border border-gray-200 dark:border-transparent rounded-lg px-1.5 py-1 text-gray-900 dark:text-white text-[10px] font-black text-right outline-none focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-gray-300" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'alchemy_optimal' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md relative overflow-hidden transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-200 dark:border-white/5 pb-4">
              <div>
                 <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">연금품 최적 계산 결과</h3>
                 <p className="text-[11px] text-gray-500 mt-1.5">현재 보유한 어패류와 하위 연금품으로 제작할 수 있는 최고 효율 목록입니다.</p>
              </div>
              <button onClick={applyCraftingResult} className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap">
                 연금 완료 및 재고 반영
              </button>
            </div>
            
            {optimalCalculations.recommendations.length === 0 ? (
              <div className="py-16 text-center bg-gray-50 dark:bg-[#111113] rounded-[1.5rem] border border-gray-200 dark:border-transparent">
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400">보유한 재고로 만들 수 있는 연금품이 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {optimalCalculations.recommendations.map((rec, idx) => (
                  <div key={rec.name} className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-white dark:bg-black rounded-xl p-1.5 shadow-sm shrink-0 border border-gray-100 dark:border-white/5"><img src={getImagePath(rec.name)||''} className="w-full h-full object-contain" /></div>
                         <div>
                            <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">{rec.name}</h4>
                            <p className="text-[10px] font-bold text-gray-500 mt-0.5">단가 {rec.sellPrice.toLocaleString()} G</p>
                         </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">제작 추천량</p>
                          <p className="text-base font-black text-gray-900 dark:text-white mt-0.5">{formatQty(rec.actualCraftedFromGreedy)}</p>
                       </div>
                    </div>
                  </div>
                ))}
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
                                        <img src={getImagePath(m)||''} alt="" className="w-4 h-4 object-contain shrink-0 drop-shadow-sm" />
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
          <div className="mb-6 border-b border-gray-200 dark:border-white/5 pb-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">스태미나 추천 (악성 재고 소진 우선)</h3>
            <p className="text-[11px] text-gray-500 mt-1.5">단순 최고 수익이 아닌, 현재 창고에 보유 중인 **재고를 가장 많이 소모할 수 있는 채집 경로**를 1순위로 추천합니다.</p>
          </div>
          {staminaRecommendation ? (
            <div className="space-y-5">
              {staminaRecommendation.type === 'single' ? (
                <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-transparent rounded-[1.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-inner">
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-2">스태미나 단일 집중 추천</p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium mb-3 leading-relaxed">
                      보유 재고({staminaRecommendation.stockConsumed.toLocaleString()}개 소진 기대)를 빠르게 털어내기 위해 <span className="text-indigo-600 dark:text-indigo-400 font-black">[{staminaRecommendation.target}]</span>만 집중 채집하세요.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-black p-5 rounded-2xl shadow-sm text-center min-w-[160px] border border-cyan-100 dark:border-transparent">
                    <p className="text-[10px] font-black text-gray-500 mb-1.5">총 예상 수익</p>
                    <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{staminaRecommendation.profit.toLocaleString()} G</p>
                  </div>
                </div>
              ) : (
                <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-transparent rounded-[1.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-inner">
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-2">재고 소진 및 마진 분배 추천</p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium mb-4 leading-relaxed">
                      악성 재고({staminaRecommendation.stockConsumed.toLocaleString()}개 소진 기대) 처리와 수익을 동시에 잡는 최적 비율입니다.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="bg-white dark:bg-black/40 p-4 rounded-xl flex-1 border border-indigo-100 dark:border-transparent shadow-sm">
                        <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">[{staminaRecommendation.target1}]</p>
                        <p className="text-[10px] font-bold text-gray-500 mt-1.5">스태미나 {staminaRecommendation.stamina1.toLocaleString()}</p>
                      </div>
                      <div className="bg-white dark:bg-black/40 p-4 rounded-xl flex-1 border border-indigo-100 dark:border-transparent shadow-sm">
                        <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">[{staminaRecommendation.target2}]</p>
                        <p className="text-[10px] font-bold text-gray-500 mt-1.5">스태미나 {staminaRecommendation.stamina2.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-black p-5 rounded-2xl shadow-sm text-center min-w-[160px] border border-indigo-100 dark:border-transparent">
                    <p className="text-[10px] font-black text-gray-500 mb-1.5">총 예상 수익</p>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{staminaRecommendation.profit.toLocaleString()} G</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center bg-gray-50 dark:bg-[#111113] rounded-[1.5rem] border border-gray-200 dark:border-transparent">
              <p className="text-sm font-bold text-gray-500">재고 또는 단가 정보가 부족합니다.</p>
            </div>
          )}
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
                          <input type="number" step="any" value={cost[item] === 0 ? '' : (globalSetMode ? Number((cost[item] * 64).toFixed(4)) : cost[item]) || ''} onChange={(e) => handleCostChange(item, e.target.value)} placeholder="단가" className="w-full bg-white dark:bg-black border border-gray-200 dark:border-transparent rounded-lg px-2.5 py-1.5 text-gray-900 dark:text-white text-[10px] font-black outline-none focus:ring-1 focus:ring-amber-500 transition-colors" />
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