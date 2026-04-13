'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { useTheme } from 'next-themes';

interface Reward {
  id: string;
  name: string;
  prob: number;
  image: string;
  amount: number;
  grade: string;
}

const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

const NICKNAME_REWARDS: Reward[] = [
  { id: 'nick_ticket', name: '한글 닉네임 변경권', prob: 3, image: `${STORAGE_BASE_URL}/capsule2/nickname_change_scroll.png`, amount: 1, grade: 'mythic' },
  { id: 'coin_5', name: '코스메틱 코인', prob: 17, image: `${STORAGE_BASE_URL}/capsule2/cosmetic_coin.png`, amount: 5, grade: 'rare' },
  { id: 'coin_3', name: '코스메틱 코인', prob: 30, image: `${STORAGE_BASE_URL}/capsule2/cosmetic_coin.png`, amount: 3, grade: 'uncommon' },
  { id: 'coin_1', name: '코스메틱 코인', prob: 50, image: `${STORAGE_BASE_URL}/capsule2/cosmetic_coin.png`, amount: 1, grade: 'common' },
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

  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  const [testResults, setTestResults] = useState<Record<string, number>>({});
  const [testCount, setTestCount] = useState(0);
  const { theme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [panelRect, setPanelRect] = useState({ top: 0, left: 0, height: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;
    const parent = rootRef.current.closest('.max-w-5xl') as HTMLElement;
    if (!parent) return;

    const updatePosition = () => {
      const bounds = parent.getBoundingClientRect();
      setPanelRect({
        top: bounds.top + window.scrollY,
        left: bounds.right + 5,
        height: bounds.height
      });
    };

    updatePosition();
    const ro = new ResizeObserver(updatePosition);
    ro.observe(parent);
    window.addEventListener('resize', updatePosition);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

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
    if (!confettiCanvasRef.current) return;
    const myConfetti = confetti.create(confettiCanvasRef.current, { resize: true, useWorker: true });
    const count = 200;
    const defaults = { origin: { x: 0.5, y: 0.5 }, colors: ['#ffffff', '#f8fafc', '#e0f2fe', '#7dd3fc', '#3b82f6', '#1e3a8a'], ticks: 200, zIndex: 200 };
    const fire = (ratio: number, opts: any) => myConfetti(Object.assign({}, defaults, opts, { particleCount: Math.floor(count * ratio) }));
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
    <div ref={rootRef} className="w-full space-y-6 relative transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm dark:shadow-lg gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <img src={`${STORAGE_BASE_URL}/f1/mythic_special_box.png`} alt="한글 닉네임 캡슐" className="w-16 h-16 object-contain drop-shadow-md dark:drop-shadow-lg" />
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white transition-colors">한글 닉네임 변경 캡슐</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors">1회 개봉 비용: <span className="text-blue-600 dark:text-blue-400 font-bold">2,500</span> 크리스탈</p>
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
          <button onClick={() => setMode('normal')} className={`px-4 py-2 text-[11px] md:text-sm font-bold rounded-lg transition-colors ${mode === 'normal' ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>일반 개봉</button>
          <button onClick={() => setMode('test')} className={`px-4 py-2 text-[11px] md:text-sm font-bold rounded-lg transition-colors ${mode === 'test' ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>1만번 검증</button>
          <button onClick={() => setMode('snipe')} className={`px-4 py-2 text-[11px] md:text-sm font-bold rounded-lg transition-colors ${mode === 'snipe' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30' : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>특정 아이템 저격</button>
        </div>
        
        <div className="flex items-center gap-3">
          {mode === 'normal' && (
            <div className="flex items-center gap-2 mr-2">
              <input type="checkbox" id="anim" checked={showAnimation} onChange={(e) => setShowAnimation(e.target.checked)} className="accent-fuchsia-500 w-4 h-4 cursor-pointer" />
              <label htmlFor="anim" className="text-xs md:text-sm font-bold text-gray-600 dark:text-gray-300 cursor-pointer select-none hover:text-gray-900 dark:hover:text-white transition-colors">룰렛 켜기</label>
            </div>
          )}
          <button onClick={handleReset} className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-[11px] md:text-sm font-bold border border-red-200 dark:border-red-500/30 rounded-lg transition-colors">
            초기화
          </button>
          <button onClick={() => setShowProbModal(!showProbModal)} className={`px-4 py-2 text-[11px] md:text-sm font-bold border rounded-lg transition-all ${showProbModal ? 'bg-fuchsia-600 text-white border-fuchsia-600 dark:bg-fuchsia-500 dark:border-fuchsia-500 shadow-md' : 'bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-500/30 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-500/20'}`}>
            {showProbModal ? '확률표 접기' : '확률표 보기'}
          </button>
        </div>
      </div>

      {mode === 'normal' && (
        <div className="w-full space-y-8 animate-fade-in">
          <div ref={containerRef} className="bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden h-72 flex flex-col justify-center shadow-inner w-full transition-colors">
            <canvas ref={confettiCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-40" />

            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-[20px] z-0">
              {Array.from({ length: 21 }).map((_, i) => (
                <div key={i} className={`w-[90px] md:w-[100px] h-[82px] md:h-[92px] rounded-xl flex-shrink-0 border transition-colors ${i === 10 ? 'bg-fuchsia-100 dark:bg-fuchsia-900/20 border-fuchsia-300 dark:border-fuchsia-500/50 shadow-[inset_0_0_10px_rgba(217,70,239,0.1)] dark:shadow-[inset_0_0_20px_rgba(217,70,239,0.3)]' : 'bg-white/50 dark:bg-gray-900/60 border-gray-200 dark:border-white/5'}`}></div>
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
                <div key={i} className="group relative hover:z-50 w-[90px] md:w-[100px] h-[82px] md:h-[92px] flex-shrink-0 flex flex-col items-center justify-center cursor-default">
                  <div className="relative">
                    <img src={item.image} alt={item.name} className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-md relative z-10" />
                    {item.amount > 1 && (
                      <div className="absolute -bottom-1 -right-2 bg-gray-900 dark:bg-black/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded border border-gray-600 dark:border-white/20 z-20">
                        x{item.amount}
                      </div>
                    )}
                    {item.grade === 'mythic' && <div className="absolute inset-0 bg-yellow-400/30 dark:bg-yellow-500/40 blur-lg rounded-full z-0"></div>}
                    {item.grade === 'legendary' && <div className="absolute inset-0 bg-fuchsia-400/30 dark:bg-fuchsia-500/40 blur-lg rounded-full z-0"></div>}
                  </div>
                  <span className="text-[9px] md:text-[10px] mt-1 md:mt-2 text-center text-gray-600 dark:text-gray-300 font-bold line-clamp-1 transition-colors">{item.name}</span>
                  
                  <div className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 hidden group-hover:block bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-[200] shadow-lg pointer-events-none">
                    {item.name} {item.amount > 1 ? `x${item.amount}` : ''}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800 dark:border-b-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[106px] md:w-[116px] h-[98px] md:h-[108px] border-4 border-fuchsia-400 dark:border-fuchsia-500 rounded-2xl z-20 shadow-[0_0_15px_rgba(217,70,239,0.3)] dark:shadow-[0_0_20px_rgba(217,70,239,0.5)] pointer-events-none transition-colors"></div>

            {!isSpinning && wonItem && (
              <div className="absolute inset-0 bg-white/80 dark:bg-black/85 z-30 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in transition-colors">
                <span className="text-fuchsia-600 dark:text-fuchsia-400 text-base font-bold mb-3 tracking-widest transition-colors">획득 성공!</span>
                <div className="relative w-20 h-20 md:w-24 md:h-24">
                  <Image src={wonItem.image} alt={wonItem.name} fill unoptimized className="object-contain drop-shadow-md dark:drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]" />
                </div>
                <h3 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white mt-4 break-keep transition-colors">
                  {wonItem.name} {wonItem.amount > 1 ? ` (x${wonItem.amount})` : ''}
                </h3>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button 
              onClick={handleOpen} 
              disabled={isSpinning}
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black text-base md:text-lg px-16 md:px-20 py-3 md:py-4 rounded-xl shadow-md dark:shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {isSpinning ? '개봉 중...' : '1회 개봉하기'}
            </button>
          </div>
        </div>
      )}

      {mode === 'test' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-200 dark:border-white/10 gap-3 transition-colors">
            <div className="text-center sm:text-left"><h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white transition-colors">대규모 시뮬레이션</h3><p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-500 mt-1 transition-colors">1만번 시행을 통해 실제 확률을 검증합니다.</p></div>
            <button onClick={handleMassTest} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 text-sm rounded-xl shadow-sm dark:shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all">즉시 1만번 실행</button>
          </div>

          {testCount > 0 && (
            <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl overflow-x-auto shadow-sm dark:shadow-none transition-colors pb-6">
              <table className="w-full text-[11px] md:text-xs text-left whitespace-nowrap">
                <thead className="text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-white/5 uppercase transition-colors">
                  <tr>
                    <th className="px-3 md:px-4 py-2.5 rounded-tl-lg">보상 아이템</th>
                    <th className="px-3 md:px-4 py-2.5">공식 확률</th>
                    <th className="px-3 md:px-4 py-2.5">시뮬레이션 실제 확률</th>
                    <th className="px-3 md:px-4 py-2.5 rounded-tr-lg">획득 횟수 (1만번 기준)</th>
                  </tr>
                </thead>
                <tbody>
                  {NICKNAME_REWARDS.map(reward => {
                    const count = testResults[reward.id] || 0;
                    const actualProb = (count / 10000) * 100;
                    const diff = Math.abs(reward.prob - actualProb);
                    const isAccurate = diff < 1.0; 

                    return (
                      <tr key={reward.id} className="border-b border-gray-200 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-3 md:px-4 py-2 md:py-3 font-bold text-gray-900 dark:text-white transition-colors">
                          <div className="group relative hover:z-50 inline-flex items-center gap-2 cursor-default">
                            <div className="relative w-5 h-5 md:w-6 md:h-6"><Image src={reward.image} alt="R" fill unoptimized style={{ imageRendering: 'pixelated' }} /></div>
                            <span className="truncate max-w-[120px]">{reward.name} {reward.amount > 1 ? `x${reward.amount}` : ''}</span>
                            <div className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 hidden group-hover:block bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-[200] shadow-lg pointer-events-none">
                              {reward.name} {reward.amount > 1 ? `x${reward.amount}` : ''}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800 dark:border-b-gray-200"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-gray-500 dark:text-gray-400 transition-colors">{reward.prob.toFixed(4)}%</td>
                        <td className={`px-3 md:px-4 py-2 md:py-3 font-black transition-colors ${isAccurate ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                          {actualProb.toFixed(4)}%
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600 dark:text-gray-300 transition-colors">{count.toLocaleString()}회</td>
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
          <div className="bg-white dark:bg-[#0a0a0a] border border-rose-200 dark:border-rose-500/20 rounded-2xl p-5 md:p-6 shadow-sm dark:shadow-xl transition-colors">
            <h3 className="text-base md:text-lg font-black text-rose-600 dark:text-rose-400 mb-3 transition-colors">특정 아이템 저격 모드</h3>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors">원하는 아이템이 나올 때까지 뒷단에서 캡슐을 무한으로 연속 개봉합니다.</p>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <select 
                value={snipeTargetId} 
                onChange={(e) => setSnipeTargetId(e.target.value)}
                className="flex-1 bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white text-xs md:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-rose-400 dark:focus:border-rose-500 cursor-pointer transition-colors"
              >
                <option value="">저격할 목표 아이템을 선택하세요</option>
                {NICKNAME_REWARDS.map(r => (
                  <option key={r.id} value={r.id}>{r.name} {r.amount > 1 ? `(x${r.amount})` : ''} - 확률 {r.prob}%</option>
                ))}
              </select>
              <button 
                onClick={handleSnipe}
                disabled={!snipeTargetId || isSniping}
                className="bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold px-6 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md dark:shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all whitespace-nowrap"
              >
                {isSniping ? '저격 진행 중...' : '나올 때까지 개봉'}
              </button>
            </div>

            <div ref={containerRef} className="relative w-full mt-6">
              {snipeResult && (
                <div className="bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center animate-fade-in-up relative z-10 backdrop-blur-sm transition-colors">
                  <span className="text-rose-600 dark:text-rose-400 text-[10px] md:text-xs font-bold tracking-widest mb-3 transition-colors">목표 달성 완료!</span>
                  <div className="group relative hover:z-50 cursor-default">
                    <img src={snipeResult.target.image} alt={snipeResult.target.name} className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-md dark:drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
                    <div className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 hidden group-hover:block bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-[200] shadow-lg pointer-events-none">
                      {snipeResult.target.name} {snipeResult.target.amount > 1 ? `x${snipeResult.target.amount}` : ''}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800 dark:border-b-gray-200"></div>
                    </div>
                  </div>
                  <div className="mt-4 text-base md:text-xl font-black text-gray-900 dark:text-white transition-colors">
                    <span className="text-indigo-600 dark:text-indigo-400 transition-colors">[{snipeResult.target.name}]</span> 획득 성공!
                  </div>
                  <div className="mt-3 text-gray-600 dark:text-gray-300 text-[11px] md:text-xs font-medium flex flex-col md:flex-row items-center justify-center gap-2 transition-colors">
                    해당 아이템을 뽑기 위해 캡슐을
                    <span className="bg-gray-200 dark:bg-white/10 px-2 py-1 rounded-lg transition-colors">총 <span className="text-rose-600 dark:text-rose-400 font-black text-sm md:text-base transition-colors">{snipeResult.attempts.toLocaleString()}</span>회</span>
                    <span className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/20 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors">
                      <img src={`${STORAGE_BASE_URL}/crystal.png`} className="w-4 h-4 object-contain" alt="크리스탈" />
                      <span className="text-blue-600 dark:text-blue-400 font-black text-sm md:text-base transition-colors">{snipeResult.cost.toLocaleString()}</span> 크리스탈 사용
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showProbModal && (
        <div className="xl:hidden fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 dark:bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowProbModal(false)}>
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-5 max-w-md w-full shadow-2xl transition-colors" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-fuchsia-600 dark:text-fuchsia-400 transition-colors">한글 닉네임 변경 캡슐 확률표</h3>
              <button onClick={() => setShowProbModal(false)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">✕</button>
            </div>
            
            <div className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1.5 pb-6">
              {NICKNAME_REWARDS.map((item, idx) => (
                <div key={idx} className="group relative hover:z-50 flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg text-[11px] md:text-xs transition-colors cursor-default">
                  <div className="relative w-6 h-6 shrink-0"><Image src={item.image} alt="I" fill unoptimized className="drop-shadow-sm dark:drop-shadow-none" /></div>
                  <span className="text-gray-700 dark:text-gray-200 flex-1 font-medium truncate transition-colors">{item.name} {item.amount > 1 ? `x${item.amount}` : ''}</span>
                  <span className="text-fuchsia-600 dark:text-white font-bold bg-fuchsia-100 dark:bg-fuchsia-500/20 dark:text-fuchsia-300 px-1.5 py-0.5 rounded transition-colors">
                    {item.prob.toFixed(4)}%
                  </span>

                  <div className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 hidden group-hover:block bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-[200] shadow-lg pointer-events-none">
                    {item.name} {item.amount > 1 ? `x${item.amount}` : ''}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800 dark:border-b-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {mounted && document.body && createPortal(
        <div 
          className={`hidden xl:block absolute z-40 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${showProbModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          style={{
            top: panelRect.top,
            left: panelRect.left,
            height: panelRect.height,
            width: showProbModal ? '400px' : '0px'
          }}
        >
          <div style={{ width: '400px', height: '100%' }} className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-2xl p-4 md:p-5 flex flex-col transition-colors">
            <div className="flex justify-between items-center mb-5 shrink-0">
              <h3 className="text-base font-black text-fuchsia-600 dark:text-fuchsia-400 transition-colors">한글 닉네임 변경 캡슐 확률표</h3>
              <button onClick={() => setShowProbModal(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors text-lg">✕</button>
            </div>
            <div className="flex flex-col gap-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1.5 pb-6">
              {NICKNAME_REWARDS.map((item, idx) => (
                <div key={idx} className="group relative hover:z-50 flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-default">
                  <div className="relative w-6 h-6 shrink-0"><Image src={item.image} alt="I" fill unoptimized className="drop-shadow-sm dark:drop-shadow-none" /></div>
                  <span className="text-gray-700 dark:text-gray-200 flex-1 font-bold text-[11px] truncate transition-colors">{item.name} {item.amount > 1 ? `x${item.amount}` : ''}</span>
                  <span className="text-white font-black bg-fuchsia-100 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-300 px-1.5 py-0.5 rounded text-[10px] transition-colors">{item.prob.toFixed(4)}%</span>

                  <div className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 hidden group-hover:block bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-[200] shadow-lg pointer-events-none">
                    {item.name} {item.amount > 1 ? `x${item.amount}` : ''}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800 dark:border-b-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}