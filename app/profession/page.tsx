'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Profession } from '@/lib/skillData';

import { 
  TOWN_RANKS, STAMINA_DRINKS, MINE_RECIPES, FARMING_RECIPES, MINE_FIXED_PRICES,
  PICKAXE_BASE_DROPS, PICKAXE_RELIC_CHANCES, LUCKY_HIT_EFFECTS, 
  GEM_DROP_EFFECTS, FLAMING_PICKAXE_EFFECTS, PRICE_BUFF_EFFECTS, AVG_RELIC_POINTS 
} from '@/lib/professionData';

import RecipeTab from '@/components/profession/RecipeTab';
import MiningStatsTab from '@/components/profession/MiningStatsTab';
import FarmingStatsTab from '@/components/profession/FarmingStatsTab';
import OceanStatsTab from '@/components/profession/OceanStatsTab';

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
  const [subTab, setSubTab] = useState<'조합법' | '시세수익'>('조합법');
  const [targetZone, setTargetZone] = useState<'코룸' | '리프톤' | '세렌트'>('코룸');

  const [userStats, setUserStats] = useState({
    stamina: 3000, pickaxeLv: 0, luckyHitLv: 0, gemDropLv: 0, flamingPickLv: 0, ingotBuffLv: 0, gemBuffLv: 0
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const sLevels = localStorage.getItem('alldding_profession');
    const sTools = localStorage.getItem('alldding_sage_tools');
    const sMisc = localStorage.getItem('alldding_misc_settings');
    
    let parsedStamina = 3000;
    let parsedPickaxe = 0, parsedLuckyHit = 0, parsedGemDrop = 0, parsedFlaming = 0, parsedIngotBuff = 0, parsedGemBuff = 0;

    if (sLevels) {
      const p = JSON.parse(sLevels);
      parsedLuckyHit = p[SKILL_IDS.luckyHit] || 0; 
      parsedGemDrop = p[SKILL_IDS.gemDrop] || 0; 
      parsedFlaming = p[SKILL_IDS.flamingPick] || 0; 
      parsedIngotBuff = p[SKILL_IDS.ingotBuff] || 0; 
      parsedGemBuff = p[SKILL_IDS.gemBuff] || 0; 
    }

    if (sTools) {
      const t = JSON.parse(sTools);
      parsedPickaxe = t['pickaxe'] || 0;
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
      stamina: parsedStamina, pickaxeLv: parsedPickaxe, luckyHitLv: parsedLuckyHit,
      gemDropLv: parsedGemDrop, flamingPickLv: parsedFlaming, ingotBuffLv: parsedIngotBuff, gemBuffLv: parsedGemBuff
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

  if (!isLoaded) return <div className="min-h-screen bg-[#050505]"></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-amber-500/30 relative flex flex-col">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-stone-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      <Header />

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 pt-32 md:pt-40 pb-20 flex flex-col items-center">
        <div className="mb-10 text-center w-full">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">전문가별 편의성 기능</h1>
          <p className="text-gray-400 text-sm md:text-base tracking-wide mx-auto whitespace-normal w-full max-w-2xl px-4">
            각 직업별 전용 조합법을 확인하고, 설정된 내 능력치 기반으로 수익률을 계산하세요.
          </p>
        </div>

        <div className="flex justify-center gap-2 md:gap-4 mb-8 overflow-x-auto pb-2 custom-scrollbar w-full max-w-2xl">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as Profession); setSubTab(tab.id === '사냥' ? '시세수익' : '조합법'); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap border-2 ${
                activeTab === tab.id 
                ? `${tab.bg} ${tab.color} ${tab.border}` 
                : 'bg-[#0a0a0a] border-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
              }`}
            >
              {tab.id} 전문가
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-8 w-full mb-8 border-b border-white/10">
          <button onClick={() => setSubTab('조합법')} className={`pb-3 font-bold text-sm transition-colors border-b-2 px-2 ${subTab === '조합법' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>전용 제작 & 조합법</button>
          {(activeTab === '채광' || activeTab === '사냥') ? (
            <button onClick={() => setSubTab('시세수익')} className={`pb-3 font-bold text-sm transition-colors border-b-2 px-2 ${subTab === '시세수익' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>고정 시세 및 일일 수익</button>
          ) : activeTab === '재배' ? (
            <button onClick={() => setSubTab('시세수익')} className={`pb-3 font-bold text-sm transition-colors border-b-2 px-2 ${subTab === '시세수익' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>3일 주기 변동 시세</button>
          ) : (
            <button onClick={() => setSubTab('시세수익')} className={`pb-3 font-bold text-sm transition-colors border-b-2 px-2 ${subTab === '시세수익' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>공예품 시세 (1일 변동)</button>
          )}
        </div>

        <div className="w-full animate-fade-in-up">
          {activeTab === '채광' && subTab === '조합법' && <RecipeTab recipes={MINE_RECIPES} />}
          {activeTab === '채광' && subTab === '시세수익' && <MiningStatsTab userStats={userStats} targetZone={targetZone} setTargetZone={setTargetZone} results={results} />}
          
          {activeTab === '재배' && subTab === '조합법' && <RecipeTab recipes={FARMING_RECIPES} />}
          {activeTab === '재배' && subTab === '시세수익' && <FarmingStatsTab />}

          {activeTab === '해양' && subTab === '조합법' && (
             <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 min-h-[400px] flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
               <h2 className="relative z-10 text-2xl font-bold text-white mb-2">해양 전용 조합법</h2>
               <p className="text-gray-500 text-sm max-w-md leading-relaxed">데이터 수집 및 업데이트 중입니다.</p>
             </div>
          )}
          {activeTab === '해양' && subTab === '시세수익' && <OceanStatsTab />}

          {activeTab === '사냥' && (
             <div className="w-full bg-rose-900/10 border border-rose-500/20 rounded-3xl p-8 md:p-12 min-h-[400px] flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
               <svg className="w-12 h-12 text-rose-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               <h2 className="relative z-10 text-2xl font-bold text-rose-400 mb-2">시스템 안정화 대기 중</h2>
               <p className="relative z-10 text-rose-300/70 text-sm max-w-md leading-relaxed">
                 사냥 전문가 콘텐츠는 현재 서버 내 밸런스 패치 및 변경 사항이 잦은 상태입니다. <br/>
                 시스템이 완전히 안정화된 이후에 데이터가 일괄 업데이트될 예정입니다.
               </p>
             </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}