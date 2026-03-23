'use client';

import { useState, useEffect, useMemo } from 'react';
import { OCEAN_RECIPES, OCEAN_FIXED_PRICES, getImagePath } from '@/lib/professionData';

interface Props {
  userStats: any;
}

const TIER1 = ["굴(1성)", "소라(1성)", "미역(1성)", "성게(1성)", "문어(1성)"];
const TIER2 = ["굴(2성)", "소라(2성)", "미역(2성)", "성게(2성)", "문어(2성)"];
const TIER3 = ["굴(3성)", "소라(3성)", "미역(3성)", "성게(3성)", "문어(3성)"];
const FISH = ["새우", "도미", "청어", "금붕어", "농어"];
const VANILLA = ["점토", "모래", "자갈", "화강암", "흙", "해초", "참나무잎", "가문비나무잎", "자작나무잎", "아카시아나무잎", "벚나무잎", "켈프", "청금석 블록", "레드스톤 블록", "철 주괴", "금 주괴", "다이아몬드", "불우렁쉥이", "유리병", "네더랙", "마그마블록", "영혼 흙", "진홍빛 자루", "뒤틀린 자루", "말린 켈프", "발광 열매", "죽은 관 산호 블록", "죽은 사방산호 블록", "죽은 거품 산호 블록", "죽은 불 산호 블록", "죽은 뇌 산호 블록"];

export default function OceanTradeCalcTab({ userStats }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'trade' | 'inventory' | 'recommend' | 'simulator'>('recommend');
  
  const [cost, setCost] = useState<Record<string, number>>({});
  const [stock, setStock] = useState<Record<string, number>>({});
  const [blacklist, setBlacklist] = useState<string[]>([]);
  
  const [tradeQty, setTradeQty] = useState<Record<string, number>>({});
  const [costUnit, setCostUnit] = useState<Record<string, 'ea' | 'set'>>({});
  const [qtyUnit, setQtyUnit] = useState<Record<string, 'ea' | 'set'>>({});
  
  const [targetItem, setTargetItem] = useState<string>(OCEAN_FIXED_PRICES[0].name);
  const [targetQtyStr, setTargetQtyStr] = useState<string>('');
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
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ocean_trade_v2', JSON.stringify({ cost, stock, blacklist }));
    }
  }, [cost, stock, blacklist, isLoaded]);

  const handleCostChange = (item: string, val: string) => {
    const num = parseFloat(val);
    const unit = costUnit[item] || 'ea';
    setCost(prev => ({ ...prev, [item]: isNaN(num) ? 0 : (unit === 'set' ? num / 64 : num) }));
  };

  const handleTradeQtyChange = (item: string, val: string) => {
    const num = parseFloat(val);
    const unit = qtyUnit[item] || 'ea';
    setTradeQty(prev => ({ ...prev, [item]: isNaN(num) ? 0 : (unit === 'set' ? num * 64 : num) }));
  };

  const handleStockChange = (item: string, val: string) => {
    const num = parseInt(val, 10);
    setStock(prev => ({ ...prev, [item]: isNaN(num) ? 0 : num }));
  };

  const toggleBlacklist = (item: string) => {
    setBlacklist(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const toggleCostUnit = (item: string) => {
    setCostUnit(prev => ({ ...prev, [item]: prev[item] === 'set' ? 'ea' : 'set' }));
  };

  const toggleQtyUnit = (item: string) => {
    setQtyUnit(prev => ({ ...prev, [item]: prev[item] === 'set' ? 'ea' : 'set' }));
  };

  const toggleExpand = (name: string) => {
    setExpandedRec(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const clearTradeQty = () => setTradeQty({});

  const saveCostData = () => {
    localStorage.setItem('ocean_trade_v2', JSON.stringify({ cost, stock, blacklist }));
    alert('입력된 단가가 성공적으로 저장되었습니다.');
  };

  const totalTradeAmount = useMemo(() => {
    let sum = 0;
    Object.entries(tradeQty).forEach(([item, qty]) => {
      if (qty > 0) sum += (cost[item] || 0) * qty;
    });
    return sum;
  }, [tradeQty, cost]);

  const addTradeToStock = () => {
    if (!confirm('현재 거래 수량을 창고에 합산하고 수량을 초기화하시겠습니까?')) return;
    const newStock = { ...stock };
    Object.entries(tradeQty).forEach(([item, qty]) => {
      if (qty > 0) {
        newStock[item] = (newStock[item] || 0) + qty;
      }
    });
    setStock(newStock);
    clearTradeQty();
    alert('창고에 합산 및 수량이 초기화되었습니다.');
  };

  const resolveMaterials = (itemName: string, quantity: number): Record<string, number> => {
    let searchName = itemName;
    if (itemName === '깐 새우') searchName = '깐 새우(2개)';
    if (itemName === '도미 회') searchName = '도미 회(2개)';
    if (itemName === '청어 회') searchName = '청어 회(2개)';
    if (itemName === '금붕어 회') searchName = '금붕어 회(2개)';
    if (itemName === '농어 회') searchName = '농어 회(2개)';

    const recipe = OCEAN_RECIPES.find(r => r.name === searchName);
    
    if (!recipe) {
      let rawName = itemName;
      if (itemName === '익히지 않은 새우 1개' || itemName === '익히지 않은 새우') rawName = '새우';
      if (itemName === '익히지 않은 도미 1개' || itemName === '익히지 않은 도미') rawName = '도미';
      if (itemName === '익히지 않은 청어 1개' || itemName === '익히지 않은 청어') rawName = '청어';
      return { [rawName]: quantity };
    }

    let yieldAmount = 1;
    if (recipe.note && recipe.note.includes('2개 제작')) yieldAmount = 2;
    if (recipe.name.includes('(2개)')) yieldAmount = 2;

    const craftsNeeded = Math.ceil(quantity / yieldAmount);
    const totals: Record<string, number> = {};

    recipe.ingredients.forEach(ing => {
      const match = ing.match(/(.+?)(?:\s+(\d+)개)?$/);
      if (match) {
        const ingName = match[1].trim();
        const ingQty = match[2] ? parseInt(match[2], 10) : 1;
        const subMats = resolveMaterials(ingName, ingQty * craftsNeeded);
        Object.entries(subMats).forEach(([k, v]) => {
          totals[k] = (totals[k] || 0) + v;
        });
      }
    });
    return totals;
  };

  const recommendations = useMemo(() => {
    const CORE_ITEMS = [...TIER1, ...TIER2, ...TIER3, ...FISH];
    
    return OCEAN_FIXED_PRICES.map(item => {
      const sellPrice = Math.ceil(item.base * (1 + o16Bonus));
      const materials = resolveMaterials(item.name, 1);
      let totalCost = 0;
      let hasBlacklist = false;
      let maxCrafts = 0;

      Object.entries(materials).forEach(([mat, qty]) => {
        if (blacklist.includes(mat)) hasBlacklist = true;
        totalCost += (cost[mat] || 0) * qty;
        
        if (CORE_ITEMS.includes(mat)) {
          const possibleCrafts = Math.ceil((stock[mat] || 0) / qty);
          if (possibleCrafts > maxCrafts) maxCrafts = possibleCrafts;
        }
      });

      const missingForMax: Record<string, number> = {};
      if (maxCrafts > 0) {
        Object.entries(materials).forEach(([mat, qty]) => {
          const req = qty * maxCrafts;
          const cur = stock[mat] || 0;
          if (cur < req) {
            missingForMax[mat] = req - cur;
          }
        });
      }

      return { 
        name: item.name, 
        sellPrice, 
        totalCost, 
        profit: sellPrice - totalCost, 
        hasBlacklist, 
        materials,
        maxCrafts,
        missingForMax
      };
    }).sort((a, b) => b.profit - a.profit);
  }, [cost, stock, blacklist, o16Bonus]);

  const simulatorResult = useMemo(() => {
    const parsedTargetQty = Math.max(1, parseInt(targetQtyStr) || 1);
    const materials = resolveMaterials(targetItem, parsedTargetQty);
    let totalCost = 0;
    let expectedRevenue = Math.ceil((OCEAN_FIXED_PRICES.find(i => i.name === targetItem)?.base || 0) * (1 + o16Bonus)) * parsedTargetQty;
    const missing: Record<string, number> = {};
    let hasBlacklist = false;

    Object.entries(materials).forEach(([mat, reqQty]) => {
      if (blacklist.includes(mat)) hasBlacklist = true;
      const currentStock = stock[mat] || 0;
      if (currentStock < reqQty) {
        const missingQty = reqQty - currentStock;
        missing[mat] = missingQty;
        totalCost += missingQty * (cost[mat] || 0);
      }
    });

    return { materials, missing, totalCost, expectedRevenue, profit: expectedRevenue - totalCost, hasBlacklist };
  }, [targetItem, targetQtyStr, stock, cost, blacklist, o16Bonus]);

  const validRecommendations = recommendations.filter(r => !r.hasBlacklist);

  if (!isLoaded) return <div className="bg-gray-100 dark:bg-white/5 h-64 rounded-3xl animate-pulse w-full"></div>;

  const renderTradeItem = (item: string) => {
    const c = cost[item] || 0;
    const q = tradeQty[item] || 0;
    const lineTotal = c * q;
    
    const cUnit = costUnit[item] || 'ea';
    const qUnit = qtyUnit[item] || 'ea';
    
    const displayCost = c === 0 ? '' : (cUnit === 'set' ? Number((c * 64).toFixed(4)) : Number(c.toFixed(4)));
    const displayQty = q === 0 ? '' : (qUnit === 'set' ? Number((q / 64).toFixed(4)) : Number(q.toFixed(4)));
    
    return (
      <div key={item} className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/5 rounded-2xl p-3 flex flex-col gap-2.5 hover:bg-gray-50 dark:hover:bg-[#16161a] hover:border-cyan-300 dark:hover:border-cyan-500/40 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300 group">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-lg shrink-0 border border-gray-200 dark:border-white/5 group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors">
              <img src={getImagePath(item)||''} alt="" className="w-4 h-4 object-contain drop-shadow-sm dark:drop-shadow-md"/>
            </div>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate max-w-[60px] sm:max-w-[80px] tracking-tight transition-colors">{item}</span>
          </div>
          <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 drop-shadow-sm dark:drop-shadow-[0_0_3px_rgba(34,211,238,0.3)] transition-colors">{lineTotal > 0 ? lineTotal.toLocaleString() : '0'} G</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative flex">
            <input type="number" step="any" value={displayCost} onChange={(e) => handleCostChange(item, e.target.value)} placeholder="단가" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-lg pl-2 py-1.5 text-gray-900 dark:text-white text-[11px] focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 pr-9 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600 font-medium" />
            <button onClick={() => toggleCostUnit(item)} className="absolute right-1 top-1 bottom-1 text-[10px] font-black bg-cyan-100 dark:bg-cyan-950/80 hover:bg-cyan-200 dark:hover:bg-cyan-800 text-cyan-600 dark:text-cyan-300 px-1.5 rounded-md transition-colors flex items-center justify-center">
              {cUnit === 'set' ? '셋' : '개'}
            </button>
          </div>
          <div className="flex-1 relative flex">
            <input type="number" step="any" value={displayQty} onChange={(e) => handleTradeQtyChange(item, e.target.value)} placeholder="수량" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-lg pl-2 py-1.5 text-gray-900 dark:text-white text-[11px] focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500 pr-9 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600 font-medium" />
            <button onClick={() => toggleQtyUnit(item)} className="absolute right-1 top-1 bottom-1 text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-600 dark:text-emerald-300 px-1.5 rounded-md transition-colors flex items-center justify-center">
              {qUnit === 'set' ? '셋' : '개'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SubTabButton = ({ id, label }: { id: typeof activeSubTab, label: string }) => (
    <button 
      onClick={() => setActiveSubTab(id)} 
      className={`relative px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap overflow-hidden ${
        activeSubTab === id 
        ? 'bg-cyan-500 text-white dark:text-black shadow-md dark:shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-100' 
        : 'bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5 scale-95'
      }`}
    >
      <span className="relative z-10">{label}</span>
      {activeSubTab === id && <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-500 z-0"></div>}
    </button>
  );

  return (
    <div className="w-full flex flex-col gap-5 relative transition-colors duration-300">
      <style dangerouslySetInnerHTML={{__html: `
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none !important;
          margin: 0 !important;
        }
        input[type="number"] {
          -moz-appearance: textfield !important;
        }
      `}} />

      <div className="flex gap-1 p-1.5 bg-gray-100/80 dark:bg-black/40 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl w-full overflow-x-auto custom-scrollbar shadow-sm dark:shadow-lg transition-colors">
        <SubTabButton id="trade" label="거래 계산기" />
        <SubTabButton id="inventory" label="재고 & 바닐라 설정" />
        <SubTabButton id="recommend" label="최적 제작 추천" />
        <SubTabButton id="simulator" label="제작 시뮬레이터" />
      </div>

      {activeSubTab === 'trade' && (
        <div className="animate-fade-in flex flex-col h-full bg-white dark:bg-gradient-to-b dark:from-[#111113] dark:to-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden relative shadow-sm dark:shadow-2xl transition-colors">
          <div className="p-5 md:p-7 flex-1 overflow-y-auto custom-scrollbar">
            <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/20 rounded-xl p-3.5 mb-6 flex items-start gap-3 transition-colors">
              <div className="text-cyan-600 dark:text-cyan-400 mt-0.5 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-xs text-cyan-800 dark:text-cyan-100/70 leading-relaxed font-medium transition-colors">
                단가는 브라우저에 자동 저장되며 수량은 1회성입니다.<br className="hidden sm:block"/>
                입력창 우측의 <strong className="text-cyan-600 dark:text-cyan-300 bg-cyan-100 dark:bg-black/30 px-1 py-0.5 rounded transition-colors">[개/셋]</strong> 버튼을 눌러 단위를 자유롭게 변경하세요.
              </p>
            </div>
            
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="text-sm font-black text-gray-900 dark:text-white tracking-widest transition-colors">1성 어패류</h4>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 dark:from-white/20 to-transparent transition-colors"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">{TIER1.map(renderTradeItem)}</div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="text-sm font-black text-blue-600 dark:text-blue-300 tracking-widest transition-colors">2성 어패류</h4>
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-300 dark:from-blue-500/30 to-transparent transition-colors"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">{TIER2.map(renderTradeItem)}</div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="text-sm font-black text-fuchsia-600 dark:text-fuchsia-300 tracking-widest transition-colors">3성 어패류</h4>
                  <div className="flex-1 h-px bg-gradient-to-r from-fuchsia-300 dark:from-fuchsia-500/30 to-transparent transition-colors"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">{TIER3.map(renderTradeItem)}</div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-300 tracking-widest transition-colors">물고기</h4>
                  <div className="flex-1 h-px bg-gradient-to-r from-emerald-300 dark:from-emerald-500/30 to-transparent transition-colors"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">{FISH.map(renderTradeItem)}</div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 w-full bg-white/90 dark:bg-black/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 p-5 md:p-6 shrink-0 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_40px_rgba(0,0,0,0.6)] z-20 transition-colors">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
              <div className="text-center lg:text-left w-full lg:w-auto">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1 tracking-wider uppercase transition-colors">총 거래 금액</p>
                <p className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-colors">
                  {totalTradeAmount.toLocaleString()} <span className="text-2xl text-cyan-600 dark:text-cyan-400">G</span>
                </p>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto">
                <button onClick={clearTradeQty} className="flex-1 sm:flex-none bg-gray-100 dark:bg-[#1a1a1e] hover:bg-gray-200 dark:hover:bg-[#25252a] text-gray-700 dark:text-white text-xs font-bold px-5 py-3.5 rounded-xl border border-gray-300 dark:border-white/10 transition-all active:scale-95 whitespace-nowrap">
                  수량 초기화
                </button>
                <button onClick={saveCostData} className="flex-[2] sm:flex-none bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/40 text-blue-600 dark:text-blue-300 text-xs font-bold px-5 py-3.5 rounded-xl border border-blue-200 dark:border-blue-500/30 transition-all active:scale-95 whitespace-nowrap shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.1)] flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  단가 저장
                </button>
                <button onClick={addTradeToStock} className="flex-[2] sm:flex-none bg-gradient-to-r from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-600 hover:from-emerald-500 hover:to-emerald-600 dark:hover:from-emerald-400 dark:hover:to-emerald-500 text-white dark:text-black text-xs font-black px-8 py-3.5 rounded-xl shadow-md dark:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-0.5 active:scale-95 whitespace-nowrap flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                  재고에 합산
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'inventory' && (
        <div className="animate-fade-in bg-white dark:bg-gradient-to-b dark:from-[#111113] dark:to-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-5 md:p-8 space-y-10 shadow-sm dark:shadow-2xl transition-colors">
          <div>
            <div className="mb-6">
              <h3 className="text-base font-black text-gray-900 dark:text-white mb-1.5 flex items-center gap-2 transition-colors">
                <div className="w-1.5 h-4 bg-emerald-500 dark:bg-emerald-400 rounded-full transition-colors"></div>창고 재고 설정
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-3.5 transition-colors">제작 시뮬레이터에서 사용할 현재 보유 재고량을 입력해 주세요.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[...TIER1, ...TIER2, ...TIER3, ...FISH].map(item => (
                <div key={item} className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-xl p-2.5 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img src={getImagePath(item)||''} alt="" className="w-5 h-5 object-contain shrink-0 drop-shadow-sm dark:drop-shadow-md group-hover:scale-110 transition-transform"/>
                    <span className="text-[11px] text-gray-700 dark:text-gray-200 font-bold truncate transition-colors">{item}</span>
                  </div>
                  <input type="number" value={stock[item] === 0 ? '' : stock[item] || ''} onChange={(e) => handleStockChange(item, e.target.value)} placeholder="0" className="w-14 bg-white dark:bg-[#1a1a1e] border border-gray-300 dark:border-white/10 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-[11px] font-medium text-right focus:outline-none focus:border-emerald-500 shrink-0 transition-colors placeholder:text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 dark:border-white/5 transition-colors">
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-2 transition-colors">
                  <div className="w-1.5 h-4 bg-amber-500 dark:bg-amber-400 rounded-full transition-colors"></div>바닐라 재료 매입가 및 블랙리스트
                </h3>
                <p className="text-xs text-amber-700/80 dark:text-amber-200/60 ml-3.5 transition-colors">캐기 귀찮거나 수급이 어려운 재료는 <strong className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-1 rounded transition-colors">제외</strong>를 체크하여 추천 루트에서 뺄 수 있습니다.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {VANILLA.map(item => {
                const isBlack = blacklist.includes(item);
                return (
                  <div key={item} className={`border rounded-xl p-3 flex flex-col gap-2.5 transition-all duration-300 ${isBlack ? 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-500/20 opacity-80' : 'bg-gray-50 dark:bg-black/40 border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/10'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img src={getImagePath(item)||''} alt="" className="w-5 h-5 object-contain shrink-0 drop-shadow-sm dark:drop-shadow-md"/>
                        <span className={`text-[11px] font-bold truncate transition-colors ${isBlack ? 'text-red-500 dark:text-red-400 line-through decoration-red-400/50 dark:decoration-red-500/50' : 'text-gray-700 dark:text-gray-200'}`}>{item}</span>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer shrink-0 pl-2 group">
                        <input type="checkbox" checked={isBlack} onChange={() => toggleBlacklist(item)} className="w-3.5 h-3.5 rounded bg-white dark:bg-black/50 border-gray-400 dark:border-gray-600 text-red-500 focus:ring-red-500 cursor-pointer transition-colors" />
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">제외</span>
                      </label>
                    </div>
                    <div className={`flex gap-1.5 transition-all duration-300 ${isBlack ? 'h-0 opacity-0 pointer-events-none overflow-hidden mt-0' : 'h-8 opacity-100 mt-1'}`}>
                      <input type="number" value={stock[item] === 0 ? '' : stock[item] || ''} onChange={(e) => handleStockChange(item, e.target.value)} placeholder="재고량" className="w-full bg-white dark:bg-[#1a1a1e] border border-gray-300 dark:border-white/10 rounded-lg px-2 py-1 text-gray-900 dark:text-white text-[11px] font-medium focus:outline-none focus:border-amber-500 transition-colors placeholder:text-gray-400" />
                      <input type="number" value={cost[item] === 0 ? '' : cost[item] || ''} onChange={(e) => handleCostChange(item, e.target.value)} placeholder="매입가(0)" className="w-full bg-white dark:bg-[#1a1a1e] border border-gray-300 dark:border-white/10 rounded-lg px-2 py-1 text-gray-900 dark:text-white text-[11px] font-medium focus:outline-none focus:border-amber-500 transition-colors placeholder:text-gray-400" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'recommend' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-cyan-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm dark:shadow-2xl transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100 dark:bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none transition-colors"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight transition-colors">최적 제작 루트 추천</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl transition-colors">
                입력하신 재료 매입가를 바탕으로 1개 제작 시 <strong className="text-cyan-600 dark:text-cyan-400 transition-colors">가장 마진이 많이 남는 순위</strong>입니다.<br className="hidden sm:block"/>
                <span className="bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded font-bold mt-1 inline-block border border-cyan-200 dark:border-cyan-500/20 transition-colors">[프리미엄 한정가] Lv.{userStats.o16Lv}</span> 효과가 적용된 판매가로 계산되었습니다.<br/>
                <strong className="text-gray-900 dark:text-white transition-colors">아이템 카드를 클릭</strong>하면 재고 소진을 위한 추가 필요 재료를 확인할 수 있습니다.
              </p>
            </div>
          </div>

          {validRecommendations.length === 0 ? (
            <div className="bg-white dark:bg-black/60 border border-gray-200 dark:border-red-500/20 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-sm dark:shadow-none transition-colors">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950/50 rounded-full flex items-center justify-center mb-4 border border-red-100 dark:border-red-500/30 transition-colors">
                <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-300 transition-colors">블랙리스트로 제외된 재료가 너무 많아 제작 가능한 아이템이 없습니다.</p>
              <p className="text-xs text-gray-500 mt-2">재고 & 바닐라 설정 탭에서 제외 설정을 일부 해제해 주세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              {validRecommendations.map((rec, idx) => (
                <div key={rec.name} 
                     onClick={() => toggleExpand(rec.name)}
                     className="bg-white dark:bg-gradient-to-r dark:from-[#111113] dark:to-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-cyan-300 dark:hover:border-cyan-500/40 shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all duration-300 cursor-pointer flex flex-col h-full group select-none">
                  
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0 border shadow-sm dark:shadow-inner transition-colors ${idx === 0 ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' : idx === 1 ? 'bg-gray-100 dark:bg-slate-300/10 text-gray-500 dark:text-slate-300 border-gray-200 dark:border-slate-300/30' : idx === 2 ? 'bg-orange-100 dark:bg-amber-700/10 text-orange-600 dark:text-amber-600 border-orange-200 dark:border-amber-700/30' : 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-white/10'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-white dark:bg-black/60 border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform shadow-sm dark:shadow-lg shrink-0">
                        <img src={getImagePath(rec.name)||''} className="w-full h-full object-contain drop-shadow-md dark:drop-shadow-xl" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-black text-gray-900 dark:text-white leading-tight tracking-tight truncate transition-colors">{rec.name}</h4>
                        <p className="text-[10px] text-gray-500 font-medium mt-0.5 truncate">기본 판매가: {rec.sellPrice.toLocaleString()} G</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-auto">
                    <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-500/10 rounded-xl p-2.5 text-center flex flex-col justify-center transition-colors">
                      <p className="text-[9px] text-rose-500 dark:text-rose-300/80 mb-1 font-bold tracking-wider transition-colors">1개 제작 원가</p>
                      <p className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 transition-colors">- {rec.totalCost.toLocaleString()}</p>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/20 rounded-xl p-2.5 text-center flex flex-col justify-center shadow-sm dark:shadow-[0_0_10px_rgba(34,211,238,0.03)] transition-colors">
                      <p className="text-[9px] text-cyan-600 dark:text-cyan-300/80 mb-1 font-bold tracking-wider transition-colors">예상 순수익(1개)</p>
                      <p className="text-xs sm:text-sm font-black text-cyan-600 dark:text-cyan-400 drop-shadow-sm transition-colors">+ {rec.profit.toLocaleString()}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-2.5 text-center flex flex-col justify-center transition-colors">
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-300/80 mb-1 font-bold tracking-wider transition-colors">순수익(재고 소진 시)</p>
                      <p className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 drop-shadow-sm transition-colors">+ {(rec.profit * rec.maxCrafts).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedRec[rec.name] ? 'max-h-[500px] opacity-100 mt-4 pt-4 border-t border-gray-200 dark:border-white/10' : 'max-h-0 opacity-0 mt-0 pt-0 border-t-0 border-transparent'}`} onClick={e => e.stopPropagation()}>
                    {rec.maxCrafts === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-4 bg-gray-50 dark:bg-white/5 rounded-xl font-medium transition-colors">제작에 필요한 어패류/물고기 재고가 없습니다.</p>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold flex items-center gap-2 transition-colors">
                            재고 전량 소모 시 부족분
                          </p>
                          <span className="bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-200 dark:border-cyan-500/30 px-2 py-0.5 rounded text-[10px] font-black text-cyan-600 dark:text-cyan-400 drop-shadow-sm transition-colors">총 {rec.maxCrafts}개 제작</span>
                        </div>
                        
                        {Object.keys(rec.missingForMax).length === 0 ? (
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 text-center font-bold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            현재 재고로 부족함 없이 모두 제작 가능합니다!
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(rec.missingForMax).map(([mat, q]) => (
                              <div key={mat} className="flex justify-between items-center bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/5 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <img src={getImagePath(mat)||''} className="w-4 h-4 object-contain shrink-0" />
                                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate max-w-[60px] sm:max-w-[80px] transition-colors">{mat}</span>
                                </div>
                                <span className="text-[10px] font-black text-rose-500 dark:text-rose-400 shrink-0 transition-colors">{q.toLocaleString()} 부족</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'simulator' && (
        <div className="animate-fade-in bg-white dark:bg-gradient-to-b dark:from-[#111113] dark:to-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-5 md:p-8 flex flex-col lg:flex-row gap-8 lg:gap-10 shadow-sm dark:shadow-2xl transition-colors">
          <div className="flex-1 flex flex-col">
            <h3 className="text-base font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2 transition-colors">
              <div className="w-1.5 h-4 bg-cyan-500 dark:bg-cyan-400 rounded-full transition-colors"></div>시뮬레이션 목표 설정
            </h3>
            <div className="flex gap-3 mb-8">
              <select value={targetItem} onChange={(e) => setTargetItem(e.target.value)} className="flex-[2] bg-gray-50 dark:bg-[#1a1a1e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white text-sm font-bold focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 cursor-pointer transition-colors shadow-inner">
                {OCEAN_FIXED_PRICES.map(item => <option key={item.name} value={item.name} className="bg-white dark:bg-[#0a0a0a]">{item.name}</option>)}
              </select>
              <div className="flex-1 relative">
                <input type="number" value={targetQtyStr} onChange={(e) => setTargetQtyStr(e.target.value)} placeholder="수량 직접 입력" className="w-full h-full bg-gray-50 dark:bg-[#1a1a1e] border border-gray-200 dark:border-white/10 rounded-xl pl-4 pr-8 py-3.5 text-gray-900 dark:text-white text-sm font-black focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 transition-colors shadow-inner placeholder:text-gray-400 dark:placeholder:text-gray-600 placeholder:font-medium" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-gray-500 transition-colors">개</span>
              </div>
            </div>

            <h4 className="text-sm font-black text-gray-700 dark:text-gray-300 mb-4 flex items-center justify-between transition-colors">
              부족한 재료 현황
              <span className="text-[10px] font-medium text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md transition-colors">내 창고 재고 대비</span>
            </h4>
            
            <div className="flex-1 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl p-4 transition-colors">
              {Object.entries(simulatorResult.missing).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-10 opacity-70">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-3 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 transition-colors">보유 중인 재고로 충분히 제작 가능합니다!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(simulatorResult.missing).map(([mat, qty]) => {
                    const isBlack = blacklist.includes(mat);
                    return (
                      <div key={mat} className={`flex justify-between items-center p-2.5 rounded-xl border transition-all ${isBlack ? 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-500/20' : 'bg-white dark:bg-[#1a1a1e] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'}`}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 bg-gray-100 dark:bg-black/50 rounded-lg flex items-center justify-center p-1.5 shrink-0 border border-gray-200 dark:border-white/5 transition-colors">
                            <img src={getImagePath(mat)||''} alt="" className="w-full h-full object-contain drop-shadow-sm dark:drop-shadow-md"/>
                          </div>
                          <span className={`text-[11px] font-bold truncate transition-colors ${isBlack ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>{mat}</span>
                        </div>
                        <span className={`text-[11px] font-black shrink-0 transition-colors ${isBlack ? 'text-red-400 dark:text-red-500/70' : 'text-rose-500 dark:text-rose-400'}`}>{qty.toLocaleString()} 부족</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-[350px] flex flex-col justify-center gap-4 shrink-0 mt-6 lg:mt-0 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-white/5 pt-8 lg:pt-0 lg:pl-8 transition-colors">
            <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-500/10 rounded-2xl p-5 hover:bg-rose-100 dark:hover:bg-rose-950/20 transition-colors">
              <p className="text-[10px] text-rose-500 dark:text-rose-300/60 font-bold mb-1 tracking-wider transition-colors">부족분 매입 예상 비용</p>
              <p className="text-xl font-black text-rose-600 dark:text-rose-400 drop-shadow-sm transition-colors">- {simulatorResult.totalCost.toLocaleString()} G</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-500/10 rounded-2xl p-5 hover:bg-emerald-100 dark:hover:bg-emerald-950/20 transition-colors">
              <p className="text-[10px] text-emerald-600 dark:text-emerald-300/60 font-bold mb-1 tracking-wider transition-colors">총 판매 수익 ([프리미엄 한정가] 적용)</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 drop-shadow-sm transition-colors">+ {simulatorResult.expectedRevenue.toLocaleString()} G</p>
            </div>
            <div className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-500/40 rounded-3xl p-6 md:p-8 mt-2 relative overflow-hidden shadow-sm dark:shadow-[0_0_30px_rgba(34,211,238,0.1)] group hover:border-cyan-300 dark:hover:border-cyan-400/60 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-bl-[100px] blur-2xl group-hover:bg-cyan-500/20 transition-colors"></div>
              <p className="text-xs text-cyan-700 dark:text-cyan-200/80 font-bold mb-2 tracking-wide relative z-10 transition-colors">최종 예상 순수익</p>
              <p className="text-3xl md:text-4xl font-black text-cyan-600 dark:text-cyan-400 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] relative z-10 tracking-tight transition-colors">
                {simulatorResult.profit > 0 ? '+' : ''}{simulatorResult.profit.toLocaleString()} G
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}