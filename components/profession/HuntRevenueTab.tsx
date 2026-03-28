'use client';

import { useState, useMemo } from 'react';
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

const CARNIVORE_BASE_AVG_VALUE = (31500 * 0.6) + (63000 * 0.3) + (135000 * 0.1); 

export default function HuntRevenueTab({ userStats }: HuntRevenueTabProps) {
  const [weakenBonus, setWeakenBonus] = useState<number>(40); 
  const [haggleRate, setHaggleRate] = useState<number>(10);

  const results = useMemo(() => {
    const totalKills = Math.floor(userStats.stamina / 10);

    const baseTrophy = userStats.swordLv > 0 ? SWORD_TROPHY[userStats.swordLv - 1] : 1;
    const comboDropBonus = COMBO_BONUS[userStats.h2Lv] || 0;
    const h5Bonus = H5_TROPHY_BONUS[userStats.h5Lv] || 0;
    const totalTrophyMultiplier = 1 + comboDropBonus + h5Bonus;
    const expectedTrophies = Math.floor(totalKills * baseTrophy * totalTrophyMultiplier);
    
    const craftableSouls = Math.floor(expectedTrophies / 10);
    const expectedContracts = Math.floor(craftableSouls / 2);
    const requiredMonsterHearts = craftableSouls * 8;

    const baseStoneChance = userStats.swordLv > 0 ? SWORD_STONE_CHANCE[userStats.swordLv - 1] : 0.01;
    const h12Bonus = H12_STONE_MULT[userStats.h12Lv] || 0;
    const expectedStonePieces = Math.floor(totalKills * baseStoneChance * (1 + h12Bonus));
    const expectedStones = Math.floor(expectedStonePieces / 5);

    const carnivoreSpawnRate = H13_SPAWN_RATE[userStats.h13Lv] || 0;
    const carnivoreEncounters = totalKills * carnivoreSpawnRate;
    
    const baseCatchRate = 0.10;
    const h15Bonus = H15_CATCH_RATE[userStats.h15Lv] || 0;
    const finalCatchRate = Math.min(baseCatchRate + (weakenBonus / 100) + h15Bonus, 0.80);
    const expectedCaught = carnivoreEncounters * finalCatchRate;

    const boostedCarniPrice = CARNIVORE_BASE_AVG_VALUE * (1 + (H14_CARNI_PRICE[userStats.h14Lv] || 0));
    const haggleMultiplier = ((haggleRate / 100) * 1.075) + ((1 - (haggleRate / 100)) * 0.925);
    const totalGold = Math.floor(expectedCaught * boostedCarniPrice * haggleMultiplier);

    return { 
      totalKills, expectedTrophies, craftableSouls, expectedContracts, requiredMonsterHearts,
      expectedStonePieces, expectedStones, carnivoreEncounters, expectedCaught, 
      totalGold, totalTrophyMultiplier, finalCatchRate 
    };
  }, [userStats, weakenBonus, haggleRate]);

  return (
    <div className="w-full animate-fade-in space-y-6">
      
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm transition-colors">
        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 tracking-tight">적용 중인 내 사냥 스펙</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-gray-500 font-bold mb-1">대검 강화</span>
            <span className="text-sm font-black text-gray-900 dark:text-white">{userStats.swordLv > 0 ? `+${userStats.swordLv}` : '미장착'}</span>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-gray-500 font-bold mb-1">끝까지 간다!</span>
            <span className="text-sm font-black text-rose-600 dark:text-rose-400">Lv.{userStats.h2Lv}</span>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-gray-500 font-bold mb-1">남들과는 다르게</span>
            <span className="text-sm font-black text-rose-600 dark:text-rose-400">Lv.{userStats.h5Lv}</span>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-gray-500 font-bold mb-1">값어치 증명</span>
            <span className="text-sm font-black text-rose-600 dark:text-rose-400">Lv.{userStats.h6Lv}</span>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-gray-500 font-bold mb-1">검증된 방식</span>
            <span className="text-sm font-black text-rose-600 dark:text-rose-400">Lv.{userStats.h12Lv}</span>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-gray-500 font-bold mb-1">피 냄새가 나</span>
            <span className="text-sm font-black text-rose-600 dark:text-rose-400">Lv.{userStats.h13Lv}</span>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-gray-500 font-bold mb-1">상태 좋네!</span>
            <span className="text-sm font-black text-rose-600 dark:text-rose-400">Lv.{userStats.h14Lv}</span>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-gray-500 font-bold mb-1">넌 이제 내 거야!</span>
            <span className="text-sm font-black text-rose-600 dark:text-rose-400">Lv.{userStats.h15Lv}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm transition-colors">
        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 tracking-tight">수익 계산기 환경 변수</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex justify-between">
              <span>육식동물 체력 깎기 보너스</span>
              <span className="text-rose-600 dark:text-rose-400 font-black">+{weakenBonus}%</span>
            </label>
            <input 
              type="range" min="0" max="40" step="5"
              value={weakenBonus} onChange={(e) => setWeakenBonus(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
            <p className="text-[11px] text-gray-500 break-keep font-medium leading-relaxed">
              일반 무기로 육식동물의 체력을 깎아 덫 성공 확률을 높이는 컨트롤 수치입니다. (최대 +40% 인정)
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 block">
              수렵꾼 흥정 성공 확률
            </label>
            <select 
              value={haggleRate} onChange={(e) => setHaggleRate(Number(e.target.value))}
              className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
            >
              {[10, 15, 20, 25, 30, 35, 40, 50, 60, 70].map(rate => (
                <option key={rate} value={rate}>호감도 기반 {rate}%</option>
              ))}
            </select>
            <p className="text-[11px] text-gray-500 break-keep font-medium leading-relaxed">
              성공 시 +5~10%, 실패 시 -5~10%의 변동폭을 기댓값으로 환산하여 골드에 자동 적용합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mb-3">초식동물 총 처치 수</span>
          <span className="text-2xl font-black text-gray-900 dark:text-white">{results.totalKills.toLocaleString()}</span>
          <span className="text-[10px] text-gray-400 mt-1">마리 (스태미나 10 기준)</span>
        </div>
        
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mb-3">획득 예상 전리품</span>
          <img src={getImagePath('사슴의 뿔') || ''} alt="전리품" className="w-8 h-8 mb-2 object-contain drop-shadow-sm" />
          <span className="text-xl font-black text-gray-900 dark:text-white">{results.expectedTrophies.toLocaleString()}</span>
          <span className="text-[10px] text-gray-400 mt-1">개 (배율 {(results.totalTrophyMultiplier * 100).toFixed(0)}%)</span>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mb-3">수상한 각인석 조각</span>
          <img src={getImagePath('수상한 각인석 조각') || ''} alt="각인석 조각" className="w-8 h-8 mb-2 object-contain drop-shadow-sm" />
          <span className="text-xl font-black text-gray-900 dark:text-white">{results.expectedStonePieces.toLocaleString()}</span>
          <span className="text-[10px] text-gray-400 mt-1">개</span>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mb-3">육식동물 조우 기댓값</span>
          <img src={getImagePath('육식 동물 덫') || ''} alt="덫" className="w-8 h-8 mb-2 object-contain drop-shadow-sm" />
          <span className="text-xl font-black text-gray-900 dark:text-white">{results.carnivoreEncounters.toFixed(1)}</span>
          <span className="text-[10px] text-gray-400 mt-1">마리 (포획률 {(results.finalCatchRate * 100).toFixed(0)}%)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-500/20 p-6 rounded-2xl flex items-center justify-between shadow-sm transition-colors">
          <div className="flex flex-col">
            <span className="text-xs text-rose-700 dark:text-rose-400 font-bold mb-1">수상한 각인석</span>
            <span className="text-2xl font-black text-rose-900 dark:text-white">{results.expectedStones.toLocaleString()} <span className="text-sm font-bold text-rose-600">개</span></span>
          </div>
          <img src={getImagePath('수상한 각인석') || ''} alt="수상한 각인석" className="w-12 h-12 object-contain drop-shadow-sm opacity-80" />
        </div>

        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-500/20 p-6 rounded-2xl flex items-center justify-between shadow-sm transition-colors">
          <div className="flex flex-col">
            <span className="text-xs text-rose-700 dark:text-rose-400 font-bold mb-1">영혼의 계약서</span>
            <span className="text-2xl font-black text-rose-900 dark:text-white">{results.expectedContracts.toLocaleString()} <span className="text-sm font-bold text-rose-600">장</span></span>
          </div>
          <img src={getImagePath('번영의 영혼 계약서') || ''} alt="계약서" className="w-12 h-12 object-contain drop-shadow-sm opacity-80" />
        </div>

        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-500/20 p-6 rounded-2xl flex items-center justify-between shadow-sm transition-colors">
          <div className="flex flex-col">
            <span className="text-xs text-rose-700 dark:text-rose-400 font-bold mb-1">소모 몬스터 심장</span>
            <span className="text-2xl font-black text-rose-900 dark:text-white">{results.requiredMonsterHearts.toLocaleString()} <span className="text-sm font-bold text-rose-600">개</span></span>
          </div>
          <img src={getImagePath('좀비의 심장') || ''} alt="몬스터 심장" className="w-12 h-12 object-contain drop-shadow-sm opacity-80" />
        </div>
      </div>

      <div className="bg-gray-900 dark:bg-[#111] p-8 md:p-10 rounded-[2rem] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-800 dark:border-white/10 transition-colors">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-lg md:text-xl font-black mb-2 tracking-tight text-white">육식동물 판매 최종 수익</h3>
          <p className="text-gray-400 text-xs md:text-sm font-medium leading-relaxed break-keep max-w-sm">
            스폰 기댓값, 흥정 확률, 포획물 상태(쇠약/평범/건강 비율) 기댓값을 모두 연산한 순수 골드 수익입니다.
          </p>
        </div>
        <div className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 drop-shadow-sm">
          {results.totalGold.toLocaleString()} <span className="text-2xl font-bold text-rose-400">G</span>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-xs text-gray-600 dark:text-gray-400 font-medium leading-loose break-keep transition-colors">
        <p className="font-bold text-gray-900 dark:text-gray-300 mb-2">연산 로직 안내</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-gray-700 dark:text-gray-300">초식동물:</strong> 총 스태미나를 10 단위로 나눈 값을 기준으로 기본 처치 수를 산출합니다. (스태미나 20 소모 개체는 2마리 분량으로 취급)</li>
          <li><strong className="text-gray-700 dark:text-gray-300">전리품 및 계약서:</strong> 대검 고유 드랍 수 × (1 + [끝까지 간다!] 보너스 + [남들과는 다르게] 보너스) 배율을 적용합니다. 전리품 10개당 1개의 영혼, 영혼 2개당 1장의 계약서를 산출합니다. 계약서 1장(영혼 2개)당 총 16개의 몬스터 심장이 요구됩니다.</li>
          <li><strong className="text-gray-700 dark:text-gray-300">각인석:</strong> 대검 고유 확률에 [검증된 방식] 스킬 배율을 적용하여 획득한 각인석 조각 5개를 완제품 1개로 환산합니다.</li>
          <li><strong className="text-gray-700 dark:text-gray-300">육식동물 판매:</strong> 초식동물 처치 수 × [피 냄새가 나] 스킬 확률로 조우 기댓값을 산출합니다. 상태 비율 평균 가치(51,300G)에 [상태 좋네!] 버프 및 흥정 기댓값을 곱하여 산출합니다.</li>
        </ul>
      </div>

    </div>
  );
}