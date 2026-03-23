'use client';

import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useTheme } from 'next-themes';

interface Reward {
  id: string;
  name: string;
  prob: number;
  image: string;
}

const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

const DINO_REWARDS: Reward[] = [
  { id: 'amargasaurus', name: '아마르가사우루스 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/amargasaurus_baby.png` },
  { id: 'anklysaurus', name: '안킬로사우르스 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/anklysaurus_baby.png` },
  { id: 'apatosaurus', name: '아파토사우르스 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/apatosaurus_baby.png` },
  { id: 'argentinosaurus', name: '아르헨티노사우르스 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/argentinosaurus_baby.png` },
  { id: 'brachiosaurus', name: '브라키오사우루스 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/brachiosaurus_baby.png` },
  { id: 'carnotaurus', name: '카르노타우루스 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/carnotaurus_baby.png` },
  { id: 'ceratosaurus', name: '케라토사우루스 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/ceratosaurus_baby.png` },
  { id: 'dilophosaurus', name: '딜로포사우루스 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/dilophosaurus_baby.png` },
  { id: 'diplodocus', name: '디플로도쿠스 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/diplodocus_baby.png` },
  { id: 'gigantosaurus', name: '기간토사우루스 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/gigantosaurus_baby.png` },
  { id: 'gorgosaurus', name: '고르고사우루스 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/gorgosaurus_baby.png` },
  { id: 'majungasaurus', name: '마준가사우루스 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/majungasaurus_baby.png` },
  { id: 'parasaurolophus', name: '파라사우롤로푸스 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/parasaurolophus_baby.png` },
  { id: 'pterodactyl', name: '프테로닥틸 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/pterodactyl_baby.png` },
  { id: 'spinosaurus', name: '스피노사우루스 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/spinosaurus_baby.png` },
  { id: 'stygimoloch', name: '스티기몰로크 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/stygimoloch_baby.png` },
  { id: 'trex', name: '티라노사우루스 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/t-rex_baby.png` },
  { id: 'triceratops', name: '트리케라톱스 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/triceratops_baby.png` },
  { id: 'velociraptor', name: '벨로키랩토르 입양권', prob: 5.2631, image: `${STORAGE_BASE_URL}/dino/velociraptor_baby.png` }
];

const drawReward = (rewards: Reward[]): Reward => {
  const rand = Math.random() * 100;
  let sum = 0;
  for (const r of rewards) {
    sum += r.prob;
    if (rand <= sum) return r;
  }
  return rewards[rewards.length - 1];
};

export default function DinoPetSimulator() {
  const [showAnimation, setShowAnimation] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [openAnimState, setOpenAnimState] = useState<'idle' | 'shaking' | 'rays' | 'flash'>('idle');
  const [flashActive, setFlashActive] = useState(false);
  const [mode, setMode] = useState<'normal' | 'test' | 'snipe' | 'budget'>('normal');
  const [showProbModal, setShowProbModal] = useState(false);
  const [wonItem, setWonItem] = useState<Reward | null>(null);
  const [totalPulls, setTotalPulls] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [snipeTargetIds, setSnipeTargetIds] = useState<string[]>([]);
  const [snipeResult, setSnipeResult] = useState<{ attempts: number, cost: number, targets: Record<string, number> } | null>(null);
  const [isSniping, setIsSniping] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState<number>(5000);
  const [budgetResult, setBudgetResult] = useState<{ pulls: number, results: [Reward, number][] } | null>(null);
  const [testResults, setTestResults] = useState<Record<string, number>>({});
  const [testCount, setTestCount] = useState(0);
  const containerRef = useRef<any>(null);
  const { theme } = useTheme();

  useEffect(() => {
    setWonItem(null);
    setSnipeTargetIds([]);
    setSnipeResult(null);
    setBudgetResult(null);
  }, []);

  const handleOpen = () => {
    if (isSpinning) return;
    const winner = drawReward(DINO_REWARDS);
    setTotalPulls(prev => prev + 1);
    setTotalCost(prev => prev + 5000);
    if (!showAnimation) {
      setWonItem(winner);
      return;
    }
    setIsSpinning(true);
    setWonItem(null);
    setFlashActive(false);
    setOpenAnimState('shaking');
    setTimeout(() => { setOpenAnimState('rays'); }, 1200);
    setTimeout(() => {
      setOpenAnimState('flash');
      setFlashActive(true);
    }, 2600);
    setTimeout(() => {
      setOpenAnimState('idle');
      setIsSpinning(false);
      setWonItem(winner);
      setTimeout(() => { setFlashActive(false); }, 50);
    }, 2800);
  };

  const handleMassTest = () => {
    const results: Record<string, number> = {};
    DINO_REWARDS.forEach(r => results[r.id] = 0);
    for (let i = 0; i < 10000; i++) {
      const reward = drawReward(DINO_REWARDS);
      results[reward.id]++;
    }
    setTotalPulls(prev => prev + 10000);
    setTotalCost(prev => prev + 50000000);
    setTestResults(results);
    setTestCount(10000);
  };

  const toggleSnipeTarget = (id: string) => {
    setSnipeTargetIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleSnipe = () => {
    if (snipeTargetIds.length === 0) {
      alert("저격할 공룡을 1개 이상 선택해주세요.");
      return;
    }
    setIsSniping(true);
    setSnipeResult(null);
    setTimeout(() => {
      let attempts = 0;
      const obtained = new Set<string>();
      const pulledCounts: Record<string, number> = {};
      while (obtained.size < snipeTargetIds.length && attempts < 100000) {
        attempts++;
        const pulled = drawReward(DINO_REWARDS);
        if (snipeTargetIds.includes(pulled.id)) obtained.add(pulled.id);
        pulledCounts[pulled.id] = (pulledCounts[pulled.id] || 0) + 1;
      }
      const cost = attempts * 5000;
      setSnipeResult({ attempts, cost, targets: pulledCounts });
      setTotalPulls(prev => prev + attempts);
      setTotalCost(prev => prev + cost);
      setIsSniping(false);
    }, 100);
  };

  const handleBudgetSimulate = () => {
    if (budgetAmount < 5000) {
      alert("크리스탈이 부족합니다. 최소 5,000 크리스탈이 필요합니다.");
      return;
    }
    const pulls = Math.floor(budgetAmount / 5000);
    const results: Record<string, number> = {};
    for (let i = 0; i < pulls; i++) {
      const reward = drawReward(DINO_REWARDS);
      results[reward.id] = (results[reward.id] || 0) + 1;
    }
    const sortedResults = DINO_REWARDS
      .filter(r => results[r.id] > 0)
      .map(r => [r, results[r.id]] as [Reward, number])
      .sort((a, b) => b[1] - a[1]);
    setBudgetResult({ pulls, results: sortedResults });
    setTotalPulls(prev => prev + pulls);
    setTotalCost(prev => prev + (pulls * 5000));
  };

  const handleReset = () => {
    setTotalPulls(0);
    setTotalCost(0);
    setWonItem(null);
    setSnipeResult(null);
    setTestCount(0);
    setBudgetResult(null);
    setOpenAnimState('idle');
    setFlashActive(false);
  };

  return (
    <div className="w-full space-y-6 relative transition-colors duration-300">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes thump-shake {
          0%, 40%, 100% { transform: scale(1) rotate(0deg); }
          5% { transform: scale(1.1) rotate(-10deg); }
          15% { transform: scale(1.1) rotate(10deg); }
          25% { transform: scale(1.1) rotate(-10deg); }
          35% { transform: scale(1) rotate(0deg); }
          55% { transform: scale(1.2) rotate(-12deg); }
          65% { transform: scale(1.2) rotate(12deg); }
          75% { transform: scale(1.2) rotate(-12deg); }
          85% { transform: scale(1) rotate(0deg); }
        }
        @keyframes vibrate-glow {
          0%, 100% { transform: scale(1.1) translateY(0); filter: brightness(1.2) drop-shadow(0 0 15px rgba(250,204,21,0.5)); }
          50% { transform: scale(1.15) translateY(-3px); filter: brightness(1.6) drop-shadow(0 0 35px rgba(250,204,21,0.9)); }
        }
        @keyframes ray-shoot {
          0% { transform: scaleY(0) translateY(0); opacity: 0; }
          20% { transform: scaleY(1) translateY(-20px); opacity: 1; }
          100% { transform: scaleY(1.5) translateY(-800px); opacity: 0; }
        }
        @keyframes circle-burst {
          0% { transform: scale(0); opacity: 1; filter: brightness(1); }
          50% { opacity: 1; filter: brightness(2); }
          100% { transform: scale(150); opacity: 0; filter: brightness(1); }
        }
        @keyframes item-float-up {
          0% { transform: scale(0.5) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes float-idle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 dark:bg-black/40 border border-yellow-300 dark:border-yellow-500/20 rounded-2xl p-5 shadow-sm dark:shadow-lg gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <img src={`${STORAGE_BASE_URL}/dino/gold_chest.png`} alt="공룡 보급품" className="w-16 h-16 object-contain drop-shadow-md dark:drop-shadow-lg" />
          <div>
            <h2 className="text-xl font-black text-yellow-600 dark:text-yellow-400 transition-colors">랜덤 공룡 펫 보급품</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">19종의 아기 공룡 펫 중 하나를 <span className="text-gray-900 dark:text-white font-bold transition-colors">동일한 확률(5.26%)</span>로 획득합니다.</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 w-full md:w-auto">
          <div className="text-sm font-bold text-gray-500 dark:text-gray-400 transition-colors">누적 개봉: <span className="text-gray-900 dark:text-white text-base transition-colors">{totalPulls.toLocaleString()}</span>회</div>
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/20 px-4 py-2 rounded-xl transition-colors">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 transition-colors">총 소모 재화</span>
            <img src={`${STORAGE_BASE_URL}/crystal.png`} className="w-5 h-5 object-contain" alt="크리스탈" />
            <span className="text-lg font-black text-blue-600 dark:text-blue-400 transition-colors">{totalCost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between border-b border-gray-200 dark:border-white/10 pb-4 transition-colors">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setMode('normal')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${mode === 'normal' ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>단일 개봉</button>
          <button onClick={() => setMode('test')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${mode === 'test' ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>10,000번 검증</button>
          <button onClick={() => setMode('snipe')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${mode === 'snipe' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-500/30' : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>공룡 콜렉터 저격</button>
          <button onClick={() => setMode('budget')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${mode === 'budget' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30' : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>대량 일괄 개봉</button>
        </div>
        
        <div className="flex items-center gap-3">
          {mode === 'normal' && (
            <div className="flex items-center gap-2 mr-2">
              <input type="checkbox" id="anim_dino" checked={showAnimation} onChange={(e) => setShowAnimation(e.target.checked)} className="accent-yellow-500 w-4 h-4 cursor-pointer" />
              <label htmlFor="anim_dino" className="text-sm font-bold text-gray-600 dark:text-gray-300 cursor-pointer select-none hover:text-gray-900 dark:hover:text-white transition-colors">연출 켜기</label>
            </div>
          )}
          <button onClick={handleReset} className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-bold border border-red-200 dark:border-red-500/30 rounded-lg transition-colors">
            초기화
          </button>
          <button onClick={() => setShowProbModal(true)} className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 text-sm font-bold border border-yellow-200 dark:border-yellow-500/30 rounded-lg transition-colors">
            확률표 보기
          </button>
        </div>
      </div>

      {mode === 'normal' && (
        <div className="w-full space-y-8 animate-fade-in">
          <div ref={containerRef} className="bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl relative overflow-hidden h-[450px] flex flex-col items-center justify-center shadow-inner w-full transition-colors">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1)_0%,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.05)_0%,transparent_70%)]"></div>
            {!wonItem && (
              <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
                {openAnimState === 'idle' && (
                  <img src={`${STORAGE_BASE_URL}/dino/gold_chest.png`} alt="보급품 상자" className="w-32 h-32 object-contain drop-shadow-md dark:drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:scale-110" />
                )}
                {openAnimState === 'shaking' && (
                  <img src={`${STORAGE_BASE_URL}/dino/gold_chest.png`} alt="보급품 상자" className="w-32 h-32 object-contain" style={{ animation: 'thump-shake 1.2s forwards' }} />
                )}
                {(openAnimState === 'rays' || openAnimState === 'flash') && (
                  <div className="relative flex items-center justify-center">
                    {openAnimState === 'rays' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        {[0, 90, 180, 270].map((deg, i) => (
                          <div key={i} className="absolute flex justify-center w-0 h-0" style={{ transform: `rotate(${deg + 45}deg)` }}>
                            <div className="absolute bottom-0 w-[60px] h-[500px] bg-gradient-to-t from-transparent via-yellow-200 dark:via-yellow-100 to-white rounded-t-full blur-[8px]" style={{ animation: `ray-shoot 0.8s ease-out forwards ${i * 0.25}s`, opacity: 0, transformOrigin: 'bottom center' }} />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="absolute w-64 h-64 bg-yellow-300/50 dark:bg-yellow-400/50 blur-[50px] rounded-full z-0 transition-colors"></div>
                    <img src={`${STORAGE_BASE_URL}/dino/gold_chest.png`} alt="보급품 상자" className="w-32 h-32 object-contain relative z-10" style={{ animation: 'vibrate-glow 0.1s infinite' }} />
                  </div>
                )}
              </div>
            )}
            {openAnimState === 'flash' && (
              <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className="w-24 h-24 bg-white rounded-full shadow-[0_0_200px_80px_white]" style={{ animation: 'circle-burst 0.4s ease-in forwards' }} />
              </div>
            )}
            <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-[800ms] ${flashActive ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8)_0%,rgba(255,255,255,1)_100%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0.9)_100%)] z-30 flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-300 ${!isSpinning && wonItem && openAnimState === 'idle' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
              {wonItem && (
                <div className="flex flex-col items-center justify-center w-full h-full" style={{ animation: 'item-float-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
                  <div style={{ animation: 'float-idle 3s ease-in-out infinite' }}>
                    <img src={wonItem.image} alt={wonItem.name} className="w-48 h-48 object-contain drop-shadow-xl dark:drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] rendering-pixelated" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white drop-shadow-sm dark:drop-shadow-md mt-6 bg-white/80 dark:bg-black/40 px-6 py-2 rounded-2xl border border-gray-200 dark:border-white/10 transition-colors">
                    {wonItem.name.replace(' 입양권', '')} 획득!
                  </h3>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <button onClick={handleOpen} disabled={isSpinning} className="bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 dark:from-yellow-600 dark:to-amber-500 dark:hover:from-yellow-500 dark:hover:to-amber-400 text-black font-black text-xl px-20 py-5 rounded-xl shadow-md dark:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95">
              {isSpinning ? '개봉 중...' : '1회 개봉하기'}
            </button>
          </div>
        </div>
      )}

      {mode === 'test' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 gap-4 transition-colors">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white transition-colors">10,000번 대규모 시뮬레이션</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">서버의 공식 확률 데이터가 실제로 어떻게 적용되는지 대수의 법칙으로 검증합니다.</p>
            </div>
            <button onClick={handleMassTest} className="bg-yellow-500 hover:bg-yellow-400 dark:bg-yellow-600 dark:hover:bg-yellow-500 text-black font-black px-6 py-3 rounded-xl transition-all shadow-sm dark:shadow-[0_0_15px_rgba(234,179,8,0.3)] whitespace-nowrap">
              즉시 1만번 돌리기
            </button>
          </div>
          {testCount > 0 && (
            <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-6 overflow-x-auto shadow-sm dark:shadow-none transition-colors">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-gray-500 dark:text-gray-500 uppercase bg-gray-50 dark:bg-white/5 transition-colors">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">보상 아이템</th>
                    <th className="px-4 py-3">공식 확률</th>
                    <th className="px-4 py-3">시뮬레이션 실제 확률</th>
                    <th className="px-4 py-3 rounded-tr-lg">획득 횟수 (1만번 기준)</th>
                  </tr>
                </thead>
                <tbody>
                  {DINO_REWARDS.map(reward => {
                    const count = testResults[reward.id] || 0;
                    const actualProb = (count / 10000) * 100;
                    const diff = Math.abs(reward.prob - actualProb);
                    const isAccurate = diff < 1.0; 
                    return (
                      <tr key={reward.id} className="border-b border-gray-200 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 font-bold text-gray-900 dark:text-white flex items-center gap-3 transition-colors">
                          <div className="w-8 h-8 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/50 transition-colors" style={{ backgroundImage: `url(${reward.image})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', imageRendering: 'pixelated' }} />
                          {reward.name}
                        </td>
                        <td className="px-4 py-4 text-gray-500 dark:text-gray-400 transition-colors">{reward.prob.toFixed(4)}%</td>
                        <td className={`px-4 py-4 font-black transition-colors ${isAccurate ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{actualProb.toFixed(4)}%</td>
                        <td className="px-4 py-4 text-gray-600 dark:text-gray-300 transition-colors">{count.toLocaleString()}회</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {mode === 'snipe' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-[#0a0a0a] border border-yellow-300 dark:border-yellow-500/20 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-[0_0_30px_rgba(234,179,8,0.05)] transition-colors">
            <h3 className="text-xl font-black text-yellow-600 dark:text-yellow-400 mb-2 transition-colors">공룡 콜렉터 다중 저격</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors">선택한 여러 마리의 공룡을 모두 최소 1마리씩 입양할 때까지 무한으로 개봉합니다.</p>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">목표 공룡 선택 (다중 선택 가능)</span>
                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-bold transition-colors">{snipeTargetIds.length}마리 선택됨</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                {DINO_REWARDS.map(r => {
                  const isSelected = snipeTargetIds.includes(r.id);
                  return (
                    <div key={r.id} onClick={() => toggleSnipeTarget(r.id)} className={`cursor-pointer flex items-center gap-2 p-2 rounded-lg border transition-all select-none ${isSelected ? 'bg-yellow-100 dark:bg-yellow-500/20 border-yellow-400 dark:border-yellow-500 shadow-sm dark:shadow-[inset_0_0_10px_rgba(234,179,8,0.3)]' : 'bg-gray-50 dark:bg-black/50 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                      <div className="w-8 h-8 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-black/50 shrink-0 transition-colors" style={{ backgroundImage: `url(${r.image})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', imageRendering: 'pixelated' }} />
                      <div className="flex flex-col overflow-hidden">
                        <span className={`text-[11px] font-bold truncate transition-colors ${isSelected ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>{r.name.replace(' 입양권', '')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-center">
              <button onClick={handleSnipe} disabled={snipeTargetIds.length === 0 || isSniping} className="bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 dark:from-yellow-600 dark:to-amber-500 dark:hover:from-yellow-500 dark:hover:to-amber-400 text-black font-black px-12 py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md dark:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all">
                {isSniping ? '공룡 찾는 중...' : '선택한 공룡이 모두 나올 때까지 개봉'}
              </button>
            </div>
            <div ref={containerRef} className="relative w-full mt-8">
              {snipeResult && (
                <div className="bg-gray-50 dark:bg-black/60 border border-yellow-300 dark:border-yellow-500/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center animate-fade-in-up transition-colors">
                  <span className="text-yellow-600 dark:text-yellow-400 text-lg font-black tracking-widest mb-2 transition-colors">컬렉션 완성!</span>
                  <div className="text-gray-700 dark:text-gray-300 font-medium mb-4 text-center text-sm md:text-base transition-colors">
                    선택한 <span className="text-gray-900 dark:text-white font-bold transition-colors">{snipeTargetIds.length}마리</span>의 공룡을 모두 입양하기 위해<br/>
                    총 <span className="text-yellow-600 dark:text-yellow-400 font-black text-xl px-1 transition-colors">{snipeResult.attempts.toLocaleString()}</span>회 개봉, <span className="text-blue-600 dark:text-blue-400 font-black text-xl mx-1 transition-colors">{snipeResult.cost.toLocaleString()}</span>크리스탈을 사용했습니다.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {mode === 'budget' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-[#0a0a0a] border border-indigo-200 dark:border-indigo-500/20 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-[0_0_30px_rgba(99,102,241,0.05)] transition-colors">
            <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 mb-2 transition-colors">대량 일괄 개봉 모드</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors">입력한 예산 내에서 최대로 보급품을 개봉하여 전체 결과를 한눈에 확인합니다.</p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-end">
              <div className="flex-1 w-full flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 pl-1 transition-colors">보유 크리스탈 예산</label>
                <div className="relative">
                  <img src={`${STORAGE_BASE_URL}/crystal.png`} className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 object-contain z-10" />
                  <input type="number" value={budgetAmount} onChange={(e) => setBudgetAmount(Number(e.target.value))} step="5000" min="5000" className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white font-black text-lg rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors" />
                </div>
              </div>
              <button onClick={handleBudgetSimulate} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-md dark:shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all whitespace-nowrap h-[52px]">일괄 개봉하기</button>
            </div>
            {budgetResult && (
              <div className="animate-fade-in-up border-t border-gray-200 dark:border-white/10 pt-8 mt-4 transition-colors">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-black text-gray-900 dark:text-white transition-colors">결과 리포트 <span className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-2 transition-colors">({budgetResult.pulls.toLocaleString()}회 개봉)</span></h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {budgetResult.results.map(([reward, count]) => (
                    <div key={reward.id} className="flex flex-col items-center justify-center p-4 rounded-xl border bg-gray-50 dark:bg-black/50 border-gray-200 dark:border-white/10 transition-colors">
                      <div className="w-12 h-12 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-black/50 mb-3 transition-colors" style={{ backgroundImage: `url(${reward.image})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', imageRendering: 'pixelated' }} />
                      <span className="text-[11px] font-bold text-center mb-2 line-clamp-1 text-gray-700 dark:text-gray-300 transition-colors">{reward.name.replace(' 입양권', '')}</span>
                      <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[11px] font-black px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/30 transition-colors">{count.toLocaleString()}마리</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showProbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowProbModal(false)}>
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-2xl w-full shadow-2xl transition-colors" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-yellow-600 dark:text-yellow-400 transition-colors">랜덤 공룡 펫 보급품 확률표</h3>
              <button onClick={() => setShowProbModal(false)} className="text-gray-400 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {DINO_REWARDS.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-2 rounded-lg text-sm transition-colors">
                  <div className="w-8 h-8 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-black/50 shrink-0 transition-colors" style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', imageRendering: 'pixelated' }} />
                  <span className="text-gray-700 dark:text-gray-200 flex-1 font-bold truncate transition-colors">{item.name}</span>
                  <span className="text-yellow-600 dark:text-white font-bold bg-yellow-100 dark:bg-yellow-500/20 dark:text-yellow-400 px-2 py-1 rounded whitespace-nowrap transition-colors">{item.prob.toFixed(4)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}