'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getImagePath, MINE_FIXED_PRICES, PRICE_BUFF_EFFECTS, PICKAXE_BASE_DROPS, LUCKY_HIT_EFFECTS, GEM_DROP_EFFECTS } from '@/lib/professionData';
import { SAGE_TOOL_EFFECTS } from '@/lib/sageData';

interface Props {
  userStats: any;
  targetZone: '코룸' | '리프톤' | '세렌트';
  setTargetZone: (zone: any) => void;
  results: any;
}

const M16_BUFF_EFFECTS = [0, 0.05, 0.07, 0.10, 0.15, 0.20, 0.30];

const APPRAISAL_BASE_EXPECTATION = {
  '코룸': 343762,   // (281772 * 0.6) + (394481 * 0.3) + (563544 * 0.1)
  '리프톤': 344858, // (282671 * 0.6) + (395739 * 0.3) + (565341 * 0.1)
  '세렌트': 340923  // (279445 * 0.6) + (391223 * 0.3) + (558890 * 0.1)
};

export default function MiningStatsTab({ userStats, targetZone, setTargetZone, results }: Props) {
  const { expectedIngots, expectedGems, expectedRelics, expectedRelicPoints, ingotRevenue, gemRevenue, totalRevenue } = results;
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

  const [marketPrices, setMarketPrices] = useState({
    abilityStone: 0, lifestone1: 0, lifestone2: 0, lifestone3: 0,
    topazBlock: 0, sapphireBlock: 0, platinumBlock: 0,
    corumIngot: 0, leaftoneIngot: 0, serentIngot: 0,
    cobbleBundle: 0, deepslateBundle: 0,
    copperBlock: 0, redstoneBlock: 0, lapisBlock: 0,
    ironBlock: 0, diamondBlock: 0, amethystBlock: 0, goldBlock: 0
  });

  const [stoneMethod, setStoneMethod] = useState<'buy' | 'exchange'>('buy');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedPrices = localStorage.getItem('alldding_mining_market');
    const savedMethod = localStorage.getItem('alldding_stone_method');
    if (savedPrices) {
      try { 
        const parsed = JSON.parse(savedPrices);
        setMarketPrices(prev => ({ ...prev, ...parsed })); 
      } catch (e) {}
    }
    if (savedMethod === 'buy' || savedMethod === 'exchange') {
      setStoneMethod(savedMethod);
    }
    setIsLoaded(true);
  }, []);

  const handlePriceChange = (key: keyof typeof marketPrices, value: string) => {
    const num = parseFloat(value);
    const newPrices = { ...marketPrices, [key]: isNaN(num) ? 0 : num };
    setMarketPrices(newPrices);
    localStorage.setItem('alldding_mining_market', JSON.stringify(newPrices));
  };

  const handleMethodChange = (method: 'buy' | 'exchange') => {
    setStoneMethod(method);
    localStorage.setItem('alldding_stone_method', method);
  };

  const strategyAnalysis = useMemo(() => {
    if (!isLoaded) return null;

    const m16Buff = M16_BUFF_EFFECTS[userStats.m16Lv || 0] || 0;
    const ingotBuff = PRICE_BUFF_EFFECTS[userStats.ingotBuffLv || 0] || 0;

    const baseIngotPrice = MINE_FIXED_PRICES.ingots.find(i => i.zone === targetZone)?.base || 0;
    const npcProfit = Math.round(baseIngotPrice * (1 + ingotBuff));
    const npcVal = npcProfit || 0;

    let stoneProfit = 0;
    let stoneReq = 1;
    if (stoneMethod === 'buy') {
      let otherCost = 0;
      if (targetZone === '코룸') otherCost = ((marketPrices.leaftoneIngot || 0) + (marketPrices.serentIngot || 0)) / 64;
      if (targetZone === '리프톤') otherCost = ((marketPrices.corumIngot || 0) + (marketPrices.serentIngot || 0)) / 64;
      if (targetZone === '세렌트') otherCost = ((marketPrices.corumIngot || 0) + (marketPrices.leaftoneIngot || 0)) / 64;
      stoneProfit = (marketPrices.abilityStone || 0) - otherCost;
      stoneReq = 1;
    } else {
      stoneProfit = (marketPrices.abilityStone || 0);
      stoneReq = 3;
    }
    const stoneVal = Math.round(stoneProfit / stoneReq) || 0;

    const expectedAppraisalRev = Math.round(APPRAISAL_BASE_EXPECTATION[targetZone] * (1 + m16Buff));
    
    // 블록 단위를 1개로 변경했으므로 64로 나누지 않고 바로 * 3 연산 적용
    let blockCost = 0;
    if (targetZone === '코룸') blockCost = (marketPrices.topazBlock || 0) * 3;
    if (targetZone === '리프톤') blockCost = (marketPrices.sapphireBlock || 0) * 3;
    if (targetZone === '세렌트') blockCost = (marketPrices.platinumBlock || 0) * 3;

    const ROYAL_TOKEN_COST = 10000;
    const totalAppraisalCost = blockCost + ROYAL_TOKEN_COST;
    const appraisalProfitPerCraft = expectedAppraisalRev - totalAppraisalCost;
    const appraisalVal = Math.round(appraisalProfitPerCraft / 32) || 0;

    let lifeProfit = 0;
    let lifeReq = 1;
    let lifeName = '';
    if (targetZone === '코룸') {
      lifeName = '하급 라이프스톤';
      const cost = (((marketPrices.cobbleBundle || 0) * 2) + ((marketPrices.copperBlock || 0) * 8) + ((marketPrices.redstoneBlock || 0) * 3)) / 64;
      lifeProfit = (marketPrices.lifestone1 || 0) - cost;
      lifeReq = 1;
    } else if (targetZone === '리프톤') {
      lifeName = '중급 라이프스톤';
      const cost = (((marketPrices.deepslateBundle || 0) * 2) + ((marketPrices.lapisBlock || 0) * 5) + ((marketPrices.ironBlock || 0) * 5) + ((marketPrices.diamondBlock || 0) * 3)) / 64;
      lifeProfit = (marketPrices.lifestone2 || 0) - cost;
      lifeReq = 2;
    } else if (targetZone === '세렌트') {
      lifeName = '상급 라이프스톤';
      const cost = (((marketPrices.copperBlock || 0) * 30) + ((marketPrices.amethystBlock || 0) * 20) + ((marketPrices.ironBlock || 0) * 7) + ((marketPrices.goldBlock || 0) * 7) + ((marketPrices.diamondBlock || 0) * 5)) / 64;
      lifeProfit = (marketPrices.lifestone3 || 0) - cost;
      lifeReq = 3;
    }
    const lifeVal = Math.round(lifeProfit / lifeReq) || 0;

    const options = [
      { type: 'appraisal', name: '귀중품 세공 (감정)', val: appraisalVal, profit: appraisalProfitPerCraft, req: 32, limit: 5, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20' },
      { type: 'stone', name: '어빌리티 스톤 제작', val: stoneVal, profit: stoneProfit, req: stoneReq, limit: Infinity, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
      { type: 'lifestone', name: lifeName, val: lifeVal, profit: lifeProfit, req: lifeReq, limit: Infinity, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
      { type: 'npc', name: 'NPC 상점 매각', val: npcVal, profit: npcProfit, req: 1, limit: Infinity, color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-50 dark:bg-[#111113]' }
    ].sort((a, b) => b.val - a.val);

    let remaining = expectedIngots || 0;
    let optimizedValue = 0;
    const plan = [];

    for (const opt of options) {
      if (remaining < opt.req) continue;
      const crafts = Math.min(opt.limit, Math.floor(remaining / opt.req));
      if (crafts > 0) {
        const used = crafts * opt.req;
        optimizedValue += crafts * opt.profit;
        remaining -= used;
        plan.push({ ...opt, crafts, used });
      }
    }

    const baseTotalValue = (expectedIngots || 0) * npcProfit;
    const extraProfit = Math.max(0, optimizedValue - baseTotalValue);
    const recommendedTotalRev = optimizedValue + (gemRevenue || 0);

    return { options, plan, extraProfit, recommendedTotalRev };
  }, [targetZone, userStats, marketPrices, stoneMethod, isLoaded, expectedIngots, gemRevenue]);

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full relative transition-colors duration-300 animate-fade-in-up">
      <style dangerouslySetInnerHTML={{__html: `
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none !important;
          margin: 0 !important;
        }
        input[type="number"] {
          -moz-appearance: textfield !important;
        }
      `}} />
      
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)}></div>
          <div className="relative z-10 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-xl dark:shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar animate-fade-in-up transition-colors">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-white/5 pb-4 transition-colors">
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">일일 수익 계산 상세내역</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-transparent shadow-sm">닫기 ✕</button>
            </div>
            
            <div className="space-y-5">
              <div className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-2xl p-5 shadow-inner transition-colors">
                <h4 className="text-sm font-black text-amber-600 dark:text-amber-400 mb-3 border-l-4 border-amber-500 pl-3 tracking-tight transition-colors">1단계: 채광 획득량 (행동력 소모)</h4>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-loose transition-colors font-bold pl-2">
                  • 총 스태미나 <span className="text-indigo-600 dark:text-indigo-400 font-black">{userStats.stamina.toLocaleString()}</span> / 10 = <span className="text-indigo-600 dark:text-indigo-400 font-black">{Math.floor(userStats.stamina / 10).toLocaleString()}회</span> 채광 진행<br/>
                  • 광석: 곡괭이 <span className="text-gray-900 dark:text-white font-black">{userStats.pickaxeLv > 0 ? PICKAXE_BASE_DROPS[userStats.pickaxeLv - 1] : 1}개</span> + [럭키히트] <span className="text-amber-600 dark:text-amber-400 font-black">{(LUCKY_HIT_EFFECTS[userStats.luckyHitLv]?.chance * 100).toFixed(0)}% 확률 {LUCKY_HIT_EFFECTS[userStats.luckyHitLv]?.amount}개 추가</span><br/>
                  • 보석: [반짝임의 시작] <span className="text-fuchsia-600 dark:text-fuchsia-400 font-black">{(GEM_DROP_EFFECTS[userStats.gemDropLv]?.chance * 100).toFixed(0)}% 확률 {GEM_DROP_EFFECTS[userStats.gemDropLv]?.amount}개 획득</span>
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-2xl p-5 shadow-inner transition-colors">
                <h4 className="text-sm font-black text-rose-600 dark:text-rose-400 mb-3 border-l-4 border-rose-500 pl-3 tracking-tight transition-colors">2단계: 주괴 최적 분배 알고리즘</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-bold leading-relaxed mb-4 transition-colors pl-2 break-keep">
                  [불붙은 곡괭이] 직발 주괴와 가공 주괴를 합산한 뒤, 입력된 시세를 바탕으로 가장 이득이 되는 경로(감정품 1일 최대 5회 제한 등)로 주괴를 자동 분배합니다.<br/>
                  <span className="text-rose-500 dark:text-rose-400">※ 귀중품 감정 시 소모되는 기타 바닐라 재료 비용은 계산에서 제외됩니다.</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                  <div className="bg-white dark:bg-black border border-gray-200 dark:border-transparent p-3 rounded-xl text-xs font-bold shadow-sm transition-colors flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-500">최종 가용 주괴</span>
                    <span className="text-gray-900 dark:text-white font-black text-sm">{expectedIngots.toLocaleString()} 개</span>
                  </div>
                  <div className="bg-white dark:bg-black border border-gray-200 dark:border-transparent p-3 rounded-xl text-xs font-bold shadow-sm transition-colors flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-500">최종 보석 획득</span>
                    <span className="text-gray-900 dark:text-white font-black text-sm">{expectedGems.toLocaleString(undefined, {maximumFractionDigits:1})} 개</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-transparent rounded-2xl p-6 text-center shadow-sm transition-colors">
                <h4 className="text-sm font-black text-amber-900 dark:text-amber-100 mb-2 tracking-tight transition-colors">최적 분배 기준 총 수익</h4>
                <p className="text-[10px] text-amber-600 dark:text-amber-500/80 font-bold mb-2 transition-colors">최적 루트 수익 + 보석 판매수익 합산</p>
                <span className="text-3xl font-black text-amber-600 dark:text-amber-400 drop-shadow-sm transition-colors">약 {Math.round(strategyAnalysis?.recommendedTotalRev || 0).toLocaleString()} G</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md dark:shadow-2xl transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-200 dark:border-white/5 pb-4 transition-colors">
          <div>
            <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">시세 및 환경 정보 입력</h3>
            <p className="text-[11px] md:text-xs font-bold text-gray-500 mt-1">입력된 유저 거래가는 브라우저에 저장되며, 최적의 주괴 사용처 분석에 활용됩니다.</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#111113] p-1.5 rounded-xl border border-gray-200 dark:border-transparent shadow-inner">
            <button onClick={() => handleMethodChange('buy')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${stoneMethod === 'buy' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>부족분 매입 방식</button>
            <button onClick={() => handleMethodChange('exchange')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${stoneMethod === 'exchange' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>1:1 주괴 교환 방식</button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-[11px] font-black text-gray-400 mb-2 px-1 tracking-widest uppercase flex items-center gap-2">
              결과물 및 광물 블록 시세 (1개 단위 입력)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
              {[
                { id: 'abilityStone', label: '어빌리티 스톤 (1개)', ph: '1개 단가', img: '어빌리티 스톤' },
                { id: 'lifestone1', label: '하급 라이프스톤 (1개)', ph: '1개 단가', img: '하급 라이프스톤' },
                { id: 'lifestone2', label: '중급 라이프스톤 (1개)', ph: '1개 단가', img: '중급 라이프스톤' },
                { id: 'lifestone3', label: '상급 라이프스톤 (1개)', ph: '1개 단가', img: '상급 라이프스톤' },
                { id: 'topazBlock', label: '토파즈 블록 (1개)', ph: '1개 단가', img: '토파즈 블록' },
                { id: 'sapphireBlock', label: '사파이어 블록 (1개)', ph: '1개 단가', img: '사파이어 블록' },
                { id: 'platinumBlock', label: '플래티넘 블록 (1개)', ph: '1개 단가', img: '플래티넘 블록' }
              ].map(item => (
                <div key={item.id} className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-xl p-3 flex flex-col gap-2.5 shadow-sm transition-colors">
                  <div className="flex items-center gap-2 min-w-0"><img src={getImagePath(item.img)||''} className="w-4 h-4 object-contain drop-shadow-sm" alt=""/><span className="text-[11px] font-black text-gray-800 dark:text-gray-200 truncate">{item.label}</span></div>
                  <input type="number" step="any" value={marketPrices[item.id as keyof typeof marketPrices] === 0 ? '' : marketPrices[item.id as keyof typeof marketPrices]} onChange={(e) => handlePriceChange(item.id as keyof typeof marketPrices, e.target.value)} placeholder={item.ph} className="w-full bg-white dark:bg-black border border-gray-300 dark:border-transparent rounded-lg px-2.5 py-1.5 text-[11px] text-gray-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-amber-500 transition-colors placeholder-gray-400" />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-[11px] font-black text-gray-400 mb-2 px-1 tracking-widest uppercase flex items-center gap-2">
              주괴 시세 (1세트 단위 입력)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: 'corumIngot', label: '코룸 주괴 (1셋)', ph: '1셋(64개) 단가', img: '코룸 주괴' },
                { id: 'leaftoneIngot', label: '리프톤 주괴 (1셋)', ph: '1셋(64개) 단가', img: '리프톤 주괴' },
                { id: 'serentIngot', label: '세렌트 주괴 (1셋)', ph: '1셋(64개) 단가', img: '세렌트 주괴' }
              ].map(item => (
                <div key={item.id} className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-xl p-3 flex flex-col gap-2.5 shadow-sm transition-colors">
                  <div className="flex items-center gap-2 min-w-0"><img src={getImagePath(item.img)||''} className="w-4 h-4 object-contain drop-shadow-sm" alt=""/><span className="text-[11px] font-black text-gray-800 dark:text-gray-200 truncate">{item.label}</span></div>
                  <input type="number" step="any" value={marketPrices[item.id as keyof typeof marketPrices] === 0 ? '' : marketPrices[item.id as keyof typeof marketPrices]} onChange={(e) => handlePriceChange(item.id as keyof typeof marketPrices, e.target.value)} placeholder={item.ph} className="w-full bg-white dark:bg-black border border-gray-300 dark:border-transparent rounded-lg px-2.5 py-1.5 text-[11px] text-gray-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-amber-500 transition-colors placeholder-gray-400" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 px-1">
              <p className="text-[11px] font-black text-gray-400 tracking-widest uppercase">바닐라 부자재 시세 (1세트 단위 입력)</p>
              <p className="text-[9px] font-bold text-rose-500 dark:text-rose-400">※ 기타 바닐라 재료는 계산에 포함되지 않습니다.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-9 gap-3">
              {[
                { id: 'cobbleBundle', label: '조약돌 뭉치 (1셋)', ph: '1셋 단가', img: '조약돌 뭉치' },
                { id: 'deepslateBundle', label: '심층암 뭉치 (1셋)', ph: '1셋 단가', img: '심층암 조약돌 뭉치' },
                { id: 'copperBlock', label: '구리 블록 (1셋)', ph: '1셋 단가', img: '구리블록' },
                { id: 'ironBlock', label: '철 블록 (1셋)', ph: '1셋 단가', img: '철블록' },
                { id: 'goldBlock', label: '금 블록 (1셋)', ph: '1셋 단가', img: '금블록' },
                { id: 'lapisBlock', label: '청금석 블록 (1셋)', ph: '1셋 단가', img: '청금석블록' },
                { id: 'redstoneBlock', label: '레드스톤 블록 (1셋)', ph: '1셋 단가', img: '레드스톤블록' },
                { id: 'diamondBlock', label: '다이아 블록 (1셋)', ph: '1셋 단가', img: '다이아몬드블록' },
                { id: 'amethystBlock', label: '자수정 블록 (1셋)', ph: '1셋 단가', img: '자수정블록' }
              ].map(item => (
                <div key={item.id} className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-xl p-3 flex flex-col gap-2.5 shadow-sm transition-colors">
                  <div className="flex items-center gap-2 min-w-0"><img src={getImagePath(item.img)||''} className="w-4 h-4 object-contain drop-shadow-sm" alt=""/><span className="text-[11px] font-black text-gray-800 dark:text-gray-200 truncate">{item.label}</span></div>
                  <input type="number" step="any" value={marketPrices[item.id as keyof typeof marketPrices] === 0 ? '' : marketPrices[item.id as keyof typeof marketPrices]} onChange={(e) => handlePriceChange(item.id as keyof typeof marketPrices, e.target.value)} placeholder={item.ph} className="w-full bg-white dark:bg-black border border-gray-300 dark:border-transparent rounded-lg px-2.5 py-1.5 text-[11px] text-gray-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-amber-500 transition-colors placeholder-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] shadow-md dark:shadow-2xl relative overflow-hidden flex flex-col lg:flex-row transition-colors">
        <div className="w-full lg:w-1/3 bg-gray-50 dark:bg-[#111113] p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/5 flex flex-col justify-between transition-colors">
          <div>
            <div className="mb-6 pb-5 border-b border-gray-200 dark:border-white/5 flex justify-between items-start transition-colors">
              <div>
                <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tight transition-colors">적용된 내 능력치</h3>
                <p className="text-[10px] md:text-[11px] font-bold text-gray-500 leading-relaxed">개인설정 보드에서 저장된 데이터가<br/>시뮬레이션에 자동 반영됩니다.</p>
              </div>
              <Link href="/settings" className="bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[10px] md:text-xs font-bold px-3 py-2 rounded-xl border border-gray-300 dark:border-transparent shadow-sm transition-colors whitespace-nowrap">설정 변경</Link>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white dark:bg-black px-4 py-3 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors">
                <span className="text-[11px] md:text-xs font-bold text-gray-600 dark:text-gray-400 tracking-tight">가용 스태미나</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{userStats.stamina.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-black px-4 py-3 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors">
                <span className="text-[11px] md:text-xs font-bold text-gray-600 dark:text-gray-400 tracking-tight">세이지 곡괭이</span>
                <span className="text-sm font-black text-stone-600 dark:text-stone-400">{userStats.pickaxeLv > 0 ? `+${userStats.pickaxeLv}` : '미장착'}</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-black px-4 py-3 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors">
                <span className="text-[11px] md:text-xs font-bold text-gray-600 dark:text-gray-400 tracking-tight">[럭키 히트]</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">Lv.{userStats.luckyHitLv}</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-black px-4 py-3 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors">
                <span className="text-[11px] md:text-xs font-bold text-gray-600 dark:text-gray-400 tracking-tight">[불붙은 곡괭이]</span>
                <span className="text-sm font-black text-orange-600 dark:text-orange-400">Lv.{userStats.flamingPickLv}</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-black px-4 py-3 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors">
                <span className="text-[11px] md:text-xs font-bold text-gray-600 dark:text-gray-400 tracking-tight">[반짝임의 시작]</span>
                <span className="text-sm font-black text-fuchsia-600 dark:text-fuchsia-400">Lv.{userStats.gemDropLv}</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-black px-4 py-3 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors">
                <span className="text-[11px] md:text-xs font-bold text-rose-600 dark:text-rose-400 tracking-tight">[귀하신 몸값]</span>
                <span className="text-sm font-black text-rose-600 dark:text-rose-400">Lv.{userStats.m16Lv || 0}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-2/3 p-6 md:p-8 flex flex-col justify-between bg-white dark:bg-gradient-to-br dark:from-[#0a0a0a] dark:to-[#0f0f13] transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tight transition-colors">주괴 최적 사용 경로 분석</h3>
              <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 transition-colors">스태미나 효율 및 입력된 시세를 바탕으로 주괴 1개당 실질 가치를 비교합니다.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <button onClick={() => setIsDetailModalOpen(true)} className="bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-[11px] md:text-xs font-black px-4 py-3 sm:py-2.5 rounded-xl border border-gray-300 dark:border-transparent transition-colors text-center shadow-sm">
                상세 계산식
              </button>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-black border border-gray-300 dark:border-transparent px-4 py-2.5 rounded-xl transition-colors shadow-sm relative">
                <span className="text-[11px] md:text-xs font-black text-gray-500 whitespace-nowrap">목표 광산</span>
                <select value={targetZone} onChange={(e) => setTargetZone(e.target.value as any)} className="bg-transparent text-gray-900 dark:text-white text-xs md:text-sm font-black focus:outline-none appearance-none cursor-pointer pr-4 transition-colors">
                  <option value="코룸" className="bg-white dark:bg-[#0a0a0a]">코룸</option>
                  <option value="리프톤" className="bg-white dark:bg-[#0a0a0a]">리프톤</option>
                  <option value="세렌트" className="bg-white dark:bg-[#0a0a0a]">세렌트</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs font-black">▼</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            {strategyAnalysis && strategyAnalysis.options.map((strat, index) => (
              <div key={strat.type} className={`relative p-4 rounded-2xl border transition-all ${index === 0 ? `border-${strat.type === 'stone' ? 'indigo' : strat.type === 'appraisal' ? 'rose' : strat.type === 'lifestone' ? 'emerald' : 'gray'}-400 shadow-md ${strat.bg}` : 'border-gray-200 dark:border-transparent bg-gray-50 dark:bg-[#111113] shadow-sm'}`}>
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest text-white shadow-sm ${index === 0 ? (strat.type === 'stone' ? 'bg-indigo-500' : strat.type === 'appraisal' ? 'bg-rose-500' : strat.type === 'lifestone' ? 'bg-emerald-500' : 'bg-gray-700') : 'bg-gray-400 dark:bg-gray-700 text-gray-100 dark:text-gray-300'}`}>
                  {index + 1}순위
                </div>
                <p className="text-[10px] font-black text-gray-500 mt-1 mb-2 text-center tracking-tight truncate px-1">{strat.name}</p>
                <p className={`text-lg md:text-xl font-black text-center tracking-tighter ${strat.color}`}>
                  {Math.round(strat.val).toLocaleString()} <span className="text-xs font-bold">G/개</span>
                </p>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-transparent rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-stretch gap-6 shadow-inner transition-colors mb-6">
            <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left">
              <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter transition-colors">최적 분배 시나리오</h4>
              <p className="text-[10px] md:text-[11px] font-bold text-indigo-700/70 dark:text-indigo-400 mb-6 transition-colors">각 제작별 한도와 비용을 고려하여 가장 높은 수익의 분배 루트를 제공합니다.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                {strategyAnalysis?.plan.map((p, i) => (
                  <div key={i} className="bg-white dark:bg-black/40 p-4 rounded-2xl border border-indigo-100 dark:border-transparent shadow-sm transition-colors flex flex-col justify-between">
                    <div>
                      <p className={`text-[9px] font-black mb-1 tracking-widest uppercase ${i === 0 ? 'text-indigo-500' : i === 1 ? 'text-cyan-500' : 'text-emerald-500'}`}>{i + 1}순위 분배</p>
                      <p className="text-sm md:text-base font-black text-gray-900 dark:text-white transition-colors tracking-tight leading-tight">{p.name}</p>
                    </div>
                    <p className="text-[11px] font-bold text-gray-500 mt-2 transition-colors">주괴 <span className="text-gray-900 dark:text-white">{p.used.toLocaleString()}</span>개 할당</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-black border border-indigo-200 dark:border-transparent p-5 rounded-3xl shadow-xl flex flex-col items-center justify-center min-w-[200px]">
              <p className="text-[11px] font-black text-gray-500 mb-1.5">시나리오 합산 수익</p>
              <p className="text-2xl font-black text-indigo-600 tracking-tighter">약 {Math.round(strategyAnalysis?.options.reduce((sum, o) => {
                const planItem = strategyAnalysis.plan.find(p => p.type === o.type);
                return sum + (planItem ? planItem.crafts * o.profit : 0);
              }, 0) || 0).toLocaleString()} G</p>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-transparent rounded-[1.5rem] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors shadow-inner dark:shadow-none">
            <div>
              <p className="text-sm md:text-base font-black text-gray-900 dark:text-white mb-1 tracking-tight transition-colors">추천 경로: 일일 예상 총수익</p>
              <p className="text-[10px] md:text-[11px] font-bold text-gray-500 break-keep">
                ※ 보석 매각액을 포함하며, 입력된 부자재 비용이 자동 차감된 순수익입니다.<br/>
                <span className="text-emerald-600 dark:text-emerald-400">단순 매각 대비 <strong>+ {Math.round(strategyAnalysis?.extraProfit || 0).toLocaleString()} G</strong> 추가 이득</span>
              </p>
            </div>
            <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-500 dark:from-amber-400 dark:to-rose-400 drop-shadow-sm tracking-tighter whitespace-nowrap">
              약 {Math.round(strategyAnalysis?.recommendedTotalRev || 0).toLocaleString()} <span className="text-2xl text-rose-500 font-black">G</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-4">
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md dark:shadow-2xl transition-colors flex flex-col h-full">
          <div className="flex justify-between items-end mb-6 border-b border-gray-200 dark:border-white/5 pb-5 transition-colors">
            <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">NPC 주괴 매입가</h3>
            <div className="text-right flex flex-col items-end">
              <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-transparent px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-black tracking-widest mb-1.5 transition-colors">주괴 좀 사주괴 적용</span>
              <span className="text-xs md:text-sm font-black text-gray-800 dark:text-gray-300 transition-colors">Lv.{userStats.ingotBuffLv}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:gap-4 flex-1">
            {MINE_FIXED_PRICES.ingots.map((item, idx) => {
              const buffedPrice = Math.round(item.base * (1 + (PRICE_BUFF_EFFECTS[userStats.ingotBuffLv] || 0)));
              const imgPath = getImagePath(item.name);
              return (
                <div key={idx} className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-sm transition-colors">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-black/50 rounded-xl border border-gray-200 dark:border-transparent flex items-center justify-center overflow-hidden p-2 transition-colors shadow-inner">
                      {imgPath ? <img src={imgPath} alt={item.name} className="w-full h-full object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }}/> : <span className="text-[8px] text-gray-400 font-bold">IMG</span>}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm md:text-base font-black text-gray-900 dark:text-white tracking-tight transition-colors">{item.name}</p>
                      <p className="text-[10px] md:text-[11px] font-bold text-gray-500">기본가 {item.base.toLocaleString()}G</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg md:text-xl font-black text-amber-600 dark:text-amber-500 drop-shadow-sm transition-colors tracking-tight">{buffedPrice.toLocaleString()} <span className="text-sm font-bold">G</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md dark:shadow-2xl transition-colors flex flex-col h-full">
          <div className="flex justify-between items-end mb-6 border-b border-gray-200 dark:border-white/5 pb-5 transition-colors">
            <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">NPC 보석 매입가</h3>
            <div className="text-right flex flex-col items-end">
              <span className="bg-fuchsia-100 dark:bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-transparent px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-black tracking-widest mb-1.5 transition-colors">반짝반짝 눈이부셔 적용</span>
              <span className="text-xs md:text-sm font-black text-gray-800 dark:text-gray-300 transition-colors">Lv.{userStats.gemBuffLv}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:gap-4 flex-1">
            {MINE_FIXED_PRICES.gems.map((item, idx) => {
              const buffedPrice = Math.round(item.base * (1 + (PRICE_BUFF_EFFECTS[userStats.gemBuffLv] || 0)));
              const imgPath = getImagePath(item.name);
              return (
                <div key={idx} className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-sm transition-colors">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-black/50 rounded-xl border border-gray-200 dark:border-transparent flex items-center justify-center overflow-hidden p-2 transition-colors shadow-inner">
                      {imgPath ? <img src={imgPath} alt={item.name} className="w-full h-full object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }}/> : <span className="text-[8px] text-gray-400 font-bold">IMG</span>}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm md:text-base font-black text-gray-900 dark:text-white tracking-tight transition-colors">{item.name}</p>
                      <p className="text-[10px] md:text-[11px] font-bold text-gray-500">{item.type} / 기본가 {item.base.toLocaleString()}G</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg md:text-xl font-black text-fuchsia-600 dark:text-fuchsia-500 drop-shadow-sm transition-colors tracking-tight">{buffedPrice.toLocaleString()} <span className="text-sm font-bold">G</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}