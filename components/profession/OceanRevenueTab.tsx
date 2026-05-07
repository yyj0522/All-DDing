'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getCachedPrices } from '@/lib/supabase';
import { SAGE_TOOL_EFFECTS } from '@/lib/sageData';
import { getImagePath, OCEAN_FIXED_PRICES } from '@/lib/professionData';
import { getItemBaseReqsPerUnit, CORE_BASE_SHELLS } from '@/lib/oceanTradeUtils';

interface Props {
  userStats: any;
  toolImprints?: Record<string, Record<string, number>>;
}

const IMPRINT_ROD_SHELL_CHANCE = [0, 0.25, 0.50, 0.75, 1.00];
const IMPRINT_ROD_ROULETTE_CHANCE = [0, 0.01, 0.02, 0.03, 0.04, 0.05];
const IMPRINT_ROD_SHELL_FIND_CHANCE = [0, 0.01, 0.03, 0.05];
const IMPRINT_ROD_WHALE_CHANCE = [0, 0.01, 0.02, 0.03, 0.04, 0.05];
const IMPRINT_ROD_RAY_CHANCE = [0, 0.01, 0.02, 0.03, 0.04, 0.05];
const IMPRINT_ROD_FISH_CHANCE = [0, 0.25, 0.50, 0.75, 1.00];

const ROD_IMPRINTS_MAP: Record<string, string> = {
  'rod_fish': '물고기 행운',
  'rod_power': '어획 강화',
  'rod_shell_find': '조개 탐색',
  'rod_shell': '어패 행운',
  'rod_breath': '수중 호흡',
  'rod_fast': '빠른 어부',
  'rod_whale': '정령 고래',
  'rod_ray': '가오리 인도',
  'rod_roulette': '어부 룰렛'
};

export default function OceanRevenueTab({ userStats, toolImprints }: Props) {
  const [dbData, setDbData] = useState<any[]>([]);
  const [cost, setCost] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      const allData = await getCachedPrices();
      const data = allData.filter((d: any) => d.category === 'craft');
      if (data && data.length > 0) setDbData(data);
    };
    fetchData();

    const saved = localStorage.getItem('ocean_trade_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCost(parsed.cost || {});
      } catch (e) {}
    }
  }, []);

  const calcResults = useMemo(() => {
    const actions = Math.floor(userStats.stamina / 15);
    const rodData = userStats.rodLv > 0 ? SAGE_TOOL_EFFECTS.rod[userStats.rodLv - 1] : { '어패류 드롭 수': '1', '조개 등장 확률': '0%' };
    const baseDrop = parseInt(rodData['어패류 드롭 수']) || 1;
    const baseShellChance = parseFloat(rodData['조개 등장 확률']) / 100 || 0;

    const rodImprints = toolImprints?.['rod'] || {};
    
    const shellImprintLv = rodImprints['rod_shell'] || 0;
    const rouletteImprintLv = rodImprints['rod_roulette'] || 0;
    const shellFindImprintLv = rodImprints['rod_shell_find'] || 0;
    const whaleImprintLv = rodImprints['rod_whale'] || 0;
    const rayImprintLv = rodImprints['rod_ray'] || 0;
    const fishImprintLv = rodImprints['rod_fish'] || 0;

    const o11Bonus = [0, 0.05, 0.07, 0.10, 0.15, 0.20][userStats.o11Lv] || 0;
    
    const extraShellsFromImprint = actions * IMPRINT_ROD_SHELL_CHANCE[shellImprintLv];
    const rouletteShells = actions * IMPRINT_ROD_ROULETTE_CHANCE[rouletteImprintLv] * 19.25;

    const totalSeafood = (actions * baseDrop * (1 + o11Bonus)) + extraShellsFromImprint + rouletteShells;

    const expectedWhales = actions * IMPRINT_ROD_WHALE_CHANCE[whaleImprintLv];
    const expectedRays = actions * IMPRINT_ROD_RAY_CHANCE[rayImprintLv];
    const expectedExtraFish = actions * IMPRINT_ROD_FISH_CHANCE[fishImprintLv];

    const o17Bonus = [0, 0.01, 0.03, 0.05, 0.07, 0.10, 0.15][userStats.o17Lv] || 0;
    const rate3 = 0.10 + o17Bonus;
    const rate2 = 0.30;
    const rate1 = 1.0 - rate2 - rate3;

    const qty1 = totalSeafood * rate1;
    const qty2 = totalSeafood * rate2;
    const qty3 = totalSeafood * rate3;

    const crafts1 = Math.floor(qty1 / 12);
    const crafts2 = Math.floor(qty2 / 3);
    const crafts3 = Math.floor(qty3 / 6);

    const rem1 = Math.floor(qty1 % 12);
    const rem2 = Math.floor(qty2 % 3);
    const rem3 = Math.floor(qty3 % 6);

    const o16Bonus = [0, 0.05, 0.07, 0.09, 0.12, 0.15, 0.20, 0.25, 0.30][userStats.o16Lv] || 0;
    
    const unitPrice1 = Math.ceil(5393 * (1 + o16Bonus));
    const unitPrice2 = Math.ceil(11399 * (1 + o16Bonus));
    const unitPrice3 = Math.ceil(19328 * (1 + o16Bonus));

    const rev1 = crafts1 * unitPrice1;
    const rev2 = crafts2 * unitPrice2;
    const rev3 = crafts3 * unitPrice3;

    const totalAlchemyRev = rev1 + rev2 + rev3;

    const itemBaseReqsPerUnit = getItemBaseReqsPerUnit();
    
    const getCost = (itemName: string, count: number) => {
      let c = 0;
      const reqs = itemBaseReqsPerUnit[itemName] || {};
      for (const [mat, q] of Object.entries(reqs)) {
        if (!CORE_BASE_SHELLS.includes(mat)) {
          c += (cost[mat] || 0) * (q as number) * count;
        }
      }
      return c;
    };

    const cost1 = getCost('리바이던의 깃털', crafts1);
    const cost2 = getCost('청해룡의 날개', crafts2);
    const cost3 = getCost('무저의 척추', crafts3);
    
    const totalVanillaCost = cost1 + cost2 + cost3;
    const netProfit = totalAlchemyRev - totalVanillaCost;

    const o14Bonus = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10][userStats.o14Lv] || 0;
    const totalShellChance = baseShellChance + o14Bonus + IMPRINT_ROD_SHELL_FIND_CHANCE[shellFindImprintLv];
    const mysteryShells = actions * totalShellChance * 0.5;

    const qtyBlack = mysteryShells * 0.01;
    const qtyPurple = mysteryShells * 0.02;
    const qtyPink = mysteryShells * 0.03;
    const qtyTurq = mysteryShells * 0.05;
    const qtyBlue = mysteryShells * 0.07;
    const qtyYellow = mysteryShells * 0.12;
    const qtyBroken = mysteryShells * 0.70;

    return { 
      actions, totalSeafood, rate1, rate2, rate3, qty1, qty2, qty3, baseDrop, o11Bonus, baseShellChance, o14Bonus, totalShellChance,
      totalRevenue: totalAlchemyRev, 
      totalAlchemyRev,
      crafts1, crafts2, crafts3, rev1, rev2, rev3,
      mysteryShells,
      qtyBlack, qtyPurple, qtyPink, qtyTurq, qtyBlue, qtyYellow, qtyBroken,
      rem1, rem2, rem3,
      extraShellsFromImprint, rouletteShells, expectedWhales, expectedRays, expectedExtraFish,
      shellFindImprintBonus: IMPRINT_ROD_SHELL_FIND_CHANCE[shellFindImprintLv],
      totalVanillaCost, netProfit
    };
  }, [userStats, toolImprints, cost]);

  const o16Bonus = [0, 0.05, 0.07, 0.09, 0.12, 0.15, 0.20, 0.25, 0.30][userStats.o16Lv] || 0;

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full relative transition-colors duration-300 animate-fade-in-up">
      
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] shadow-md dark:shadow-2xl relative flex flex-col lg:flex-row transition-colors items-stretch">
        <div className="w-full lg:w-1/3 bg-gray-50 dark:bg-[#111113] p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/5 flex flex-col transition-colors rounded-t-[2rem] lg:rounded-tr-none lg:rounded-l-[2rem]">
          <div className="mb-6 pb-5 border-b border-gray-200 dark:border-white/5 flex justify-between items-start transition-colors">
            <div>
              <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tight transition-colors">적용된 내 능력치</h3>
              <p className="text-[10px] md:text-[11px] font-bold text-gray-500 leading-relaxed">개인설정 보드에서 저장된 데이터가<br/>시뮬레이션에 자동 반영됩니다.</p>
            </div>
            <Link href="/settings" className="bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[10px] md:text-xs font-bold px-3 py-2 rounded-xl border border-gray-300 dark:border-transparent shadow-sm transition-colors whitespace-nowrap">설정 변경</Link>
          </div>
          
          <div className="space-y-5 flex-1 w-full">
            <div>
              <h4 className="text-[10px] font-black text-gray-400 mb-2 px-1 tracking-widest uppercase">기본 능력치</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 tracking-tight">가용 스태미나</span>
                  <span className="text-[11px] md:text-xs font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{userStats.stamina.toLocaleString()}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 tracking-tight">세이지 낚싯대</span>
                  <span className="text-[11px] md:text-xs font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">{userStats.rodLv > 0 ? `+${userStats.rodLv}` : '미장착'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-gray-400 mb-2 px-1 tracking-widest uppercase">전문가 스킬</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 tracking-tight">[심해 채집꾼]</span>
                  <span className="text-[11px] md:text-xs font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">Lv.{userStats.o11Lv}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 tracking-tight">[조개 좀 사조개]</span>
                  <span className="text-[11px] md:text-xs font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">Lv.{userStats.o12Lv}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 tracking-tight">[조개 무한리필]</span>
                  <span className="text-[11px] md:text-xs font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">Lv.{userStats.o14Lv}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">[프리미엄 한정가]</span>
                  <span className="text-[11px] md:text-xs font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Lv.{userStats.o16Lv}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-fuchsia-600 dark:text-fuchsia-400 tracking-tight">[별별별!]</span>
                  <span className="text-[11px] md:text-xs font-black text-fuchsia-600 dark:text-fuchsia-400 whitespace-nowrap">Lv.{userStats.o17Lv}</span>
                </div>
              </div>
            </div>

            {toolImprints?.['rod'] && Object.values(toolImprints['rod']).some(lv => lv > 0) && (
              <div>
                <h4 className="text-[10px] font-black text-gray-400 mb-2 px-1 tracking-widest uppercase">부여된 각인석</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(toolImprints['rod']).map(([key, lv]) => {
                    if (lv === 0) return null;
                    const name = ROD_IMPRINTS_MAP[key];
                    if (!name) return null;
                    return (
                      <div key={key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                        <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 tracking-tight truncate">[{name}]</span>
                        <span className="text-[11px] md:text-xs font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Lv.{lv}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {userStats.stamina === 3000 && userStats.rodLv === 0 && (
              <p className="text-[10px] text-rose-600 dark:text-rose-400/80 font-bold mt-4 text-center bg-rose-50 dark:bg-rose-500/10 py-2.5 rounded-xl border border-rose-200 dark:border-transparent transition-colors">능력치가 기본값입니다. 정확한 계산을 위해 개인설정에서 데이터를 최신화해주세요.</p>
            )}
          </div>
        </div>
        
        <div className="w-full lg:w-2/3 p-6 md:p-8 flex flex-col justify-between bg-white dark:bg-gradient-to-br dark:from-[#0a0a0a] dark:to-[#0f0f13] transition-colors rounded-b-[2rem] lg:rounded-bl-none lg:rounded-r-[2rem]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tight transition-colors">어패류 최적 사용 경로 분석</h3>
              <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 transition-colors">스태미나 효율 및 입력된 시세를 바탕으로 기댓값을 계산합니다.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="relative p-4 rounded-2xl border border-blue-400 shadow-md bg-blue-50 dark:bg-blue-950/20 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest text-white shadow-sm bg-blue-500">
                총 획득량
              </div>
              <p className="text-[10px] font-black text-gray-500 mt-1 mb-2 text-center tracking-tight truncate px-1">기본 어패류 (1~3성 합산)</p>
              <p className="text-lg md:text-xl font-black text-center tracking-tighter text-blue-600 dark:text-blue-400">
                {Math.round(calcResults.totalSeafood).toLocaleString()} <span className="text-xs font-bold">개</span>
              </p>
            </div>
            
            <div className="relative group cursor-help p-4 rounded-2xl border border-cyan-400 shadow-md bg-cyan-50 dark:bg-cyan-950/20 transition-all hover:bg-cyan-100 dark:hover:bg-cyan-900/30 z-10 hover:z-50">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest text-white shadow-sm bg-cyan-500">
                추가 획득
              </div>
              <p className="text-[10px] font-black text-gray-500 mt-1 mb-2 text-center tracking-tight truncate px-1">조개 획득 기댓값</p>
              <p className="text-lg md:text-xl font-black text-center tracking-tighter text-cyan-600 dark:text-cyan-400">
                {calcResults.mysteryShells.toLocaleString(undefined, {maximumFractionDigits:1})} <span className="text-xs font-bold">개</span>
              </p>
              
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[260px] bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/10 rounded-2xl p-4 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[999] shadow-2xl scale-95 group-hover:scale-100 origin-bottom">
                <p className="text-[11px] font-black text-gray-900 dark:text-white mb-2 pb-2 border-b border-gray-100 dark:border-white/10 text-center">상세 기댓값 (총 {calcResults.mysteryShells.toLocaleString(undefined, {maximumFractionDigits:1})}개)</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
                  <div className="flex justify-between items-center"><span className="text-[10px] flex items-center gap-1 font-bold text-gray-600 dark:text-gray-300"><img src={getImagePath('흑진주')||''} className="w-3 h-3" alt=""/>흑진주</span><span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400">{calcResults.qtyBlack.toLocaleString(undefined, {maximumFractionDigits:1})}</span></div>
                  <div className="flex justify-between items-center"><span className="text-[10px] flex items-center gap-1 font-bold text-gray-600 dark:text-gray-300"><img src={getImagePath('보라빛 진주')||''} className="w-3 h-3" alt=""/>보라빛 진주</span><span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400">{calcResults.qtyPurple.toLocaleString(undefined, {maximumFractionDigits:1})}</span></div>
                  <div className="flex justify-between items-center"><span className="text-[10px] flex items-center gap-1 font-bold text-gray-600 dark:text-gray-300"><img src={getImagePath('분홍빛 진주')||''} className="w-3 h-3" alt=""/>분홍빛 진주</span><span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400">{calcResults.qtyPink.toLocaleString(undefined, {maximumFractionDigits:1})}</span></div>
                  <div className="flex justify-between items-center"><span className="text-[10px] flex items-center gap-1 font-bold text-gray-600 dark:text-gray-300"><img src={getImagePath('청록빛 진주')||''} className="w-3 h-3" alt=""/>청록빛 진주</span><span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400">{calcResults.qtyTurq.toLocaleString(undefined, {maximumFractionDigits:1})}</span></div>
                  <div className="flex justify-between items-center"><span className="text-[10px] flex items-center gap-1 font-bold text-gray-600 dark:text-gray-300"><img src={getImagePath('푸른빛 진주')||''} className="w-3 h-3" alt=""/>푸른빛 진주</span><span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400">{calcResults.qtyBlue.toLocaleString(undefined, {maximumFractionDigits:1})}</span></div>
                  <div className="flex justify-between items-center"><span className="text-[10px] flex items-center gap-1 font-bold text-gray-600 dark:text-gray-300"><img src={getImagePath('노란빛 진주')||''} className="w-3 h-3" alt=""/>노란빛 진주</span><span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400">{calcResults.qtyYellow.toLocaleString(undefined, {maximumFractionDigits:1})}</span></div>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-gray-100 dark:border-white/10">
                  <span className="text-[10px] flex items-center gap-1 font-bold text-gray-500"><img src={getImagePath('깨진 조개껍데기')||''} className="w-3 h-3" alt=""/>깨진 조개껍데기</span>
                  <span className="text-[10px] font-black text-gray-500">{calcResults.qtyBroken.toLocaleString(undefined, {maximumFractionDigits:1})}</span>
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-[#111113] border-b border-r border-gray-200 dark:border-white/10 rotate-45"></div>
              </div>
            </div>

            <div className="relative p-4 rounded-2xl border border-indigo-400 shadow-md bg-indigo-50 dark:bg-indigo-950/20 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest text-white shadow-sm bg-indigo-500">
                추가 획득
              </div>
              <p className="text-[10px] font-black text-gray-500 mt-1 mb-2 text-center tracking-tight truncate px-1">정령 고래 조우</p>
              <p className="text-lg md:text-xl font-black text-center tracking-tighter text-indigo-600 dark:text-indigo-400">
                {calcResults.expectedWhales.toFixed(1)} <span className="text-xs font-bold">회</span>
              </p>
            </div>

            <div className="relative p-4 rounded-2xl border border-emerald-400 shadow-md bg-emerald-50 dark:bg-emerald-950/20 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest text-white shadow-sm bg-emerald-500">
                추가 획득
              </div>
              <p className="text-[10px] font-black text-gray-500 mt-1 mb-2 text-center tracking-tight truncate px-1">가오리 조우</p>
              <p className="text-lg md:text-xl font-black text-center tracking-tighter text-emerald-600 dark:text-emerald-400">
                {calcResults.expectedRays.toFixed(1)} <span className="text-xs font-bold">회</span>
              </p>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-transparent rounded-3xl p-6 md:p-8 flex flex-col xl:flex-row items-stretch gap-8 shadow-inner transition-colors mb-6">
            <div className="flex-1 flex flex-col">
              <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter transition-colors">최고 효율 연금품 제작</h4>
              <p className="text-[10px] md:text-[11px] font-bold text-indigo-700/70 dark:text-indigo-400 mb-6 transition-colors break-keep">획득한 어패류를 성급에 따라 분리하여 수익이 가장 높은 연금품으로 모두 제작합니다.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3 w-full">
                <div className="bg-white dark:bg-black/40 p-4 rounded-2xl border border-indigo-100 dark:border-transparent shadow-sm transition-colors flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10 shrink-0">
                        <img src={getImagePath('리바이던의 깃털') || ''} alt="리바이던의 깃털" className="w-5 h-5 object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-[9px] font-black mb-0.5 tracking-widest uppercase text-indigo-500">1성 어패류</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white transition-colors tracking-tight leading-tight truncate max-w-[100px] sm:max-w-[130px]">리바이던의 깃털</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-indigo-50 dark:border-white/5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-[10px] md:text-[11px] font-bold text-gray-500 transition-colors gap-1 sm:gap-0">
                      <span>소모 수량</span>
                      <span className="text-gray-900 dark:text-white font-black">{Math.floor(calcResults.qty1).toLocaleString()}개</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-[10px] md:text-[11px] font-bold text-gray-500 transition-colors gap-1 sm:gap-0">
                      <span>제작 수량</span>
                      <span className="text-xs md:text-sm font-black text-indigo-600 dark:text-indigo-400">{calcResults.crafts1.toLocaleString()}개</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-black/40 p-4 rounded-2xl border border-indigo-100 dark:border-transparent shadow-sm transition-colors flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10 shrink-0">
                        <img src={getImagePath('청해룡의 날개') || ''} alt="청해룡의 날개" className="w-5 h-5 object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-[9px] font-black mb-0.5 tracking-widest uppercase text-cyan-500">2성 어패류</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white transition-colors tracking-tight leading-tight truncate max-w-[100px] sm:max-w-[130px]">청해룡의 날개</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-indigo-50 dark:border-white/5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-[10px] md:text-[11px] font-bold text-gray-500 transition-colors gap-1 sm:gap-0">
                      <span>소모 수량</span>
                      <span className="text-gray-900 dark:text-white font-black">{Math.floor(calcResults.qty2).toLocaleString()}개</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-[10px] md:text-[11px] font-bold text-gray-500 transition-colors gap-1 sm:gap-0">
                      <span>제작 수량</span>
                      <span className="text-xs md:text-sm font-black text-indigo-600 dark:text-indigo-400">{calcResults.crafts2.toLocaleString()}개</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-black/40 p-4 rounded-2xl border border-indigo-100 dark:border-transparent shadow-sm transition-colors flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10 shrink-0">
                        <img src={getImagePath('무저의 척추') || ''} alt="무저의 척추" className="w-5 h-5 object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-[9px] font-black mb-0.5 tracking-widest uppercase text-emerald-500">3성 어패류</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white transition-colors tracking-tight leading-tight truncate max-w-[100px] sm:max-w-[130px]">무저의 척추</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-indigo-50 dark:border-white/5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-[10px] md:text-[11px] font-bold text-gray-500 transition-colors gap-1 sm:gap-0">
                      <span>소모 수량</span>
                      <span className="text-gray-900 dark:text-white font-black">{Math.floor(calcResults.qty3).toLocaleString()}개</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-[10px] md:text-[11px] font-bold text-gray-500 transition-colors gap-1 sm:gap-0">
                      <span>제작 수량</span>
                      <span className="text-xs md:text-sm font-black text-indigo-600 dark:text-indigo-400">{calcResults.crafts3.toLocaleString()}개</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-black border border-indigo-200 dark:border-transparent p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center min-w-[220px]">
              <p className="text-[11px] font-black text-gray-500 mb-1.5">연금품 총 수익</p>
              <p className="text-2xl lg:text-3xl font-black text-indigo-600 tracking-tighter">{calcResults.totalAlchemyRev.toLocaleString()} G</p>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-transparent rounded-[1.5rem] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors shadow-inner dark:shadow-none mb-6">
            <div>
              <p className="text-sm md:text-base font-black text-gray-900 dark:text-white mb-1 tracking-tight transition-colors">추천 경로: 일일 예상 순수익</p>
              <p className="text-[10px] md:text-[11px] font-bold text-gray-500 break-keep">
                ※ 개인설정에 입력된 단가를 바탕으로 바닐라 재료 매입 비용이 차감된 최종 순수익입니다.<br/>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] font-bold text-rose-500">바닐라 재료비: -{Math.round(calcResults.totalVanillaCost).toLocaleString()} G</span>
              <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 drop-shadow-sm tracking-tighter whitespace-nowrap">
                {Math.round(calcResults.netProfit).toLocaleString()} <span className="text-2xl text-indigo-500 font-black">G</span>
              </span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-black/30 rounded-xl p-4 border border-gray-200 dark:border-white/5 flex flex-wrap items-center gap-3 transition-colors">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-500 transition-colors">연금품 제작 후 남는 잉여 어패류:</span>
            <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-[#111113] border border-gray-200 dark:border-transparent px-2.5 py-1.5 rounded-lg shadow-sm transition-colors">1성 <span className="text-gray-900 dark:text-white font-black transition-colors ml-1">{calcResults.rem1}개</span></span>
            <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-[#111113] border border-gray-200 dark:border-transparent px-2.5 py-1.5 rounded-lg shadow-sm transition-colors">2성 <span className="text-gray-900 dark:text-white font-black transition-colors ml-1">{calcResults.rem2}개</span></span>
            <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-[#111113] border border-gray-200 dark:border-transparent px-2.5 py-1.5 rounded-lg shadow-sm transition-colors">3성 <span className="text-gray-900 dark:text-white font-black transition-colors ml-1">{calcResults.rem3}개</span></span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md dark:shadow-2xl transition-colors mt-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6 border-b border-gray-200 dark:border-white/5 pb-5 transition-colors">
          <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">NPC 연금품 고정 매입가</h3>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-transparent px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest transition-colors">프리미엄 한정가 적용</span>
            <span className="text-sm font-black text-gray-800 dark:text-gray-300 transition-colors">Lv.{userStats.o16Lv}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 flex-1">
          {OCEAN_FIXED_PRICES.map((item, idx) => {
            const buffedPrice = Math.ceil(item.base * (1 + o16Bonus));
            const imgPath = getImagePath(item.name);
            return (
              <div key={idx} className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-sm transition-colors">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-black/50 rounded-xl border border-gray-200 dark:border-transparent flex items-center justify-center overflow-hidden p-2 transition-colors shadow-inner">
                    {imgPath ? <img src={imgPath} alt={item.name} className="w-full h-full object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }}/> : <span className="text-[8px] text-gray-400 font-bold">IMG</span>}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm md:text-base font-black text-gray-900 dark:text-white tracking-tight transition-colors">{item.name}</p>
                    <p className="text-[10px] md:text-[11px] font-bold text-gray-500">기본가 {item.base.toLocaleString()}G</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg md:text-xl font-black text-emerald-600 dark:text-emerald-500 drop-shadow-sm transition-colors tracking-tight">{buffedPrice.toLocaleString()} <span className="text-sm font-bold">G</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md dark:shadow-2xl transition-colors mt-4">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-white/5 pb-4 transition-colors">
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">일일 수익 연산 로직 안내</h3>
        </div>
        <div className="flex flex-col gap-5">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> 1단계: 수중 어획 횟수 및 어패류 획득</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-bold leading-relaxed break-keep">
                총 스태미나를 15 단위로 나눈 값을 기준으로 기본 낚시 횟움을 산출합니다. 낚싯대 고유 드롭 수 × (1 + [심해 채집꾼] 보너스)를 기본으로 합니다.<br/>
                <strong className="text-blue-500 dark:text-blue-400 mt-1 block">각인석 보너스: 어패 행운, 어부 룰렛 효과가 기댓값에 추가 합산되어 최종 획득량을 증가시킵니다.</strong>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> 2단계: 조개 파밍</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-bold leading-relaxed break-keep">
                낚싯대 기본 확률에 [조개 무한리필] 스킬 보너스와 각인석(조개 탐색) 확률을 합산합니다. 획득 시 50% 확률로 조개를 얻으며, 진주 등 공예품은 연금품 수익 합산에서 제외됩니다.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> 연금품 제작</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-bold leading-relaxed break-keep">
                획득한 전체 어패류를 [별별별!] 스킬 보너스에 따라 1~3성으로 분배 후, 각 성급별로 가장 가치가 높은 최종 연금품(깃털, 날개, 척추)으로 모두 제작하여 수익을 도출합니다.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> 특수 각인 효과</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-bold leading-relaxed break-keep">
                물고기 행운, 정령 고래 조우, 가오리 인도 각인은 스태미나 횟수 기반으로 조우 기댓값이 별도로 산출되어 상단 요약 패널에 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}