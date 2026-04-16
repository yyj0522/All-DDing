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

const CARNIVORE_BASE_AVG_VALUE = (26775 * 0.6) + (53550 * 0.3) + (114750 * 0.1); 

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
    
    const craftableSouls = Math.floor(expectedTrophies / 15);
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

  const activeSpecs = [
    { name: '대검 강화', val: userStats.swordLv > 0 ? `+${userStats.swordLv}` : '미장착', isLv: false },
    { name: '끝까지 간다!', val: userStats.h2Lv, isLv: true },
    { name: '남들과는 다르게', val: userStats.h5Lv, isLv: true },
    { name: '값어치 증명', val: userStats.h6Lv, isLv: true },
    { name: '검증된 방식', val: userStats.h12Lv, isLv: true },
    { name: '피 냄새가 나', val: userStats.h13Lv, isLv: true },
    { name: '상태 좋네!', val: userStats.h14Lv, isLv: true },
    { name: '넌 이제 내 거야!', val: userStats.h15Lv, isLv: true },
  ];

  return (
    <div className="w-full animate-fade-in space-y-6 md:space-y-8 transition-colors duration-300">
      
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-5 md:p-6 shadow-md dark:shadow-2xl transition-colors">
        <div className="flex items-center gap-2 mb-4 md:mb-5 px-1">
          <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight transition-colors">적용 중인 내 사냥 스펙</h3>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          {activeSpecs.map((spec, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-100 dark:bg-[#111113] border border-gray-300 dark:border-transparent rounded-xl px-3 py-2 shadow-sm transition-colors">
              <span className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 font-bold whitespace-nowrap">{spec.name}</span>
              <span className={`text-xs md:text-sm font-black ${spec.val === '미장착' || spec.val === 0 ? 'text-gray-400 dark:text-gray-600' : 'text-rose-600 dark:text-rose-400'} whitespace-nowrap transition-colors`}>
                {spec.isLv && spec.val !== 0 ? 'Lv.' : ''}{spec.val}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md dark:shadow-2xl transition-colors">
        <div className="flex items-center gap-2 mb-6 px-1">
          <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight transition-colors">수익 계산기 환경 변수</h3>
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
              </div>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 break-keep font-bold leading-relaxed transition-colors">
              성공 시 +5~10%, 실패 시 -5~10%의 변동폭을 기댓값으로 환산하여 골드에 자동 적용합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {[
          { label: '초식동물 총 처치 수', val: results.totalKills, unit: '마리 (스태미나 10 기준)', img: '사슴의 뿔', sub: null, color: 'text-gray-900 dark:text-white' },
          { label: '획득 예상 전리품', val: results.expectedTrophies, unit: `개 (배율 ${(results.totalTrophyMultiplier * 100).toFixed(0)}%)`, img: '사슴의 뿔', sub: null, color: 'text-rose-600 dark:text-rose-400' },
          { label: '수상한 각인석 조각', val: results.expectedStonePieces, unit: '개', img: '수상한 각인석 조각', sub: null, color: 'text-purple-600 dark:text-purple-400' },
          { label: '육식동물 조우 기댓값', val: results.carnivoreEncounters.toFixed(1), unit: `마리 (포획률 ${(results.finalCatchRate * 100).toFixed(0)}%)`, img: '육식 동물 덫', sub: null, color: 'text-amber-600 dark:text-amber-400' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent p-5 md:p-6 rounded-[1.5rem] flex flex-col items-center text-center shadow-sm hover:shadow-md dark:shadow-2xl transition-all duration-300 group">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mb-4 tracking-tight transition-colors">{stat.label}</span>
            <div className="w-12 h-12 bg-gray-50 dark:bg-[#111113] rounded-2xl border border-gray-200 dark:border-transparent flex items-center justify-center p-2.5 mb-3 group-hover:scale-110 transition-transform shadow-inner">
              <img src={getImagePath(stat.img) || ''} alt={stat.img} className="w-full h-full object-contain drop-shadow-sm" style={{imageRendering: 'pixelated'}} />
            </div>
            <span className={`text-2xl font-black ${stat.color} tracking-tight transition-colors`}>{typeof stat.val === 'number' ? stat.val.toLocaleString() : stat.val}</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold mt-1.5 transition-colors">{stat.unit}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {[
          { label: '수상한 각인석', val: results.expectedStones, unit: '개', img: '수상한 각인석', bg: 'bg-purple-50 dark:bg-purple-900/10', border: 'border-purple-200 dark:border-purple-500/20', text: 'text-purple-900 dark:text-white', subText: 'text-purple-700 dark:text-purple-400' },
          { label: '영혼의 계약서', val: results.expectedContracts, unit: '장', img: '번영의 영혼 계약서', bg: 'bg-emerald-50 dark:bg-emerald-900/10', border: 'border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-900 dark:text-white', subText: 'text-emerald-700 dark:text-emerald-400' },
          { label: '소모 몬스터 심장', val: results.requiredMonsterHearts, unit: '개', img: '좀비의 심장', bg: 'bg-rose-50 dark:bg-rose-900/10', border: 'border-rose-200 dark:border-rose-500/20', text: 'text-rose-900 dark:text-white', subText: 'text-rose-700 dark:text-rose-400' }
        ].map((item, i) => (
          <div key={i} className={`${item.bg} border ${item.border} p-5 md:p-6 rounded-[1.5rem] flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300`}>
            <div className="flex flex-col">
              <span className={`text-[11px] md:text-xs ${item.subText} font-black mb-1.5 tracking-tight transition-colors`}>{item.label}</span>
              <span className={`text-2xl md:text-3xl font-black ${item.text} tracking-tight transition-colors`}>
                {item.val.toLocaleString()} <span className={`text-sm font-black ${item.subText} ml-0.5`}>{item.unit}</span>
              </span>
            </div>
            <div className="w-14 h-14 bg-white/50 dark:bg-black/20 rounded-2xl p-2.5 flex items-center justify-center border border-white/50 dark:border-white/5 shadow-inner">
              <img src={getImagePath(item.img) || ''} alt={item.label} className="w-full h-full object-contain drop-shadow-md" style={{imageRendering: 'pixelated'}} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-[#1a0f12] dark:to-[#170e0a] p-8 md:p-10 rounded-[2rem] border border-rose-200 dark:border-rose-500/20 shadow-md dark:shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 transition-colors">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-xl md:text-2xl font-black mb-2 md:mb-3 tracking-tight text-gray-900 dark:text-white transition-colors">육식동물 판매 최종 수익</h3>
          <p className="text-gray-600 dark:text-gray-400 text-[11px] md:text-xs font-bold leading-relaxed break-keep max-w-sm transition-colors">
            스폰 기댓값, 흥정 확률, 포획물 상태(쇠약/평범/건강 비율) 기댓값을 모두 연산한 순수 골드 수익입니다.
          </p>
        </div>
        <div className="bg-white dark:bg-[#050505] border border-rose-100 dark:border-rose-500/30 px-8 py-5 rounded-[1.5rem] shadow-sm dark:shadow-inner flex items-baseline gap-2 transition-colors">
          <span className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 drop-shadow-sm">
            {results.totalGold.toLocaleString()}
          </span>
          <span className="text-2xl md:text-3xl font-black text-rose-500 dark:text-rose-400 transition-colors">G</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-sm dark:shadow-2xl transition-colors">
        <div className="flex items-center gap-2 mb-4 px-1">
          <p className="font-black text-gray-900 dark:text-white transition-colors">연산 로직 안내</p>
        </div>
        <ul className="space-y-3 pl-2">
          {[
            { t: '초식동물', d: '총 스태미나를 10 단위로 나눈 값을 기준으로 기본 처치 수를 산출합니다. (스태미나 20 소모 개체는 2마리 분량으로 취급)' },
            { t: '전리품 및 계약서', d: '대검 고유 드랍 수 × (1 + [끝까지 간다!] 보너스 + [남들과는 다르게] 보너스) 배율을 적용합니다. 전리품 15개당 1개의 영혼, 영혼 2개당 1장의 계약서를 산출합니다. 계약서 1장(영혼 2개)당 총 16개의 몬스터 심장이 요구됩니다.' },
            { t: '각인석', d: '대검 고유 확률에 [검증된 방식] 스킬 배율을 적용하여 획득한 각인석 조각 5개를 완제품 1개로 환산합니다.' },
            { t: '육식동물 판매', d: '초식동물 처치 수 × [피 냄새가 나] 스킬 확률로 조우 기댓값을 산출합니다. 상태 비율 평균 가치(43,605G)에 [상태 좋네!] 버프 및 흥정 기댓값을 곱하여 산출합니다.' }
          ].map((item, i) => (
            <li key={i} className="flex gap-3 items-start text-xs sm:text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-1.5 flex-shrink-0 transition-colors"></span>
              <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed transition-colors break-keep">
                <strong className="text-gray-800 dark:text-gray-200 font-bold transition-colors">{item.t}:</strong> {item.d}
              </p>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}