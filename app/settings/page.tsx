'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

type Profession = '재배' | '채광' | '사냥' | '해양';

interface SkillCost { p: number; g: number; s: number; effect: string }
interface SkillNode { id: string; name: string; max: number; req: string | null; costs: SkillCost[] }

const SKILL_DATA: Record<Profession, Record<string, SkillNode>> = {
  '재배': {
    f1: { id: 'f1', name: '[아일랜드] 재배학개론', max: 7, req: null, costs: [
      { p: 1, g: 5000, s: 2, effect: "채집 경험치 +1%" }, { p: 2, g: 10000, s: 4, effect: "채집 경험치 +2%" }, { p: 5, g: 25000, s: 10, effect: "채집 경험치 +3%" }, { p: 10, g: 100000, s: 20, effect: "채집 경험치 +5%" }, { p: 25, g: 400000, s: 50, effect: "채집 경험치 +7%" }, { p: 30, g: 2000000, s: 60, effect: "채집 경험치 +9%" }, { p: 50, g: 5000000, s: 100, effect: "채집 경험치 +15%" }
    ]},
    f2: { id: 'f2', name: '[야생] 난 아직 베고파', max: 4, req: 'f1', costs: [
      { p: 1, g: 5000, s: 2, effect: "원목 추가 드롭 +10% (1개)" }, { p: 2, g: 30000, s: 4, effect: "원목 추가 드롭 +30% (1개)" }, { p: 5, g: 300000, s: 10, effect: "원목 추가 드롭 +50% (2개)" }, { p: 10, g: 500000, s: 20, effect: "원목 추가 드롭 +70% (2개)" }
    ]},
    f3: { id: 'f3', name: '[아일랜드] 후르츠 파티', max: 5, req: 'f1', costs: [
      { p: 1, g: 5000, s: 2, effect: "과일 추가 드롭 +1% (1개)" }, { p: 5, g: 300000, s: 10, effect: "과일 추가 드롭 +3% (1개)" }, { p: 10, g: 500000, s: 20, effect: "과일 추가 드롭 +5% (1개)" }, { p: 20, g: 1000000, s: 40, effect: "과일 추가 드롭 +10% (2개)" }, { p: 30, g: 3000000, s: 60, effect: "과일 추가 드롭 +30% (2개)" }
    ]},
    f4: { id: 'f4', name: '[아일랜드] 불 더 올려!', max: 5, req: 'f2', costs: [
      { p: 10, g: 10000, s: 20, effect: "제작 시간 -10%" }, { p: 30, g: 1000000, s: 60, effect: "제작 시간 -30%" }, { p: 50, g: 3000000, s: 100, effect: "제작 시간 -40%" }, { p: 70, g: 5000000, s: 140, effect: "제작 시간 -60%" }, { p: 100, g: 7000000, s: 200, effect: "제작 시간 -80%" }
    ]},
    f5: { id: 'f5', name: '[아일랜드] 한 솥 가득', max: 5, req: 'f4', costs: [
      { p: 1, g: 5000, s: 2, effect: "3세트 판매 보너스 +1%" }, { p: 15, g: 150000, s: 30, effect: "3세트 판매 보너스 +2%" }, { p: 50, g: 1000000, s: 100, effect: "3세트 판매 보너스 +3%" }, { p: 70, g: 10000000, s: 140, effect: "3세트 판매 보너스 +4%" }, { p: 100, g: 15000000, s: 200, effect: "3세트 판매 보너스 +7%" }
    ]},
    f6: { id: 'f6', name: '[아일랜드] 5성급 주방', max: 5, req: 'f5', costs: [
      { p: 10, g: 10000, s: 20, effect: "대기 슬롯 5개" }, { p: 30, g: 500000, s: 60, effect: "대기 슬롯 6개" }, { p: 50, g: 1000000, s: 100, effect: "대기 슬롯 7개" }, { p: 70, g: 3000000, s: 140, effect: "대기 슬롯 8개" }, { p: 100, g: 5000000, s: 200, effect: "대기 슬롯 9개" }
    ]},
    f7: { id: 'f7', name: '[마을] 씨앗 장전 완료!', max: 2, req: 'f6', costs: [
      { p: 50, g: 5000000, s: 100, effect: "씨앗 심기 범위 5x3" }, { p: 100, g: 10000000, s: 200, effect: "씨앗 심기 범위 5x15" }
    ]},
    f8: { id: 'f8', name: '[마을] 오늘도 풍년이다!', max: 7, req: 'f2', costs: [
      { p: 1, g: 5000, s: 2, effect: "농작물 추가 드롭 +1% (1개)" }, { p: 3, g: 10000, s: 6, effect: "농작물 추가 드롭 +2% (1개)" }, { p: 7, g: 25000, s: 14, effect: "농작물 추가 드롭 +3% (1개)" }, { p: 15, g: 75000, s: 30, effect: "농작물 추가 드롭 +4% (1개)" }, { p: 40, g: 500000, s: 80, effect: "농작물 추가 드롭 +5% (2개)" }, { p: 100, g: 5000000, s: 200, effect: "농작물 추가 드롭 +7% (2개)" }, { p: 150, g: 7000000, s: 300, effect: "농작물 추가 드롭 +10% (3개)" }
    ]},
    f9: { id: 'f9', name: '[마을] 왕 크니까 왕 좋아', max: 4, req: 'f8', costs: [
      { p: 1, g: 5000, s: 2, effect: "대왕 작물 확률 0.5%" }, { p: 5, g: 50000, s: 10, effect: "대왕 작물 확률 1%" }, { p: 20, g: 700000, s: 40, effect: "대왕 작물 확률 3%" }, { p: 50, g: 5000000, s: 100, effect: "대왕 작물 확률 5%" }
    ]},
    f10: { id: 'f10', name: '[마을] 수확은 한방에!', max: 2, req: 'f9', costs: [
      { p: 50, g: 5000000, s: 100, effect: "수확 범위 5x3" }, { p: 100, g: 10000000, s: 200, effect: "수확 범위 5x15" }
    ]},
    f11: { id: 'f11', name: '[아일랜드] 쓸어담는 맛', max: 5, req: 'f3', costs: [
      { p: 1, g: 10000, s: 2, effect: "과일 캐기 시간 5초" }, { p: 3, g: 100000, s: 6, effect: "과일 캐기 시간 10초" }, { p: 7, g: 500000, s: 14, effect: "과일 캐기 시간 20초" }, { p: 15, g: 2000000, s: 30, effect: "과일 캐기 시간 25초" }, { p: 30, g: 5000000, s: 60, effect: "과일 캐기 시간 30초" }
    ]},
    f12: { id: 'f12', name: '[마을] 씨앗은 덤이야', max: 10, req: 'f11', costs: [
      { p: 1, g: 5000, s: 2, effect: "씨앗 드롭 +1%" }, { p: 2, g: 15000, s: 4, effect: "씨앗 드롭 +2%" }, { p: 5, g: 30000, s: 10, effect: "씨앗 드롭 +3%" }, { p: 8, g: 50000, s: 16, effect: "씨앗 드롭 +4%" }, { p: 15, g: 100000, s: 30, effect: "씨앗 드롭 +5%" }, { p: 25, g: 250000, s: 50, effect: "씨앗 드롭 +6%" }, { p: 40, g: 1000000, s: 80, effect: "씨앗 드롭 +7%" }, { p: 80, g: 3000000, s: 160, effect: "씨앗 드롭 +10%" }, { p: 100, g: 5000000, s: 200, effect: "씨앗 드롭 +20%" }, { p: 150, g: 7000000, s: 300, effect: "씨앗 드롭 +30%" }
    ]},
    f13: { id: 'f13', name: '[아일랜드] 가공의 신', max: 5, req: 'f12', costs: [
      { p: 10, g: 10000, s: 20, effect: "가공 슬롯 5개" }, { p: 30, g: 500000, s: 60, effect: "가공 슬롯 6개" }, { p: 50, g: 1000000, s: 100, effect: "가공 슬롯 7개" }, { p: 70, g: 3000000, s: 140, effect: "가공 슬롯 8개" }, { p: 100, g: 5000000, s: 200, effect: "가공 슬롯 9개" }
    ]},
    f14: { id: 'f14', name: '[아일랜드] 자연이 주는 선물', max: 10, req: 'f3', costs: [
      { p: 1, g: 5000, s: 2, effect: "씨앗 추가 드롭 +1% (1개)" }, { p: 2, g: 10000, s: 4, effect: "씨앗 추가 드롭 +2% (1개)" }, { p: 5, g: 30000, s: 10, effect: "씨앗 추가 드롭 +3% (1개)" }, { p: 8, g: 50000, s: 16, effect: "씨앗 추가 드롭 +4% (1개)" }, { p: 15, g: 100000, s: 30, effect: "씨앗 추가 드롭 +5% (2개)" }, { p: 25, g: 250000, s: 50, effect: "씨앗 추가 드롭 +6% (2개)" }, { p: 40, g: 700000, s: 80, effect: "씨앗 추가 드롭 +7% (3개)" }, { p: 50, g: 1500000, s: 100, effect: "씨앗 추가 드롭 +8% (4개)" }, { p: 60, g: 3000000, s: 120, effect: "씨앗 추가 드롭 +9% (5개)" }, { p: 100, g: 7000000, s: 200, effect: "씨앗 추가 드롭 +10% (8개)" }
    ]},
    f15: { id: 'f15', name: '[아일랜드] 돈 좀 벌어볼까?', max: 10, req: 'f14', costs: [
      { p: 1, g: 10000, s: 2, effect: "요리 판매가 +1%" }, { p: 3, g: 30000, s: 6, effect: "요리 판매가 +2%" }, { p: 7, g: 50000, s: 14, effect: "요리 판매가 +3%" }, { p: 15, g: 300000, s: 30, effect: "요리 판매가 +4%" }, { p: 30, g: 1000000, s: 60, effect: "요리 판매가 +5%" }, { p: 50, g: 2000000, s: 100, effect: "요리 판매가 +6%" }, { p: 60, g: 3000000, s: 120, effect: "요리 판매가 +10%" }, { p: 70, g: 5000000, s: 140, effect: "요리 판매가 +15%" }, { p: 80, g: 10000000, s: 160, effect: "요리 판매가 +30%" }, { p: 100, g: 15000000, s: 200, effect: "요리 판매가 +50%" }
    ]},
    f16: { id: 'f16', name: '[아일랜드] 불붙은 괭이', max: 10, req: 'f15', costs: [
      { p: 1, g: 10000, s: 2, effect: "베이스 추가 드롭 +1% (1개)" }, { p: 3, g: 30000, s: 6, effect: "베이스 추가 드롭 +2% (1개)" }, { p: 7, g: 50000, s: 14, effect: "베이스 추가 드롭 +3% (2개)" }, { p: 10, g: 300000, s: 20, effect: "베이스 추가 드롭 +4% (2개)" }, { p: 20, g: 700000, s: 40, effect: "베이스 추가 드롭 +5% (2개)" }, { p: 35, g: 1000000, s: 70, effect: "베이스 추가 드롭 +6% (3개)" }, { p: 70, g: 2000000, s: 140, effect: "베이스 추가 드롭 +7% (3개)" }, { p: 100, g: 3000000, s: 200, effect: "베이스 추가 드롭 +8% (5개)" }, { p: 120, g: 5000000, s: 240, effect: "베이스 추가 드롭 +9% (5개)" }, { p: 150, g: 7000000, s: 300, effect: "베이스 추가 드롭 +15% (7개)" }
    ]},
    f17: { id: 'f17', name: '[아일랜드] 신선함 유지 기술', max: 3, req: 'f16', costs: [
      { p: 50, g: 5000000, s: 100, effect: "유통기한 3일" }, { p: 70, g: 10000000, s: 140, effect: "유통기한 4일" }, { p: 100, g: 30000000, s: 200, effect: "유통기한 5일" }
    ]}
  },
  '채광': {},
  '사냥': {},
  '해양': {}
};

const INGREDIENTS = {
  농작물: ["토마토 베이스", "양파 베이스", "마늘 베이스", "호박 묶음", "감자 묶음", "당근 묶음", "비트 묶음", "수박 묶음", "달콤한 열매 묶음"],
  고기류: ["익힌 돼지고기", "익힌 돼지 삼겹살", "익힌 양고기", "익힌 양 갈비살", "익힌 닭 가슴살", "익힌 닭 다리살", "익힌 닭고기", "스테이크", "익힌 소 등심", "익힌 돼지 앞다리살", "익힌 양 다리살", "익힌 소 갈비살"],
  기타: ["설탕 큐브", "버터 조각", "치즈 조각", "밀가루 반죽", "요리용 소금", "파인애플", "코코넛", "요리용 우유", "오일"]
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'트리'|'단가'>('트리');
  const [profTab, setProfTab] = useState<Profession>('재배');
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [savedLevels, setSavedLevels] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const sLevels = localStorage.getItem('alldding_profession');
    const sPrices = localStorage.getItem('alldding_prices');
    if (sLevels) {
      const p = JSON.parse(sLevels);
      setLevels(p);
      setSavedLevels(p);
    }
    if (sPrices) setPrices(JSON.parse(sPrices));
    setIsLoaded(true);
  }, []);

  const handleLevelChange = (id: string, delta: number) => {
    const skill = SKILL_DATA[profTab][id];
    if (!skill) return;
    const current = levels[id] || 0;
    const reqLevel = skill.req ? (levels[skill.req] || 0) : 1;
    if (reqLevel === 0 && delta > 0) return;
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
    Object.values(SKILL_DATA[profTab]).forEach(skill => {
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
    Object.values(SKILL_DATA[profTab]).forEach(skill => {
      const lv = levels[skill.id] || 0;
      if (lv > 0) {
        effects.push(`${skill.name.replace(/\[.*?\] /, '')}: ${skill.costs[lv - 1].effect}`);
      }
    });
    return effects;
  }, [levels, profTab]);

  const SkillBox = ({ id }: { id: string }) => {
    const skill = SKILL_DATA[profTab][id];
    if(!skill) return null;
    const lv = levels[id] || 0;
    const isUnlocked = !skill.req || (levels[skill.req] || 0) > 0;
    
    return (
      <div className={`inline-block w-36 md:w-44 bg-[#0a0a0a] border-2 rounded-2xl p-3 flex flex-col items-center gap-2 shadow-lg transition-all z-10 ${isUnlocked ? (lv > 0 ? 'border-amber-500 bg-amber-500/5' : 'border-gray-600') : 'border-gray-800 opacity-40'}`}>
        <div className={`mx-auto w-8 h-8 rounded-lg border flex items-center justify-center text-[8px] font-bold ${isUnlocked ? 'bg-white/10 border-white/20 text-white' : 'bg-black border-gray-700 text-gray-600'}`}>IMG</div>
        <div className="text-[11px] md:text-xs font-bold text-white text-center leading-tight h-8 flex items-center justify-center break-keep w-full px-1">{skill.name}</div>
        <div className="flex items-center gap-2 bg-black rounded-xl p-1.5 w-full justify-between border border-white/5">
          <button onClick={() => handleLevelChange(id, -1)} disabled={lv === 0} className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white disabled:opacity-30 bg-white/5 rounded-lg">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
          </button>
          <span className={`text-[10px] md:text-xs font-black tracking-widest ${lv > 0 ? 'text-amber-400' : 'text-gray-500'}`}>{lv}/{skill.max}</span>
          <button onClick={() => handleLevelChange(id, 1)} disabled={!isUnlocked || lv === skill.max} className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white disabled:opacity-30 bg-white/5 rounded-lg">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </div>
    );
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-indigo-500/30 flex flex-col relative">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[150px] pointer-events-none"></div>

      <Header />

      <style dangerouslySetInnerHTML={{__html: `
        .skill-tree { display: flex; justify-content: center; overflow-x: auto; padding-bottom: 2rem; width: 100%; }
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
      `}} />

      <main className="relative z-10 flex-1 max-w-[1600px] w-full mx-auto px-4 pt-32 md:pt-40 pb-20">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">개인 설정 보드</h1>
            <p className="text-gray-400 text-sm md:text-base tracking-wide">
              전문가 스킬 트리 시뮬레이션 및 재료 단가를 통합 관리합니다.
            </p>
          </div>
          <button onClick={saveAll} className="bg-white text-black hover:bg-gray-200 font-black px-8 py-3.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)] whitespace-nowrap">
            전체 설정 저장하기
          </button>
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
          <div className="flex flex-col gap-8 animate-fade-in-up">
            
            <div className="flex justify-center gap-2 md:gap-4 mb-4 overflow-x-auto pb-2 custom-scrollbar w-full">
              {(['재배', '채광', '사냥', '해양'] as Profession[]).map((tab) => (
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
              
              <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-w-[1200px]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">{profTab} 스킬 트리</h2>
                  <button onClick={resetTree} className="text-xs text-gray-400 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5">트리 초기화</button>
                </div>
                
                <div className="w-full overflow-x-auto custom-scrollbar pb-8 flex-1">
                  {profTab === '재배' ? (
                    <div className="skill-tree min-w-max mx-auto transform scale-90 md:scale-100 origin-top">
                      <ul>
                        <li>
                          <SkillBox id="f1" />
                          <ul>
                            <li>
                              <SkillBox id="f2" />
                              <ul>
                                <li>
                                  <SkillBox id="f8" />
                                  <ul>
                                    <li><SkillBox id="f9" />
                                      <ul>
                                        <li><SkillBox id="f10" /></li>
                                      </ul>
                                    </li>
                                  </ul>
                                </li>
                                <li>
                                  <SkillBox id="f4" />
                                  <ul>
                                    <li><SkillBox id="f5" />
                                      <ul>
                                        <li><SkillBox id="f6" />
                                          <ul>
                                            <li><SkillBox id="f7" /></li>
                                          </ul>
                                        </li>
                                      </ul>
                                    </li>
                                  </ul>
                                </li>
                              </ul>
                            </li>
                            <li>
                              <SkillBox id="f3" />
                              <ul>
                                <li>
                                  <SkillBox id="f11" />
                                  <ul>
                                    <li><SkillBox id="f12" />
                                      <ul>
                                        <li><SkillBox id="f13" /></li>
                                      </ul>
                                    </li>
                                  </ul>
                                </li>
                                <li>
                                  <SkillBox id="f14" />
                                  <ul>
                                    <li><SkillBox id="f15" />
                                      <ul>
                                        <li><SkillBox id="f16" />
                                          <ul>
                                            <li><SkillBox id="f17" /></li>
                                          </ul>
                                        </li>
                                      </ul>
                                    </li>
                                  </ul>
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500 font-bold">해당 전문가의 스킬 트리를 준비 중입니다.</div>
                  )}
                </div>
              </div>

              <div className="w-full xl:w-80 flex flex-col gap-6 flex-shrink-0">
                <div className="bg-gradient-to-br from-amber-900/20 to-black border border-amber-500/20 rounded-3xl p-6 shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-2">추가 요구 재화</h3>
                  <p className="text-xs text-gray-400 mb-6">마지막 저장 시점 대비 누적 비용</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-sm font-bold text-gray-400">필요 골드</span>
                      <span className="font-black text-amber-400 text-xl">{diffCost.gold.toLocaleString()} G</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-sm font-bold text-gray-400">어빌리티 스톤</span>
                      <span className="font-black text-blue-400 text-xl">{diffCost.stone.toLocaleString()} 개</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-400">스킬 포인트</span>
                      <span className="font-black text-emerald-400 text-xl">{diffCost.point.toLocaleString()} P</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl flex-1 min-h-[300px] flex flex-col">
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
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in-up max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8">재료 단가 입력 시트</h2>
            <div className="flex flex-col gap-12">
              {Object.entries(INGREDIENTS).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-black tracking-widest text-gray-500 mb-4 border-l-2 border-indigo-500 pl-3 uppercase">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {items.map((item, idx) => (
                      <div key={idx} className="bg-black border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/20 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/5 rounded border border-white/10 flex items-center justify-center text-[8px] text-gray-600 font-bold flex-shrink-0">
                            IMG
                          </div>
                          <label className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors truncate w-20" title={item}>
                            {item}
                          </label>
                        </div>
                        <div className="relative w-20 flex-shrink-0">
                          <input 
                            type="number" 
                            placeholder="0"
                            value={prices[item] === 0 ? '' : prices[item] || ''}
                            onChange={(e) => handlePriceChange(item, e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-2 pr-6 text-white text-right text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors"
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