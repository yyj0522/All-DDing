'use client';

import { useState, useMemo, useEffect, useRef } from 'react';

const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

type GradeId = 'rough' | 'neat' | 'exquisite';

const CONTRACTS_REQ = [5, 10, 15, 20, 25];

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
    <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 z-40 overflow-hidden pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
      <div className="absolute top-0 left-0 w-full h-full" style={{ transform: `translate(-${col * 100}%, -${row * 100}%)`, transition: 'none' }}>
        <img src={url} alt="effect" className="absolute top-0 left-0 max-w-none m-0 p-0" style={{ width: `${cols * 100}%`, height: 'auto', imageRendering: 'pixelated' }} />
      </div>
    </div>
  );
};

const STONE_GRADES: { id: GradeId; gradeName: string; prob: number; coin: number; ruby: number }[] = [
  { id: 'rough', gradeName: '투박한', prob: 10, coin: 100000, ruby: 3 },
  { id: 'neat', gradeName: '단정한', prob: 20, coin: 200000, ruby: 5 },
  { id: 'exquisite', gradeName: '정교한', prob: 30, coin: 300000, ruby: 7 },
];

const TOOL_TYPES = [
  { id: 'hoe', name: '세이지 괭이', prof: 'farm', profName: '농부', contractImg: 'contract_prosperity.png', toolImg: 'hoe4.png', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-950/20' },
  { id: 'pickaxe', name: '세이지 곡괭이', prof: 'mine', profName: '채광', contractImg: 'contract_shatter.png', toolImg: 'pickaxe1.png', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-950/20' },
  { id: 'rod', name: '세이지 낚싯대', prof: 'fish', profName: '낚시', contractImg: 'contract_hightide.png', toolImg: 'fish4.png', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-950/20' },
  { id: 'sword', name: '세이지 대검', prof: 'hunt', profName: '사냥', contractImg: 'contract_conquest.png', toolImg: 'sword4.png', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950/20' },
];

const EFFECTS_DATA: Record<string, { name: string; maxLevel: number; reqs: number[] }[]> = {
  hoe: [
    { name: '채집 강화', maxLevel: 3, reqs: [5, 7, 9] },
    { name: '채집 가속', maxLevel: 3, reqs: [3, 5, 7] },
    { name: '씨앗 행운', maxLevel: 4, reqs: [5, 7, 9, 11] },
    { name: '과일 행운', maxLevel: 4, reqs: [5, 7, 9, 11] },
    { name: '과일 가속', maxLevel: 3, reqs: [3, 5, 7] },
    { name: '빠른 농부', maxLevel: 5, reqs: [9, 9, 11, 11, 13] },
    { name: '작물 상자', maxLevel: 5, reqs: [7, 7, 9, 9, 11] },
    { name: '과일 바구니', maxLevel: 5, reqs: [9, 9, 11, 11, 13] },
    { name: '유성 낙하', maxLevel: 5, reqs: [9, 9, 11, 11, 13] },
    { name: '농부 룰렛', maxLevel: 5, reqs: [5, 5, 7, 7, 9] },
  ],
  pickaxe: [
    { name: '채광 강화', maxLevel: 3, reqs: [5, 7, 9] },
    { name: '채광 가속', maxLevel: 3, reqs: [3, 5, 7] },
    { name: '광물 행운', maxLevel: 4, reqs: [5, 7, 9, 11] },
    { name: '유물 탐색', maxLevel: 3, reqs: [3, 5, 7] },
    { name: '코비 탐색', maxLevel: 3, reqs: [3, 5, 7] },
    { name: '빠른 광부', maxLevel: 5, reqs: [9, 9, 11, 11, 13] },
    { name: '보석 코비', maxLevel: 5, reqs: [9, 9, 11, 11, 13] },
    { name: '광산 수레', maxLevel: 5, reqs: [7, 7, 9, 9, 11] },
    { name: '광부 룰렛', maxLevel: 5, reqs: [5, 5, 7, 7, 9] },
  ],
  rod: [
    { name: '물고기 행운', maxLevel: 4, reqs: [5, 7, 9, 11] },
    { name: '어획 강화', maxLevel: 3, reqs: [5, 7, 9] },
    { name: '조개 탐색', maxLevel: 3, reqs: [3, 5, 7] },
    { name: '어패 행운', maxLevel: 4, reqs: [5, 7, 9, 11] },
    { name: '수중 호흡', maxLevel: 1, reqs: [9] },
    { name: '빠른 어부', maxLevel: 5, reqs: [9, 9, 11, 11, 13] },
    { name: '정령 고래', maxLevel: 5, reqs: [7, 7, 9, 9, 11] },
    { name: '가오리 인도', maxLevel: 5, reqs: [9, 9, 11, 11, 13] },
    { name: '어부 룰렛', maxLevel: 5, reqs: [5, 5, 7, 7, 9] },
  ],
  sword: [
    { name: '공격 강화', maxLevel: 3, reqs: [5, 7, 9] },
    { name: '공격 가속', maxLevel: 3, reqs: [3, 5, 7] },
    { name: '전리품 행운', maxLevel: 4, reqs: [5, 7, 9, 11] },
    { name: '조각 탐색', maxLevel: 3, reqs: [5, 7, 9] },
    { name: '빠른 사냥꾼', maxLevel: 5, reqs: [9, 9, 11, 11, 13] },
    { name: '흔적 추적', maxLevel: 5, reqs: [7, 7, 9, 9, 11] },
    { name: '조각 공명', maxLevel: 5, reqs: [9, 9, 11, 11, 13] },
    { name: '흡인 사냥', maxLevel: 5, reqs: [9, 9, 11, 11, 13] },
    { name: '사냥꾼 룰렛', maxLevel: 5, reqs: [5, 5, 7, 7, 9] },
  ]
};

export default function EngravingSimulator() {
  const [selectedToolId, setSelectedToolId] = useState(TOOL_TYPES[0].id);
  const currentToolData = useMemo(() => TOOL_TYPES.find(t => t.id === selectedToolId)!, [selectedToolId]);

  const [selectedEffectName, setSelectedEffectName] = useState<string>(EFFECTS_DATA[selectedToolId][0].name);

  const [selectedGradeId, setSelectedGradeId] = useState<GradeId>(STONE_GRADES[0].id);
  const [targetLevel, setTargetLevel] = useState<number>(1);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [baselineLevel, setBaselineLevel] = useState<number>(0);
  const [currentTries, setCurrentTries] = useState<number>(0);
  
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [animState, setAnimState] = useState<'idle' | 'hitting' | 'success' | 'fail'>('idle');
  const [skipAnim, setSkipAnim] = useState(false);

  const [engraveCost, setEngraveCost] = useState({ coin: 0, ruby: 0, contracts: 0, rough: 0, neat: 0, exquisite: 0 });
  const [history, setHistory] = useState<{ from: number, to: number, tries: number, gradeName: string }[]>([]);

  useEffect(() => {
    setSelectedEffectName(EFFECTS_DATA[selectedToolId][0].name);
    setCurrentLevel(0);
    setBaselineLevel(0);
    setCurrentTries(0);
    setHistory([]);
    setEngraveCost({ coin: 0, ruby: 0, contracts: 0, rough: 0, neat: 0, exquisite: 0 });
    setAnimState('idle');
  }, [selectedToolId]);

  useEffect(() => {
    setBaselineLevel(currentLevel);
  }, [selectedGradeId]);

  const currentEffectData = useMemo(() => {
    return EFFECTS_DATA[selectedToolId].find(e => e.name === selectedEffectName) || EFFECTS_DATA[selectedToolId][0];
  }, [selectedToolId, selectedEffectName]);

  useEffect(() => {
    if (targetLevel > currentEffectData.maxLevel) {
      setTargetLevel(currentEffectData.maxLevel);
    }
  }, [currentEffectData, targetLevel]);

  const currentGradeData = useMemo(() => STONE_GRADES.find(g => g.id === selectedGradeId)!, [selectedGradeId]);

  const handleResetEngrave = () => {
    setCurrentLevel(0);
    setBaselineLevel(0);
    setCurrentTries(0);
    setEngraveCost({ coin: 0, ruby: 0, contracts: 0, rough: 0, neat: 0, exquisite: 0 });
    setHistory([]);
    setAnimState('idle');
  };

  const processEngraveData = (lvl: number, currentCost: any) => {
    const contractNeed = CONTRACTS_REQ[lvl]; 
    currentCost.coin += currentGradeData.coin;
    currentCost.ruby += currentGradeData.ruby;
    currentCost.contracts += contractNeed;
    currentCost[currentGradeData.id] += 1;
    return (Math.random() * 100) < currentGradeData.prob;
  };

  const executeSingleEngrave = () => {
    if (currentLevel >= currentEffectData.maxLevel || isEnhancing) return;
    setIsEnhancing(true);

    if (skipAnim) {
      const tempCost = { ...engraveCost };
      const isSuccess = processEngraveData(currentLevel, tempCost);
      setEngraveCost(tempCost);

      if (isSuccess) {
        setHistory([{ from: currentLevel, to: currentLevel + 1, tries: currentTries + 1, gradeName: currentGradeData.gradeName }, ...history]);
        setCurrentLevel(currentLevel + 1);
        setCurrentTries(0);
      } else {
        setCurrentTries(currentTries + 1);
      }
      setIsEnhancing(false);
    } else {
      setAnimState('hitting');
    }
  };

  const handleHittingComplete = () => {
    const tempCost = { ...engraveCost };
    const isSuccess = processEngraveData(currentLevel, tempCost);
    setEngraveCost(tempCost);

    if (isSuccess) {
      setAnimState('success');
      setHistory([{ from: currentLevel, to: currentLevel + 1, tries: currentTries + 1, gradeName: currentGradeData.gradeName }, ...history]);
      setCurrentLevel(currentLevel + 1);
      setCurrentTries(0);
    } else {
      setAnimState('fail');
      setCurrentTries(currentTries + 1);
    }
  };

  const handleResultComplete = () => { 
    setAnimState('idle'); 
    setIsEnhancing(false); 
  };

  const executeAutoEngrave = () => {
    if (currentLevel >= targetLevel || currentLevel >= currentEffectData.maxLevel || isEnhancing) return;
    setIsEnhancing(true);

    let tempLevel = currentLevel;
    let tempTries = currentTries;
    const tempCost = { ...engraveCost };
    const tempHistory = [...history];

    while (tempLevel < targetLevel && tempLevel < currentEffectData.maxLevel) {
      const isSuccess = processEngraveData(tempLevel, tempCost);
      tempTries++;
      if (isSuccess) {
        tempHistory.unshift({ from: tempLevel, to: tempLevel + 1, tries: tempTries, gradeName: currentGradeData.gradeName });
        tempLevel++;
        tempTries = 0;
      }
    }

    setCurrentLevel(tempLevel);
    setCurrentTries(tempTries);
    setEngraveCost(tempCost);
    setHistory(tempHistory);
    setIsEnhancing(false);
  };

  const expectedValues = useMemo(() => {
    let expCoin = 0;
    let expRuby = 0;
    let expContracts = 0;
    let expStones = 0;
    
    const startLvl = baselineLevel;
    const endLvl = Math.max(targetLevel, currentLevel);
    
    for (let i = startLvl; i < endLvl; i++) {
      const contractNeed = CONTRACTS_REQ[i];
      const expectedTries = 100 / currentGradeData.prob;
      
      expCoin += currentGradeData.coin * expectedTries;
      expRuby += currentGradeData.ruby * expectedTries;
      expContracts += contractNeed * expectedTries;
      expStones += expectedTries;
    }

    return { expCoin, expRuby, expContracts, expStones, startLvl, endLvl };
  }, [baselineLevel, targetLevel, currentLevel, currentGradeData]);

  const formatGold = (amount: number) => {
    if (amount < 10000) return amount.toLocaleString();
    const man = Math.floor(amount / 10000);
    return `${man.toLocaleString()}만`;
  };

  return (
    <div className="w-full space-y-6 animate-fade-in relative text-gray-900 dark:text-gray-200 transition-colors duration-300">
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row justify-between gap-4 relative z-10">
        <div className="flex items-center gap-2 p-1 px-4 bg-gray-100 dark:bg-white/5 rounded-xl shrink-0 border border-gray-200 dark:border-white/10">
          <img src={`${STORAGE_BASE_URL}/engraving/stone_suspicious.png`} className="w-6 h-6 object-contain" alt="" />
          <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">도구 각인</span>
        </div>
        <div className="grid grid-cols-4 gap-2 w-full md:w-auto">
          {TOOL_TYPES.map(t => (
            <button key={t.id} onClick={() => { setSelectedToolId(t.id); handleResetEngrave(); }} className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${selectedToolId === t.id ? `border-current ${t.bgColor} ${t.color} shadow-lg` : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 grayscale hover:grayscale-0 hover:border-gray-300'}`}>
              <img src={`${STORAGE_BASE_URL}/tools/${t.toolImg}`} className="w-6 h-6 object-contain" style={{imageRendering: 'pixelated'}} alt="" />
              <span className="text-[10px] font-black break-keep whitespace-nowrap">{t.profName}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 relative z-10">
        <div className="w-full xl:w-[420px] flex flex-col gap-4 shrink-0">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-gray-500">각인 효과 선택</label>
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setSkipAnim(!skipAnim)}>
                <div className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 ${skipAnim ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${skipAnim ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">연출 스킵</span>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
              {EFFECTS_DATA[selectedToolId].map(effect => (
                <button key={effect.name} onClick={() => { setSelectedEffectName(effect.name); handleResetEngrave(); }} className={`py-2 px-1 rounded-lg border text-[11px] font-bold transition-all break-keep whitespace-nowrap ${selectedEffectName === effect.name ? `border-current ${currentToolData.bgColor} ${currentToolData.color} shadow-sm` : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}>
                  {effect.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
            <label className="text-xs font-bold text-gray-500 mb-3 block">각인석 등급 선택 (확률)</label>
            <div className="grid grid-cols-3 gap-2">
              {STONE_GRADES.map(grade => {
                const imgName = `stone_${currentToolData.prof}_${grade.id}.png`;
                const isSelected = selectedGradeId === grade.id;
                return (
                  <button key={grade.id} onClick={() => setSelectedGradeId(grade.id)} className={`py-2 px-1 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${isSelected ? `border-current ${currentToolData.bgColor} ${currentToolData.color} shadow-md scale-105` : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 hover:border-gray-300'}`}>
                    <img src={`${STORAGE_BASE_URL}/engraving/${imgName}`} className="w-8 h-8 object-contain mb-1" alt="" />
                    <span className="text-[11px] font-black break-keep whitespace-nowrap">{grade.gradeName}</span>
                    <span className="text-[10px] font-bold opacity-80 whitespace-nowrap">{grade.prob}% 확률</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative w-full aspect-[4/3] rounded-2xl border border-gray-300 dark:border-white/5 shadow-inner overflow-hidden flex flex-col items-center justify-center transition-colors">
            <img src={`${STORAGE_BASE_URL}/engraving/engrave_bg.png`} className="absolute inset-0 w-full h-full object-cover opacity-90 dark:opacity-100" style={{imageRendering: 'pixelated'}} alt="" />
            <div className="absolute top-4 left-4 z-10 flex flex-col bg-white/90 dark:bg-black/80 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 backdrop-blur-sm">
              <span className="text-[10px] text-gray-500 font-bold mb-0.5">현재 각인 레벨</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">Lv.{currentLevel} <span className="text-xs text-gray-400">/ {currentEffectData.maxLevel}</span></span>
            </div>
            <div className="absolute top-[42.4%] left-[36.2%] transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center z-10 hover:scale-110 transition-transform cursor-help">
              <img src={`${STORAGE_BASE_URL}/engraving/stone_${currentToolData.prof}_${currentGradeData.id}.png`} className="w-full h-full object-contain drop-shadow-md" alt="" />
            </div>
            <div className="absolute top-[-3.2%] left-[2.8%] transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center z-10 hover:scale-110 transition-transform cursor-help relative">
              <img src={`${STORAGE_BASE_URL}/tools/${currentToolData.toolImg}`} className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" style={{imageRendering: 'pixelated'}} alt="" />
              {animState === 'hitting' && <SpriteEffect type="hitting" onComplete={handleHittingComplete} />}
              {animState === 'success' && <SpriteEffect type="success" onComplete={handleResultComplete} />}
              {animState === 'fail' && <SpriteEffect type="fail" onComplete={handleResultComplete} />}
            </div>
            <div className="absolute top-[42.4%] left-[64%] transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center z-10 hover:scale-110 transition-transform cursor-help">
              <img src={`${STORAGE_BASE_URL}/engraving/${currentToolData.contractImg}`} className="w-full h-full object-contain drop-shadow-md" alt="" />
              {currentLevel < currentEffectData.maxLevel && (
                <span className="absolute -bottom-2 -right-3 text-[9px] font-black bg-gray-900 text-white px-1 py-0.5 rounded shadow-md border border-gray-700 scale-90">
                  {CONTRACTS_REQ[currentLevel]}
                </span>
              )}
            </div>
            <div className="absolute bottom-4 w-[90%] flex gap-2 bg-white/80 dark:bg-black/60 p-2 rounded-xl border border-gray-200 dark:border-white/10 backdrop-blur-sm">
              <select value={targetLevel} onChange={(e)=>setTargetLevel(Number(e.target.value))} className="w-[70px] bg-white/90 dark:bg-[#1a1a1e]/90 text-[11px] font-bold px-2 rounded-lg border border-gray-200 dark:border-white/10 outline-none cursor-pointer">
                {Array.from({ length: currentEffectData.maxLevel }, (_, i) => i + 1).map(l => (
                  <option key={l} value={l} disabled={l <= currentLevel}>Lv.{l}</option>
                ))}
              </select>
              <button onClick={executeSingleEngrave} disabled={isEnhancing || currentLevel >= currentEffectData.maxLevel} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] sm:text-xs font-black px-2 py-2 rounded-lg shadow-md transition-colors disabled:opacity-50 whitespace-nowrap">
                {isEnhancing ? '각인 중...' : '1회 각인'}
              </button>
              <button onClick={executeAutoEngrave} disabled={isEnhancing || currentLevel >= targetLevel} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] sm:text-xs font-black px-2 py-2 rounded-lg shadow-md transition-colors disabled:opacity-50 whitespace-nowrap">
                자동 각인
              </button>
              <button onClick={handleResetEngrave} disabled={isEnhancing} className="w-[36px] bg-gray-200/90 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 shrink-0">⟲</button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-gray-700 dark:text-gray-300">시뮬레이션 소모 재화</h3>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded">현재 Lv.{currentLevel}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                  <div className="flex items-center gap-1"><img src={`${STORAGE_BASE_URL}/coin.png`} className="w-4 h-4" alt="" /><span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">골드</span></div>
                  <span className="text-sm font-black text-yellow-600 dark:text-yellow-400 whitespace-nowrap">{formatGold(engraveCost.coin)}</span>
                </div>
                <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                  <div className="flex items-center gap-1"><img src={`${STORAGE_BASE_URL}/ruby.png`} className="w-4 h-4" alt="" /><span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">루비</span></div>
                  <span className="text-sm font-black text-red-600 dark:text-red-400 whitespace-nowrap">{engraveCost.ruby.toLocaleString()}</span>
                </div>
                <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                  <div className="flex items-center gap-1"><img src={`${STORAGE_BASE_URL}/engraving/${currentToolData.contractImg}`} className="w-4 h-4 object-contain" alt="" /><span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">계약서</span></div>
                  <span className={`text-sm font-black ${currentToolData.color} whitespace-nowrap`}>{engraveCost.contracts.toLocaleString()}</span>
                </div>
                <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                  <div className="flex items-center gap-1"><img src={`${STORAGE_BASE_URL}/engraving/stone_${currentToolData.prof}_rough.png`} className="w-4 h-4 object-contain" alt="" /><span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">투박한</span></div>
                  <span className={`text-sm font-black ${currentToolData.color} whitespace-nowrap`}>{engraveCost.rough.toLocaleString()}</span>
                </div>
                <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                  <div className="flex items-center gap-1"><img src={`${STORAGE_BASE_URL}/engraving/stone_${currentToolData.prof}_neat.png`} className="w-4 h-4 object-contain" alt="" /><span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">단정한</span></div>
                  <span className={`text-sm font-black ${currentToolData.color} whitespace-nowrap`}>{engraveCost.neat.toLocaleString()}</span>
                </div>
                <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                  <div className="flex items-center gap-1"><img src={`${STORAGE_BASE_URL}/engraving/stone_${currentToolData.prof}_exquisite.png`} className="w-4 h-4 object-contain" alt="" /><span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">정교한</span></div>
                  <span className={`text-sm font-black ${currentToolData.color} whitespace-nowrap`}>{engraveCost.exquisite.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 p-5 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10 blur-sm pointer-events-none"><img src={`${STORAGE_BASE_URL}/coin.png`} className="w-24 h-24" alt="" /></div>
              <div className="flex justify-between items-center mb-4 relative z-10 gap-2">
                <h3 className="text-sm font-black text-indigo-700 dark:text-indigo-300 whitespace-nowrap">수학적 기댓값 평균</h3>
                <div className="text-[10px] font-bold text-indigo-500 bg-white dark:bg-indigo-900/40 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-500/30 text-right whitespace-nowrap shrink-0">
                  <span className="block">Lv.{expectedValues.startLvl} ➔ Lv.{expectedValues.endLvl}</span>
                  <span className="block">({currentGradeData.gradeName} 기준)</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="bg-white/80 dark:bg-black/40 border border-indigo-100 dark:border-indigo-500/20 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">골드</span>
                  <span className="text-sm font-black text-yellow-600 dark:text-yellow-400 whitespace-nowrap">{formatGold(expectedValues.expCoin)}</span>
                </div>
                <div className="bg-white/80 dark:bg-black/40 border border-indigo-100 dark:border-indigo-500/20 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">루비</span>
                  <span className="text-sm font-black text-red-600 dark:text-red-400 whitespace-nowrap">{Math.ceil(expectedValues.expRuby).toLocaleString()}</span>
                </div>
                <div className="bg-white/80 dark:bg-black/40 border border-indigo-100 dark:border-indigo-500/20 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">계약서</span>
                  <span className="text-sm font-black text-gray-900 dark:text-white whitespace-nowrap">{Math.ceil(expectedValues.expContracts).toLocaleString()}</span>
                </div>
                <div className="bg-white/80 dark:bg-black/40 border border-indigo-100 dark:border-indigo-500/20 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">각인석</span>
                  <span className="text-sm font-black text-gray-900 dark:text-white whitespace-nowrap">{Math.ceil(expectedValues.expStones).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="bg-gray-100 dark:bg-white/5 px-4 py-3 border-b border-gray-200 dark:border-white/5 font-black text-sm flex justify-between items-center relative">
              <span>각인 성공 기록</span>
              <span className="text-xs font-bold text-gray-500 bg-white dark:bg-black/40 px-2 py-0.5 rounded border border-gray-200 dark:border-white/10">총 시도: {history.reduce((acc, cur) => acc + cur.tries, 0)}회</span>
               <div className={`absolute bottom-0 left-0 w-24 h-0.5 ${currentToolData.color.replace('text-', 'bg-').replace('400', '500')}`}></div>
            </div>
            <div className="p-4 space-y-2">
              {history.length === 0 ? <p className="text-center text-gray-400 text-sm py-12 transition-colors">각인 시도 기록이 없습니다.</p> : 
                [...history].map((h, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-black/30 p-3 rounded-lg border border-gray-200 dark:border-white/5 animate-fade-in-up">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full ${currentToolData.bgColor} flex items-center justify-center ${currentToolData.color} border border-current shrink-0`}>
                          <img src={`${STORAGE_BASE_URL}/engraving/stone_${currentToolData.prof}_${STONE_GRADES.find(sg=>sg.gradeName === h.gradeName)?.id}.png`} className="w-5 h-5" alt="" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`font-black text-sm ${currentToolData.color} whitespace-nowrap`}>Lv.{h.from} ➔ Lv.{h.to}</span>
                        <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap overflow-hidden text-ellipsis">{selectedEffectName} ({h.gradeName})</span>
                      </div>
                    </div>
                    <span className="text-gray-900 dark:text-white text-xs font-bold bg-white dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 shrink-0 whitespace-nowrap">{h.tries}회 만에 성공</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}