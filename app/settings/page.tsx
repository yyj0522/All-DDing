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
  { name: '숲 (1~3위)', value: '숲', maxStamina: 3300, emoji: '🌲' },
  { name: '열매 (상위 5%)', value: '열매', maxStamina: 3200, emoji: '🍎' },
  { name: '꽃 (상위 30%)', value: '꽃', maxStamina: 3100, emoji: '🌸' },
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

const SEEDS = ["토마토 씨앗", "양파 씨앗", "마늘 씨앗"];

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
          let displayPrice = row.price;
          if (!SEEDS.includes(row.item_name)) {
            displayPrice = Math.round(row.price / 64);
          }

          if (initialPrices[row.item_name] !== undefined && !isNaN(initialPrices[row.item_name])) {
            finalPrices[row.item_name] = initialPrices[row.item_name];
          } else {
            finalPrices[row.item_name] = displayPrice;
          }
        });

        setPrices({ ...initialPrices, ...finalPrices });
      } else {
        if (sPrices) setPrices(initialPrices);
      }
      setIsLoaded(true);
    };
    fetchData();
  }, []);

  const handleLevelChange = (id: string, delta: number) => {
    const skill = SKILL_DATA[profTab][id];
    if (!skill) return;
    const current = levels[id] || 0;
    let isUnlocked = (skill.req && skill.req2) ? ((levels[skill.req] || 0) > 0 || (levels[skill.req2] || 0) > 0) : (skill.req ? (levels[skill.req] || 0) > 0 : true);
    if (!isUnlocked && delta > 0) return;
    setLevels(prev => ({ ...prev, [id]: Math.max(0, Math.min(skill.max, current + delta)) }));
  };

  const handleToolLevelChange = (id: string, delta: number, max: number) => {
    const current = toolLevels[id] || 0;
    setToolLevels(prev => ({ ...prev, [id]: Math.max(0, Math.min(max, current + delta)) }));
  };

  const handlePriceChange = (item: string, value: string) => {
    const num = parseInt(value);
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

  if (!isLoaded) return <div className="min-h-screen bg-[#050505]"></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-indigo-500/30 flex flex-col relative overflow-x-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[150px] pointer-events-none"></div>

      <Header />

      <style dangerouslySetInnerHTML={{__html: `
        .skill-tree { display: flex; justify-content: center; width: 100%; padding-bottom: 2rem; }
        .skill-tree ul { padding-top: 25px; position: relative; display: flex; justify-content: center; transition: all 0.3s; white-space: nowrap; }
        .skill-tree li { display: inline-block; vertical-align: top; text-align: center; list-style-type: none; position: relative; padding: 25px 5px 0 5px; transition: all 0.3s; }
        .skill-tree li::before, .skill-tree li::after { content: ''; position: absolute; top: 0; right: 50%; border-top: 2px solid #3f3f46; width: 50%; height: 25px; z-index: 1; }
        .skill-tree li::after { right: auto; left: 50%; border-left: 2px solid #3f3f46; }
        .skill-tree li:only-child::after, .skill-tree li:only-child::before { display: none; }
        .skill-tree li:only-child { padding-top: 0; }
        .skill-tree li:first-child::before, .skill-tree li:last-child::after { border: 0 none; }
        .skill-tree li:last-child::before { border-right: 2px solid #3f3f46; border-radius: 0 10px 0 0; }
        .skill-tree li:first-child::after { border-radius: 10px 0 0 0; }
        .skill-tree ul ul::before { content: ''; position: absolute; top: 0; left: 50%; border-left: 2px solid #3f3f46; width: 0; height: 25px; margin-left: -1px; z-index: 1; }
        input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
      `}} />

      <main className="relative z-10 flex-1 max-w-[1600px] w-full mx-auto px-4 pt-32 md:pt-40 pb-20">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">개인 설정 보드</h1>
            <p className="text-gray-400 text-sm md:text-base tracking-wide">전문가 스킬, 세이지 도구 현황 및 재료 단가를 통합 관리합니다.</p>
          </div>
        </div>

        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto max-w-7xl mx-auto custom-scrollbar">
          <button onClick={() => setActiveTab('트리')} className={`px-6 py-2.5 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === '트리' ? 'bg-amber-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>전문가 스킬 현황</button>
          <button onClick={() => setActiveTab('도구')} className={`px-6 py-2.5 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === '도구' ? 'bg-rose-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>세이지 도구 현황</button>
          <button onClick={() => setActiveTab('단가')} className={`px-6 py-2.5 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === '단가' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>개인 재료 단가 시트</button>
          <button onClick={() => setActiveTab('기타')} className={`px-6 py-2.5 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === '기타' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>기타 부가 설정</button>
        </div>

        {activeTab === '트리' && <SkillTreeTab profTab={profTab} setProfTab={setProfTab} levels={levels} handleLevelChange={handleLevelChange} resetTree={resetTree} saveAll={saveAll} diffCost={diffCost} activeEffects={activeEffects} />}
        {activeTab === '도구' && <SageToolsTab activeToolId={activeToolId} setActiveToolId={setActiveToolId} toolLevels={toolLevels} handleToolLevelChange={handleToolLevelChange} resetTools={resetTools} saveAll={saveAll} diffToolCost={diffToolCost} getToolImageName={getToolImageName} />}
        {activeTab === '단가' && <PriceSheetTab prices={prices} handlePriceChange={handlePriceChange} saveAll={saveAll} />}
        {activeTab === '기타' && <MiscSettingsTab townRank={townRank} setTownRank={setTownRank} drinkRoutine={drinkRoutine} addDrinkToRoutine={addDrinkToRoutine} removeDrinkFromRoutine={removeDrinkFromRoutine} saveAll={saveAll} currentTownEmoji={currentTownEmoji} currentMaxStamina={currentMaxStamina} dailyDrinkRecovery={dailyDrinkRecovery} totalDailyStamina={totalDailyStamina} TOWN_RANKS={TOWN_RANKS} STAMINA_DRINKS={STAMINA_DRINKS} />}

      </main>
      <Footer />
    </div>
  );
}