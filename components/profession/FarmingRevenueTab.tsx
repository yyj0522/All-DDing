'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getImagePath } from '@/lib/professionData';

interface Props {
  userStats: any;
  toolImprints?: Record<string, Record<string, number>>;
}

const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

const HOE_BASE_DROPS = [2, 3, 3, 3, 4, 4, 4, 5, 5, 8, 10, 10, 12, 12, 17];
const F14_SEED_EXTRA = [0, 0.01, 0.02, 0.03, 0.04, 0.10, 0.12, 0.21, 0.32, 0.45, 0.80];
const F16_BASE_EXTRA = [0, 0.01, 0.02, 0.06, 0.08, 0.10, 0.18, 0.21, 0.40, 0.45, 1.05];
const BASE_MOLE_CHANCE = [0, 0, 0, 0, 0, 0, 0.01, 0.01, 0.03, 0.03, 0.04, 0.04, 0.08, 0.08, 0.10];

const IMPRINT_HOE_BOX = [0, 0.01, 0.02, 0.03, 0.04, 0.05];
const IMPRINT_HOE_ROULETTE = [0, 0.01, 0.02, 0.03, 0.04, 0.05];
const IMPRINT_HOE_SEED = [0, 0.5, 1.0, 1.5, 2.0];
const IMPRINT_HOE_BEAN = [0, 0.5, 1.0, 1.5, 2.0];

const HOE_IMPRINTS_MAP: Record<string, string> = {
  'hoe_seed': '씨앗 행운',
  'hoe_fruit': '과일 행운',
  'hoe_bean': '원두 행운',
  'hoe_box': '작물 상자',
  'hoe_basket': '과일 바구니',
  'hoe_roulette': '농부 룰렛'
};

export default function FarmingRevenueTab({ userStats, toolImprints }: Props) {
  const [marketPrices, setMarketPrices] = useState({
    tomatoSeed: 15000, onionSeed: 15000, garlicSeed: 15000
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [staminaAlloc, setStaminaAlloc] = useState({ tomato: 0, onion: 0, garlic: 0 });

  const usableStamina = useMemo(() => Math.floor((userStats.stamina || 0) / 5) * 5, [userStats.stamina]);

  useEffect(() => {
    const savedPrices = localStorage.getItem('alldding_farm_market');
    const savedAlloc = localStorage.getItem('alldding_farm_alloc');
    
    if (savedPrices) {
      try { setMarketPrices(prev => ({ ...prev, ...JSON.parse(savedPrices) })); } catch (e) {}
    }
    
    if (savedAlloc) {
      try { 
        const parsed = JSON.parse(savedAlloc);
        if (parsed.tomato + parsed.onion + parsed.garlic === usableStamina) {
          setStaminaAlloc(parsed);
        } else {
          const t = Math.floor((usableStamina / 3) / 5) * 5;
          const o = Math.floor(((usableStamina - t) / 2) / 5) * 5;
          const g = usableStamina - t - o;
          setStaminaAlloc({ tomato: t, onion: o, garlic: g });
        }
      } catch (e) {}
    } else {
      const t = Math.floor((usableStamina / 3) / 5) * 5;
      const o = Math.floor(((usableStamina - t) / 2) / 5) * 5;
      const g = usableStamina - t - o;
      setStaminaAlloc({ tomato: t, onion: o, garlic: g });
    }
    
    setIsLoaded(true);
  }, [usableStamina]);

  const handlePriceChange = (key: keyof typeof marketPrices, value: string) => {
    const num = parseFloat(value);
    const newPrices = { ...marketPrices, [key]: isNaN(num) ? 0 : num };
    setMarketPrices(newPrices);
    localStorage.setItem('alldding_farm_market', JSON.stringify(newPrices));
  };

  const handleAllocChange = (crop: 'tomato' | 'onion' | 'garlic', val: string, shouldRound: boolean = false) => {
    let num = parseInt(val, 10);
    if (isNaN(num)) num = 0;
    
    if (shouldRound) {
      num = Math.round(num / 5) * 5;
    }

    if (num < 0) num = 0;
    if (num > usableStamina) num = usableStamina;

    let next = { ...staminaAlloc, [crop]: num };
    let remain = usableStamina - num;

    if (crop === 'tomato') {
      next.onion = shouldRound ? Math.floor((remain / 2) / 5) * 5 : Math.floor(remain / 2);
      next.garlic = remain - next.onion;
    } else if (crop === 'onion') {
      next.garlic = shouldRound ? Math.floor((remain / 2) / 5) * 5 : Math.floor(remain / 2);
      next.tomato = remain - next.garlic;
    } else if (crop === 'garlic') {
      next.tomato = shouldRound ? Math.floor((remain / 2) / 5) * 5 : Math.floor(remain / 2);
      next.onion = remain - next.tomato;
    }

    setStaminaAlloc(next);
    if (shouldRound) {
      localStorage.setItem('alldding_farm_alloc', JSON.stringify(next));
    }
  };

  const results = useMemo(() => {
    const totalActions = Math.floor(userStats.stamina / 5);
    const baseDrop = userStats.hoeLv > 0 ? HOE_BASE_DROPS[userStats.hoeLv - 1] : 1;
    
    const imprints = toolImprints?.['hoe'] || {};
    const hoeSeedDrop = IMPRINT_HOE_SEED[imprints['hoe_seed'] || 0] || 0;
    const hoeBoxDrop = IMPRINT_HOE_BOX[imprints['hoe_box'] || 0] * 25.5 || 0;
    const hoeRouletteDrop = IMPRINT_HOE_ROULETTE[imprints['hoe_roulette'] || 0] * 23.1 || 0;
    const f14Drop = F14_SEED_EXTRA[userStats.f14Lv || 0] || 0;
    
    const expectedSeedsPerAction = baseDrop + hoeSeedDrop + hoeBoxDrop + hoeRouletteDrop + f14Drop;
    
    const actionT = Math.floor(staminaAlloc.tomato / 5);
    const actionO = Math.floor(staminaAlloc.onion / 5);
    const actionG = Math.floor(staminaAlloc.garlic / 5);

    const tSeeds = actionT * expectedSeedsPerAction;
    const oSeeds = actionO * expectedSeedsPerAction;
    const gSeeds = actionG * expectedSeedsPerAction;
    const totalSeeds = tSeeds + oSeeds + gSeeds;
    
    const revT = Math.floor(tSeeds * ((marketPrices.tomatoSeed || 0) / 64));
    const revO = Math.floor(oSeeds * ((marketPrices.onionSeed || 0) / 64));
    const revG = Math.floor(gSeeds * ((marketPrices.garlicSeed || 0) / 64));
    const totalRev = revT + revO + revG;

    const f16Extra = F16_BASE_EXTRA[userStats.f16Lv || 0] || 0;
    const baseT = actionT * f16Extra;
    const baseO = actionO * f16Extra;
    const baseG = actionG * f16Extra;
    const totalBases = baseT + baseO + baseG;

    const moleChance = userStats.hoeLv > 0 ? BASE_MOLE_CHANCE[userStats.hoeLv - 1] : 0;
    const moleEncounters = totalActions * moleChance;
    const beanImprintDrop = IMPRINT_HOE_BEAN[imprints['hoe_bean'] || 0] || 0;
    const totalBeans = moleEncounters * (1 + beanImprintDrop);

    return { 
      totalActions, actionT, actionO, actionG, 
      totalSeeds, tSeeds, oSeeds, gSeeds, 
      totalRev, expectedSeedsPerAction,
      totalBases, baseT, baseO, baseG,
      totalBeans
    };
  }, [userStats, toolImprints, marketPrices, staminaAlloc]);

  if (!isLoaded) return null;

  const inputBaseClass = "w-full bg-transparent border-none pl-2 pr-8 py-2.5 text-sm font-black text-emerald-600 dark:text-emerald-400 text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className="flex flex-col gap-6 w-full relative transition-colors duration-300 animate-fade-in-up pb-10">
      
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md dark:shadow-2xl transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-200 dark:border-white/5 pb-4">
          <div>
            <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">씨앗 시세 입력</h3>
            <p className="text-[11px] md:text-xs font-bold text-gray-500 mt-1">입력된 시세는 브라우저에 저장됩니다.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'tomatoSeed', label: '토마토 씨앗', img: '토마토 씨앗', color: 'text-rose-500' },
            { id: 'onionSeed', label: '양파 씨앗', img: '양파 씨앗', color: 'text-amber-500' },
            { id: 'garlicSeed', label: '마늘 씨앗', img: '마늘 씨앗', color: 'text-gray-500' }
          ].map(item => (
            <div key={item.id} className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-colors group hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:shadow-md">
              <div className="flex items-center gap-3 border-b border-gray-200 dark:border-white/5 pb-3">
                <div className="w-12 h-12 bg-white dark:bg-black/50 rounded-xl border border-gray-200 dark:border-transparent flex items-center justify-center p-2 shadow-sm group-hover:scale-110 transition-transform">
                  <img src={getImagePath(item.img) || undefined} className="w-full h-full object-contain drop-shadow-sm" style={{imageRendering: 'pixelated'}} alt="" />
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-black ${item.color} dark:text-gray-200`}>{item.label}</span>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded-md mt-1 w-max">1세트(64개) 단가</span>
                </div>
              </div>
              <div className="w-32 bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/10 flex items-center overflow-hidden relative">
                <input 
                  type="number" step="any" 
                  value={marketPrices[item.id as keyof typeof marketPrices] === 0 ? '' : marketPrices[item.id as keyof typeof marketPrices]} 
                  onChange={(e) => handlePriceChange(item.id as keyof typeof marketPrices, e.target.value)} 
                  onFocus={(e) => e.target.select()}
                  placeholder="0" 
                  className={inputBaseClass} 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 pointer-events-none">G</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md dark:shadow-2xl transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-200 dark:border-white/5 pb-5">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              채집 스태미나 분배
            </h3>
            <p className="text-xs font-bold text-gray-500 mt-2">보유하신 스태미나({usableStamina.toLocaleString()})를 각 작물에 어떻게 분배하여 채집할지 설정하세요. (5단위 조절)</p>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex w-full h-8 rounded-full overflow-hidden shadow-inner border border-gray-200 dark:border-white/10">
            <div className="bg-rose-500 flex items-center justify-center text-white text-[10px] sm:text-xs font-black transition-all overflow-hidden whitespace-nowrap" style={{ width: `${usableStamina > 0 ? (staminaAlloc.tomato / usableStamina) * 100 : 0}%` }}>
              {staminaAlloc.tomato > 0 ? `${staminaAlloc.tomato} (${Math.round((staminaAlloc.tomato / usableStamina) * 100)}%)` : ''}
            </div>
            <div className="bg-amber-500 flex items-center justify-center text-white text-[10px] sm:text-xs font-black transition-all overflow-hidden whitespace-nowrap" style={{ width: `${usableStamina > 0 ? (staminaAlloc.onion / usableStamina) * 100 : 0}%` }}>
              {staminaAlloc.onion > 0 ? `${staminaAlloc.onion} (${Math.round((staminaAlloc.onion / usableStamina) * 100)}%)` : ''}
            </div>
            <div className="bg-gray-500 flex items-center justify-center text-white text-[10px] sm:text-xs font-black transition-all overflow-hidden whitespace-nowrap" style={{ width: `${usableStamina > 0 ? (staminaAlloc.garlic / usableStamina) * 100 : 0}%` }}>
              {staminaAlloc.garlic > 0 ? `${staminaAlloc.garlic} (${Math.round((staminaAlloc.garlic / usableStamina) * 100)}%)` : ''}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-rose-50 dark:bg-rose-950/20 p-5 rounded-2xl border border-rose-200 dark:border-rose-500/30">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-black text-rose-700 dark:text-rose-400 flex items-center gap-2"><img src={getImagePath('토마토 씨앗') || undefined} className="w-5 h-5" style={{imageRendering:'pixelated'}} alt="" /> 토마토 채집</span>
                <div className="relative w-28 bg-white dark:bg-black/50 border border-rose-200 dark:border-rose-500/30 rounded-lg flex items-center overflow-hidden">
                  <input type="number" value={staminaAlloc.tomato === 0 ? '' : staminaAlloc.tomato} onChange={(e) => handleAllocChange('tomato', e.target.value, false)} onBlur={(e) => handleAllocChange('tomato', e.target.value, true)} onFocus={(e) => e.target.select()} placeholder="0" className="w-full bg-transparent border-none pl-2 pr-6 py-1.5 text-xs font-black text-rose-900 dark:text-rose-300 text-right outline-none" />
                </div>
              </div>
              <input type="range" min="0" max={usableStamina} step="5" value={staminaAlloc.tomato} onChange={(e) => handleAllocChange('tomato', e.target.value, true)} className="w-full h-2 bg-rose-200 dark:bg-rose-900/50 rounded-lg appearance-none cursor-pointer accent-rose-500" />
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-500/30">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-black text-amber-700 dark:text-amber-400 flex items-center gap-2"><img src={getImagePath('양파 씨앗') || undefined} className="w-5 h-5" style={{imageRendering:'pixelated'}} alt="" /> 양파 채집</span>
                <div className="relative w-28 bg-white dark:bg-black/50 border border-amber-200 dark:border-amber-500/30 rounded-lg flex items-center overflow-hidden">
                  <input type="number" value={staminaAlloc.onion === 0 ? '' : staminaAlloc.onion} onChange={(e) => handleAllocChange('onion', e.target.value, false)} onBlur={(e) => handleAllocChange('onion', e.target.value, true)} onFocus={(e) => e.target.select()} placeholder="0" className="w-full bg-transparent border-none pl-2 pr-6 py-1.5 text-xs font-black text-amber-900 dark:text-amber-300 text-right outline-none" />
                </div>
              </div>
              <input type="range" min="0" max={usableStamina} step="5" value={staminaAlloc.onion} onChange={(e) => handleAllocChange('onion', e.target.value, true)} className="w-full h-2 bg-amber-200 dark:bg-amber-900/50 rounded-lg appearance-none cursor-pointer accent-amber-500" />
            </div>

            <div className="bg-gray-100 dark:bg-gray-800/30 p-5 rounded-2xl border border-gray-300 dark:border-gray-600/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2"><img src={getImagePath('마늘 씨앗') || undefined} className="w-5 h-5" style={{imageRendering:'pixelated'}} alt="" /> 마늘 채집</span>
                <div className="relative w-28 bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-600/50 rounded-lg flex items-center overflow-hidden">
                  <input type="number" value={staminaAlloc.garlic === 0 ? '' : staminaAlloc.garlic} onChange={(e) => handleAllocChange('garlic', e.target.value, false)} onBlur={(e) => handleAllocChange('garlic', e.target.value, true)} onFocus={(e) => e.target.select()} placeholder="0" className="w-full bg-transparent border-none pl-2 pr-6 py-1.5 text-xs font-black text-gray-900 dark:text-gray-300 text-right outline-none" />
                </div>
              </div>
              <input type="range" min="0" max={usableStamina} step="5" value={staminaAlloc.garlic} onChange={(e) => handleAllocChange('garlic', e.target.value, true)} className="w-full h-2 bg-gray-300 dark:bg-gray-700/50 rounded-lg appearance-none cursor-pointer accent-gray-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] shadow-md dark:shadow-2xl relative overflow-hidden flex flex-col lg:flex-row transition-colors items-stretch">
        <div className="w-full lg:w-1/3 bg-gray-50 dark:bg-[#111113] p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/5 flex flex-col transition-colors">
          <div className="mb-6 pb-5 border-b border-gray-200 dark:border-white/5 flex justify-between items-start transition-colors">
            <div>
              <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tight transition-colors">적용된 스펙</h3>
              <p className="text-[10px] md:text-[11px] font-bold text-gray-500 leading-relaxed">기댓값 산출에 영향을 주는 요인입니다.</p>
            </div>
            <Link href="/settings" className="bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[10px] md:text-xs font-bold px-3 py-2 rounded-xl border border-gray-300 dark:border-transparent shadow-sm whitespace-nowrap">설정 변경</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-400 mb-2 px-1 tracking-widest uppercase">내 스펙</h4>
              <div className="flex justify-between items-center bg-white dark:bg-black px-4 py-3 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">가용 스태미나</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{userStats.stamina.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-black px-4 py-3 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">세이지 괭이</span>
                <span className="text-sm font-black text-stone-600 dark:text-stone-400">{userStats.hoeLv > 0 ? `+${userStats.hoeLv}` : '미장착'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-400 mb-2 px-1 tracking-widest uppercase">적용된 전문가 스킬</h4>
              <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-950/20 px-4 py-3 rounded-xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">[자연이 주는 선물]</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-300">Lv.{userStats.f14Lv || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-rose-50 dark:bg-rose-950/20 px-4 py-3 rounded-xl border border-rose-100 dark:border-rose-500/20 shadow-sm">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400">[불붙은 괭이]</span>
                <span className="text-sm font-black text-rose-600 dark:text-rose-300">Lv.{userStats.f16Lv || 0}</span>
              </div>
            </div>

            {toolImprints?.['hoe'] && Object.values(toolImprints['hoe']).some(lv => lv > 0) && (
              <div className="col-span-1 md:col-span-2 pt-2 border-t border-gray-200 dark:border-white/5">
                <h4 className="text-[10px] font-black text-gray-400 mb-2 px-1 tracking-widest uppercase">부여된 각인석</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(toolImprints['hoe']).map(([key, lv]) => {
                    if (lv === 0) return null;
                    const name = HOE_IMPRINTS_MAP[key];
                    if (!name) return null;
                    return (
                      <div key={key} className="flex justify-between items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">[{name}]</span>
                        <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">Lv.{lv}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full lg:w-2/3 p-6 md:p-8 flex flex-col bg-white dark:bg-gradient-to-br dark:from-[#0a0a0a] dark:to-[#0f0f13] transition-colors relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-bl-full pointer-events-none"></div>
          
          <div className="mb-8 relative z-10">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tight">기본 채집 예상 수익</h3>
            <p className="text-xs font-bold text-gray-500">요리를 하지 않고, 입력한 분배 비율에 맞춰 아일랜드에서 씨앗을 캐서 세트 단위로 팔았을 때의 기본 기댓값입니다.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
            <div className="bg-gray-50 dark:bg-black/50 p-5 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-black text-gray-500 mb-1 block">채집 가능 횟수</span>
              <span className="text-2xl font-black text-gray-900 dark:text-white">{results.totalActions.toLocaleString()} <span className="text-sm">회</span></span>
            </div>
            <div className="bg-gray-50 dark:bg-black/50 p-5 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-black text-gray-500 mb-1 block">1회 평균 씨앗</span>
              <span className="text-2xl font-black text-gray-900 dark:text-white">{results.expectedSeedsPerAction.toFixed(2)} <span className="text-sm">개</span></span>
            </div>
            <div className="bg-gray-50 dark:bg-black/50 p-5 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-black text-gray-500 mb-1 block">총 예상 획득 씨앗</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-500">{Math.floor(results.totalSeeds).toLocaleString()} <span className="text-sm text-amber-600/50">개</span></span>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-5 rounded-3xl border border-emerald-200 dark:border-emerald-500/20 shadow-md flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 mb-1 block">매각 수익</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{results.totalRev.toLocaleString()} <span className="text-sm text-emerald-700/50">G</span></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 flex-1">
            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-5 rounded-3xl shadow-sm flex flex-col h-full">
              <h4 className="text-xs font-black text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-100 dark:border-white/5">씨앗별 획득량 상세</h4>
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={getImagePath('토마토 씨앗') || undefined} className="w-8 h-8 object-contain drop-shadow-sm" style={{imageRendering: 'pixelated'}} alt="" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-gray-500">토마토 채집 ({results.actionT}회)</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white">{Math.floor(results.tSeeds).toLocaleString()} 개</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={getImagePath('양파 씨앗') || undefined} className="w-8 h-8 object-contain drop-shadow-sm" style={{imageRendering: 'pixelated'}} alt="" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-gray-500">양파 채집 ({results.actionO}회)</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white">{Math.floor(results.oSeeds).toLocaleString()} 개</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={getImagePath('마늘 씨앗') || undefined} className="w-8 h-8 object-contain drop-shadow-sm" style={{imageRendering: 'pixelated'}} alt="" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-gray-500">마늘 채집 ({results.actionG}회)</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white">{Math.floor(results.gSeeds).toLocaleString()} 개</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 p-5 rounded-3xl shadow-sm flex flex-col justify-center flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-black/50 rounded-xl flex items-center justify-center p-1.5 shadow-sm border border-amber-100 dark:border-transparent">
                      <img src={`${STORAGE_BASE_URL}/barista/coffee_beans.png`} className="w-full h-full object-contain drop-shadow-sm" style={{imageRendering: 'pixelated'}} alt="" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-500 mb-0.5">두더지 획득</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">원두 <span className="text-amber-600 dark:text-amber-400">{Math.floor(results.totalBeans).toLocaleString()} 개</span> 예상</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 p-5 rounded-3xl shadow-sm flex flex-col justify-center flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-black/50 rounded-xl flex items-center justify-center p-1.5 shadow-sm border border-rose-100 dark:border-transparent">
                      <img src={getImagePath('토마토 베이스') || undefined} className="w-full h-full object-contain drop-shadow-sm" style={{imageRendering: 'pixelated'}} alt="" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-500 mb-0.5">요리 재료</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">베이스 <span className="text-rose-600 dark:text-rose-400">{Math.floor(results.totalBases).toLocaleString()} 개</span> 예상</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}