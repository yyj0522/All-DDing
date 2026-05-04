'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  getImagePath, VANILLA, TIER1, TIER2, TIER3, FISH, 
  getItemBaseReqsPerUnit, simulateCraftPure, formatQty,
  ALCHEMY_T1_JEONGSU, ALCHEMY_T2_CORE, ALCHEMY_T1_ESSENCE, 
  ALCHEMY_T2_CRYSTAL, ALCHEMY_T1_ELIXIR, ALCHEMY_T2_POTION
} from '@/lib/oceanTradeUtils';
import OceanAlchemyOptimal from './OceanAlchemyOptimal';
import OceanStaminaRecommend from './OceanStaminaRecommend';

interface Props {
  userStats: any;
  toolImprints: any;
}

export default function OceanTradeCalcTab({ userStats, toolImprints }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'alchemy_optimal' | 'stamina_recommend' | 'trade' | 'settings'>('alchemy_optimal');
  
  const [cost, setCost] = useState<Record<string, number>>({});
  const [stock, setStock] = useState<Record<string, number>>({});
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [tradeQty, setTradeQty] = useState<Record<string, number>>({});
  
  const [craftInputs, setCraftInputs] = useState<Record<string, { boxes: string, sets: string, units: string }>>({});
  const [pendingCrafts, setPendingCrafts] = useState<Record<string, number>>({});
  
  const [globalSetMode, setGlobalSetMode] = useState<boolean>(false);
  const [recommendMode, setRecommendMode] = useState<'balance' | 'max_profit'>('balance');
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [isInventoryVisible, setIsInventoryVisible] = useState(false);

  const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>({
    '1성': false,
    '2성': false,
    '3성': false
  });
  
  const [inventoryTab, setInventoryTab] = useState<string>('전체');

  useEffect(() => {
    const saved = localStorage.getItem('ocean_trade_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCost(parsed.cost || {});
        setStock(parsed.stock || {});
        setBlacklist(parsed.blacklist || []);
        if (parsed.globalSetMode !== undefined) setGlobalSetMode(parsed.globalSetMode);
        if (parsed.recommendMode !== undefined) setRecommendMode(parsed.recommendMode);
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ocean_trade_v3', JSON.stringify({ cost, stock, blacklist, globalSetMode, recommendMode }));
    }
  }, [cost, stock, blacklist, globalSetMode, recommendMode, isLoaded]);

  useEffect(() => {
    setPendingCrafts({});
    setCraftInputs({});
  }, [stock, activeSubTab, recommendMode]);

  const handleCostChange = (item: string, val: string) => {
    const num = parseFloat(val);
    setCost(prev => ({ ...prev, [item]: isNaN(num) ? 0 : (globalSetMode ? num / 64 : num) }));
  };

  const toggleBlacklist = (item: string) => {
    setBlacklist(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const clearTradeQty = () => setTradeQty({});

  const saveCostData = () => {
    localStorage.setItem('ocean_trade_v3', JSON.stringify({ cost, stock, blacklist, globalSetMode, recommendMode }));
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

  const itemBaseReqsPerUnit = useMemo(() => getItemBaseReqsPerUnit(), []);

  const handleQueueCraft = (itemName: string, maxQty: number) => {
    const input = craftInputs[itemName] || { boxes: '', sets: '', units: '' };
    let totalQtyToCraft = 0;
    
    if (input.boxes || input.sets || input.units) {
        const b = parseInt(input.boxes) || 0;
        const s = parseInt(input.sets) || 0;
        const u = parseInt(input.units) || 0;
        totalQtyToCraft = (b * 3456) + (s * 64) + u;
    } else {
        totalQtyToCraft = maxQty; 
    }

    if (totalQtyToCraft <= 0) {
        alert('올바른 수량을 입력해 주세요.');
        return;
    }

    if (totalQtyToCraft > maxQty) {
        alert('보유 재고로 제작할 수 있는 최대 수량을 초과했습니다.');
        return;
    }

    setPendingCrafts(prev => ({
      ...prev,
      [itemName]: totalQtyToCraft
    }));
  };

  const handleRemovePending = (itemName: string) => {
    setPendingCrafts(prev => {
      const next = { ...prev };
      delete next[itemName];
      return next;
    });
  };

  const handleCraftInputChange = (itemName: string, field: 'boxes' | 'sets' | 'units', value: string) => {
      setCraftInputs(prev => ({
          ...prev,
          [itemName]: {
              ...(prev[itemName] || { boxes: '', sets: '', units: '' }),
              [field]: value
          }
      }));
  };

  const executeAllPendingCrafts = () => {
    if (Object.keys(pendingCrafts).length === 0) return;
    if (!confirm(`총 ${Object.keys(pendingCrafts).length}종류의 연금품 제작을 창고 재고에 일괄 반영하시겠습니까?`)) return;

    const sim = simulateCraftPure(pendingCrafts, stock);
    setStock(sim.stock);
    setPendingCrafts({});
    setCraftInputs({});
    alert('모든 예약된 제작이 창고에 성공적으로 반영되었습니다.');
  };

  const toggleAccordion = (tier: string) => {
    setAccordionOpen(prev => ({ ...prev, [tier]: !prev[tier] }));
  };

  const renderInventoryItem = (item: string) => {
    return (
      <div key={item} className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/5 rounded-xl p-3 flex flex-col gap-2.5 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors shadow-sm">
        <div className="flex items-center gap-1.5 min-w-0 pr-1">
          <img src={getImagePath(item) || undefined} alt="" className="w-5 h-5 object-contain shrink-0 drop-shadow-sm"/>
          <span className="text-[12px] text-gray-800 dark:text-gray-200 font-black truncate tracking-tight">{item}</span>
        </div>
        {globalSetMode ? (
          <div className="grid grid-cols-3 gap-1 w-full shrink-0">
            <input type="number" min="0" placeholder="상자" value={stock[item] >= 3456 ? Math.floor(stock[item]/3456) : ''} onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              const currentSets = stock[item] ? Math.floor((stock[item] % 3456) / 64) : 0;
              const currentUnits = stock[item] ? stock[item] % 64 : 0;
              setStock(prev => ({...prev, [item]: (val * 3456) + (currentSets * 64) + currentUnits}));
            }} className="w-full h-8 bg-gray-50 dark:bg-black border border-gray-200 dark:border-transparent rounded px-1 text-gray-900 dark:text-white text-[11px] font-black text-center outline-none focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-400 placeholder:font-normal" />
            <input type="number" min="0" placeholder="세트" value={(stock[item] % 3456) >= 64 ? Math.floor((stock[item]%3456)/64) : ''} onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              const currentBoxes = stock[item] ? Math.floor(stock[item]/3456) : 0;
              const currentUnits = stock[item] ? stock[item] % 64 : 0;
              setStock(prev => ({...prev, [item]: (currentBoxes * 3456) + (val * 64) + currentUnits}));
            }} className="w-full h-8 bg-gray-50 dark:bg-black border border-gray-200 dark:border-transparent rounded px-1 text-gray-900 dark:text-white text-[11px] font-black text-center outline-none focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-400 placeholder:font-normal" />
            <input type="number" min="0" placeholder="개" value={(stock[item] || 0) % 64 !== 0 ? stock[item] % 64 : ''} onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              const currentBoxes = stock[item] ? Math.floor(stock[item]/3456) : 0;
              const currentSets = stock[item] ? Math.floor((stock[item] % 3456) / 64) : 0;
              setStock(prev => ({...prev, [item]: (currentBoxes * 3456) + (currentSets * 64) + val}));
            }} className="w-full h-8 bg-gray-50 dark:bg-black border border-gray-200 dark:border-transparent rounded px-1 text-gray-900 dark:text-white text-[11px] font-black text-center outline-none focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-400 placeholder:font-normal" />
          </div>
        ) : (
          <input type="number" min="0" value={stock[item] || ''} onChange={(e) => setStock(prev => ({...prev, [item]: parseInt(e.target.value) || 0}))} placeholder="0" className="w-full h-8 bg-white dark:bg-black border border-gray-200 dark:border-transparent rounded-lg px-2.5 text-gray-900 dark:text-white text-[12px] font-black outline-none focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-600" />
        )}
      </div>
    );
  };

  const renderTradeItem = (item: string) => {
    const c = cost[item] || 0;
    const q = tradeQty[item] || 0;
    const lineTotal = c * q;
    const displayCost = c === 0 ? '' : (globalSetMode ? Number((c * 64).toFixed(4)) : Number(c.toFixed(4)));
    
    return (
      <div key={item} className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/5 rounded-xl p-2.5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center px-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <img src={getImagePath(item) || undefined} alt="" className="w-4 h-4 object-contain shrink-0"/>
            <span className="text-[11px] font-black text-gray-800 dark:text-gray-200 truncate tracking-tight">{item}</span>
          </div>
          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 tracking-tight shrink-0">{lineTotal > 0 ? `${lineTotal.toLocaleString()} G` : '0 G'}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <input type="number" step="any" value={displayCost} onChange={(e) => handleCostChange(item, e.target.value)} placeholder={globalSetMode ? "단가(1셋)" : "단가"} className="w-full h-7 bg-gray-50 dark:bg-black border border-gray-200 dark:border-transparent rounded-lg px-2 text-gray-900 dark:text-white text-[11px] font-bold focus:ring-1 focus:ring-blue-500 outline-none transition-colors" />
          {globalSetMode ? (
            <div className="grid grid-cols-3 gap-1 w-full">
              <input type="number" min="0" placeholder="상자" value={q >= 3456 ? Math.floor(q / 3456) : ''} onChange={(e) => {
                 const val = parseInt(e.target.value) || 0;
                 const s = Math.floor((q % 3456) / 64);
                 const u = q % 64;
                 setTradeQty(prev => ({...prev, [item]: (val * 3456) + (s * 64) + u}));
              }} className="w-full h-7 bg-gray-50 dark:bg-black border border-gray-200 dark:border-transparent rounded-lg px-1 text-gray-900 dark:text-white text-[10px] font-bold text-center focus:ring-1 focus:ring-emerald-500 outline-none transition-colors placeholder:font-normal" />
              <input type="number" min="0" placeholder="세트" value={(q % 3456) >= 64 ? Math.floor((q % 3456) / 64) : ''} onChange={(e) => {
                 const val = parseInt(e.target.value) || 0;
                 const b = Math.floor(q / 3456);
                 const u = q % 64;
                 setTradeQty(prev => ({...prev, [item]: (b * 3456) + (val * 64) + u}));
              }} className="w-full h-7 bg-gray-50 dark:bg-black border border-gray-200 dark:border-transparent rounded-lg px-1 text-gray-900 dark:text-white text-[10px] font-bold text-center focus:ring-1 focus:ring-emerald-500 outline-none transition-colors placeholder:font-normal" />
              <input type="number" min="0" placeholder="개" value={q % 64 !== 0 ? q % 64 : ''} onChange={(e) => {
                 const val = parseInt(e.target.value) || 0;
                 const b = Math.floor(q / 3456);
                 const s = Math.floor((q % 3456) / 64);
                 setTradeQty(prev => ({...prev, [item]: (b * 3456) + (s * 64) + val}));
              }} className="w-full h-7 bg-gray-50 dark:bg-black border border-gray-200 dark:border-transparent rounded-lg px-1 text-gray-900 dark:text-white text-[10px] font-bold text-center focus:ring-1 focus:ring-emerald-500 outline-none transition-colors placeholder:font-normal" />
            </div>
          ) : (
            <input type="number" min="0" value={q || ''} onChange={(e) => setTradeQty(prev => ({...prev, [item]: parseInt(e.target.value)||0}))} placeholder="수량" className="w-full h-7 bg-gray-50 dark:bg-black border border-gray-200 dark:border-transparent rounded-lg px-2 text-gray-900 dark:text-white text-[11px] font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-colors" />
          )}
        </div>
      </div>
    );
  };

  const SubTabButton = ({ id, label }: { id: typeof activeSubTab, label: string }) => (
    <button 
      onClick={() => setActiveSubTab(id)} 
      className={`w-full md:w-auto px-2 md:px-5 py-2.5 rounded-xl font-black text-[10px] sm:text-[11px] md:text-xs transition-all border whitespace-nowrap shadow-sm flex items-center justify-center ${
        activeSubTab === id 
        ? 'bg-blue-600 text-white border-transparent shadow-blue-500/30' 
        : 'bg-white dark:bg-[#111113] border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );

  if (!isLoaded) return <div className="bg-gray-100 dark:bg-[#0a0a0a] h-64 rounded-[2rem] animate-pulse w-full border border-gray-200 dark:border-white/10 transition-colors"></div>;

  return (
    <div className="w-full flex flex-col gap-5 md:gap-7 animate-fade-in-up transition-colors duration-300 relative pb-24">
      <style dangerouslySetInnerHTML={{__html: `
        html, body { overflow-anchor: none; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
      `}} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-2 w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[1.5rem] shadow-sm transition-colors">
        <div className="grid grid-cols-2 md:flex md:flex-row gap-2 w-full md:w-auto shrink-0">
          <SubTabButton id="alchemy_optimal" label="연금품 최적 계산" />
          <SubTabButton id="stamina_recommend" label="스태미나 추천" />
          <SubTabButton id="trade" label="거래 계산기" />
          <SubTabButton id="settings" label="단가 및 바닐라 설정" />
        </div>

        <div className="hidden lg:flex flex-1 justify-end px-2">
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-transparent">
            우측 상단 개인설정에서 세이지 도구 및 전문가 스킬을 설정해야 본인 스펙에 맞는 완벽한 최적화 계산이 진행됩니다.
          </span>
        </div>

        <label className="flex items-center justify-end gap-3 px-4 py-2 cursor-pointer shrink-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-white/10">
          <input type="checkbox" className="hidden" checked={globalSetMode} onChange={(e) => setGlobalSetMode(e.target.checked)} />
          <span className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest transition-colors">세트 단위 표시</span>
          <div className={`relative w-10 h-5 rounded-full transition-colors ${globalSetMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-md ${globalSetMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </div>
        </label>
      </div>

      {(activeSubTab === 'alchemy_optimal' || activeSubTab === 'stamina_recommend') && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[1.5rem] p-5 md:p-6 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-white/5 pb-4">
            <div>
              <h2 className="text-xl font-black text-blue-700 dark:text-blue-400 mb-1">간편 재고 관리</h2>
              <p className="text-[11px] text-gray-500 font-bold">어패류 및 연금품 재고를 입력하세요.</p>
            </div>
            <button 
              onClick={() => setIsInventoryVisible(!isInventoryVisible)} 
              className="text-[11px] md:text-xs text-blue-600 font-black bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              {isInventoryVisible ? '닫기 ▲' : '펼치기 ▼'}
            </button>
          </div>
          
          {isInventoryVisible && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 dark:bg-[#111113] p-3 rounded-2xl border border-gray-200 dark:border-transparent">
                <p className="text-[10px] text-gray-500 font-black ml-2">현재 선택 탭: <span className="text-blue-500">{inventoryTab}</span></p>
                <div className="flex gap-2 overflow-x-auto custom-scrollbar">
                  {['전체', '1성', '2성', '3성'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setInventoryTab(tab)}
                      className={`px-6 py-2.5 rounded-xl text-[12px] font-black transition-all whitespace-nowrap ${inventoryTab === tab ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-[#1a1a1e] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              
              {(inventoryTab === '전체' || inventoryTab === '1성') && (
                <div className="border border-blue-100 dark:border-blue-900/30 bg-white/50 dark:bg-[#0a0a0c]/50 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-[14px] font-black text-blue-800 dark:text-blue-400 mb-4">1성 재고 입력</h3>
                  
                  <h4 className="text-[12px] font-black text-gray-900 dark:text-white mb-3">보유 어패류</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                    {TIER1.map(renderInventoryItem)}
                  </div>

                  <div className="border border-blue-100 dark:border-blue-900/30 rounded-xl overflow-hidden bg-white dark:bg-[#111113]">
                    <button onClick={() => toggleAccordion('1성')} className="w-full flex items-center justify-between p-4 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                      <div className="text-left">
                        <div className="text-[13px] font-black text-gray-900 dark:text-white">추가 재고 입력 (정수/핵)</div>
                        <div className="text-[11px] font-bold text-gray-500 mt-1">정수/핵 보유분이 있다면 펼쳐서 입력하세요</div>
                      </div>
                      <span className="text-blue-600 font-bold text-[11px] bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors">
                        {accordionOpen['1성'] ? '닫기 ▲' : '펼치기 ▼'}
                      </span>
                    </button>
                    
                    {accordionOpen['1성'] && (
                      <div className="p-4 bg-gray-50/50 dark:bg-[#0a0a0c] grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-blue-100 dark:border-blue-900/30">
                          <div className="bg-white dark:bg-[#111113] p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                            <h5 className="text-[12px] font-black text-blue-800 dark:text-blue-400 mb-3">보유 정수</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {ALCHEMY_T1_JEONGSU.map(renderInventoryItem)}
                            </div>
                          </div>
                          <div className="bg-white dark:bg-[#111113] p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                            <h5 className="text-[12px] font-black text-blue-800 dark:text-blue-400 mb-3">보유 핵</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {ALCHEMY_T2_CORE.map(renderInventoryItem)}
                            </div>
                          </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(inventoryTab === '전체' || inventoryTab === '2성') && (
                <div className="border border-blue-100 dark:border-blue-900/30 bg-white/50 dark:bg-[#0a0a0c]/50 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-[14px] font-black text-blue-800 dark:text-blue-400 mb-4">2성 재고 입력</h3>
                  
                  <h4 className="text-[12px] font-black text-gray-900 dark:text-white mb-3">보유 어패류</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                    {TIER2.map(renderInventoryItem)}
                  </div>

                  <div className="border border-blue-100 dark:border-blue-900/30 rounded-xl overflow-hidden bg-white dark:bg-[#111113]">
                    <button onClick={() => toggleAccordion('2성')} className="w-full flex items-center justify-between p-4 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                      <div className="text-left">
                        <div className="text-[13px] font-black text-gray-900 dark:text-white">추가 재고 입력 (에센스/결정)</div>
                        <div className="text-[11px] font-bold text-gray-500 mt-1">에센스/결정 보유분이 있다면 펼쳐서 입력하세요</div>
                      </div>
                      <span className="text-blue-600 font-bold text-[11px] bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors">
                        {accordionOpen['2성'] ? '닫기 ▲' : '펼치기 ▼'}
                      </span>
                    </button>
                    
                    {accordionOpen['2성'] && (
                      <div className="p-4 bg-gray-50/50 dark:bg-[#0a0a0c] grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-blue-100 dark:border-blue-900/30">
                          <div className="bg-white dark:bg-[#111113] p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                            <h5 className="text-[12px] font-black text-blue-800 dark:text-blue-400 mb-3">보유 에센스</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {ALCHEMY_T1_ESSENCE.map(renderInventoryItem)}
                            </div>
                          </div>
                          <div className="bg-white dark:bg-[#111113] p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                            <h5 className="text-[12px] font-black text-blue-800 dark:text-blue-400 mb-3">보유 결정</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {ALCHEMY_T2_CRYSTAL.map(renderInventoryItem)}
                            </div>
                          </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(inventoryTab === '전체' || inventoryTab === '3성') && (
                <div className="border border-blue-100 dark:border-blue-900/30 bg-white/50 dark:bg-[#0a0a0c]/50 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-[14px] font-black text-blue-800 dark:text-blue-400 mb-4">3성 재고 입력</h3>
                  
                  <h4 className="text-[12px] font-black text-gray-900 dark:text-white mb-3">보유 어패류</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                    {TIER3.map(renderInventoryItem)}
                  </div>

                  <div className="border border-blue-100 dark:border-blue-900/30 rounded-xl overflow-hidden bg-white dark:bg-[#111113]">
                    <button onClick={() => toggleAccordion('3성')} className="w-full flex items-center justify-between p-4 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                      <div className="text-left">
                        <div className="text-[13px] font-black text-gray-900 dark:text-white">추가 재고 입력 (엘릭서/영약)</div>
                        <div className="text-[11px] font-bold text-gray-500 mt-1">엘릭서/영약 보유분이 있다면 펼쳐서 입력하세요</div>
                      </div>
                      <span className="text-blue-600 font-bold text-[11px] bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors">
                        {accordionOpen['3성'] ? '닫기 ▲' : '펼치기 ▼'}
                      </span>
                    </button>
                    
                    {accordionOpen['3성'] && (
                      <div className="p-4 bg-gray-50/50 dark:bg-[#0a0a0c] grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-blue-100 dark:border-blue-900/30">
                          <div className="bg-white dark:bg-[#111113] p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                            <h5 className="text-[12px] font-black text-blue-800 dark:text-blue-400 mb-3">보유 엘릭서</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {ALCHEMY_T1_ELIXIR.map(renderInventoryItem)}
                            </div>
                          </div>
                          <div className="bg-white dark:bg-[#111113] p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                            <h5 className="text-[12px] font-black text-blue-800 dark:text-blue-400 mb-3">보유 영약</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {ALCHEMY_T2_POTION.map(renderInventoryItem)}
                            </div>
                          </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border border-blue-100 dark:border-blue-900/30 bg-white/50 dark:bg-[#0a0a0c]/50 rounded-2xl p-5 shadow-sm mt-6">
                <h3 className="text-[14px] font-black text-blue-800 dark:text-blue-400 mb-4">횟감 재고 입력 (공통)</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {FISH.map(renderInventoryItem)}
                </div>
              </div>

              <div className="flex justify-end pt-4 mt-2 border-t border-gray-100 dark:border-white/5">
                <button
                  onClick={clearInventory}
                  className="text-[11px] md:text-xs font-bold px-6 py-3 rounded-xl transition-all bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 shadow-sm"
                >
                  전체 재고 초기화
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'alchemy_optimal' && (
        <div className="animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 px-2">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                연금품 최적 계산
              </h2>
              <p className="text-xs text-gray-500 mt-1">창고 재고를 기반으로 제작할 연금품을 추천합니다.</p>
            </div>
          </div>

          <OceanAlchemyOptimal
            stock={stock}
            cost={cost}
            blacklist={blacklist}
            userStats={userStats}
            globalSetMode={globalSetMode}
            craftInputs={craftInputs}
            pendingCrafts={pendingCrafts}
            handleCraftInputChange={handleCraftInputChange}
            handleQueueCraft={handleQueueCraft}
            handleRemovePending={handleRemovePending}
            itemBaseReqsPerUnit={itemBaseReqsPerUnit}
          />
        </div>
      )}

      {activeSubTab === 'stamina_recommend' && (
        <OceanStaminaRecommend
          stock={stock}
          cost={cost}
          blacklist={blacklist}
          recommendMode={recommendMode}
          userStats={userStats}
          toolImprints={toolImprints}
          globalSetMode={globalSetMode}
          itemBaseReqsPerUnit={itemBaseReqsPerUnit}
        />
      )}

      {activeSubTab === 'trade' && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] overflow-hidden shadow-md transition-colors">
          <div className="p-4 md:p-6">
            <div className="space-y-6">
              {[{ title: '1성 어패류', list: TIER1 },
                { title: '2성 어패류', list: TIER2 },
                { title: '3성 어패류', list: TIER3 },
                { title: '물고기 회', list: FISH }].map((group) => (
                <div key={group.title}>
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-[10px] font-black text-gray-500 tracking-widest pl-1">{group.title}</h4>
                    <div className="flex-1 h-[1px] bg-gray-200 dark:bg-white/5"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">{group.list.map(renderTradeItem)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-[#111113] border-t border-gray-200 dark:border-white/10 p-5 md:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-gray-500 font-black mb-1">총 거래 금액</p>
                <p className="text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400">{totalTradeAmount.toLocaleString()} G</p>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
                <button onClick={clearTradeQty} className="flex-1 sm:flex-none bg-gray-200 dark:bg-white/10 hover:bg-gray-300 text-gray-700 dark:text-gray-300 text-[11px] font-black px-5 py-3 rounded-xl transition-all shadow-sm">수량 초기화</button>
                <button onClick={addTradeToStock} className="flex-[2] sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black px-6 py-3 rounded-xl transition-all shadow-md">재고에 합산</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'settings' && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md space-y-10 transition-colors">
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
                          <div className="flex items-center gap-1.5 min-w-0 pr-2">
                            <img src={getImagePath(item) || undefined} alt="" className="w-4 h-4 object-contain shrink-0 drop-shadow-sm" />
                            <span className={`text-[11px] font-black truncate ${isBlack ? 'text-rose-600 line-through' : 'text-gray-800 dark:text-gray-200'}`}>{item}</span>
                          </div>
                          <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                            <input type="checkbox" checked={isBlack} onChange={() => toggleBlacklist(item)} className="w-3.5 h-3.5 rounded border-gray-300 text-rose-500" />
                            <span className="text-[9px] font-bold text-gray-500">제외</span>
                          </label>
                       </div>
                       {!isBlack && (
                          <input type="number" step="any" value={cost[item] === 0 ? '' : (globalSetMode ? Number((cost[item] * 64).toFixed(4)) : cost[item]) || ''} onChange={(e) => handleCostChange(item, e.target.value)} placeholder={globalSetMode ? "단가(1셋)" : "단가"} className="w-full bg-white dark:bg-black border border-gray-200 dark:border-transparent rounded-lg px-2.5 py-1.5 text-[10px] font-black outline-none focus:ring-1 focus:ring-amber-500 transition-colors" />
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="pt-6 flex justify-end border-t border-gray-200 dark:border-white/5">
             <button onClick={saveCostData} className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black px-8 py-3.5 rounded-xl transition-all shadow-md active:scale-95">설정 및 단가 저장</button>
          </div>
        </div>
      )}

      {Object.keys(pendingCrafts).length > 0 && activeSubTab === 'alchemy_optimal' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-t border-gray-200 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transform transition-transform duration-300 animate-fade-in-up">
          <div className="max-w-5xl mx-auto px-4 py-4 md:py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex flex-col w-full sm:w-auto">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black text-gray-900 dark:text-white">총 제작 예약 현황</span>
                <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-md">{Object.keys(pendingCrafts).length}종목</span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 max-h-[60px] overflow-y-auto custom-scrollbar pr-2">
                {Object.entries(pendingCrafts).map(([name, qty]) => {
                  return (
                    <div key={name} className="flex items-center bg-gray-100 dark:bg-[#16161a] border border-gray-200 dark:border-white/5 rounded-lg px-2 py-1 gap-1.5 group cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 dark:hover:border-rose-500/30 transition-colors" onClick={() => handleRemovePending(name)} title="클릭하여 예약 취소">
                      <img src={getImagePath(name) || undefined} className="w-3.5 h-3.5 object-contain" alt="" />
                      <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{name}</span>
                      <span className="text-[10px] font-black text-blue-500">{formatQty(qty, globalSetMode)}</span>
                      <span className="text-[8px] text-gray-400 ml-1 opacity-0 group-hover:opacity-100 group-hover:text-rose-500 transition-opacity">[취소]</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              <button 
                onClick={() => {
                  if(confirm('모든 예약을 취소하시겠습니까?')) {
                    setPendingCrafts({});
                    setCraftInputs({});
                  }
                }}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-300 text-xs font-black hover:bg-gray-100 dark:hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                전체 취소
              </button>
              <button 
                onClick={executeAllPendingCrafts}
                className="flex-[2] sm:flex-none bg-blue-600 hover:bg-blue-500 text-white text-sm font-black px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap flex items-center justify-center gap-2"
              >
                일괄 재고 차감
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}