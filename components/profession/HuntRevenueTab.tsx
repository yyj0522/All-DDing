'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { getImagePath } from '@/lib/professionData';

interface HuntRevenueTabProps {
  userStats: {
    stamina: number;
    swordLv: number;
    h2Lv: number;
    h5Lv: number;
    h6Lv: number;
    h12Lv: number;
    h13Lv: number;
    h14Lv: number;
    h15Lv: number;
  };
  toolImprints?: Record<string, Record<string, number>>;
}

const SWORD_TROPHY = [1, 2, 2, 2, 3, 3, 3, 4, 4, 6, 6, 7, 7, 8, 10];
const SWORD_STONE_CHANCE = [0.01, 0.03, 0.03, 0.05, 0.05, 0.07, 0.07, 0.10, 0.10, 0.15, 0.15, 0.20, 0.20, 0.25, 0.30];

const COMBO_MAX = [0, 5, 7, 10, 15, 20];
const COMBO_BONUS = [0, 0.03, 0.05, 0.10, 0.21, 0.40]; 

const H5_TROPHY_BONUS = [0, 0.03, 0.05, 0.07, 0.10, 0.15, 0.20, 0.30]; 
const H12_STONE_MULT = [0, 0.35, 0.40, 0.45, 0.50]; 
const H13_SPAWN_RATE = [0, 0.03, 0.07, 0.10]; 
const H14_CARNI_PRICE = [0, 0.05, 0.07, 0.10, 0.20, 0.30, 0.50]; 
const H15_CATCH_RATE = [0, 0.12, 0.15, 0.17, 0.20, 0.25, 0.30]; 

const CARNIVORE_BASE_AVG_VALUE = (26775 * 0.6) + (53550 * 0.3) + (114750 * 0.1); 

const IMPRINT_SWORD_LOOT_CHANCE = [0, 0.25, 0.50, 0.75, 1.00];
const IMPRINT_SWORD_PIECE_CHANCE = [0, 0.01, 0.03, 0.05];
const IMPRINT_SWORD_RESONANCE_CHANCE = [0, 0.005, 0.01, 0.015, 0.02, 0.03];
const IMPRINT_SWORD_BLACKHOLE_CHANCE = [0, 0.02, 0.04, 0.06, 0.08, 0.10];
const IMPRINT_SWORD_ROULETTE_CHANCE = [0, 0.01, 0.02, 0.03, 0.04, 0.05];

const SWORD_IMPRINTS_MAP: Record<string, string> = {
  'sword_power': '공격 강화',
  'sword_speed': '공격 가속',
  'sword_loot': '전리품 행운',
  'sword_piece': '조각 탐색',
  'sword_fast': '빠른 사냥꾼',
  'sword_track': '흔적 추적',
  'sword_resonance': '조각 공명',
  'sword_blackhole': '흡인 사냥',
  'sword_roulette': '사냥꾼 룰렛'
};

export default function HuntRevenueTab({ userStats, toolImprints }: HuntRevenueTabProps) {
  const [weakenBonus, setWeakenBonus] = useState<number>(40); 
  const [haggleRate, setHaggleRate] = useState<number>(10);

  const results = useMemo(() => {
    let totalKills = Math.floor(userStats.stamina / 10);
    const swordImprints = toolImprints?.['sword'] || {};

    const blackholeLv = swordImprints['sword_blackhole'] || 0;
    const blackholeChance = IMPRINT_SWORD_BLACKHOLE_CHANCE[blackholeLv];
    
    let simulatedStamina = userStats.stamina;
    let actualKills = 0;
    
    if (blackholeChance > 0) {
      let attempts = Math.floor(simulatedStamina / 10);
      actualKills = attempts;
    } else {
      actualKills = totalKills;
    }

    const baseTrophy = userStats.swordLv > 0 ? SWORD_TROPHY[userStats.swordLv - 1] : 1;
    const comboDropBonus = COMBO_BONUS[userStats.h2Lv] || 0;
    const h5Bonus = H5_TROPHY_BONUS[userStats.h5Lv] || 0;
    
    const lootImprintLv = swordImprints['sword_loot'] || 0;
    const extraLootChance = IMPRINT_SWORD_LOOT_CHANCE[lootImprintLv];
    const extraLootCount = actualKills * extraLootChance;

    const rouletteImprintLv = swordImprints['sword_roulette'] || 0;
    const rouletteChance = IMPRINT_SWORD_ROULETTE_CHANCE[rouletteImprintLv];
    const rouletteEncounters = actualKills * rouletteChance;
    const rouletteAvgTrophies = rouletteEncounters * ((3.5 * 5 * 0.9) + (3.5 * 10 * 0.1));

    const totalTrophyMultiplier = 1 + comboDropBonus + h5Bonus;
    const expectedTrophies = Math.floor((actualKills * baseTrophy * totalTrophyMultiplier) + extraLootCount + rouletteAvgTrophies);
    
    const craftableSouls = Math.floor(expectedTrophies / 15);
    const expectedContracts = Math.floor(craftableSouls / 2);
    const requiredMonsterHearts = craftableSouls * 8;

    const baseStoneChance = userStats.swordLv > 0 ? SWORD_STONE_CHANCE[userStats.swordLv - 1] : 0.01;
    const h12Bonus = H12_STONE_MULT[userStats.h12Lv] || 0;
    
    const pieceImprintLv = swordImprints['sword_piece'] || 0;
    const extraPieceChance = IMPRINT_SWORD_PIECE_CHANCE[pieceImprintLv];
    
    const resonanceImprintLv = swordImprints['sword_resonance'] || 0;
    const resonanceChance = IMPRINT_SWORD_RESONANCE_CHANCE[resonanceImprintLv];
    const resonanceAvgPieces = (actualKills * resonanceChance) * 3; 

    const expectedStonePieces = Math.floor((actualKills * (baseStoneChance + extraPieceChance) * (1 + h12Bonus)) + resonanceAvgPieces);
    const expectedStones = Math.floor(expectedStonePieces / 5);

    const carnivoreSpawnRate = H13_SPAWN_RATE[userStats.h13Lv] || 0;
    const carnivoreEncounters = actualKills * carnivoreSpawnRate;
    
    const baseCatchRate = 0.10;
    const h15Bonus = H15_CATCH_RATE[userStats.h15Lv] || 0;
    const finalCatchRate = Math.min(baseCatchRate + (weakenBonus / 100) + h15Bonus, 0.80);
    const expectedCaught = carnivoreEncounters * finalCatchRate;

    const boostedCarniPrice = CARNIVORE_BASE_AVG_VALUE * (1 + (H14_CARNI_PRICE[userStats.h14Lv] || 0));
    const haggleMultiplier = ((haggleRate / 100) * 1.075) + ((1 - (haggleRate / 100)) * 0.925);
    const totalGold = Math.floor(expectedCaught * boostedCarniPrice * haggleMultiplier);

    return { 
      totalKills: actualKills, expectedTrophies, craftableSouls, expectedContracts, requiredMonsterHearts,
      expectedStonePieces, expectedStones, carnivoreEncounters, expectedCaught, 
      totalGold, totalTrophyMultiplier, finalCatchRate 
    };
  }, [userStats, weakenBonus, haggleRate, toolImprints]);

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full relative transition-colors duration-300 animate-fade-in-up">
      
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md dark:shadow-2xl transition-colors">
        <div className="flex items-center gap-2 mb-6 px-1">
          <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">수익 계산기 환경 변수</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 px-1">
          <div className="flex flex-col">
            <div className="flex justify-between items-end mb-4">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200 transition-colors">육식동물 체력 깎기 보너스</label>
              <div className="bg-rose-50 dark:bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-200 dark:border-rose-500/20 transition-colors">
                <span className="text-rose-600 dark:text-rose-400 font-black text-sm">+{weakenBonus}%</span>
              </div>
            </div>
            <input 
              type="range" min="0" max="40" step="5"
              value={weakenBonus} onChange={(e) => setWeakenBonus(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:accent-rose-600 transition-colors mb-3"
            />
            <p className="text-[11px] text-gray-500 dark:text-gray-400 break-keep font-bold leading-relaxed transition-colors">
              일반 무기로 육식동물의 체력을 깎아 덫 성공 확률을 높이는 컨트롤 수치입니다. (최대 +40% 인정)
            </p>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 block mb-4 transition-colors">
              수렵꾼 흥정 성공 확률
            </label>
            <div className="relative mb-3">
              <select 
                value={haggleRate} onChange={(e) => setHaggleRate(Number(e.target.value))}
                className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-transparent rounded-xl px-4 py-3 text-sm font-black text-gray-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-colors shadow-sm"
              >
                {[10, 15, 20, 25, 30, 35, 40, 50, 60, 70].map(rate => (
                  <option key={rate} value={rate} className="font-bold">호감도 기반 {rate}%</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400 transition-colors">
                ▼
              </div>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 break-keep font-bold leading-relaxed transition-colors">
              성공 시 +5~10%, 실패 시 -5~10%의 변동폭을 기댓값으로 환산하여 골드에 자동 적용합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] shadow-md dark:shadow-2xl relative overflow-hidden flex flex-col lg:flex-row transition-colors items-stretch">
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
                  <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 tracking-tight">세이지 대검</span>
                  <span className="text-[11px] md:text-xs font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">{userStats.swordLv > 0 ? `+${userStats.swordLv}` : '미장착'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-gray-400 mb-2 px-1 tracking-widest uppercase">전문가 스킬</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 tracking-tight">[끝까지 간다!]</span>
                  <span className="text-[11px] md:text-xs font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">Lv.{userStats.h2Lv}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 tracking-tight">[남들과는 다르게]</span>
                  <span className="text-[11px] md:text-xs font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">Lv.{userStats.h5Lv}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 tracking-tight">[값어치 증명]</span>
                  <span className="text-[11px] md:text-xs font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">Lv.{userStats.h6Lv}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-purple-600 dark:text-purple-400 tracking-tight">[검증된 방식]</span>
                  <span className="text-[11px] md:text-xs font-black text-purple-600 dark:text-purple-400 whitespace-nowrap">Lv.{userStats.h12Lv}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-amber-600 dark:text-amber-400 tracking-tight">[피 냄새가 나]</span>
                  <span className="text-[11px] md:text-xs font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">Lv.{userStats.h13Lv}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-amber-600 dark:text-amber-400 tracking-tight">[상태 좋네!]</span>
                  <span className="text-[11px] md:text-xs font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">Lv.{userStats.h14Lv}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0 col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-2">
                  <span className="text-[10px] md:text-[11px] font-bold text-amber-600 dark:text-amber-400 tracking-tight">[넌 이제 내 거야!]</span>
                  <span className="text-[11px] md:text-xs font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">Lv.{userStats.h15Lv}</span>
                </div>
              </div>
            </div>

            {toolImprints?.['sword'] && Object.values(toolImprints['sword']).some(lv => lv > 0) && (
              <div>
                <h4 className="text-[10px] font-black text-gray-400 mb-2 px-1 tracking-widest uppercase">부여된 각인석</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(toolImprints['sword']).map(([key, lv]) => {
                    if (lv === 0) return null;
                    const name = SWORD_IMPRINTS_MAP[key];
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
            
            {userStats.stamina === 3000 && userStats.swordLv === 0 && (
              <p className="text-[10px] text-rose-600 dark:text-rose-400/80 font-bold mt-4 text-center bg-rose-50 dark:bg-rose-500/10 py-2.5 rounded-xl border border-rose-200 dark:border-transparent transition-colors">능력치가 기본값입니다. 정확한 계산을 위해 개인설정에서 데이터를 최신화해주세요.</p>
            )}
          </div>
        </div>
        
        <div className="w-full lg:w-2/3 p-6 md:p-8 flex flex-col justify-between bg-white dark:bg-gradient-to-br dark:from-[#0a0a0a] dark:to-[#0f0f13] transition-colors rounded-b-[2rem] lg:rounded-bl-none lg:rounded-r-[2rem]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tight transition-colors">일일 사냥 획득 및 수익 분석</h3>
              <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 transition-colors">스태미나 효율 및 입력된 환경 변수를 바탕으로 기댓값을 계산합니다.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="relative p-4 rounded-2xl border border-blue-400 shadow-md bg-blue-50 dark:bg-blue-950/20 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest text-white shadow-sm bg-blue-500">
                처치
              </div>
              <p className="text-[10px] font-black text-gray-500 mt-1 mb-2 text-center tracking-tight truncate px-1">초식동물 총 처치 수</p>
              <p className="text-lg md:text-xl font-black text-center tracking-tighter text-blue-600 dark:text-blue-400">
                {results.totalKills.toLocaleString()} <span className="text-xs font-bold">마리</span>
              </p>
            </div>
            
            <div className="relative p-4 rounded-2xl border border-cyan-400 shadow-md bg-cyan-50 dark:bg-cyan-950/20 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest text-white shadow-sm bg-cyan-500">
                획득
              </div>
              <p className="text-[10px] font-black text-gray-500 mt-1 mb-2 text-center tracking-tight truncate px-1">획득 예상 전리품</p>
              <div className="flex flex-col items-center">
                <p className="text-lg md:text-xl font-black text-center tracking-tighter text-cyan-600 dark:text-cyan-400">
                  {results.expectedTrophies.toLocaleString()} <span className="text-xs font-bold">개</span>
                </p>
                <p className="text-[9px] text-cyan-500 font-bold mt-0.5">배율 {(results.totalTrophyMultiplier * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div className="relative p-4 rounded-2xl border border-indigo-400 shadow-md bg-indigo-50 dark:bg-indigo-950/20 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest text-white shadow-sm bg-indigo-500">
                획득
              </div>
              <p className="text-[10px] font-black text-gray-500 mt-1 mb-2 text-center tracking-tight truncate px-1">수상한 각인석 조각</p>
              <p className="text-lg md:text-xl font-black text-center tracking-tighter text-indigo-600 dark:text-indigo-400">
                {results.expectedStonePieces.toLocaleString()} <span className="text-xs font-bold">개</span>
              </p>
            </div>

            <div className="relative p-4 rounded-2xl border border-emerald-400 shadow-md bg-emerald-50 dark:bg-emerald-950/20 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest text-white shadow-sm bg-emerald-500 whitespace-nowrap">
                포획 기댓값
              </div>
              <p className="text-[10px] font-black text-gray-500 mt-1 mb-2 text-center tracking-tight truncate px-1">육식동물 조우</p>
              <div className="flex flex-col items-center">
                <p className="text-lg md:text-xl font-black text-center tracking-tighter text-emerald-600 dark:text-emerald-400">
                  {results.carnivoreEncounters.toFixed(1)} <span className="text-xs font-bold">마리</span>
                </p>
                <p className="text-[9px] text-emerald-500 font-bold mt-0.5">포획률 {(results.finalCatchRate * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-transparent rounded-3xl p-6 md:p-8 flex flex-col xl:flex-row items-stretch gap-8 shadow-inner transition-colors mb-6">
            <div className="flex-1 flex flex-col">
              <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter transition-colors">획득 및 소모 연산결과</h4>
              <p className="text-[10px] md:text-[11px] font-bold text-indigo-700/70 dark:text-indigo-400 mb-6 transition-colors break-keep">전리품과 각인석 조각을 영혼과 완제품으로 변환한 최종 수량입니다.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                <div className="bg-white dark:bg-black/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-500/20 shadow-sm transition-colors flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10 shrink-0">
                        <img src={getImagePath('수상한 각인석') || ''} alt="수상한 각인석" className="w-5 h-5 object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-[9px] font-black mb-0.5 tracking-widest uppercase text-purple-600 dark:text-purple-400">완제품 획득</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white transition-colors tracking-tight leading-tight truncate">수상한 각인석</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-purple-50 dark:border-white/5">
                    <div className="flex justify-between items-center text-[10px] md:text-[11px] font-bold text-gray-500 transition-colors">
                      <span>최종 수량</span>
                      <span className="text-xs md:text-sm font-black text-purple-700 dark:text-purple-400">{results.expectedStones.toLocaleString()}개</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-black/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 shadow-sm transition-colors flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10 shrink-0">
                        <img src={getImagePath('정복의 영혼 계약서') || ''} alt="영혼의 계약서" className="w-5 h-5 object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-[9px] font-black mb-0.5 tracking-widest uppercase text-emerald-600 dark:text-emerald-400">완제품 획득</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white transition-colors tracking-tight leading-tight truncate">영혼의 계약서</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-emerald-50 dark:border-white/5">
                    <div className="flex justify-between items-center text-[10px] md:text-[11px] font-bold text-gray-500 transition-colors">
                      <span>최종 수량</span>
                      <span className="text-xs md:text-sm font-black text-emerald-700 dark:text-emerald-400">{results.expectedContracts.toLocaleString()}장</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-black/40 p-4 rounded-2xl border border-rose-200 dark:border-rose-500/20 shadow-sm transition-colors flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10 shrink-0">
                        <img src={getImagePath('좀비의 심장') || ''} alt="몬스터 심장" className="w-5 h-5 object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-[9px] font-black mb-0.5 tracking-widest uppercase text-rose-600 dark:text-rose-400">필요 재료</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white transition-colors tracking-tight leading-tight truncate max-w-[100px] sm:max-w-[130px]">소모 몬스터 심장</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-rose-50 dark:border-white/5">
                    <div className="flex justify-between items-center text-[10px] md:text-[11px] font-bold text-gray-500 transition-colors">
                      <span>필요 수량</span>
                      <span className="text-xs md:text-sm font-black text-rose-700 dark:text-rose-400">{results.requiredMonsterHearts.toLocaleString()}개</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-black border border-indigo-200 dark:border-transparent p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center min-w-[220px]">
              <p className="text-[11px] font-black text-gray-500 mb-1.5">제작 영혼의 기운</p>
              <p className="text-2xl lg:text-3xl font-black text-indigo-600 tracking-tighter">{results.craftableSouls.toLocaleString()} 개</p>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-transparent rounded-[1.5rem] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors shadow-inner dark:shadow-none mb-6">
            <div>
              <p className="text-sm md:text-base font-black text-gray-900 dark:text-white mb-1 tracking-tight transition-colors">육식동물 판매 최종 수익</p>
              <p className="text-[10px] md:text-[11px] font-bold text-gray-500 break-keep">
                ※ 스폰 기댓값, 흥정 확률, 포획물 상태(쇠약/평범/건강 비율) 기댓값을 모두 연산한 순수 골드 수익입니다.<br/>
              </p>
            </div>
            <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 dark:from-rose-400 dark:to-orange-400 drop-shadow-sm tracking-tighter whitespace-nowrap">
              {results.totalGold.toLocaleString()} <span className="text-2xl text-orange-500 font-black">G</span>
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md dark:shadow-2xl transition-colors mt-4">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-white/5 pb-4 transition-colors">
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">일일 수익 연산 로직 안내</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> 1단계: 초식동물 처치 및 전리품 획득</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-bold leading-relaxed break-keep">
                총 스태미나를 10 단위로 나눈 값을 기준으로 기본 처치 수를 산출합니다. 대검 고유 드랍 수 × (1 + [끝까지 간다!] + [남들과는 다르게]) 배율을 적용합니다.<br/>
                <strong className="text-rose-500 dark:text-rose-400 mt-1 block">각인석 보너스: 전리품 행운, 사냥꾼 룰렛 효과가 기댓값에 추가 합산되어 최종 전리품을 증가시킵니다.</strong>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> 2단계: 영혼석 및 계약서 가공</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-bold leading-relaxed break-keep">
                전리품 15개당 1개의 영혼, 영혼 2개당 1장의 계약서를 산출합니다. 계약서 1장당 16개의 몬스터 심장이 요구되며 필요 심장 수를 안내합니다.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> 각인석 조각 계산</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-bold leading-relaxed break-keep">
                대검 고유 확률에 [검증된 방식] 스킬 배율을 적용하고, 추가로 각인석(조각 탐색, 조각 공명) 효과를 합산하여 획득한 조각 5개를 완제품 1개로 환산합니다.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> 육식동물 판매 수익</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-bold leading-relaxed break-keep">
                처치 수 × [피 냄새가 나] 스킬 확률로 조우 기댓값을 산출합니다. 육식동물 상태 평균 가치에 [상태 좋네!] 버프 및 흥정 기댓값을 곱하여 산출합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}