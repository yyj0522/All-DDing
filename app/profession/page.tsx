'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Profession } from '@/lib/skillData';

import { 
  TOWN_RANKS, STAMINA_DRINKS, MINE_RECIPES, FARMING_RECIPES, OCEAN_RECIPES, HUNT_RECIPES, MINE_FIXED_PRICES,
  PICKAXE_BASE_DROPS, PICKAXE_RELIC_CHANCES, LUCKY_HIT_EFFECTS, 
  GEM_DROP_EFFECTS, FLAMING_PICKAXE_EFFECTS, PRICE_BUFF_EFFECTS, AVG_RELIC_POINTS 
} from '@/lib/professionData';

import RecipeTab from '@/components/profession/RecipeTab';
import MiningStatsTab from '@/components/profession/MiningStatsTab';
import FarmingStatsTab from '@/components/profession/FarmingStatsTab';
import OceanStatsTab from '@/components/profession/OceanStatsTab';
import OceanRevenueTab from '@/components/profession/OceanRevenueTab';
import BaristaTab from '@/components/profession/BaristaTab';
import OceanTradeCalcTab from '@/components/profession/OceanTradeCalcTab';
import HuntRevenueTab from '@/components/profession/HuntRevenueTab';

const TABS = [
  { id: '재배', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/50' },
  { id: '채광', color: 'text-stone-400', bg: 'bg-stone-500/10', border: 'border-stone-500/50' },
  { id: '해양', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/50' },
  { id: '사냥', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/50' }
] as const;

const SKILL_IDS = {
  luckyHit: 'm6',      
  gemDrop: 'm3',      
  flamingPick: 'm7',  
  ingotBuff: 'm5',    
  gemBuff: 'm4'        
};

export default function ProfessionPage() {
  const [activeTab, setActiveTab] = useState<Profession>('채광');
  const [subTab, setSubTab] = useState<string>('조합법');
  const [targetZone, setTargetZone] = useState<'코룸' | '리프톤' | '세렌트'>('코룸');

  const [userStats, setUserStats] = useState({
    stamina: 3000, pickaxeLv: 0, rodLv: 0, swordLv: 0, 
    luckyHitLv: 0, gemDropLv: 0, flamingPickLv: 0, ingotBuffLv: 0, gemBuffLv: 0,
    o11Lv: 0, o12Lv: 0, o14Lv: 0, o16Lv: 0, o17Lv: 0,
    h2Lv: 0, h5Lv: 0, h6Lv: 0, h12Lv: 0, h13Lv: 0, h14Lv: 0, h15Lv: 0
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const sLevels = localStorage.getItem('alldding_profession');
    const sTools = localStorage.getItem('alldding_sage_tools');
    const sMisc = localStorage.getItem('alldding_misc_settings');
    
    let parsedStamina = 3000;
    let parsedPickaxe = 0, parsedRod = 0, parsedSword = 0;
    let parsedLuckyHit = 0, parsedGemDrop = 0, parsedFlaming = 0, parsedIngotBuff = 0, parsedGemBuff = 0;
    let parsedO11 = 0, parsedO12 = 0, parsedO14 = 0, parsedO16 = 0, parsedO17 = 0;
    let parsedH2 = 0, parsedH5 = 0, parsedH6 = 0, parsedH12 = 0, parsedH13 = 0, parsedH14 = 0, parsedH15 = 0;

    if (sLevels) {
      const p = JSON.parse(sLevels);
      parsedLuckyHit = p[SKILL_IDS.luckyHit] || 0; 
      parsedGemDrop = p[SKILL_IDS.gemDrop] || 0; 
      parsedFlaming = p[SKILL_IDS.flamingPick] || 0; 
      parsedIngotBuff = p[SKILL_IDS.ingotBuff] || 0; 
      parsedGemBuff = p[SKILL_IDS.gemBuff] || 0; 

      parsedO11 = p['o11'] || 0;
      parsedO12 = p['o12'] || 0;
      parsedO14 = p['o14'] || 0;
      parsedO16 = p['o16'] || 0;
      parsedO17 = p['o17'] || 0;

      parsedH2 = p['h2'] || 0;
      parsedH5 = p['h5'] || 0;
      parsedH6 = p['h6'] || 0;
      parsedH12 = p['h12'] || 0;
      parsedH13 = p['h13'] || 0;
      parsedH14 = p['h14'] || 0;
      parsedH15 = p['h15'] || 0;
    }

    if (sTools) {
      const t = JSON.parse(sTools);
      parsedPickaxe = t['pickaxe'] || 0;
      parsedRod = t['rod'] || 0;
      parsedSword = t['sword'] || 0;
    }
    
    if (sMisc) {
      const m = JSON.parse(sMisc);
      const baseStamina = TOWN_RANKS.find(r => r.value === m.townRank)?.maxStamina || 3000;
      const drinkRecovery = (m.drinkRoutine || []).reduce((sum: number, val: number) => {
        const d = STAMINA_DRINKS.find(drink => drink.value === val);
        return sum + (d?.recovery || 0);
      }, 0);
      parsedStamina = baseStamina + drinkRecovery;
    }
    
    setUserStats({
      stamina: parsedStamina, pickaxeLv: parsedPickaxe, rodLv: parsedRod, swordLv: parsedSword,
      luckyHitLv: parsedLuckyHit, gemDropLv: parsedGemDrop, flamingPickLv: parsedFlaming, ingotBuffLv: parsedIngotBuff, gemBuffLv: parsedGemBuff,
      o11Lv: parsedO11, o12Lv: parsedO12, o14Lv: parsedO14, o16Lv: parsedO16, o17Lv: parsedO17,
      h2Lv: parsedH2, h5Lv: parsedH5, h6Lv: parsedH6, h12Lv: parsedH12, h13Lv: parsedH13, h14Lv: parsedH14, h15Lv: parsedH15
    });

    setIsLoaded(true);
  }, []);

  const results = useMemo(() => {
    const totalActions = Math.floor(userStats.stamina / 10);
    const baseDrop = userStats.pickaxeLv > 0 ? PICKAXE_BASE_DROPS[userStats.pickaxeLv - 1] : 1; 
    const luckyHit = LUCKY_HIT_EFFECTS[userStats.luckyHitLv] || { chance: 0, amount: 0 };
    const expectedOrePerAction = baseDrop + (luckyHit.chance * luckyHit.amount);
    const totalOres = totalActions * expectedOrePerAction;
    
    const flamingChance = FLAMING_PICKAXE_EFFECTS[userStats.flamingPickLv] || 0;
    const directIngots = totalActions * flamingChance;
    const expectedIngots = Math.floor((totalOres / 16) + directIngots);

    const gemDrop = GEM_DROP_EFFECTS[userStats.gemDropLv] || { chance: 0, amount: 0 };
    const expectedGemPerAction = userStats.gemDropLv > 0 ? (gemDrop.chance * gemDrop.amount) : 0;
    const expectedGems = totalActions * expectedGemPerAction;

    const relicChance = userStats.pickaxeLv > 0 ? PICKAXE_RELIC_CHANCES[userStats.pickaxeLv - 1] : 0;
    const expectedRelics = totalActions * relicChance;
    const expectedRelicPoints = expectedRelics * AVG_RELIC_POINTS;

    const baseIngotPrice = MINE_FIXED_PRICES.ingots.find(i => i.zone === targetZone)?.base || 0;
    const baseGemPrice = MINE_FIXED_PRICES.gems.find(g => g.zone === targetZone)?.base || 0;

    const finalIngotPrice = Math.floor(baseIngotPrice * (1 + (PRICE_BUFF_EFFECTS[userStats.ingotBuffLv] || 0)));
    const finalGemPrice = Math.floor(baseGemPrice * (1 + (PRICE_BUFF_EFFECTS[userStats.gemBuffLv] || 0)));

    const ingotRevenue = expectedIngots * finalIngotPrice;
    const gemRevenue = expectedGems * finalGemPrice;
    const totalRevenue = ingotRevenue + gemRevenue;

    return { expectedIngots, expectedGems, expectedRelics, expectedRelicPoints, ingotRevenue, gemRevenue, totalRevenue };
  }, [userStats, targetZone]);

  if (!isLoaded) return <div className="min-h-screen bg-gray-50 dark:bg-[#050505] transition-colors duration-300"></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans selection:bg-amber-200 dark:selection:bg-amber-500/30 relative flex flex-col overflow-x-hidden transition-colors duration-300">
      <div className="absolute top-[-20%] left-[-10%] w-full h-[50%] bg-stone-300/30 dark:bg-stone-600/5 rounded-full blur-[120px] pointer-events-none transition-colors duration-300"></div>
      <Header />

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 pt-28 md:pt-40 pb-20 flex flex-col items-center">
        <div className="mb-8 text-center w-full px-2">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3">전문가 기능</h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-base tracking-wide max-w-xl mx-auto break-keep opacity-80">
            내 능력치 기반 수익률 계산 및 전용 조합법 확인
          </p>
        </div>

        <div className="w-full max-w-2xl mb-8 px-2">
          <div className="grid grid-cols-4 gap-1.5 md:gap-4 bg-white dark:bg-white/5 p-1.5 rounded-[20px] md:rounded-[24px] border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-2xl transition-colors">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { 
                  setActiveTab(tab.id as Profession); 
                  setSubTab('조합법'); 
                }}
                className={`flex items-center justify-center py-3 md:py-4 rounded-[14px] md:rounded-[18px] font-bold transition-all text-[11px] sm:text-sm md:text-base shadow-sm ${
                  activeTab === tab.id 
                  ? `bg-gray-900 text-white dark:bg-white dark:text-black scale-100 shadow-gray-300 dark:shadow-white/10` 
                  : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                {tab.id}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 w-full mb-10 border-b border-gray-200 dark:border-white/10 px-2 transition-colors">
          <button 
            onClick={() => setSubTab('조합법')} 
            className={`pb-3.5 font-bold text-[11px] sm:text-xs md:text-sm transition-all border-b-2 px-1 ${
              subTab === '조합법' ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            제작 & 조합법
          </button>
          
          {(activeTab === '채광' || activeTab === '사냥' || activeTab === '해양') && (
            <button 
              onClick={() => setSubTab('시세수익')} 
              className={`pb-3.5 font-bold text-[11px] sm:text-xs md:text-sm transition-all border-b-2 px-1 ${
                subTab === '시세수익' ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              예상 일일 수익
            </button>
          )}

          {activeTab === '재배' && (
            <>
              <button 
                onClick={() => setSubTab('변동시세')} 
                className={`pb-3.5 font-bold text-[11px] sm:text-xs md:text-sm transition-all border-b-2 px-1 ${
                  subTab === '변동시세' ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                3일 주기 시세
              </button>
              <button 
                onClick={() => setSubTab('바리스타')} 
                className={`pb-3.5 font-bold text-[11px] sm:text-xs md:text-sm transition-all border-b-2 px-1 ${
                  subTab === '바리스타' ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                바리스타
              </button>
            </>
          )}

          {activeTab === '해양' && (
            <>
              <button 
                onClick={() => setSubTab('변동시세')} 
                className={`pb-3.5 font-bold text-[11px] sm:text-xs md:text-sm transition-all border-b-2 px-1 ${
                  subTab === '변동시세' ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                공예품 시세
              </button>
              <button 
                onClick={() => setSubTab('거래계산기')} 
                className={`pb-3.5 font-bold text-[11px] sm:text-xs md:text-sm transition-all border-b-2 px-1 ${
                  subTab === '거래계산기' ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                거래 계산기
              </button>
            </>
          )}
        </div>

        <div className="w-full animate-fade-in px-1 md:px-0">
          {activeTab === '채광' && subTab === '조합법' && <RecipeTab recipes={MINE_RECIPES} />}
          {activeTab === '채광' && subTab === '시세수익' && (
            <MiningStatsTab 
              userStats={userStats} 
              targetZone={targetZone} 
              setTargetZone={setTargetZone} 
              results={results} 
            />
          )}
          
          {activeTab === '재배' && subTab === '조합법' && <RecipeTab recipes={FARMING_RECIPES} />}
          {activeTab === '재배' && subTab === '변동시세' && <FarmingStatsTab />}
          {activeTab === '재배' && subTab === '바리스타' && <BaristaTab />}

          {activeTab === '해양' && subTab === '조합법' && <RecipeTab recipes={OCEAN_RECIPES} />}
          {activeTab === '해양' && subTab === '시세수익' && <OceanRevenueTab userStats={userStats} />}
          {activeTab === '해양' && subTab === '변동시세' && <OceanStatsTab />}
          {activeTab === '해양' && subTab === '거래계산기' && <OceanTradeCalcTab userStats={userStats} />}

          {activeTab === '사냥' && subTab === '조합법' && <RecipeTab recipes={HUNT_RECIPES} />}
          {activeTab === '사냥' && subTab === '시세수익' && <HuntRevenueTab userStats={userStats} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}