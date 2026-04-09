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

const simulateCraftPure = (targetList: Record<string, number>, initialStock: Record<string, number>) => {
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

const ITEM_BASE_REQS: Record<string, Record<string, number>> = {};
const ALL_ITEMS = Array.from(new Set([...TIER1, ...TIER2, ...TIER3, ...FISH, ...ALCHEMY_T1, ...ALCHEMY_T2, ...ALCHEMY_T3, ...OCEAN_FIXED_PRICES.map(i=>i.name)]));
ALL_ITEMS.forEach(name => {
  ITEM_BASE_REQS[name] = simulateCraftPure({ [name]: 1 }, {}).missing;
});

type StaminaScenario = 
  | { type: 'single'; target: string; profit: number; crafted: Record<string, number> }
  | { type: 'split'; target1: string; stamina1: number; target2: string; stamina2: number; profit: number; crafted: Record<string, number> };

export default function OceanTradeCalcTab({ userStats }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'recommend' | 'simulator' | 'trade' | 'inventory'>('recommend');
  
  const [cost, setCost] = useState<Record<string, number>>({});
  const [stock, setStock] = useState<Record<string, number>>({});
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [tradeQty, setTradeQty] = useState<Record<string, number>>({});
  const [targets, setTargets] = useState<Record<string, string>>({});
  
  const [globalSetMode, setGlobalSetMode] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedRec, setExpandedRec] = useState<Record<string, boolean>>({});

  const o16Bonus = [0, 0.05, 0.07, 0.09, 0.12, 0.15, 0.20, 0.25, 0.30][userStats.o16Lv] || 0;

  useEffect(() => {
    const saved = localStorage.getItem('ocean_trade_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCost(parsed.cost || {});
        setStock(parsed.stock || {});
        setBlacklist(parsed.blacklist || []);
        if (parsed.globalSetMode !== undefined) setGlobalSetMode(parsed.globalSetMode);
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ocean_trade_v2', JSON.stringify({ cost, stock, blacklist, globalSetMode }));
    }
  }, [cost, stock, blacklist, globalSetMode, isLoaded]);

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
    localStorage.setItem('ocean_trade_v2', JSON.stringify({ cost, stock, blacklist, globalSetMode }));
    alert('입력된 단가가 성공적으로 저장되었습니다.');
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

  const recommendations = useMemo(() => {
    if (!isLoaded || activeSubTab === 'trade' || activeSubTab === 'inventory') return [];
    
    const CORE_ITEMS = [...TIER1, ...TIER2, ...TIER3, ...FISH];
    const baseEq = getBaseEquivalents(stock);
    
    return OCEAN_FIXED_PRICES.map(item => {
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

      const missingForMax = simulateCraftPure({ [item.name]: maxCrafts }, stock).missing;

      return { 
        name: item.name, 
        sellPrice, 
        totalCost, 
        profit: sellPrice - totalCost, 
        hasBlacklist, 
        materials: baseMats,
        maxCrafts,
        missingForMax
      };
    }).sort((a, b) => b.profit - a.profit);
  }, [cost, stock, blacklist, o16Bonus, isLoaded, activeSubTab]);

  const evalStockFast = (addedStock: Record<string, number>, sortedItems: any[]) => {
    let tempStock = { ...stock };
    for(const k in addedStock) tempStock[k] = (tempStock[k] || 0) + addedStock[k];
    let totalP = 0;
    const crafted: Record<string, number> = {};
    const CORE_ITEMS = [...TIER1, ...TIER2, ...TIER3, ...FISH];
    
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
          const sim = simulateCraftPure({[item.name]: mid}, tempStock);
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
          const simMissing = simulateCraftPure({[item.name]: bestQty}, tempStock).missing;
          let costForThis = 0;
          Object.entries(simMissing).forEach(([m, q]) => { costForThis += q * (cost[m] || 0); });
          const profit = (item.sellPrice * bestQty) - costForThis;
          
          totalP += profit;
          crafted[item.name] = bestQty;
          tempStock = resultingStock;
       }
    }
    return { profit: totalP, crafted };
  };

  const staminaAnalysis = useMemo(() => {
    if (!isLoaded || activeSubTab !== 'recommend') return null;
    const sortedItems = [...recommendations].filter(r => !r.hasBlacklist && r.profit > 0);
    if (sortedItems.length === 0 || userStats.stamina < 15) return null;

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
    let maxFoundProfit = -1;
    const totalStamina = userStats.stamina;
    const maxActions = Math.floor(totalStamina / 15);
    
    const singleResults = [];
    for(const cat of TARGET_CATEGORIES) {
        const yieldA = getYield(totalStamina, cat);
        const res = evalStockFast(yieldA, sortedItems);
        singleResults.push({ cat, profit: res.profit, crafted: res.crafted });
        if (res.profit > maxFoundProfit) {
            maxFoundProfit = res.profit;
            bestScenario = { type: 'single', target: cat, profit: res.profit, crafted: res.crafted };
        }
    }

    singleResults.sort((a, b) => b.profit - a.profit);
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
                if (res.profit > maxFoundProfit) {
                    maxFoundProfit = res.profit;
                    bestScenario = { 
                        type: 'split', 
                        target1: cat1, stamina1: a1 * 15, 
                        target2: cat2, stamina2: a2 * 15,
                        profit: res.profit, crafted: res.crafted 
                    };
                }
            }
        }
    }

    return bestScenario;
  }, [stock, recommendations, cost, blacklist, userStats, isLoaded, activeSubTab]);

  const simulatorResult = useMemo(() => {
    if (!isLoaded || activeSubTab !== 'simulator') return { missing: {}, totalCost: 0, expectedRevenue: 0, profit: 0, hasBlacklist: false, isActive: false };
    let totalCost = 0;
    let expectedRevenue = 0;
    let hasBlacklist = false;
    const actualTargets: Record<string, number> = {};

    Object.entries(targets).forEach(([targetItem, qtyStr]) => {
      const parsedTargetQty = Math.max(0, Math.round((parseFloat(qtyStr) || 0) * (globalSetMode ? 64 : 1)));
      if (parsedTargetQty > 0) {
        actualTargets[targetItem] = parsedTargetQty;
        expectedRevenue += Math.ceil((OCEAN_FIXED_PRICES.find(i => i.name === targetItem)?.base || 0) * (1 + o16Bonus)) * parsedTargetQty;
      }
    });

    const missing = simulateCraftPure(actualTargets, stock).missing;

    Object.entries(missing).forEach(([mat, reqQty]) => {
      if (blacklist.includes(mat)) hasBlacklist = true;
      totalCost += reqQty * (cost[mat] || 0);
    });

    return { missing, totalCost, expectedRevenue, profit: expectedRevenue - totalCost, hasBlacklist, isActive: Object.keys(actualTargets).length > 0 };
  }, [targets, stock, cost, blacklist, o16Bonus, globalSetMode, isLoaded, activeSubTab]);

  const validRecommendations = recommendations.filter(r => !r.hasBlacklist);

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
      <div key={item} className="bg-white dark:bg-[#111113] border border-gray-300 dark:border-transparent rounded-2xl p-3 flex flex-col gap-2.5 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 flex items-center justify-center bg-gray-100 dark:bg-black rounded-lg border border-gray-200 dark:border-transparent shrink-0">
              <img src={getImagePath(item)||''} alt="" className="w-5 h-5 object-contain drop-shadow-sm"/>
            </div>
            <span className="text-[11px] md:text-xs font-black text-gray-800 dark:text-gray-200 truncate tracking-tight">{item}</span>
          </div>
          <span className="text-[11px] font-black text-cyan-600 dark:text-cyan-400 tracking-tight shrink-0">{lineTotal > 0 ? lineTotal.toLocaleString() : '0'} G</span>
        </div>
        <div className="flex gap-2">
          <input type="number" step="any" value={displayCost} onChange={(e) => handleCostChange(item, e.target.value)} placeholder={globalSetMode ? "단가(1셋)" : "단가(1개)"} className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-transparent rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-[11px] font-bold focus:ring-1 focus:ring-cyan-500 outline-none transition-colors" />
          <input type="number" step="any" value={displayQty} onChange={(e) => handleTradeQtyChange(item, e.target.value)} placeholder={globalSetMode ? "수량(셋)" : "수량(개)"} className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-transparent rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-[11px] font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-colors" />
        </div>
      </div>
    );
  };

  const SubTabButton = ({ id, label }: { id: typeof activeSubTab, label: string }) => (
    <button 
      onClick={() => setActiveSubTab(id)} 
      className={`px-4 md:px-6 py-2.5 rounded-full font-black text-[11px] md:text-xs transition-all border whitespace-nowrap snap-start shadow-sm ${
        activeSubTab === id 
        ? 'bg-cyan-600 text-white border-transparent shadow-cyan-500/30' 
        : 'bg-white dark:bg-[#111113] border-gray-300 dark:border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  );

  if (!isLoaded) return <div className="bg-gray-100 dark:bg-[#0a0a0a] h-64 rounded-[2rem] animate-pulse w-full border border-gray-200 dark:border-white/10 transition-colors"></div>;

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 animate-fade-in-up transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-2 w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[1.5rem] shadow-sm transition-colors">
        <div className="flex gap-2 overflow-x-auto custom-scrollbar w-full md:w-auto snap-x">
          <SubTabButton id="recommend" label="최적 제작 추천" />
          <SubTabButton id="simulator" label="제작 시뮬레이터" />
          <SubTabButton id="trade" label="거래 계산기" />
          <SubTabButton id="inventory" label="재고 & 바닐라 설정" />
        </div>
        <label className="flex items-center justify-end gap-3 px-3 py-1.5 cursor-pointer shrink-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-white/10">
          <input type="checkbox" className="hidden" checked={globalSetMode} onChange={(e) => setGlobalSetMode(e.target.checked)} />
          <span className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest transition-colors">세트(64개) 단위 모드</span>
          <div className={`relative w-11 h-6 rounded-full transition-colors ${globalSetMode ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-md ${globalSetMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </div>
        </label>
      </div>

      {activeSubTab === 'trade' && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] overflow-hidden shadow-md dark:shadow-2xl flex flex-col transition-colors">
          <div className="p-6 md:p-8 flex-1">
            <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-transparent rounded-2xl p-5 mb-8 flex flex-col gap-1.5 shadow-sm transition-colors">
              <p className="text-sm text-cyan-800 dark:text-cyan-200 font-black tracking-tight">거래 데이터 가이드</p>
              <p className="text-[11px] md:text-xs text-cyan-700/80 dark:text-cyan-400 font-bold leading-relaxed">
                단가는 브라우저에 자동 저장되며 수량은 1회성입니다.<br className="hidden sm:block"/>
                상단의 <strong className="text-cyan-600 dark:text-cyan-300 transition-colors">세트 단위 모드</strong>를 켜면 입력과 표시가 모두 64개 기준으로 변경됩니다.
              </p>
            </div>
            
            <div className="space-y-10">
              {[{ title: '1성 어패류', list: TIER1 },
                { title: '2성 어패류', list: TIER2 },
                { title: '3성 어패류', list: TIER3 },
                { title: '물고기', list: FISH }].map((group) => (
                <div key={group.title}>
                  <div className="flex items-center gap-3 mb-5 px-1">
                    <h4 className="text-sm font-black text-gray-900 dark:text-white tracking-widest transition-colors">{group.title}</h4>
                    <div className="flex-1 h-[2px] bg-gray-100 dark:bg-white/5 transition-colors"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">{group.list.map(renderTradeItem)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white/90 dark:bg-[#111113]/90 backdrop-blur-xl border-t border-gray-300 dark:border-white/10 p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.4)] z-20 transition-colors">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left w-full lg:w-auto">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1.5">총 거래 금액</p>
                <p className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 tracking-tighter">
                  {totalTradeAmount.toLocaleString()} <span className="text-xl text-cyan-600 ml-1">G</span>
                </p>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto">
                <button onClick={clearTradeQty} className="flex-1 sm:flex-none bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-black px-6 py-4 rounded-xl border border-gray-300 dark:border-transparent shadow-sm transition-all active:scale-95 whitespace-nowrap">수량 초기화</button>
                <button onClick={saveCostData} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-6 py-4 rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap">단가 저장</button>
                <button onClick={addTradeToStock} className="flex-[1.5] sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-8 py-4 rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap">재고에 합산</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'inventory' && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 space-y-12 shadow-md dark:shadow-2xl transition-colors">
          {[ { t: '기본 재료 창고', sub: '제작 시뮬레이터에서 사용할 어패류/물고기 재고량을 ' + (globalSetMode ? '세트 단위로' : '개수 단위로') + ' 입력해 주세요.', list: [...TIER1, ...TIER2, ...TIER3, ...FISH], color: 'bg-emerald-500' },
             { t: '1단계 연금품 창고 (정수/에센스/엘릭서)', sub: '보유 중인 1단계 연금품을 입력하면 시뮬레이션 및 추천 루트에서 자동으로 우선 계산됩니다.', list: ALCHEMY_T1, color: 'bg-purple-500' },
             { t: '2단계 연금품 창고 (핵/결정/영약)', sub: '', list: ALCHEMY_T2, color: 'bg-rose-500' },
             { t: '3단계 연금품 창고 (최종 재료)', sub: '', list: ALCHEMY_T3, color: 'bg-indigo-500' } ].map(group => (
            <div key={group.t}>
              <div className="mb-6 px-1">
                <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white mb-1.5 flex items-center gap-2.5 transition-colors">
                  <div className={`w-1.5 h-5 ${group.color} rounded-full`}></div>{group.t}
                </h3>
                {group.sub && <p className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-4 transition-colors">{group.sub}</p>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {group.list.map(item => (
                  <div key={item} className="bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-transparent rounded-2xl p-2.5 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-black transition-all shadow-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={getImagePath(item)||''} alt="" className="w-5 h-5 object-contain shrink-0 drop-shadow-sm"/>
                      <span className="text-[11px] text-gray-700 dark:text-gray-200 font-bold truncate tracking-tight transition-colors">{item}</span>
                    </div>
                    <input type="number" step="any" value={stock[item] === 0 ? '' : (globalSetMode ? Number((stock[item] / 64).toFixed(4)) : stock[item]) || ''} onChange={(e) => handleStockChange(item, e.target.value)} placeholder="0" className="w-14 md:w-16 bg-white dark:bg-black border border-gray-300 dark:border-transparent rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-[11px] font-black text-right outline-none focus:ring-1 focus:ring-cyan-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-8 border-t border-gray-200 dark:border-white/5 transition-colors">
            <div className="mb-6 px-1">
              <h3 className="text-base md:text-lg font-black text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-2.5 transition-colors">
                <div className="w-1.5 h-5 bg-amber-500 rounded-full"></div>바닐라 재료 매입가 및 블랙리스트
              </h3>
              <p className="text-xs font-bold text-amber-700/80 dark:text-amber-200/60 ml-4 transition-colors">캐기 귀찮거나 수급이 어려운 재료는 <strong className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-1 rounded transition-colors">제외</strong>를 체크하여 추천 루트에서 뺄 수 있습니다.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {VANILLA.map(item => {
                const isBlack = blacklist.includes(item);
                return (
                  <div key={item} className={`border rounded-[1.25rem] p-4 transition-all duration-300 ${isBlack ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-transparent opacity-75' : 'bg-white dark:bg-[#111113] border-gray-300 dark:border-transparent shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={getImagePath(item)||''} alt="" className="w-5 h-5 object-contain drop-shadow-sm"/>
                        <span className={`text-[11px] font-black truncate transition-colors ${isBlack ? 'text-rose-600 line-through' : 'text-gray-800 dark:text-gray-200'}`}>{item}</span>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer group">
                        <input type="checkbox" checked={isBlack} onChange={() => toggleBlacklist(item)} className="w-4 h-4 rounded border-gray-400 text-rose-600 focus:ring-rose-500 cursor-pointer" />
                        <span className="text-[10px] font-black text-gray-400 group-hover:text-rose-500 transition-colors">제외</span>
                      </label>
                    </div>
                    {!isBlack && (
                      <div className="flex gap-2">
                        <input type="number" step="any" value={stock[item] === 0 ? '' : (globalSetMode ? Number((stock[item] / 64).toFixed(4)) : stock[item]) || ''} onChange={(e) => handleStockChange(item, e.target.value)} placeholder="재고" className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-transparent rounded-lg px-2.5 py-1.5 text-gray-900 dark:text-white text-[11px] font-bold outline-none focus:ring-1 focus:ring-amber-500 transition-colors placeholder:text-gray-400" />
                        <input type="number" step="any" value={cost[item] === 0 ? '' : (globalSetMode ? Number((cost[item] * 64).toFixed(4)) : cost[item]) || ''} onChange={(e) => handleCostChange(item, e.target.value)} placeholder="단가" className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-transparent rounded-lg px-2.5 py-1.5 text-gray-900 dark:text-white text-[11px] font-bold outline-none focus:ring-1 focus:ring-amber-500 transition-colors placeholder:text-gray-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'recommend' && (
        <div className="space-y-6 md:space-y-8">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2.5rem] p-6 md:p-10 shadow-md dark:shadow-2xl relative overflow-hidden transition-colors">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-white/5 pb-4 tracking-tighter transition-colors">스태미나 효율 및 재고 소진 분석</h3>
            {staminaAnalysis ? (
              <div className="space-y-6">
                {staminaAnalysis.type === 'single' ? (
                  <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-transparent rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-inner transition-colors">
                    <div className="text-center md:text-left flex-1">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 transition-colors">스태미나 올인 추천</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-4 leading-relaxed transition-colors">
                        현재 보유하신 재고와 총 스태미나({userStats.stamina.toLocaleString()})를 고려할 때, <br className="hidden sm:block"/>
                        <span className="text-indigo-600 dark:text-indigo-400 font-black transition-colors">[{staminaAnalysis.target}]</span>만 집중적으로 채집하는 것이 가장 높은 수익을 기대할 수 있습니다.
                      </p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {Object.entries(staminaAnalysis.crafted).map(([item, qty]) => (
                          <span key={item} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-xs font-black text-gray-900 dark:text-white shadow-sm dark:shadow-none transition-colors">
                            {item} <span className="text-indigo-600 dark:text-indigo-400 ml-1 transition-colors">{formatQty(qty as number)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-black/60 p-6 rounded-3xl border border-cyan-200 dark:border-transparent shadow-xl text-center min-w-[200px] transition-colors">
                      <p className="text-[11px] font-black text-gray-500 mb-1.5 transition-colors">총 예상 순수익</p>
                      <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight transition-colors">{staminaAnalysis.profit.toLocaleString()} G</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-transparent rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-stretch gap-6 shadow-inner transition-colors">
                    <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 transition-colors">재고 소진 및 마진 극대화 분배</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-4 leading-relaxed transition-colors">
                        창고에 남은 악성 재고를 소진하면서 동시에 최고 마진을 내는 최적의 스태미나 분배 비율입니다.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-5">
                        <div className="bg-white dark:bg-black/40 p-5 rounded-[1.5rem] border border-indigo-100 dark:border-transparent shadow-sm transition-colors">
                          <p className="text-[10px] font-black text-gray-500 mb-1 transition-colors">재고 소진용 타겟</p>
                          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 transition-colors">[{staminaAnalysis.target1}] 채집</p>
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1.5 transition-colors">스태미나 {staminaAnalysis.stamina1.toLocaleString()} 할당</p>
                        </div>
                        <div className="bg-white dark:bg-black/40 p-5 rounded-[1.5rem] border border-indigo-100 dark:border-transparent shadow-sm transition-colors">
                          <p className="text-[10px] font-black text-gray-500 mb-1 transition-colors">수익 극대화 타겟</p>
                          <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 transition-colors">[{staminaAnalysis.target2}] 채집</p>
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1.5 transition-colors">스태미나 {staminaAnalysis.stamina2.toLocaleString()} 할당</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {Object.entries(staminaAnalysis.crafted).map(([item, qty]) => (
                          <span key={item} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-xs font-black text-gray-900 dark:text-white shadow-sm dark:shadow-none transition-colors">
                            {item} <span className="text-indigo-600 dark:text-indigo-400 ml-1 transition-colors">{formatQty(qty as number)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-black border border-indigo-200 dark:border-transparent p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center min-w-[220px] transition-colors">
                      <p className="text-[11px] font-black text-gray-500 mb-2 transition-colors">총 예상 순수익</p>
                      <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter transition-colors">{staminaAnalysis.profit.toLocaleString()} G</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center bg-gray-50 dark:bg-[#111113] rounded-3xl border border-gray-300 dark:border-transparent transition-colors">
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 transition-colors">보유한 재고 또는 단가 정보가 부족하여 분석을 시작할 수 없습니다.</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2.5rem] p-6 md:p-10 shadow-md dark:shadow-2xl transition-colors">
            <div className="mb-6 border-b border-gray-200 dark:border-white/5 pb-4">
              <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tighter transition-colors">단일 품목 최적 제작 루트</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mt-2 transition-colors">
                입력하신 재료 매입가를 바탕으로 1개 제작 시 <strong className="text-cyan-600 dark:text-cyan-400 transition-colors">가장 마진이 많이 남는 순위</strong>입니다.<br className="hidden sm:block"/>
                <span className="bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded font-bold mt-1 inline-block border border-cyan-200 dark:border-cyan-500/20 transition-colors">[프리미엄 한정가] Lv.{userStats.o16Lv}</span> 효과가 적용된 판매가로 계산되었습니다.<br/>
                <strong className="text-gray-900 dark:text-white transition-colors">아이템 카드를 클릭</strong>하면 재고 소진을 위한 추가 필요 재료를 확인할 수 있습니다.
              </p>
            </div>
            
            {validRecommendations.length === 0 ? (
              <div className="bg-white dark:bg-black/60 border border-gray-200 dark:border-red-500/20 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-sm dark:shadow-none transition-colors">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-300 transition-colors">블랙리스트로 제외된 재료가 너무 많아 제작 가능한 아이템이 없습니다.</p>
                <p className="text-xs text-gray-500 mt-2">재고 & 바닐라 설정 탭에서 제외 설정을 일부 해제해 주세요.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                {validRecommendations.map((rec, idx) => (
                  <div key={rec.name} onClick={() => toggleExpand(rec.name)} className="bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-transparent rounded-[2rem] p-5 md:p-6 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md dark:shadow-none flex flex-col h-full group select-none">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shadow-inner border border-white/20 ${idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-400 text-white' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>{idx + 1}</div>
                      <div className="w-14 h-14 bg-white dark:bg-black rounded-2xl p-2.5 shadow-sm group-hover:scale-105 transition-transform shrink-0"><img src={getImagePath(rec.name)||''} className="w-full h-full object-contain" /></div>
                      <div className="min-w-0">
                        <h4 className="text-base md:text-lg font-black text-gray-900 dark:text-white truncate tracking-tight transition-colors">{rec.name}</h4>
                        <p className="text-[11px] font-bold text-gray-500 mt-0.5 transition-colors">기본 판매가: {rec.sellPrice.toLocaleString()} G</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white dark:bg-black/40 p-3 rounded-xl border border-gray-200 dark:border-transparent text-center shadow-sm transition-colors">
                        <p className="text-[9px] font-black text-gray-500 mb-1 transition-colors">1개 제작 원가</p>
                        <p className="text-xs font-black text-rose-500 dark:text-rose-400 transition-colors">- {rec.totalCost.toLocaleString()}</p>
                      </div>
                      <div className="bg-white dark:bg-black/40 p-3 rounded-xl border border-gray-200 dark:border-transparent text-center shadow-sm transition-colors">
                        <p className="text-[9px] font-black text-gray-500 mb-1 transition-colors">예상 순수익(1개)</p>
                        <p className="text-xs font-black text-cyan-600 dark:text-cyan-400 transition-colors">+ {rec.profit.toLocaleString()}</p>
                      </div>
                      <div className="bg-white dark:bg-black/40 p-3 rounded-xl border border-gray-200 dark:border-transparent text-center shadow-sm transition-colors">
                        <p className="text-[9px] font-black text-gray-500 mb-1 transition-colors">순수익(재고 소진 시)</p>
                        <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 transition-colors">+ {(rec.profit * rec.maxCrafts).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 ${expandedRec[rec.name] ? 'max-h-[500px] mt-6 pt-5 border-t border-gray-200 dark:border-white/5 opacity-100' : 'max-h-0 opacity-0 mt-0 pt-0 border-transparent'}`}>
                      <p className="text-[10px] font-black text-gray-500 mb-3 tracking-widest uppercase transition-colors">재고 전량 소모 시 부족분</p>
                      <p className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-500/30 w-fit mb-3">총 {formatQty(rec.maxCrafts)} 제작</p>
                      {Object.keys(rec.missingForMax).length === 0 ? (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 text-center font-bold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 py-3 rounded-xl transition-colors">
                          현재 재고로 부족함 없이 모두 제작 가능합니다!
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">{Object.entries(rec.missingForMax).map(([m, q]) => (
                          <div key={m} className="bg-white dark:bg-black p-2.5 rounded-xl border border-gray-200 dark:border-transparent flex justify-between items-center shadow-sm transition-colors">
                            <div className="flex items-center gap-2 min-w-0"><img src={getImagePath(m)||''} className="w-4 h-4 object-contain" /><span className="text-[10px] font-bold truncate transition-colors">{m}</span></div>
                            <span className="text-[10px] font-black text-rose-500 whitespace-nowrap">{formatQty(q as number)} 부족</span>
                          </div>
                        ))}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'simulator' && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2.5rem] p-6 md:p-10 shadow-md dark:shadow-2xl flex flex-col lg:flex-row gap-10 transition-colors">
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 transition-colors"><div className="w-1.5 h-6 bg-cyan-500 rounded-full transition-colors"></div>시뮬레이션 다중 목표 설정</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-10">
              {OCEAN_FIXED_PRICES.map(item => (
                <div key={item.name} className="bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-transparent rounded-2xl p-3 flex flex-col gap-2.5 hover:bg-gray-100 dark:hover:bg-white/5 transition-all shadow-sm">
                  <div className="flex items-center gap-2 min-w-0"><img src={getImagePath(item.name)||''} className="w-5 h-5 object-contain drop-shadow-sm" /><span className="text-[11px] font-black text-gray-800 dark:text-gray-200 tracking-tight truncate transition-colors">{item.name}</span></div>
                  <input type="number" step="any" value={targets[item.name] || ''} onChange={(e) => handleTargetChange(item.name, e.target.value)} placeholder={globalSetMode ? "0셋" : "0개"} className="w-full bg-white dark:bg-black border border-gray-300 dark:border-transparent rounded-lg px-2.5 py-1.5 text-[11px] text-gray-900 dark:text-white font-black outline-none focus:ring-1 focus:ring-cyan-500 transition-colors" />
                </div>
              ))}
            </div>

            <h4 className="text-sm font-black text-gray-700 dark:text-gray-300 mb-4 flex items-center justify-between transition-colors">
              최종 부족한 재료 현황
              <span className="text-[10px] font-medium text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md transition-colors">내 창고 재고 완벽 합산</span>
            </h4>
            <div className="bg-gray-50 dark:bg-black/60 border border-gray-300 dark:border-transparent rounded-3xl p-6 min-h-[200px] flex flex-col shadow-inner transition-colors">
              {!simulatorResult.isActive ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-50"><p className="text-xs font-bold text-gray-500 dark:text-gray-400 transition-colors">제작할 목표 수량을 입력해 주세요.</p></div>
              ) : Object.entries(simulatorResult.missing).length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center"><p className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-transparent px-6 py-4 rounded-2xl transition-colors">보유 중인 재고로 충분히 모두 제작 가능합니다!</p></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(simulatorResult.missing).map(([mat, qty]) => {
                    const isBlack = blacklist.includes(mat);
                    return (
                      <div key={mat} className={`flex justify-between items-center p-3 rounded-xl border transition-all ${isBlack ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-transparent' : 'bg-white dark:bg-[#1a1a1e] border-gray-200 dark:border-transparent shadow-sm'}`}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={getImagePath(mat)||''} alt="" className="w-5 h-5 object-contain drop-shadow-sm" />
                          <span className={`text-[11px] font-bold truncate ${isBlack ? 'text-rose-600 dark:text-rose-500' : 'text-gray-700 dark:text-gray-200'}`}>{mat}</span>
                        </div>
                        <span className={`text-[11px] font-black shrink-0 ${isBlack ? 'text-rose-500 dark:text-rose-400/80' : 'text-rose-600 dark:text-rose-400'}`}>{formatQty(qty as number)} 부족</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-[320px] flex flex-col justify-center gap-4 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-white/5 pt-10 lg:pt-0 lg:pl-10 transition-colors">
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-transparent rounded-[1.5rem] p-5 shadow-sm transition-colors">
              <p className="text-[10px] font-black text-rose-500 dark:text-rose-400/80 mb-1.5 tracking-widest uppercase transition-colors">부족분 매입 예상 총 비용</p>
              <p className="text-xl font-black text-rose-600 dark:text-rose-400 drop-shadow-sm transition-colors">- {simulatorResult.totalCost.toLocaleString()} G</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-transparent rounded-[1.5rem] p-5 shadow-sm transition-colors">
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400/80 mb-1.5 tracking-widest uppercase transition-colors">총 판매 수익 ([프리미엄 한정가] 적용)</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 drop-shadow-sm transition-colors">+ {simulatorResult.expectedRevenue.toLocaleString()} G</p>
            </div>
            <div className="bg-cyan-600 dark:bg-cyan-500/90 p-8 rounded-[2rem] text-white shadow-md dark:shadow-none mt-4 relative overflow-hidden transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 dark:bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl transition-colors"></div>
              <p className="text-[11px] font-black text-white/90 uppercase tracking-widest mb-2 relative z-10 transition-colors">최종 예상 순수익</p>
              <p className="text-4xl font-black relative z-10 tracking-tighter drop-shadow-md">
                {simulatorResult.profit > 0 ? '+' : ''}{simulatorResult.profit.toLocaleString()} <span className="text-xl font-bold ml-1">G</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}