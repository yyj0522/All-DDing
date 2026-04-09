'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { SKILL_DATA, Profession } from '@/lib/skillData';
import { SAGE_TOOLS, TOOL_UPGRADE_COST } from '@/lib/sageData';
import { getCachedPrices } from '@/lib/supabase';
import SkillTreeTab from '@/components/settings/SkillTreeTab';
import SageToolsTab from '@/components/settings/SageToolsTab';
import PriceSheetTab from '@/components/settings/PriceSheetTab';
import MiscSettingsTab from '@/components/settings/MiscSettingsTab';

const getToolImageName = (toolId: string, level: number) => {
  const prefix = toolId === 'rod' ? 'fish' : toolId;
  if (level >= 15) return `${prefix}4`;
  if (level >= 10) return `${prefix}3`;
  if (level >= 6) return `${prefix}2`;
  return `${prefix}1`;
};

const TOWN_RANKS = [
  { name: '숲 (1~3위)', value: '숲', maxStamina: 4000, emoji: '🌲' },
  { name: '열매 (상위 5%)', value: '열매', maxStamina: 3500, emoji: '🍎' },
  { name: '꽃 (상위 30%)', value: '꽃', maxStamina: 3300, emoji: '🌸' },
  { name: '새싹 (상위 70%)', value: '새싹', maxStamina: 3000, emoji: '🌱' },
  { name: '씨앗 (순위 밖)', value: '씨앗', maxStamina: 3000, emoji: '🫘' },
];

const STAMINA_DRINKS = [
  { name: '스태미나 드링크 I', value: 1, recovery: 100 },
  { name: '스태미나 드링크 II', value: 2, recovery: 300 },
  { name: '스태미나 드링크 III', value: 3, recovery: 500 },
  { name: '스태미나 드링크 IV', value: 4, recovery: 700 },
  { name: '스태미나 드링크 V', value: 5, recovery: 1000 },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'트리'|'도구'|'단가'|'기타'>('트리');
  const [profTab, setProfTab] = useState<Profession>('재배');
  const [activeToolId, setActiveToolId] = useState<string>('hoe');
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [savedLevels, setSavedLevels] = useState<Record<string, number>>({});
  const [toolLevels, setToolLevels] = useState<Record<string, number>>({});
  const [savedToolLevels, setSavedToolLevels] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [townRank, setTownRank] = useState<string>('씨앗');
  const [drinkRoutine, setDrinkRoutine] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const sLevels = localStorage.getItem('alldding_profession');
      const sTools = localStorage.getItem('alldding_sage_tools');
      const sPrices = localStorage.getItem('alldding_prices');
      const sMisc = localStorage.getItem('alldding_misc_settings');
      if (sLevels) { const p = JSON.parse(sLevels); setLevels(p); setSavedLevels(p); }
      if (sTools) { const t = JSON.parse(sTools); setToolLevels(t); setSavedToolLevels(t); }
      if (sMisc) {
        const m = JSON.parse(sMisc);
        setTownRank(m.townRank || '씨앗');
        if (m.drinkRoutine) setDrinkRoutine(m.drinkRoutine);
        else if (m.drinkType && m.drinkCount) setDrinkRoutine(Array(m.drinkCount).fill(m.drinkType));
      }
      let initialPrices: Record<string, number> = sPrices ? JSON.parse(sPrices) : {};
      const allData = await getCachedPrices();
      const data = allData.filter((d: any) => d.category === 'ingredient');
      if (data && data.length > 0) {
        const finalPrices: Record<string, number> = {};
        data.forEach((row: any) => { 
          if (initialPrices[row.item_name] !== undefined && !isNaN(initialPrices[row.item_name])) {
            finalPrices[row.item_name] = initialPrices[row.item_name];
          } else {
            finalPrices[row.item_name] = row.price;
          }
        });
        setPrices({ ...initialPrices, ...finalPrices });
      } else if (sPrices) {
        setPrices(initialPrices);
      }
      setIsLoaded(true);
    };
    fetchData();
  }, []);

  const handleLevelChange = (id: string, delta: number) => {
    const skill = SKILL_DATA[profTab][id];
    if (!skill) return;
    const current = levels[id] || 0;
    const isUnlocked = (skill.req && skill.req2) ? ((levels[skill.req] || 0) > 0 || (levels[skill.req2] || 0) > 0) : (skill.req ? (levels[skill.req] || 0) > 0 : true);
    if (!isUnlocked && delta > 0) return;
    setLevels(prev => ({ ...prev, [id]: Math.max(0, Math.min(skill.max, current + delta)) }));
  };

  const handleToolLevelChange = (id: string, delta: number, max: number) => {
    const current = toolLevels[id] || 0;
    setToolLevels(prev => ({ ...prev, [id]: Math.max(0, Math.min(max, current + delta)) }));
  };

  const handlePriceChange = (item: string, value: string) => {
    const num = parseFloat(value);
    setPrices(prev => ({ ...prev, [item]: isNaN(num) ? 0 : num }));
  };

  const addDrinkToRoutine = (val: number) => drinkRoutine.length < 5 && setDrinkRoutine([...drinkRoutine, val]);
  const removeDrinkFromRoutine = (idx: number) => { const n = [...drinkRoutine]; n.splice(idx, 1); setDrinkRoutine(n); };

  const saveAll = () => {
    localStorage.setItem('alldding_profession', JSON.stringify(levels));
    localStorage.setItem('alldding_sage_tools', JSON.stringify(toolLevels));
    localStorage.setItem('alldding_prices', JSON.stringify(prices));
    localStorage.setItem('alldding_misc_settings', JSON.stringify({ townRank, drinkRoutine }));
    localStorage.setItem('alldding_skill', String(levels['f15'] || 0));
    setSavedLevels(levels); setSavedToolLevels(toolLevels);
    alert('개인 설정이 성공적으로 저장되었습니다.');
  };

  const resetTree = () => { if(confirm('스킬 트리를 초기화 하시겠습니까?')) { setLevels({}); setSavedLevels({}); localStorage.removeItem('alldding_profession'); } };
  const resetTools = () => { if(confirm('도구 현황을 초기화 하시겠습니까?')) { setToolLevels({}); setSavedToolLevels({}); localStorage.removeItem('alldding_sage_tools'); } };

  const diffCost = useMemo(() => {
    let gold = 0, stone = 0, point = 0;
    Object.values(SKILL_DATA[profTab] || {}).forEach(skill => {
      for (let i = savedLevels[skill.id] || 0; i < (levels[skill.id] || 0); i++) {
        gold += skill.costs[i].g; stone += skill.costs[i].s; point += skill.costs[i].p;
      }
    });
    return { gold, stone, point };
  }, [levels, savedLevels, profTab]);

  const diffToolCost = useMemo(() => {
    let coin = 0, ruby = 0, stone1 = 0, stone2 = 0, stone3 = 0;
    SAGE_TOOLS.forEach(tool => {
      const cur = toolLevels[tool.id] || 0, sav = savedToolLevels[tool.id] || 0;
      let tCoin = 0, tRuby = 0, ts1 = 0, ts2 = 0, ts3 = 0;
      for (let i = Math.min(cur, sav); i < Math.max(cur, sav); i++) {
        tCoin += TOOL_UPGRADE_COST[i].coin; tRuby += TOOL_UPGRADE_COST[i].ruby;
        ts1 += TOOL_UPGRADE_COST[i].stone1; ts2 += TOOL_UPGRADE_COST[i].stone2; ts3 += TOOL_UPGRADE_COST[i].stone3;
      }
      if (cur > sav) { coin += tCoin; ruby += tRuby; stone1 += ts1; stone2 += ts2; stone3 += ts3; } 
      else if (cur < sav) { coin -= tCoin; ruby -= tRuby; stone1 -= ts1; stone2 -= ts2; stone3 -= ts3; }
    });
    return { coin, ruby, stone1, stone2, stone3 };
  }, [toolLevels, savedToolLevels]);

  const activeEffects = useMemo(() => {
    const effects: string[] = [];
    Object.values(SKILL_DATA[profTab] || {}).forEach(skill => {
      const lv = levels[skill.id] || 0;
      if (lv > 0) effects.push(`${skill.name.replace(/\[.*?\] /, '')}: ${skill.costs[lv - 1].effect}`);
    });
    return effects;
  }, [levels, profTab]);

  const currentMaxStamina = TOWN_RANKS.find(r => r.value === townRank)?.maxStamina || 3000;
  const currentTownEmoji = TOWN_RANKS.find(r => r.value === townRank)?.emoji || '🫘';
  const dailyDrinkRecovery = drinkRoutine.reduce((sum, val) => sum + (STAMINA_DRINKS.find(d => d.value === val)?.recovery || 0), 0);
  const totalDailyStamina = currentMaxStamina + dailyDrinkRecovery;

  if (!isLoaded) return <div className="min-h-screen bg-gray-50 dark:bg-[#050505] transition-colors duration-300"></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-200 dark:selection:bg-indigo-500/30 relative flex flex-col overflow-x-hidden transition-colors duration-300">
      <div className="absolute top-[-20%] left-[-10%] w-full h-[50%] bg-indigo-300/20 dark:bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none transition-colors duration-300"></div>
      <Header />
      <style dangerouslySetInnerHTML={{__html: `
        .skill-tree { display: flex; justify-content: center; width: 100%; padding-bottom: 2rem; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .skill-tree ul { padding-top: 25px; position: relative; display: flex; justify-content: center; transition: all 0.3s; white-space: nowrap; }
        .skill-tree li { display: inline-block; vertical-align: top; text-align: center; list-style-type: none; position: relative; padding: 25px 5px 0 5px; transition: all 0.3s; }
        .skill-tree li::before, .skill-tree li::after { content: ''; position: absolute; top: 0; right: 50%; border-top: 2px solid #9ca3af; width: 50%; height: 25px; z-index: 1; }
        html.dark .skill-tree li::before, html.dark .skill-tree li::after { border-color: #3f3f46; }
        .skill-tree li::after { right: auto; left: 50%; border-left: 2px solid #9ca3af; }
        html.dark .skill-tree li::after { border-color: #3f3f46; }
        .skill-tree li:only-child::after, .skill-tree li:only-child::before { display: none; }
        .skill-tree li:only-child { padding-top: 0; }
        .skill-tree li:first-child::before, .skill-tree li:last-child::after { border: 0 none; }
        .skill-tree li:last-child::before { border-right: 2px solid #9ca3af; border-radius: 0 10px 0 0; }
        html.dark .skill-tree li:last-child::before { border-color: #3f3f46; }
        .skill-tree li:first-child::after { border-radius: 10px 0 0 0; }
        .skill-tree ul ul::before { content: ''; position: absolute; top: 0; left: 50%; border-left: 2px solid #9ca3af; width: 0; height: 25px; margin-left: -1px; z-index: 1; }
        html.dark .skill-tree ul ul::before { border-color: #3f3f46; }
        input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        html.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `}} />
      <main className="relative z-10 flex-1 max-w-[1500px] w-full mx-auto px-4 pt-28 md:pt-40 pb-20 flex flex-col items-center">
        <div className="mb-8 text-center w-full px-2">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3 transition-colors">
            개인 설정 <span className="text-indigo-600 dark:text-indigo-500 transition-colors">보드</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-base tracking-wide max-w-xl mx-auto break-keep opacity-80 transition-colors">
            전문가 스킬 트리, 세이지 도구 강화 현황 및 재료 단가를 통합 관리합니다.
          </p>
        </div>

        <div className="w-full max-w-2xl mb-8 px-2">
          <div className="grid grid-cols-4 gap-1.5 md:gap-4 bg-white dark:bg-white/5 p-1.5 rounded-[20px] md:rounded-[24px] border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-2xl transition-colors">
            {['트리', '도구', '단가', '기타'].map((tab) => {
              const label = tab === '트리' ? '스킬 트리' : tab === '도구' ? '도구 강화' : tab === '단가' ? '단가 관리' : '기타 설정';
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as '트리'|'도구'|'단가'|'기타')}
                  className={`flex items-center justify-center py-3 md:py-4 rounded-[14px] md:rounded-[18px] font-bold transition-all text-[11px] sm:text-sm md:text-base shadow-sm ${
                    activeTab === tab
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-black scale-100 shadow-gray-300 dark:shadow-white/10'
                    : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full animate-fade-in px-1 md:px-0 flex flex-col items-center">
          {activeTab === '트리' && <SkillTreeTab profTab={profTab} setProfTab={setProfTab} levels={levels} handleLevelChange={handleLevelChange} resetTree={resetTree} saveAll={saveAll} diffCost={diffCost} activeEffects={activeEffects} />}
          {activeTab === '도구' && <SageToolsTab activeToolId={activeToolId} setActiveToolId={setActiveToolId} toolLevels={toolLevels} handleToolLevelChange={handleToolLevelChange} resetTools={resetTools} saveAll={saveAll} diffToolCost={diffToolCost} getToolImageName={getToolImageName} />}
          {activeTab === '단가' && <PriceSheetTab prices={prices} handlePriceChange={handlePriceChange} saveAll={saveAll} />}
          {activeTab === '기타' && <MiscSettingsTab townRank={townRank} setTownRank={setTownRank} drinkRoutine={drinkRoutine} addDrinkToRoutine={addDrinkToRoutine} removeDrinkFromRoutine={removeDrinkFromRoutine} saveAll={saveAll} currentTownEmoji={currentTownEmoji} currentMaxStamina={currentMaxStamina} dailyDrinkRecovery={dailyDrinkRecovery} totalDailyStamina={totalDailyStamina} TOWN_RANKS={TOWN_RANKS} STAMINA_DRINKS={STAMINA_DRINKS} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}