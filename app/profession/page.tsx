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
import FarmingRevenueTab from '@/components/profession/FarmingRevenueTab';
import CookingRecommendTab from '@/components/profession/CookingRecommendTab';
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
  gemBuff: 'm4',
  m16: 'm16'
};

export default function ProfessionPage() {
  const [activeTab, setActiveTab] = useState<Profession>('채광');
  const [subTab, setSubTab] = useState<string>('조합법');
  const [targetZone, setTargetZone] = useState<'코룸' | '리프톤' | '세렌트'>('코룸');

  const [userStats, setUserStats] = useState<any>({
    stamina: 3000, hoeLv: 0, pickaxeLv: 0, rodLv: 0, swordLv: 0, 
    luckyHitLv: 0, gemDropLv: 0, flamingPickLv: 0, ingotBuffLv: 0, gemBuffLv: 0, m16Lv: 0,
    o11Lv: 0, o12Lv: 0, o13Lv: 0, o14Lv: 0, o16Lv: 0, o17Lv: 0,
    h2Lv: 0, h5Lv: 0, h6Lv: 0, h12Lv: 0, h13Lv: 0, h14Lv: 0, h15Lv: 0,
    f4Lv: 0, f5Lv: 0, f6Lv: 0, f8Lv: 0, f9Lv: 0, f12Lv: 0, f14Lv: 0, f15Lv: 0, f16Lv: 0, f18Lv: 0, f19Lv: 0, f20Lv: 0, f22Lv: 0, f23Lv: 0
  });
  
  const [toolImprints, setToolImprints] = useState<any>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const sLevels = localStorage.getItem('alldding_profession');
    const sTools = localStorage.getItem('alldding_sage_tools');
    const sMisc = localStorage.getItem('alldding_misc_settings');
    
    let parsedStamina = 3000;
    let parsedHoe = 0, parsedPickaxe = 0, parsedRod = 0, parsedSword = 0;
    let parsedLuckyHit = 0, parsedGemDrop = 0, parsedFlaming = 0, parsedIngotBuff = 0, parsedGemBuff = 0, parsedM16 = 0;
    let parsedO11 = 0, parsedO12 = 0, parsedO13 = 0, parsedO14 = 0, parsedO16 = 0, parsedO17 = 0;
    let parsedH2 = 0, parsedH5 = 0, parsedH6 = 0, parsedH12 = 0, parsedH13 = 0, parsedH14 = 0, parsedH15 = 0;
    let parsedF4 = 0, parsedF5 = 0, parsedF6 = 0, parsedF8 = 0, parsedF9 = 0, parsedF12 = 0, parsedF14 = 0, parsedF15 = 0, parsedF16 = 0, parsedF18 = 0, parsedF19 = 0, parsedF20 = 0, parsedF22 = 0, parsedF23 = 0;

    if (sLevels) {
      const p = JSON.parse(sLevels);
      parsedLuckyHit = p[SKILL_IDS.luckyHit] || 0; 
      parsedGemDrop = p[SKILL_IDS.gemDrop] || 0; 
      parsedFlaming = p[SKILL_IDS.flamingPick] || 0; 
      parsedIngotBuff = p[SKILL_IDS.ingotBuff] || 0; 
      parsedGemBuff = p[SKILL_IDS.gemBuff] || 0; 
      parsedM16 = p[SKILL_IDS.m16] || 0;
      parsedO11 = p['o11'] || 0;
      parsedO12 = p['o12'] || 0;
      parsedO13 = p['o13'] || 0;
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
      parsedF4 = p['f4'] || 0;
      parsedF5 = p['f5'] || 0;
      parsedF6 = p['f6'] || 0;
      parsedF8 = p['f8'] || 0;
      parsedF9 = p['f9'] || 0;
      parsedF12 = p['f12'] || 0;
      parsedF14 = p['f14'] || 0;
      parsedF15 = p['f15'] || 0;
      parsedF16 = p['f16'] || 0;
      parsedF18 = p['f18'] || 0;
      parsedF19 = p['f19'] || 0;
      parsedF20 = p['f20'] || 0;
      parsedF22 = p['f22'] || 0;
      parsedF23 = p['f23'] || 0;
    }

    if (sTools) {
      try {
        const t = JSON.parse(sTools);
        if (t.levels) {
          parsedHoe = t.levels['hoe'] || 0;
          parsedPickaxe = t.levels['pickaxe'] || 0;
          parsedRod = t.levels['rod'] || 0;
          parsedSword = t.levels['sword'] || 0;
          setToolImprints(t.imprints || {});
        } else {
          parsedHoe = t['hoe'] || 0;
          parsedPickaxe = t['pickaxe'] || 0;
          parsedRod = t['rod'] || 0;
          parsedSword = t['sword'] || 0;
        }
      } catch(e) {}
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
      stamina: parsedStamina, hoeLv: parsedHoe, pickaxeLv: parsedPickaxe, rodLv: parsedRod, swordLv: parsedSword,
      luckyHitLv: parsedLuckyHit, gemDropLv: parsedGemDrop, flamingPickLv: parsedFlaming, ingotBuffLv: parsedIngotBuff, gemBuffLv: parsedGemBuff, m16Lv: parsedM16,
      o11Lv: parsedO11, o12Lv: parsedO12, o13Lv: parsedO13, o14Lv: parsedO14, o16Lv: parsedO16, o17Lv: parsedO17,
      h2Lv: parsedH2, h5Lv: parsedH5, h6Lv: parsedH6, h12Lv: parsedH12, h13Lv: parsedH13, h14Lv: parsedH14, h15Lv: parsedH15,
      f4Lv: parsedF4, f5Lv: parsedF5, f6Lv: parsedF6, f8Lv: parsedF8, f9Lv: parsedF9, f12Lv: parsedF12, f14Lv: parsedF14, f15Lv: parsedF15, f16Lv: parsedF16, f18Lv: parsedF18, f19Lv: parsedF19, f20Lv: parsedF20, f22Lv: parsedF22, f23Lv: parsedF23
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
      <div className="absolute top-[-20%] left-[-10%] w-full h-[50%] bg-stone-400/20 dark:bg-stone-600/10 rounded-full blur-[150px] pointer-events-none transition-colors duration-300"></div>
      <Header />

      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-4 pt-28 md:pt-40 pb-24 md:pb-20 flex flex-col items-center">
        <div className="mb-6 md:mb-8 text-center w-full px-2 transition-colors">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-2 md:mb-3 transition-colors">
            전문가 <span className="text-stone-600 dark:text-stone-500 transition-colors">기능</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-base tracking-wide max-w-xl mx-auto break-keep opacity-80 transition-colors">
            내 능력치 기반 수익률 계산 및 전용 조합법을 확인하세요.
          </p>
        </div>

        <div className="w-full max-w-2xl mb-5 md:mb-8 px-1 transition-colors">
          <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-1.5 p-1.5 bg-gray-200/50 dark:bg-[#111113] rounded-2xl md:rounded-[24px] border border-gray-200 dark:border-white/5 shadow-inner transition-colors">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { 
                  setActiveTab(tab.id as Profession); 
                  setSubTab('조합법'); 
                }}
                className={`py-2.5 md:py-3.5 rounded-xl font-black transition-all text-[12px] sm:text-sm md:text-base ${
                  activeTab === tab.id 
                  ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 bg-transparent'
                }`}
              >
                {tab.id}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 w-full max-w-4xl mb-8 md:mb-10 px-1 transition-colors">
          <button 
            onClick={() => setSubTab('조합법')} 
            className={`px-4 md:px-6 py-2.5 rounded-full font-black text-[11px] sm:text-xs md:text-sm transition-all border ${
              subTab === '조합법' 
              ? 'bg-gray-900 text-white border-transparent dark:bg-white dark:text-black shadow-md' 
              : 'bg-white dark:bg-[#111113] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            제작 & 조합법
          </button>
          
          {(activeTab === '채광' || activeTab === '사냥' || activeTab === '해양' || activeTab === '재배') && (
            <button 
              onClick={() => setSubTab('시세수익')} 
              className={`px-4 md:px-6 py-2.5 rounded-full font-black text-[11px] sm:text-xs md:text-sm transition-all border ${
                subTab === '시세수익' 
                ? 'bg-gray-900 text-white border-transparent dark:bg-white dark:text-black shadow-md' 
                : 'bg-white dark:bg-[#111113] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              예상 일일 수익
            </button>
          )}

          {activeTab === '재배' && (
            <>
              <button 
                onClick={() => setSubTab('요리추천')} 
                className={`px-4 md:px-6 py-2.5 rounded-full font-black text-[11px] sm:text-xs md:text-sm transition-all border ${
                  subTab === '요리추천' 
                  ? 'bg-gray-900 text-white border-transparent dark:bg-white dark:text-black shadow-md' 
                  : 'bg-white dark:bg-[#111113] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                요리 추천(BETA)
              </button>
              <button 
                onClick={() => setSubTab('변동시세')} 
                className={`px-4 md:px-6 py-2.5 rounded-full font-black text-[11px] sm:text-xs md:text-sm transition-all border ${
                  subTab === '변동시세' 
                  ? 'bg-gray-900 text-white border-transparent dark:bg-white dark:text-black shadow-md' 
                  : 'bg-white dark:bg-[#111113] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                3일 주기 시세
              </button>
              <button 
                onClick={() => setSubTab('바리스타')} 
                className={`px-4 md:px-6 py-2.5 rounded-full font-black text-[11px] sm:text-xs md:text-sm transition-all border ${
                  subTab === '바리스타' 
                  ? 'bg-gray-900 text-white border-transparent dark:bg-white dark:text-black shadow-md' 
                  : 'bg-white dark:bg-[#111113] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
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
                className={`px-4 md:px-6 py-2.5 rounded-full font-black text-[11px] sm:text-xs md:text-sm transition-all border ${
                  subTab === '변동시세' 
                  ? 'bg-gray-900 text-white border-transparent dark:bg-white dark:text-black shadow-md' 
                  : 'bg-white dark:bg-[#111113] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                공예품 시세
              </button>
              <button 
                onClick={() => setSubTab('거래계산기')} 
                className={`px-4 md:px-6 py-2.5 rounded-full font-black text-[11px] sm:text-xs md:text-sm transition-all border ${
                  subTab === '거래계산기' 
                  ? 'bg-gray-900 text-white border-transparent dark:bg-white dark:text-black shadow-md' 
                  : 'bg-white dark:bg-[#111113] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
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
              toolImprints={toolImprints}
            />
          )}
          
          {activeTab === '재배' && subTab === '조합법' && <RecipeTab recipes={FARMING_RECIPES} />}
          {activeTab === '재배' && subTab === '시세수익' && <FarmingRevenueTab userStats={userStats} toolImprints={toolImprints} />}
          {activeTab === '재배' && subTab === '요리추천' && <CookingRecommendTab userStats={userStats} />}
          {activeTab === '재배' && subTab === '변동시세' && <FarmingStatsTab />}
          {activeTab === '재배' && subTab === '바리스타' && <BaristaTab />}

          {activeTab === '해양' && subTab === '조합법' && <RecipeTab recipes={OCEAN_RECIPES} />}
          {activeTab === '해양' && subTab === '시세수익' && <OceanRevenueTab userStats={userStats} toolImprints={toolImprints} />}
          {activeTab === '해양' && subTab === '변동시세' && <OceanStatsTab />}
          {activeTab === '해양' && subTab === '거래계산기' && <OceanTradeCalcTab userStats={userStats} toolImprints={toolImprints} />}

          {activeTab === '사냥' && subTab === '조합법' && <RecipeTab recipes={HUNT_RECIPES} />}
          {activeTab === '사냥' && subTab === '시세수익' && <HuntRevenueTab userStats={userStats} toolImprints={toolImprints} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}