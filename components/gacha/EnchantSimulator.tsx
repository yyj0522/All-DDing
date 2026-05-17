'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { 
  ENCHANT_BOXES, 
  GREEN_REWARDS,
  BLUE_REWARDS,
  LOWER_REWARDS,
  UPPER_REWARDS,
  LEGENDARY_REWARDS,
  MYTHIC_REWARDS,
  drawReward, 
  Reward 
} from '@/lib/gachaData';
import { useTheme } from 'next-themes';

export default function EnchantSimulator() {
  const [activeBox, setActiveBox] = useState(ENCHANT_BOXES.find(b => b.active));
  const [showAnimation, setShowAnimation] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [mode, setMode] = useState<'normal' | 'test' | 'snipe'>('normal');
  
  const [strip, setStrip] = useState<Reward[]>([]);
  const [offset, setOffset] = useState(0);
  const [wonItem, setWonItem] = useState<Reward | null>(null);
  
  const [snipeTargetId, setSnipeTargetId] = useState<string>('');
  const [snipeResult, setSnipeResult] = useState<{ attempts: number, target: Reward } | null>(null);
  const [isSniping, setIsSniping] = useState(false);

  
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  const [testResults, setTestResults] = useState<Record<string, number>>({});
  const [testCount, setTestCount] = useState(0);
  const { theme } = useTheme();

  

  const getCurrentRewards = () => {
    switch (activeBox?.id) {
      case 'general_g': return GREEN_REWARDS;
      case 'general_b': return BLUE_REWARDS;
      case 'lower_special': return LOWER_REWARDS;
      case 'upper_special': return UPPER_REWARDS;
      case 'legendary_special': return LEGENDARY_REWARDS;
      case 'mythic_special': return MYTHIC_REWARDS;
      default: return [];
    }
  };

  const currentRewards = getCurrentRewards();

  useEffect(() => {
    if (!currentRewards || currentRewards.length === 0) return;
    const initial: Reward[] = [];
    for (let i = 0; i < 30; i++) {
      initial.push(drawReward(currentRewards));
    }
    setStrip(initial);
    setOffset(-(10 * 120) - 50);
    setWonItem(null);
    setSnipeTargetId('');
    setSnipeResult(null);
  }, [activeBox]);

  const triggerFancyConfetti = () => {
    if (!confettiCanvasRef.current) return;
    const myConfetti = confetti.create(confettiCanvasRef.current, { resize: true, useWorker: true });
    const count = 200;
    const defaults = { origin: { x: 0.5, y: 0.5 }, colors: ['#ffffff', '#f8fafc', '#7dd3fc', '#3b82f6', '#1e3a8a'], ticks: 200, zIndex: 200 };
    const fire = (ratio: number, opts: any) => myConfetti(Object.assign({}, defaults, opts, { particleCount: Math.floor(count * ratio) }));
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const handleOpen = () => {
    if (isSpinning || !activeBox) return;
    const winner = drawReward(currentRewards);
    if (!showAnimation) { setWonItem(winner); return; }
    setIsSpinning(true); setWonItem(null);
    const newStrip: Reward[] = [];
    for (let i = 0; i < 100; i++) newStrip.push(drawReward(currentRewards));
    const targetIndex = 85; newStrip[targetIndex] = winner;
    setStrip(newStrip);
    const startIdx = 10; setOffset(-(startIdx * 120) - 50);
    setTimeout(() => {
      const duration = 6000; let startTime: number | null = null;
      const animate = (time: number) => {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 4); 
        const currentIdx = Math.round(startIdx + (targetIndex - startIdx) * easeProgress);
        const currentOffset = -(currentIdx * 120) - 50;
        if (trackRef.current) trackRef.current.style.transform = `translate(${currentOffset}px, -50%)`;
        if (progress < 1) requestAnimationFrame(animate);
        else {
          setOffset(-(targetIndex * 120) - 50);
          if (trackRef.current) trackRef.current.style.transform = `translate(${-(targetIndex * 120) - 50}px, -50%)`;
          setIsSpinning(false); setWonItem(winner); triggerFancyConfetti();
        }
      };
      requestAnimationFrame(animate);
    }, 50);
  };

  const handleMassTest = () => {
    const results: Record<string, number> = {};
    currentRewards.forEach(r => results[r.id] = 0);
    for (let i = 0; i < 10000; i++) results[drawReward(currentRewards).id]++;
    setTestResults(results); setTestCount(10000);
  };

  const handleSnipe = () => {
    if (!snipeTargetId) return;
    setIsSniping(true); setSnipeResult(null);
    setTimeout(() => {
      let attempts = 0, pulled: Reward;
      do { attempts++; pulled = drawReward(currentRewards); if (attempts > 50000) break; } while (pulled.id !== snipeTargetId);
      setSnipeResult({ attempts, target: pulled }); setIsSniping(false); triggerFancyConfetti();
    }, 100);
  };

  return (
    <div className="w-full relative transition-colors duration-300">
      <div className="w-full space-y-5 md:space-y-6">
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap lg:flex-nowrap w-full gap-2 md:gap-3 px-1">
          {ENCHANT_BOXES.map((box) => (
            <button
              key={box.id}
              disabled={!box.active}
              onClick={() => { if (isSpinning || isSniping) return; setActiveBox(box); }}
              className={`flex-1 flex flex-col items-center p-2 md:p-3 rounded-xl border transition-all ${
                !box.active ? 'opacity-30 grayscale border-gray-200 dark:border-white/5 cursor-not-allowed' :
                activeBox?.id === box.id ? 'bg-fuchsia-50 dark:bg-fuchsia-500/10 border-fuchsia-400 dark:border-fuchsia-500 shadow-sm dark:shadow-lg' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/30'
              }`}
            >
              <div className="relative w-10 h-10 md:w-12 md:h-12 mb-1.5">
                <Image src={box.image} alt={box.name} fill unoptimized priority className="object-contain" />
              </div>
              <span className={`text-[9px] md:text-[11px] font-bold text-center break-keep leading-tight ${activeBox?.id === box.id ? 'text-fuchsia-700 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{box.name}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-gray-200 dark:border-white/10 pb-4 transition-colors">
          <div className="flex flex-wrap justify-center gap-2 w-full md:w-auto">
            {['normal', 'test', 'snipe'].map((m) => (
              <button 
                key={m}
                onClick={() => setMode(m as any)} 
                className={`px-3 md:px-4 py-2 text-[11px] md:text-sm font-bold rounded-lg transition-all ${
                  mode === m ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20' : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                {m === 'normal' ? '일반 개봉' : m === 'test' ? '1만번 검증' : '아이템 저격'}
              </button>
            ))}
          </div>
          
            <div className="flex items-center justify-between w-full md:w-auto gap-4">
            {mode === 'normal' && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="anim" checked={showAnimation} onChange={(e) => setShowAnimation(e.target.checked)} className="accent-fuchsia-500 w-4 h-4 cursor-pointer" />
                <label htmlFor="anim" className="text-xs md:text-sm font-bold text-gray-600 dark:text-gray-400 cursor-pointer select-none hover:text-gray-900 dark:hover:text-white transition-colors">룰렛 켜기</label>
              </div>
            )}
          </div>
        </div>

        {mode === 'normal' && (
          <div className="w-full space-y-6 md:space-y-8 animate-fade-in">
            <div ref={containerRef} className="bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl relative overflow-hidden h-52 md:h-64 flex flex-col justify-center shadow-inner w-full transition-colors">
              <canvas ref={confettiCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-40" />

              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-[20px] z-0 opacity-20 md:opacity-100">
                {Array.from({ length: 21 }).map((_, i) => (
                  <div key={i} className={`w-[90px] md:w-[100px] h-[82px] md:h-[92px] rounded-xl flex-shrink-0 border transition-colors ${i === 10 ? 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-500/50' : 'bg-white dark:bg-gray-900/50 border-gray-200 dark:border-white/5'}`}></div>
                ))}
              </div>

              <div ref={trackRef} className="absolute top-1/2 flex gap-[20px] z-10" style={{ left: '50%', transform: `translate(${offset}px, -50%)`, transition: 'none' }}>
                {strip.map((item, i) => (
                  <div key={i} className="group relative hover:z-50 w-[90px] md:w-[100px] h-[82px] md:h-[92px] flex-shrink-0 flex flex-col items-center justify-center cursor-default">
                    <div className="relative w-10 h-10 md:w-12 md:h-12">
                      <Image src={item.image} alt={item.name} fill unoptimized priority className="object-contain" style={{ imageRendering: 'pixelated' }} />
                      {item.grade === 'mythic' && <div className="absolute inset-0 bg-yellow-400/30 dark:bg-yellow-500/30 blur-lg rounded-full z-0"></div>}
                      {item.grade === 'legendary' && <div className="absolute inset-0 bg-fuchsia-400/30 dark:bg-fuchsia-500/30 blur-lg rounded-full z-0"></div>}
                    </div>
                    <span className="text-[9px] md:text-[10px] mt-1 md:mt-2 text-center text-gray-700 dark:text-gray-300 font-bold line-clamp-1 transition-colors">{item.name}</span>
                    <div className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 hidden group-hover:block bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-[200] shadow-lg pointer-events-none">
                      {item.name}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800 dark:border-b-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[106px] md:w-[116px] h-[98px] md:h-[108px] border-4 border-red-500 rounded-2xl z-20 shadow-sm dark:shadow-lg pointer-events-none transition-colors"></div>

              {!isSpinning && wonItem && (
                <div className="absolute inset-0 bg-white/90 dark:bg-black/90 z-30 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in p-4 text-center transition-colors">
                  <span className="text-fuchsia-600 dark:text-fuchsia-400 text-xs md:text-sm font-bold mb-2 tracking-widest transition-colors">획득 성공!</span>
                  <div className="relative w-20 h-20 md:w-24 md:h-24">
                    <Image src={wonItem.image} alt={wonItem.name} fill unoptimized className="object-contain drop-shadow-md dark:drop-shadow-2xl" />
                  </div>
                  <h3 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white mt-3 break-keep transition-colors">
                    {wonItem.id === 'piece' ? '인챈트북 조각!' : wonItem.name} {wonItem.amount > 1 ? `(x${wonItem.amount})` : ''}
                  </h3>
                </div>
              )}
            </div>
            <div className="flex justify-center"><button onClick={handleOpen} disabled={isSpinning || !activeBox} className="w-full md:w-auto bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black text-base md:text-lg px-16 md:px-20 py-3 md:py-4 rounded-xl shadow-md dark:shadow-lg transform active:scale-95 transition-all">{isSpinning ? '개봉 중...' : '1회 개봉하기'}</button></div>
          </div>
        )}

        {mode === 'test' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-200 dark:border-white/10 gap-3 transition-colors">
              <div className="text-center sm:text-left"><h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white transition-colors">대규모 시뮬레이션</h3><p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-500 mt-1 transition-colors">1만번 시행을 통해 실제 확률을 검증합니다.</p></div>
              <button onClick={handleMassTest} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 text-sm rounded-xl shadow-sm dark:shadow-lg transition-all">즉시 1만번 실행</button>
            </div>
            {testCount > 0 && (
              <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl overflow-x-auto shadow-sm dark:shadow-none transition-colors pb-6">
                <table className="w-full text-[11px] md:text-xs text-left whitespace-nowrap">
                  <thead className="text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-white/5 uppercase transition-colors"><tr><th className="px-3 md:px-4 py-2.5">보상</th><th className="px-3 md:px-4 py-2.5">공식</th><th className="px-3 md:px-4 py-2.5">실제</th><th className="px-3 md:px-4 py-2.5">횟수</th></tr></thead>
                  <tbody>
                    {currentRewards.map(reward => {
                      const count = testResults[reward.id] || 0; const actual = (count / 10000) * 100;
                      return (
                        <tr key={reward.id} className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-3 md:px-4 py-2 md:py-3 font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
                            <div className="group relative hover:z-50 inline-flex items-center gap-2 cursor-default">
                              <div className="relative w-5 h-5 md:w-6 md:h-6"><Image src={reward.image} alt="R" fill unoptimized style={{ imageRendering: 'pixelated' }} /></div>
                              <span className="truncate max-w-[120px]">{reward.name}</span>
                              <div className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 hidden group-hover:block bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-[200] shadow-lg pointer-events-none">
                                {reward.name}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800 dark:border-b-gray-200"></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-gray-500 dark:text-gray-400 transition-colors">{reward.prob.toFixed(4)}%</td>
                          <td className={`px-3 md:px-4 py-2 md:py-3 font-black transition-colors ${Math.abs(reward.prob - actual) < 1.0 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{actual.toFixed(4)}%</td>
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
              <h3 className="text-base md:text-lg font-black text-rose-600 dark:text-rose-400 mb-3 transition-colors">아이템 저격 모드</h3>
              <div className="flex flex-col gap-3">
                <select value={snipeTargetId} onChange={(e) => setSnipeTargetId(e.target.value)} className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white text-xs md:text-sm rounded-xl px-3 py-2.5 outline-none focus:border-rose-400 dark:focus:border-rose-500 transition-colors">
                  <option value="">저격할 목표 아이템을 선택하세요</option>
                  {currentRewards.map(r => (<option key={r.id} value={r.id}>{r.name} - 확률 {r.prob}%</option>))}
                </select>
                <button onClick={handleSnipe} disabled={!snipeTargetId || isSniping} className="w-full bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold py-3 rounded-xl shadow-sm dark:shadow-lg transition-all">{isSniping ? '찾는 중...' : '나올 때까지 개봉'}</button>
              </div>
              {snipeResult && (
                <div className="mt-6 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl p-5 flex flex-col items-center animate-fade-in-up transition-colors">
                  <span className="text-rose-600 dark:text-rose-400 text-[10px] md:text-xs font-bold tracking-widest mb-3 transition-colors">TARGET OBTAINED</span>
                  <div className="relative w-16 h-16 md:w-20 md:h-20 mb-3"><Image src={snipeResult.target.image} alt="T" fill unoptimized className="drop-shadow-sm dark:drop-shadow-none" /></div>
                  <div className="text-base md:text-lg font-black text-gray-900 dark:text-white text-center break-keep transition-colors">
                    <span className="text-indigo-600 dark:text-indigo-400 transition-colors">[{snipeResult.target.name}]</span> 획득을 위해 <br className="md:hidden" />
                    <span className="text-rose-600 dark:text-rose-400 px-1 transition-colors">{snipeResult.attempts.toLocaleString()}</span>회 개봉했습니다.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2rem] p-5 max-w-5xl mx-auto mt-6">
        <div className="flex justify-between items-center mb-5 shrink-0">
          <h3 className="text-base font-black text-fuchsia-600 dark:text-fuchsia-400 transition-colors">{activeBox?.name} 확률표</h3>
        </div>
        <div className="grid grid-cols-2 gap-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1.5 pb-6">
          {currentRewards.map((item, idx) => (
            <div key={idx} className="group relative hover:z-50 flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-default">
              <div className="relative w-5 h-5 shrink-0"><Image src={item.image} alt="I" fill unoptimized className="drop-shadow-sm dark:drop-shadow-none" /></div>
              <span className="text-gray-700 dark:text-gray-200 flex-1 font-bold text-[10px] truncate transition-colors">{item.name}</span>
              <span className="text-white font-black bg-fuchsia-100 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-300 px-1 py-0.5 rounded text-[9px] transition-colors">{item.prob.toFixed(4)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}