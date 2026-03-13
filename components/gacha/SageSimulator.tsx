'use client';

import { useState, useEffect, useRef } from 'react';
import { SAGE_TOOLS, ENHANCE_COSTS, SAGE_TOOL_EFFECTS } from '@/lib/reinforceData';

interface EnhanceHistory {
  from: number;
  to: number;
  tries: number;
  cost: { coin: number; ruby: number; low: number; mid: number; high: number };
}

const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

const SpriteEffect = ({ type, onComplete }: { type: 'hitting' | 'success' | 'fail', onComplete?: () => void }) => {
  const [frame, setFrame] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const config = {
    hitting: { url: `${STORAGE_BASE_URL}/reinforce/effect.png`, cols: 9, rows: 3, total: 23, speed: 15, loopCount: 3 },
    success: { url: `${STORAGE_BASE_URL}/reinforce/success_effect.png`, cols: 9, rows: 4, total: 33, speed: 20, loopCount: 1 },
    fail: { url: `${STORAGE_BASE_URL}/reinforce/fail_effect.png`, cols: 9, rows: 3, total: 27, speed: 20, loopCount: 1 }
  };

  const { url, cols, rows, total, speed, loopCount } = config[type];

  useEffect(() => {
    let currentFrame = 0;
    let currentLoop = 0;
    const interval = setInterval(() => {
      currentFrame++;
      if (currentFrame >= total) {
        currentLoop++;
        if (currentLoop >= loopCount) {
          clearInterval(interval);
          setTimeout(() => { if (onCompleteRef.current) onCompleteRef.current(); }, 0);
        } else {
          currentFrame = 0;
          setFrame(currentFrame);
        }
      } else {
        setFrame(currentFrame);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [type, total, speed, loopCount]);

  const col = frame % cols;
  const row = Math.floor(frame / cols);

  return (
    <div className="absolute top-[52.5%] left-[51.5%] transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 z-40 overflow-hidden pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
      <div className="absolute top-0 left-0 w-full h-full" style={{ transform: `translate(-${col * 100}%, -${row * 100}%)`, transition: 'none' }}>
        <img src={url} alt="effect" className="absolute top-0 left-0 max-w-none m-0 p-0" style={{ width: `${cols * 100}%`, height: 'auto', imageRendering: 'pixelated' }} />
      </div>
    </div>
  );
};

export default function SageSimulator() {
  const [selectedTool, setSelectedTool] = useState(SAGE_TOOLS[0].id);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [animState, setAnimState] = useState<'idle' | 'hitting' | 'success' | 'fail'>('idle');
  const [skipAnim, setSkipAnim] = useState(false);
  const [targetLevel, setTargetLevel] = useState(15);
  const [activeTab, setActiveTab] = useState<'history' | 'expected'>('history');
  const [totalCost, setTotalCost] = useState({ coin: 0, ruby: 0, low: 0, mid: 0, high: 0 });
  const [currentTries, setCurrentTries] = useState(0);
  const [history, setHistory] = useState<EnhanceHistory[]>([]);
  const [expectedRange, setExpectedRange] = useState<{start: number | null, end: number | null}>({ start: null, end: null });

  const formatGold = (amount: number) => {
    if (amount < 10000) return amount.toLocaleString();
    const uk = Math.floor(amount / 100000000);
    const man = Math.floor((amount % 100000000) / 10000);
    if (uk > 0) return man > 0 ? `${uk}억 ${man}만` : `${uk}억`;
    return `${man}만`;
  };

  const getToolImage = (toolId: string, level: number) => {
    if (toolId === 'hoe') return `${STORAGE_BASE_URL}/tools/hoe${level >= 15 ? 4 : level >= 10 ? 3 : level >= 6 ? 2 : 1}.png`;
    if (toolId === 'pickaxe') return `${STORAGE_BASE_URL}/tools/pickaxe${level >= 15 ? 1 : level >= 10 ? 2 : level >= 6 ? 3 : 4}.png`;
    if (toolId === 'rod') return `${STORAGE_BASE_URL}/tools/fish${level >= 15 ? 4 : level >= 10 ? 3 : level >= 6 ? 2 : 1}.png`;
    if (toolId === 'sword') return `${STORAGE_BASE_URL}/tools/sword${level >= 15 ? 4 : level >= 10 ? 3 : level >= 6 ? 2 : 1}.png`;
    return `${STORAGE_BASE_URL}/unknown.png`;
  };

  const handleReset = () => {
    setCurrentLevel(0);
    setTotalCost({ coin: 0, ruby: 0, low: 0, mid: 0, high: 0 });
    setCurrentTries(0);
    setHistory([]);
    setAnimState('idle');
  };

  const processEnhance = (currentLvl: number, tries: number, tempCost: any, tempHistory: any[]) => {
    const costData = ENHANCE_COSTS[currentLvl];
    const newTries = tries + 1;
    tempCost.coin += costData.coin;
    tempCost.ruby += costData.ruby;
    tempCost.low += costData.low;
    tempCost.mid += costData.mid;
    tempCost.high += costData.high;
    const isSuccess = (Math.random() * 100) < costData.prob;
    if (isSuccess) {
      tempHistory.push({
        from: currentLvl, to: currentLvl + 1, tries: newTries,
        cost: { coin: costData.coin * newTries, ruby: costData.ruby * newTries, low: costData.low * newTries, mid: costData.mid * newTries, high: costData.high * newTries }
      });
      return { success: true, newLvl: currentLvl + 1, newTries: 0 };
    }
    return { success: false, newLvl: currentLvl, newTries: newTries };
  };

  const executeTargetEnhance = () => {
    if (currentLevel >= targetLevel || isEnhancing) return;
    setIsEnhancing(true);
    let tempLevel = currentLevel;
    let tempTries = currentTries;
    const tempCost = { ...totalCost };
    const tempHistory = [...history];
    while (tempLevel < targetLevel && tempLevel < 15) {
      const result = processEnhance(tempLevel, tempTries, tempCost, tempHistory);
      tempLevel = result.newLvl;
      tempTries = result.newTries;
    }
    setCurrentLevel(tempLevel);
    setTotalCost(tempCost);
    setCurrentTries(tempTries);
    setHistory(tempHistory);
    setIsEnhancing(false);
  };

  const executeSingleEnhance = () => {
    if (currentLevel >= 15 || isEnhancing) return;
    setIsEnhancing(true);
    if (skipAnim) {
      const result = processEnhance(currentLevel, currentTries, { ...totalCost }, [...history]);
      setTotalCost({ ...totalCost, coin: totalCost.coin + ENHANCE_COSTS[currentLevel].coin, ruby: totalCost.ruby + ENHANCE_COSTS[currentLevel].ruby, low: totalCost.low + ENHANCE_COSTS[currentLevel].low, mid: totalCost.mid + ENHANCE_COSTS[currentLevel].mid, high: totalCost.high + ENHANCE_COSTS[currentLevel].high });
      if (result.success) { setHistory([...history, { from: currentLevel, to: result.newLvl, tries: currentTries + 1, cost: { coin: ENHANCE_COSTS[currentLevel].coin * (currentTries + 1), ruby: ENHANCE_COSTS[currentLevel].ruby * (currentTries + 1), low: ENHANCE_COSTS[currentLevel].low * (currentTries + 1), mid: ENHANCE_COSTS[currentLevel].mid * (currentTries + 1), high: ENHANCE_COSTS[currentLevel].high * (currentTries + 1) } }]); setCurrentLevel(result.newLvl); setCurrentTries(0); } else { setCurrentTries(result.newTries); }
      setIsEnhancing(false);
    } else { setAnimState('hitting'); }
  };

  const handleHittingComplete = () => {
    const tempCost = { ...totalCost };
    const tempHistory = [...history];
    const result = processEnhance(currentLevel, currentTries, tempCost, tempHistory);
    setTotalCost(tempCost);
    if (result.success) { setAnimState('success'); setHistory(tempHistory); setCurrentLevel(result.newLvl); setCurrentTries(0); } else { setAnimState('fail'); setCurrentTries(result.newTries); }
  };

  const handleResultComplete = () => { setAnimState('idle'); setIsEnhancing(false); };

  const handleExpectedRowClick = (index: number) => {
    if (expectedRange.start === null || (expectedRange.start !== null && expectedRange.start !== expectedRange.end)) { setExpectedRange({ start: index, end: index }); } else { setExpectedRange({ start: Math.min(expectedRange.start, index), end: Math.max(expectedRange.start, index) }); }
  };

  const nextCost = currentLevel < 15 ? ENHANCE_COSTS[currentLevel] : null;
  const currentStats = SAGE_TOOL_EFFECTS[selectedTool][currentLevel];
  
  const calculateCumulativeExpectedCost = () => {
    if (expectedRange.start === null || expectedRange.end === null) return null;
    let coin = 0, ruby = 0, low = 0, mid = 0, high = 0;
    for (let i = expectedRange.start; i <= expectedRange.end; i++) {
      const c = ENHANCE_COSTS[i];
      const tries = Math.ceil(100 / c.prob);
      coin += c.coin * tries; ruby += c.ruby * tries; low += c.low * tries; mid += c.mid * tries; high += c.high * tries;
    }
    return { coin, ruby, low, mid, high };
  };
  const cumulativeCost = calculateCumulativeExpectedCost();

  return (
    <div className="w-full space-y-8 animate-fade-in text-gray-100 flex flex-col xl:flex-row gap-8 xl:gap-12">
      <div className="w-full xl:w-[420px] shrink-0 flex flex-col gap-6">
        <div className="bg-[#0f0f13]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex gap-2 p-1 bg-black/40 rounded-xl mb-5">
            {SAGE_TOOLS.map(tool => (
              <button key={tool.id} onClick={() => { if(!isEnhancing) { setSelectedTool(tool.id); handleReset(); } }} className={`flex-1 py-2.5 text-[11px] font-black rounded-lg transition-all ${selectedTool === tool.id ? 'bg-gradient-to-t from-indigo-600/40 to-indigo-500/10 text-indigo-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>{tool.name}</button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setSkipAnim(!skipAnim)}>
              <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${skipAnim ? 'bg-indigo-500' : 'bg-gray-700'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${skipAnim ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-sm font-bold text-gray-400 group-hover:text-gray-200 transition-colors">연출 스킵</span>
            </div>
            <button onClick={handleReset} disabled={isEnhancing} className="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-lg transition-colors disabled:opacity-50">⟲ 초기화</button>
          </div>
        </div>

        <div className="relative w-full aspect-[4/5] flex items-center justify-center select-none bg-gradient-to-b from-[#1a1a24] to-[#0a0a0f] rounded-3xl border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_60%)]"></div>
          {nextCost && (
            <div className="absolute top-5 left-5 z-30 flex flex-col items-center justify-center bg-black/70 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md shadow-lg">
              <span className="text-gray-400 text-[10px] font-bold mb-1">성공률</span>
              <span className="text-yellow-400 text-lg font-black">{nextCost.prob}%</span>
            </div>
          )}
          <img src={`${STORAGE_BASE_URL}/reinforce/reinforce.png`} alt="제단" className="relative w-[85%] h-auto object-contain pointer-events-none drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]" style={{ imageRendering: 'pixelated' }} />
          {nextCost && (
            <>
              <div className="absolute top-[46%] left-[34%] transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center transition-all duration-300 hover:scale-110">
                <img src={`${STORAGE_BASE_URL}/tools/lifestone1.png`} className="w-5 h-5 object-contain opacity-90" />
                <span className="absolute -bottom-2 -right-2 text-[11px] font-black text-white px-1 bg-black/60 rounded border border-white/10">{nextCost.low}</span>
              </div>
              <div className="absolute top-[39%] left-[52%] transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center transition-all duration-300 hover:scale-110">
                <img src={`${STORAGE_BASE_URL}/tools/lifestone2.png`} className={`w-5 h-5 object-contain ${nextCost.high > 0 ? 'opacity-90' : 'opacity-20 grayscale'}`} /> 
                {nextCost.high > 0 && <span className="absolute -bottom-2 -right-2 text-[11px] font-black text-white px-1 bg-black/60 rounded border border-white/10">{nextCost.high}</span>}
              </div>
              <div className="absolute top-[46%] left-[69%] transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center transition-all duration-300 hover:scale-110">
                <img src={`${STORAGE_BASE_URL}/tools/lifestone3.png`} className={`w-5 h-5 object-contain ${nextCost.mid > 0 ? 'opacity-90' : 'opacity-20 grayscale'}`} /> 
                {nextCost.mid > 0 && <span className="absolute -bottom-2 -right-2 text-[11px] font-black text-white px-1 bg-black/60 rounded border border-white/10">{nextCost.mid}</span>}
              </div>
            </>
          )}
          <div className="absolute top-[51.5%] left-[51.5%] transform -translate-x-1/2 -translate-y-1/2 group z-20">
            <div className="w-12 h-12 flex items-center justify-center cursor-help relative transition-transform">
               <img src={getToolImage(selectedTool, currentLevel)} className="w-10 h-10 object-contain drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]" style={{ imageRendering: 'pixelated' }} />
               {currentLevel > 0 && (
                 <span className="absolute -top-3 -right-4 text-xs font-black text-yellow-300 bg-black/60 px-1.5 rounded-full border border-yellow-500/30">+{currentLevel}</span>
               )}
            </div>
            <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 w-52 bg-[#1a1a24]/95 backdrop-blur-xl border border-indigo-500/30 rounded-xl p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] scale-95 group-hover:scale-100">
              <h4 className="text-[13px] font-black text-white mb-2 border-b border-white/10 pb-1.5 flex justify-between items-center">
                <span>{SAGE_TOOLS.find(t=>t.id===selectedTool)?.name}</span>
                <span className="text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded text-[10px]">+{currentLevel}</span>
              </h4>
              <ul className="space-y-1 text-[11px] text-gray-300">
                {Object.entries(currentStats).map(([key, val]) => (
                  <li key={key} className="flex justify-between items-center"><span className="text-gray-400">{key}</span><span className="font-bold text-indigo-300">{val}</span></li>
                ))}
              </ul>
            </div>
          </div>
          {animState === 'hitting' && <SpriteEffect type="hitting" onComplete={handleHittingComplete} />}
          {animState === 'success' && <SpriteEffect type="success" onComplete={handleResultComplete} />}
          {animState === 'fail' && <SpriteEffect type="fail" onComplete={handleResultComplete} />}
          <div className="absolute bottom-[6%] left-[50%] transform -translate-x-1/2 w-[80px] z-20 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all group" onClick={executeSingleEnhance}>
            <img src={`${STORAGE_BASE_URL}/reinforce/reinforce_btn.png`} alt="강화버튼" className="w-full h-auto group-hover:brightness-110" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pb-1"><span className="text-black font-black text-[13px] tracking-widest">{isEnhancing ? '...' : currentLevel >= 15 ? 'MAX' : '강화'}</span></div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="bg-[#0f0f13]/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl">
          <h3 className="text-sm font-black text-gray-300 mb-3 flex items-center gap-2">현재까지 누적 소모 재화</h3>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex-1 flex items-center justify-between bg-black/40 p-3 rounded-xl border border-yellow-500/20">
                <div className="flex items-center gap-2"><img src={`${STORAGE_BASE_URL}/coin.png`} className="w-5 h-5 object-contain" /><span className="text-xs text-gray-400 font-bold">골드</span></div>
                <span className="text-sm font-black text-yellow-400">{formatGold(totalCost.coin)}</span>
              </div>
              <div className="flex-1 flex items-center justify-between bg-black/40 p-3 rounded-xl border border-red-500/20">
                <div className="flex items-center gap-2"><img src={`${STORAGE_BASE_URL}/ruby.png`} className="w-5 h-5 object-contain" /><span className="text-xs text-gray-400 font-bold">루비</span></div>
                <span className="text-sm font-black text-red-400">{totalCost.ruby.toLocaleString()}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center justify-center bg-black/40 p-2 rounded-xl border border-white/5"><img src={`${STORAGE_BASE_URL}/tools/lifestone1.png`} className="w-5 h-5 object-contain mb-1" /><span className="text-xs font-bold text-gray-200">{totalCost.low.toLocaleString()}</span></div>
              <div className="flex flex-col items-center justify-center bg-black/40 p-2 rounded-xl border border-white/5"><img src={`${STORAGE_BASE_URL}/tools/lifestone3.png`} className="w-5 h-5 object-contain mb-1" /><span className="text-xs font-bold text-gray-200">{totalCost.mid.toLocaleString()}</span></div>
              <div className="flex flex-col items-center justify-center bg-black/40 p-2 rounded-xl border border-white/5"><img src={`${STORAGE_BASE_URL}/tools/lifestone2.png`} className="w-5 h-5 object-contain mb-1" /><span className="text-xs font-bold text-gray-200">{totalCost.high.toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#0f0f13]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl flex flex-col">
          <div className="flex border-b border-white/5">
            <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-sm font-black transition-colors relative ${activeTab === 'history' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}>실제 강화 기록{activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500"></div>}</button>
            <button onClick={() => setActiveTab('expected')} className={`flex-1 py-3 text-sm font-black transition-colors relative ${activeTab === 'expected' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}>구간별 기댓값 표{activeTab === 'expected' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500"></div>}</button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar h-[400px]">
            {activeTab === 'history' && (
              <div className="flex justify-end mb-3">
                 <div className="flex items-center bg-black/50 border border-indigo-500/30 rounded-xl overflow-hidden h-8 shadow-inner">
                  <span className="text-[10px] text-gray-400 px-3 font-bold">자동 타겟 설정</span>
                  <select value={targetLevel} onChange={(e) => setTargetLevel(Number(e.target.value))} className="bg-transparent text-indigo-300 text-xs font-black px-2 h-full outline-none cursor-pointer">
                    {[...Array(15)].map((_, i) => (<option key={i+1} value={i+1} className="bg-gray-900">+{i+1}강</option>))}
                  </select>
                  <button onClick={executeTargetEnhance} disabled={isEnhancing || currentLevel >= targetLevel} className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-bold px-4 h-full border-l border-indigo-500/30">즉시 돌파</button>
                </div>
              </div>
            )}
            {activeTab === 'history' ? (
              <div className="flex flex-col gap-2">
                {history.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-gray-600"><span className="text-sm font-bold">아직 돌파 기록이 없습니다.</span></div>) : 
                history.map((h, i) => (
                  <div key={i} className="flex flex-row items-center justify-between bg-black/40 border border-white/5 p-2 rounded-lg hover:bg-black/60 transition-colors">
                    <div className="flex items-center gap-3 shrink-0"><div className="flex items-center justify-center bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-lg min-w-[80px]"><span className="text-indigo-300 font-black text-xs">{h.from} ➔ {h.to}</span></div><span className="text-gray-400 text-[11px] font-black">{h.tries}번 시도</span></div>
                    <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold text-gray-400 flex-1 flex-wrap pl-2">
                      <span className="text-yellow-400 bg-yellow-950/30 px-1.5 py-0.5 rounded border border-yellow-500/10 flex items-center gap-1"><img src={`${STORAGE_BASE_URL}/coin.png`} className="w-3 h-3" />{formatGold(h.cost.coin)}</span>
                      {h.cost.ruby > 0 && <span className="text-red-400 bg-red-950/30 px-1.5 py-0.5 rounded border border-red-500/10 flex items-center gap-1"><img src={`${STORAGE_BASE_URL}/ruby.png`} className="w-3 h-3" />{h.cost.ruby.toLocaleString()}</span>}
                      {h.cost.low > 0 && <span className="text-gray-300 bg-gray-800/50 px-1.5 py-0.5 rounded border border-white/5 flex items-center gap-1"><img src={`${STORAGE_BASE_URL}/tools/lifestone1.png`} className="w-3 h-3" />{h.cost.low.toLocaleString()}</span>}
                      {h.cost.mid > 0 && <span className="text-gray-300 bg-gray-800/50 px-1.5 py-0.5 rounded border border-white/5 flex items-center gap-1"><img src={`${STORAGE_BASE_URL}/tools/lifestone3.png`} className="w-3 h-3" />{h.cost.mid.toLocaleString()}</span>}
                      {h.cost.high > 0 && <span className="text-gray-300 bg-gray-800/50 px-1.5 py-0.5 rounded border border-white/5 flex items-center gap-1"><img src={`${STORAGE_BASE_URL}/tools/lifestone2.png`} className="w-3 h-3" />{h.cost.high.toLocaleString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full flex flex-col gap-4">
                {expectedRange.start !== null && expectedRange.end !== null && cumulativeCost && (
                  <div className="bg-indigo-900/30 border border-indigo-500/50 p-4 rounded-xl flex flex-col gap-3 sticky top-0 z-10 backdrop-blur-md shadow-lg">
                    <div className="flex items-center justify-between"><h4 className="text-indigo-300 font-black text-sm">{expectedRange.start}강 ➔ {expectedRange.end + 1}강 누적 기댓값</h4><button onClick={() => setExpectedRange({start: null, end: null})} className="text-gray-400 text-xs font-bold">선택 취소</button></div>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="flex items-center gap-1 text-yellow-400 font-bold bg-black/40 px-2 py-1 rounded"><img src={`${STORAGE_BASE_URL}/coin.png`} className="w-4 h-4" />{formatGold(cumulativeCost.coin)}</span>
                      {cumulativeCost.ruby > 0 && <span className="flex items-center gap-1 text-red-400 font-bold bg-black/40 px-2 py-1 rounded"><img src={`${STORAGE_BASE_URL}/ruby.png`} className="w-4 h-4" />{cumulativeCost.ruby.toLocaleString()}</span>}
                      {cumulativeCost.low > 0 && <span className="flex items-center gap-1 text-gray-300 font-bold bg-black/40 px-2 py-1 rounded"><img src={`${STORAGE_BASE_URL}/tools/lifestone1.png`} className="w-4 h-4" />{cumulativeCost.low.toLocaleString()}</span>}
                      {cumulativeCost.mid > 0 && <span className="flex items-center gap-1 text-gray-300 font-bold bg-black/40 px-2 py-1 rounded"><img src={`${STORAGE_BASE_URL}/tools/lifestone3.png`} className="w-4 h-4" />{cumulativeCost.mid.toLocaleString()}</span>}
                      {cumulativeCost.high > 0 && <span className="flex items-center gap-1 text-gray-300 font-bold bg-black/40 px-2 py-1 rounded"><img src={`${STORAGE_BASE_URL}/tools/lifestone2.png`} className="w-4 h-4" />{cumulativeCost.high.toLocaleString()}</span>}
                    </div>
                  </div>
                )}
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-900/80 text-gray-400"><tr><th className="px-2 py-2 text-center w-8">선택</th><th className="px-3 py-2">단계</th><th className="px-2 py-2 text-center">확률</th><th className="px-2 py-2 text-center">평균시도</th><th className="px-3 py-2 text-right">단계별 기댓값</th></tr></thead>
                  <tbody>{ENHANCE_COSTS.map((c, i) => {
                    const tries = Math.ceil(100 / c.prob); const isChecked = expectedRange.start !== null && expectedRange.end !== null && i >= expectedRange.start && i <= expectedRange.end;
                    return (
                      <tr key={i} className={`border-b border-white/5 last:border-0 hover:bg-white/10 cursor-pointer transition-colors ${isChecked ? 'bg-indigo-900/20' : ''}`} onClick={() => handleExpectedRowClick(i)}>
                        <td className="px-2 py-2 text-center"><input type="checkbox" checked={isChecked} readOnly className="accent-indigo-500 w-3.5 h-3.5 pointer-events-none" /></td>
                        <td className={`px-3 py-2 font-black ${isChecked ? 'text-indigo-200' : 'text-indigo-300'}`}>{i} ➔ {i+1}</td>
                        <td className="px-2 py-2 font-bold text-white text-center bg-white/5">{c.prob}%</td>
                        <td className="px-2 py-2 text-gray-400 text-center">{tries}회</td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            <span className="flex items-center gap-1 text-yellow-400 font-bold bg-yellow-900/20 px-1.5 py-0.5 rounded text-[10px]"><img src={`${STORAGE_BASE_URL}/coin.png`} className="w-3 h-3" />{formatGold(c.coin * tries)}</span>
                            {c.ruby > 0 && <span className="flex items-center gap-1 text-red-400 font-bold bg-red-900/20 px-1.5 py-0.5 rounded text-[10px]"><img src={`${STORAGE_BASE_URL}/ruby.png`} className="w-3 h-3" />{(c.ruby * tries).toLocaleString()}</span>}
                            <div className="flex gap-1 ml-1 bg-gray-800/50 px-1.5 py-0.5 rounded">
                              {c.low > 0 && <span className="flex items-center gap-0.5 text-gray-300 font-bold text-[10px]"><img src={`${STORAGE_BASE_URL}/tools/lifestone1.png`} className="w-3 h-3" />{(c.low * tries).toLocaleString()}</span>}
                              {c.mid > 0 && <span className="flex items-center gap-0.5 text-gray-300 font-bold text-[10px]"><img src={`${STORAGE_BASE_URL}/tools/lifestone3.png`} className="w-3 h-3" />{(c.mid * tries).toLocaleString()}</span>}
                              {c.high > 0 && <span className="flex items-center gap-0.5 text-gray-300 font-bold text-[10px]"><img src={`${STORAGE_BASE_URL}/tools/lifestone2.png`} className="w-3 h-3" />{(c.high * tries).toLocaleString()}</span>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}