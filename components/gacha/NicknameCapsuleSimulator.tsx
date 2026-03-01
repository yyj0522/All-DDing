'use client';

import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface Reward {
  id: string;
  name: string;
  prob: number;
  image: string;
  amount: number;
  grade: string;
}

const NICKNAME_REWARDS: Reward[] = [
  { id: 'nick_ticket', name: '한글 닉네임 변경권', prob: 3, image: '/capsule2/nickname_change_scroll.png', amount: 1, grade: 'mythic' },
  { id: 'coin_5', name: '코스메틱 코인', prob: 17, image: '/capsule2/cosmetic_coin.png', amount: 5, grade: 'rare' },
  { id: 'coin_3', name: '코스메틱 코인', prob: 30, image: '/capsule2/cosmetic_coin.png', amount: 3, grade: 'uncommon' },
  { id: 'coin_1', name: '코스메틱 코인', prob: 50, image: '/capsule2/cosmetic_coin.png', amount: 1, grade: 'common' },
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

const drawVisualReward = (rewards: Reward[]): Reward => {
  return rewards[Math.floor(Math.random() * rewards.length)];
};

export default function NicknameCapsuleSimulator() {
  const [showAnimation, setShowAnimation] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [mode, setMode] = useState<'normal' | 'test' | 'snipe'>('normal');
  const [showProbModal, setShowProbModal] = useState(false);
  const [strip, setStrip] = useState<Reward[]>([]);
  const [offset, setOffset] = useState(0);
  const [wonItem, setWonItem] = useState<Reward | null>(null);
  
  const [totalPulls, setTotalPulls] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  const [snipeTargetId, setSnipeTargetId] = useState<string>('');
  const [snipeResult, setSnipeResult] = useState<{ attempts: number, cost: number, target: Reward } | null>(null);
  const [isSniping, setIsSniping] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [testResults, setTestResults] = useState<Record<string, number>>({});
  const [testCount, setTestCount] = useState(0);

  useEffect(() => {
    const initial: Reward[] = [];
    for (let i = 0; i < 30; i++) {
      initial.push(drawVisualReward(NICKNAME_REWARDS));
    }
    setStrip(initial);
    setOffset(-(10 * 120) - 50);
    setWonItem(null);
    setSnipeTargetId('');
    setSnipeResult(null);
  }, []);

  const triggerFancyConfetti = () => {
    let originX = 0.5;
    let originY = 0.5;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      originX = (rect.left + rect.width / 2) / window.innerWidth;
      originY = (rect.top + rect.height / 2) / window.innerHeight;
    }

    const count = 250; 
    const defaults = {
      origin: { x: originX, y: originY },
      colors: ['#ffffff', '#f8fafc', '#e0f2fe', '#7dd3fc', '#3b82f6', '#1e3a8a'], 
      ticks: 200, 
      zIndex: 200
    };

    function fire(particleRatio: number, opts: any) {
      confetti(Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio)
      }));
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const handleOpen = () => {
    if (isSpinning) return;

    const winner = drawReward(NICKNAME_REWARDS);
    setTotalPulls(prev => prev + 1);
    setTotalCost(prev => prev + 2500);

    if (!showAnimation) {
      setWonItem(winner);
      return;
    }

    setIsSpinning(true);
    setWonItem(null);

    const newStrip: Reward[] = [];
    for (let i = 0; i < 100; i++) {
      newStrip.push(drawVisualReward(NICKNAME_REWARDS));
    }
    const targetIndex = 85;
    newStrip[targetIndex] = winner;
    
    setStrip(newStrip);

    const startIdx = 10;
    setOffset(-(startIdx * 120) - 50);

    setTimeout(() => {
      const duration = 6000;
      let startTime: number | null = null;

      const animate = (time: number) => {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 4); 
        
        const currentIdx = Math.round(startIdx + (targetIndex - startIdx) * easeProgress);
        const currentOffset = -(currentIdx * 120) - 50;
        
        if (trackRef.current) {
          trackRef.current.style.transform = `translate(${currentOffset}px, -50%)`;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setOffset(-(targetIndex * 120) - 50);
          if (trackRef.current) {
            trackRef.current.style.transform = `translate(${-(targetIndex * 120) - 50}px, -50%)`;
          }
          setIsSpinning(false);
          setWonItem(winner);
          triggerFancyConfetti();
        }
      };

      requestAnimationFrame(animate);
    }, 50);
  };

  const handleMassTest = () => {
    const results: Record<string, number> = {};
    NICKNAME_REWARDS.forEach(r => results[r.id] = 0);

    for (let i = 0; i < 10000; i++) {
      const reward = drawReward(NICKNAME_REWARDS);
      results[reward.id]++;
    }

    setTotalPulls(prev => prev + 10000);
    setTotalCost(prev => prev + 25000000);
    setTestResults(results);
    setTestCount(10000);
  };

  const handleSnipe = () => {
    if (!snipeTargetId) {
      alert("저격할 아이템을 먼저 선택해주세요.");
      return;
    }

    setIsSniping(true);
    setSnipeResult(null);

    setTimeout(() => {
      let attempts = 0;
      let pulled: Reward;
      
      do {
        attempts++;
        pulled = drawReward(NICKNAME_REWARDS);
        if (attempts > 50000) break;
      } while (pulled.id !== snipeTargetId);

      const cost = attempts * 2500;
      setSnipeResult({ attempts, cost, target: pulled });
      setTotalPulls(prev => prev + attempts);
      setTotalCost(prev => prev + cost);
      setIsSniping(false);
    }, 100);
  };

  const handleReset = () => {
    setTotalPulls(0);
    setTotalCost(0);
    setWonItem(null);
    setStrip([]);
    setSnipeResult(null);
    setTestCount(0);
  };

  return (
    <div className="w-full space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-black/40 border border-white/10 rounded-2xl p-5 shadow-lg gap-4">
        <div className="flex items-center gap-4">
          <img src="/f1/mythic_special_box.png" alt="한글 닉네임 캡슐" className="w-16 h-16 object-contain drop-shadow-lg" />
          <div>
            <h2 className="text-xl font-black text-white">한글 닉네임 변경 캡슐</h2>
            <p className="text-sm text-gray-400 mt-1">1회 개봉 비용: <span className="text-blue-400 font-bold">2,500</span> 크리스탈</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 w-full md:w-auto">
          <div className="text-sm font-bold text-gray-400">누적 개봉: <span className="text-white text-base">{totalPulls.toLocaleString()}</span>회</div>
          <div className="flex items-center gap-2 bg-blue-900/20 border border-blue-500/20 px-4 py-2 rounded-xl">
            <span className="text-xs font-bold text-gray-400">총 소모 재화</span>
            <img src="/crystal.png" className="w-5 h-5 object-contain" alt="크리스탈" />
            <span className="text-lg font-black text-blue-400">{totalCost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between border-b border-white/10 pb-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setMode('normal')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${mode === 'normal' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>일반 개봉</button>
          <button onClick={() => setMode('test')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${mode === 'test' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>10,000번 검증</button>
          <button onClick={() => setMode('snipe')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${mode === 'snipe' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-gray-500 hover:text-gray-300'}`}>특정 아이템 저격</button>
        </div>
        
        <div className="flex items-center gap-3">
          {mode === 'normal' && (
            <div className="flex items-center gap-2 mr-2">
              <input type="checkbox" id="anim" checked={showAnimation} onChange={(e) => setShowAnimation(e.target.checked)} className="accent-fuchsia-500 w-4 h-4 cursor-pointer" />
              <label htmlFor="anim" className="text-sm font-bold text-gray-300 cursor-pointer select-none hover:text-white transition-colors">룰렛 켜기</label>
            </div>
          )}
          <button onClick={handleReset} className="px-4 py-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 text-sm font-bold border border-red-500/30 rounded-lg transition-colors">
            초기화
          </button>
          <button onClick={() => setShowProbModal(true)} className="px-4 py-2 bg-fuchsia-900/20 text-fuchsia-400 hover:bg-fuchsia-900/40 text-sm font-bold border border-fuchsia-500/30 rounded-lg transition-colors">
            확률표 보기
          </button>
        </div>
      </div>

      {mode === 'normal' && (
        <div className="w-full space-y-8 animate-fade-in">
          <div ref={containerRef} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 relative overflow-hidden h-72 flex flex-col justify-center shadow-inner w-full">
            
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-[20px] z-0">
              {Array.from({ length: 21 }).map((_, i) => (
                <div key={i} className={`w-[100px] h-[92px] rounded-xl flex-shrink-0 border ${i === 10 ? 'bg-fuchsia-900/20 border-fuchsia-500/50 shadow-[inset_0_0_20px_rgba(217,70,239,0.3)]' : 'bg-gray-900/60 border-white/5'}`}></div>
              ))}
            </div>

            <div 
              ref={trackRef}
              className="absolute top-1/2 flex gap-[20px] z-10"
              style={{ 
                left: '50%',
                transform: `translate(${offset}px, -50%)`, 
                transition: 'none'
              }}
            >
              {strip.map((item, i) => (
                <div key={i} className="w-[100px] h-[92px] flex-shrink-0 flex flex-col items-center justify-center">
                  <div className="relative">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-contain drop-shadow-md relative z-10" />
                    {item.amount > 1 && (
                      <div className="absolute -bottom-1 -right-2 bg-black/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded border border-white/20 z-20">
                        x{item.amount}
                      </div>
                    )}
                    {item.grade === 'mythic' && <div className="absolute inset-0 bg-yellow-500/40 blur-lg rounded-full z-0"></div>}
                    {item.grade === 'legendary' && <div className="absolute inset-0 bg-fuchsia-500/40 blur-lg rounded-full z-0"></div>}
                  </div>
                  <span className="text-[10px] mt-2 text-center text-gray-300 font-bold line-clamp-1">{item.name}</span>
                </div>
              ))}
            </div>

            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[116px] h-[108px] border-4 border-fuchsia-500 rounded-2xl z-20 shadow-[0_0_20px_rgba(217,70,239,0.5)] pointer-events-none"></div>

            {!isSpinning && wonItem && (
              <div className="absolute inset-0 bg-black/85 z-30 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in">
                <span className="text-fuchsia-400 text-base font-bold mb-3 tracking-widest">획득!</span>
                <img src={wonItem.image} alt={wonItem.name} className="w-28 h-28 object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]" />
                <h3 className="text-3xl font-black text-white mt-6">
                  {wonItem.name} {wonItem.amount > 1 ? ` (x${wonItem.amount})` : ''}
                </h3>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button 
              onClick={handleOpen} 
              disabled={isSpinning}
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black text-xl px-20 py-5 rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {isSpinning ? '개봉 중...' : '1회 개봉하기'}
            </button>
          </div>
        </div>
      )}

      {mode === 'test' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 p-6 rounded-2xl border border-white/10 gap-4">
            <div>
              <h3 className="text-xl font-black text-white">10,000번 대규모 시뮬레이션</h3>
              <p className="text-sm text-gray-400 mt-1">서버의 공식 확률 데이터가 실제로 어떻게 적용되는지 대수의 법칙으로 검증합니다.</p>
            </div>
            <button onClick={handleMassTest} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] whitespace-nowrap">
              즉시 1만번 돌리기
            </button>
          </div>

          {testCount > 0 && (
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-gray-500 uppercase bg-white/5">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">보상 아이템</th>
                    <th className="px-4 py-3">공식 확률</th>
                    <th className="px-4 py-3">시뮬레이션 실제 확률</th>
                    <th className="px-4 py-3 rounded-tr-lg">획득 횟수 (1만번 기준)</th>
                  </tr>
                </thead>
                <tbody>
                  {NICKNAME_REWARDS.map(reward => {
                    const count = testResults[reward.id] || 0;
                    const actualProb = (count / 10000) * 100;
                    const diff = Math.abs(reward.prob - actualProb);
                    const isAccurate = diff < 1.0; 

                    return (
                      <tr key={reward.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 font-bold text-white flex items-center gap-3">
                          <img src={reward.image} className="w-6 h-6 object-contain" />
                          {reward.name} {reward.amount > 1 ? `x${reward.amount}` : ''}
                        </td>
                        <td className="px-4 py-4 text-gray-400">{reward.prob.toFixed(4)}%</td>
                        <td className={`px-4 py-4 font-black ${isAccurate ? 'text-green-400' : 'text-yellow-400'}`}>
                          {actualProb.toFixed(4)}%
                        </td>
                        <td className="px-4 py-4 text-gray-300">{count.toLocaleString()}회</td>
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
          <div className="bg-[#0a0a0a] border border-rose-500/20 rounded-2xl p-6 sm:p-8 shadow-[0_0_30px_rgba(244,63,94,0.05)]">
            <h3 className="text-xl font-black text-rose-400 mb-2">특정 아이템 저격 모드</h3>
            <p className="text-sm text-gray-400 mb-6">원하는 아이템이 나올 때까지 뒷단에서 캡슐을 무한으로 연속 개봉합니다.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <select 
                value={snipeTargetId} 
                onChange={(e) => setSnipeTargetId(e.target.value)}
                className="flex-1 bg-black border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="">저격할 목표 아이템을 선택하세요</option>
                {NICKNAME_REWARDS.map(r => (
                  <option key={r.id} value={r.id}>{r.name} {r.amount > 1 ? `(x${r.amount})` : ''} - 확률 {r.prob}%</option>
                ))}
              </select>
              <button 
                onClick={handleSnipe}
                disabled={!snipeTargetId || isSniping}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all whitespace-nowrap"
              >
                {isSniping ? '저격 진행 중...' : '나올 때까지 개봉'}
              </button>
            </div>

            <div ref={containerRef} className="relative w-full">
              {snipeResult && (
                <div className="bg-black/50 border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center animate-fade-in-up relative z-10 backdrop-blur-sm">
                  <span className="text-rose-400 text-sm font-bold tracking-widest mb-4">목표 달성 완료!</span>
                  <img src={snipeResult.target.image} alt={snipeResult.target.name} className="w-24 h-24 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
                  <div className="mt-6 text-2xl font-black text-white">
                    <span className="text-indigo-400 text-3xl">[{snipeResult.target.name}]</span> 획득 성공!
                  </div>
                  <div className="mt-4 text-gray-300 font-medium flex flex-col md:flex-row items-center justify-center gap-2">
                    해당 아이템을 뽑기 위해 캡슐을
                    <span className="bg-white/10 px-3 py-1 rounded-lg">총 <span className="text-rose-400 font-black text-xl">{snipeResult.attempts.toLocaleString()}</span>회</span>
                    <span className="bg-blue-900/20 border border-blue-500/20 px-3 py-1 rounded-lg flex items-center gap-1.5">
                      <img src="/crystal.png" className="w-5 h-5 object-contain" alt="크리스탈" />
                      <span className="text-blue-400 font-black text-xl">{snipeResult.cost.toLocaleString()}</span> 크리스탈 사용
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showProbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowProbModal(false)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-fuchsia-400">한글 닉네임 변경 캡슐 확률표</h3>
              <button onClick={() => setShowProbModal(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {NICKNAME_REWARDS.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg text-sm">
                  <img src={item.image} className="w-8 h-8 object-contain" />
                  <span className="text-gray-200 flex-1 font-medium">{item.name} {item.amount > 1 ? `x${item.amount}` : ''}</span>
                  <span className="text-white font-bold bg-fuchsia-500/20 text-fuchsia-300 px-2 py-1 rounded">
                    {item.prob.toFixed(4)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}