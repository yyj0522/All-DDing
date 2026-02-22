'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import SkillTree from '@/components/SkillTree';
import { SKILL_DATA, INGREDIENTS, Profession, ITEM_IMAGES } from '@/lib/skillData';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'트리'|'단가'>('트리');
  const [profTab, setProfTab] = useState<Profession>('재배');
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [savedLevels, setSavedLevels] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const sLevels = localStorage.getItem('alldding_profession');
      const sPrices = localStorage.getItem('alldding_prices');
      
      if (sLevels) {
        const p = JSON.parse(sLevels);
        setLevels(p);
        setSavedLevels(p);
      }

      let initialPrices: Record<string, number> = {};
      
      if (sPrices) {
        initialPrices = JSON.parse(sPrices);
      }
      
      const { data, error } = await supabase.from('item_prices').select('*').eq('category', 'ingredient');
      if (data && !error) {
        const dbPrices: Record<string, number> = {};
        data.forEach(row => { dbPrices[row.item_name] = row.price; });
        
        const mergedPrices = { ...dbPrices, ...initialPrices };
        setPrices(mergedPrices);
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
    
    let isUnlocked = false;
    if (skill.req && skill.req2) {
      isUnlocked = (levels[skill.req] || 0) > 0 || (levels[skill.req2] || 0) > 0;
    } else if (skill.req) {
      isUnlocked = (levels[skill.req] || 0) > 0;
    } else {
      isUnlocked = true;
    }

    if (!isUnlocked && delta > 0) return;
    setLevels(prev => ({ ...prev, [id]: Math.max(0, Math.min(skill.max, current + delta)) }));
  };

  const handlePriceChange = (item: string, value: string) => {
    const num = parseInt(value);
    setPrices(prev => ({ ...prev, [item]: isNaN(num) ? 0 : num }));
  };

  const saveAll = () => {
    localStorage.setItem('alldding_profession', JSON.stringify(levels));
    localStorage.setItem('alldding_prices', JSON.stringify(prices));
    
    const profitSkillLevel = levels['f15'] || 0;
    localStorage.setItem('alldding_skill', String(profitSkillLevel));

    setSavedLevels(levels);
    alert('개인 설정이 성공적으로 저장되었습니다.');
  };

  const resetTree = () => {
    if(confirm('스킬 트리를 초기화 하시겠습니까? (로컬 데이터 삭제)')) {
      setLevels({});
      setSavedLevels({});
      localStorage.removeItem('alldding_profession');
    }
  };

  const diffCost = useMemo(() => {
    let gold = 0; let stone = 0; let point = 0;
    Object.values(SKILL_DATA[profTab] || {}).forEach(skill => {
      const cur = levels[skill.id] || 0;
      const sav = savedLevels[skill.id] || 0;
      for (let i = sav; i < cur; i++) {
        gold += skill.costs[i].g;
        stone += skill.costs[i].s;
        point += skill.costs[i].p;
      }
    });
    return { gold, stone, point };
  }, [levels, savedLevels, profTab]);

  const activeEffects = useMemo(() => {
    const effects: string[] = [];
    Object.values(SKILL_DATA[profTab] || {}).forEach(skill => {
      const lv = levels[skill.id] || 0;
      if (lv > 0) {
        effects.push(`${skill.name.replace(/\[.*?\] /, '')}: ${skill.costs[lv - 1].effect}`);
      }
    });
    return effects;
  }, [levels, profTab]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col relative overflow-x-hidden">
        <Header />
        <main className="relative z-10 flex-1 max-w-[1600px] w-full mx-auto px-4 pt-32 md:pt-40 pb-20">
          <div className="mb-10 max-w-7xl mx-auto space-y-4">
            <div className="w-64 h-12 bg-white/5 animate-pulse rounded-2xl"></div>
            <div className="w-96 h-4 bg-white/5 animate-pulse rounded-full"></div>
          </div>
          <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 max-w-7xl mx-auto">
            <div className="w-32 h-10 bg-white/5 animate-pulse rounded-xl"></div>
            <div className="w-32 h-10 bg-white/5 animate-pulse rounded-xl"></div>
          </div>
          <div className="flex flex-col xl:flex-row gap-8 w-full justify-center max-w-7xl mx-auto">
            <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 min-h-[500px] animate-pulse"></div>
            <div className="w-full xl:w-80 flex flex-col gap-5">
              <div className="w-full h-40 bg-white/5 rounded-3xl animate-pulse"></div>
              <div className="w-full h-14 bg-white/5 rounded-2xl animate-pulse"></div>
              <div className="w-full h-64 bg-white/5 rounded-3xl animate-pulse"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
        
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}} />

      <main className="relative z-10 flex-1 max-w-[1600px] w-full mx-auto px-4 pt-32 md:pt-40 pb-20">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">개인 설정 보드</h1>
            <p className="text-gray-400 text-sm md:text-base tracking-wide">
              전문가 스킬 트리 시뮬레이션 및 재료 단가를 통합 관리합니다.
            </p>
          </div>
        </div>

        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto max-w-7xl mx-auto">
          <button onClick={() => setActiveTab('트리')} className={`px-6 py-2.5 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === '트리' ? 'bg-amber-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            전문가 스킬 현황
          </button>
          <button onClick={() => setActiveTab('단가')} className={`px-6 py-2.5 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === '단가' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            개인 재료 단가 시트
          </button>
        </div>

        {activeTab === '트리' && (
          <div className="flex flex-col gap-8 animate-fade-in-up w-full max-w-7xl mx-auto">
            <div className="flex justify-center gap-2 md:gap-4 mb-4 overflow-x-auto pb-2 custom-scrollbar w-full">
              {(['재배', '채광', '해양', '사냥'] as Profession[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setProfTab(tab)}
                  className={`px-8 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${
                    profTab === tab 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/50 shadow-[0_0_15px_rgba(251,191,36,0.1)]' 
                    : 'bg-[#0a0a0a] border border-white/5 text-gray-500 hover:bg-white/5 hover:text-gray-300'
                  }`}
                >
                  {tab} 전문가
                </button>
              ))}
            </div>

            <div className="flex flex-col xl:flex-row gap-8 w-full justify-center">
              <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col w-full xl:max-w-[1100px]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">{profTab} 스킬 트리</h2>
                  <button onClick={resetTree} className="text-xs text-gray-400 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5">트리 초기화</button>
                </div>
                
                {profTab === '재배' && (
                  <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-bold text-center">
                    [씨앗은 덤이야], [왕 크니까 왕 좋아], [오늘도 풍년이다!] 스킬은 요리 효율 분석의 <span className="text-white">베이스 원가 기댓값</span>에 자동 반영됩니다.
                  </div>
                )}
                
                <div className="w-full overflow-x-auto custom-scrollbar pb-8 flex-1">
                  <SkillTree profTab={profTab} levels={levels} onLevelChange={handleLevelChange} />
                </div>
              </div>

              <div className="w-full xl:w-80 flex flex-col gap-5 flex-shrink-0">
                <div className="bg-gradient-to-br from-amber-900/20 to-black border border-amber-500/20 rounded-3xl p-6 shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-2">추가 요구 재화</h3>
                  <p className="text-xs text-gray-400 mb-6">마지막 저장 시점 대비 누적 비용</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-sm font-bold text-gray-400">필요 골드</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-amber-400 text-xl">{diffCost.gold.toLocaleString()}</span>
                        <img src="/icons/coin.png" alt="G" className="w-5 h-5 object-contain" onError={(e) => {e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden')}} />
                        <span className="text-amber-400 font-bold hidden">G</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-sm font-bold text-gray-400">어빌리티 스톤</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-blue-400 text-xl">{diffCost.stone.toLocaleString()}</span>
                        <img src="/icons/ability_stone.png" alt="스톤" className="w-5 h-5 object-contain" style={{ imageRendering: 'pixelated' }} onError={(e) => {e.currentTarget.style.display='none';}} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-400">스킬 포인트</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-emerald-400 text-xl">{diffCost.point.toLocaleString()}</span>
                        <img src="/icons/skill_arc.png" alt="P" className="w-5 h-5 object-contain" style={{ imageRendering: 'pixelated' }} onError={(e) => {e.currentTarget.style.display='none';}} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <button onClick={saveAll} className="w-full bg-white text-black hover:bg-gray-200 font-black px-8 py-3.5 rounded-2xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-[1.02]">
                  전체 설정 저장하기
                </button>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl flex-1 min-h-[250px] flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    활성화된 효과 요약
                  </h3>
                  <div className="overflow-y-auto custom-scrollbar flex-1 space-y-2 pr-2">
                    {activeEffects.length > 0 ? activeEffects.map((eff, i) => (
                      <div key={i} className="text-xs font-bold text-gray-300 bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                        {eff}
                      </div>
                    )) : (
                      <div className="text-sm text-gray-600 text-center py-10">활성화된 스킬이 없습니다.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === '단가' && (
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in-up max-w-7xl mx-auto relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">재료 단가 입력 시트</h2>
                <div className="bg-amber-400/10 border border-amber-400/20 text-amber-400 px-4 py-3 rounded-xl text-sm font-bold w-fit">
                  입력되는 모든 재료의 가격은 <span className="text-white">1셋(64개) 단위</span> 기준입니다.
                </div>
              </div>
              <button onClick={saveAll} className="w-full md:w-auto bg-white text-black hover:bg-gray-200 font-black px-8 py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] whitespace-nowrap h-fit hover:scale-[1.02]">
                전체 설정 저장하기
              </button>
            </div>
            
            <div className="flex flex-col gap-12">
              {Object.entries(INGREDIENTS).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-black tracking-widest text-gray-500 mb-4 border-l-2 border-indigo-500 pl-3 uppercase">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map((item, idx) => (
                      <div key={idx} className="bg-black border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/20 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/5 rounded border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img 
                              src={`/ingredients/${ITEM_IMAGES[item]}.png`} 
                              alt={item}
                              className="w-6 h-6 object-contain"
                              style={{ imageRendering: 'pixelated' }}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          </div>
                          <label className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors truncate w-[70px]" title={item}>
                            {item}
                          </label>
                        </div>
                        <div className="relative w-20 flex-shrink-0">
                          <input 
                            type="number" 
                            placeholder="0"
                            value={prices[item] === 0 ? '' : prices[item] || ''}
                            onChange={(e) => handlePriceChange(item, e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-2 pr-6 text-white text-right text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-600">G</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}