'use client';

import { useState, useRef, useEffect } from 'react';
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

export default function EnchantSimulator() {
  const [activeBox, setActiveBox] = useState(ENCHANT_BOXES.find(b => b.active));
  const [showAnimation, setShowAnimation] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [mode, setMode] = useState<'normal' | 'test' | 'snipe'>('normal');
  const [showProbModal, setShowProbModal] = useState(false);
  const [strip, setStrip] = useState<Reward[]>([]);
  const [offset, setOffset] = useState(0);
  const [wonItem, setWonItem] = useState<Reward | null>(null);
  
  const [snipeTargetId, setSnipeTargetId] = useState<string>('');
  const [snipeResult, setSnipeResult] = useState<{ attempts: number, target: Reward } | null>(null);
  const [isSniping, setIsSniping] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [testResults, setTestResults] = useState<Record<string, number>>({});
  const [testCount, setTestCount] = useState(0);

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
    let originX = 0.5, originY = 0.5;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      originX = (rect.left + rect.width / 2) / window.innerWidth;
      originY = (rect.top + rect.height / 2) / window.innerHeight;
    }
    const count = 200;
    const defaults = { origin: { x: originX, y: originY }, colors: ['#ffffff', '#f8fafc', '#7dd3fc', '#3b82f6', '#1e3a8a'], ticks: 200, zIndex: 200 };
    const fire = (ratio: number, opts: any) => confetti(Object.assign({}, defaults, opts, { particleCount: Math.floor(count * ratio) }));
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
    <div className="w-full space-y-6 md:space-y-8 relative">
      {/* 캡슐 선택 영역: 모바일 2열 격자 / 데스크톱 가로 배열 */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap lg:flex-nowrap gap-3 md:gap-4 px-1">
        {ENCHANT_BOXES.map((box) => (
          <button
            key={box.id}
            disabled={!box.active}
            onClick={() => { if (isSpinning || isSniping) return; setActiveBox(box); }}
            className={`flex flex-col items-center p-3 md:p-4 rounded-2xl border transition-all ${
              !box.active ? 'opacity-30 grayscale border-white/5 cursor-not-allowed' :
              activeBox?.id === box.id ? 'bg-fuchsia-500/10 border-fuchsia-500 shadow-lg' : 'bg-white/5 border-white/10 hover:border-white/30'
            }`}
          >
            <div className="relative w-12 h-12 md:w-16 md:h-16 mb-2">
              <Image src={box.image} alt={box.name} fill unoptimized priority className="object-contain" />
            </div>
            <span className="text-[10px] md:text-xs font-bold text-center break-keep leading-tight">{box.name}</span>
          </button>
        ))}
      </div>

      {/* 메뉴 바: 모바일 상하 배치 / 데스크톱 좌우 배치 */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-white/10 pb-4">
        <div className="flex flex-wrap justify-center gap-2 w-full md:w-auto">
          {['normal', 'test', 'snipe'].map((m) => (
            <button 
              key={m}
              onClick={() => setMode(m as any)} 
              className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${
                mode === m ? 'bg-white/10 text-white border border-white/20' : 'text-gray-500 hover:text-gray-300'
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
              <label htmlFor="anim" className="text-xs md:text-sm font-bold text-gray-400 cursor-pointer select-none">룰렛 켜기</label>
            </div>
          )}
          <button onClick={() => setShowProbModal(true)} className="flex-1 md:flex-none px-4 py-2 bg-fuchsia-500/10 text-fuchsia-400 text-xs md:text-sm font-bold border border-fuchsia-500/30 rounded-lg">확률표</button>
        </div>
      </div>

      {/* 룰렛 영역 */}
      {mode === 'normal' && (
        <div className="w-full space-y-8 animate-fade-in">
          <div ref={containerRef} className="bg-[#0a0a0a] border border-white/10 rounded-2xl relative overflow-hidden h-60 md:h-72 flex flex-col justify-center shadow-inner w-full">
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-[20px] z-0 opacity-20 md:opacity-100">
              {Array.from({ length: 21 }).map((_, i) => (
                <div key={i} className={`w-[100px] h-[92px] rounded-xl flex-shrink-0 border ${i === 10 ? 'bg-red-900/20 border-red-500/50' : 'bg-gray-900/50 border-white/5'}`}></div>
              ))}
            </div>

            <div ref={trackRef} className="absolute top-1/2 flex gap-[20px] z-10" style={{ left: '50%', transform: `translate(${offset}px, -50%)`, transition: 'none' }}>
              {strip.map((item, i) => (
                <div key={i} className="w-[100px] h-[92px] flex-shrink-0 flex flex-col items-center justify-center">
                  <div className="relative w-12 h-12">
                    <Image src={item.image} alt={item.name} fill unoptimized priority className="object-contain" style={{ imageRendering: 'pixelated' }} />
                    {item.grade === 'mythic' && <div className="absolute inset-0 bg-yellow-500/30 blur-lg rounded-full z-0"></div>}
                    {item.grade === 'legendary' && <div className="absolute inset-0 bg-fuchsia-500/30 blur-lg rounded-full z-0"></div>}
                  </div>
                  <span className="text-[9px] md:text-[10px] mt-2 text-center text-gray-300 font-bold line-clamp-1">{item.name}</span>
                </div>
              ))}
            </div>

            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[116px] h-[108px] border-4 border-red-500 rounded-2xl z-20 shadow-lg pointer-events-none"></div>

            {!isSpinning && wonItem && (
              <div className="absolute inset-0 bg-black/90 z-30 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in p-4 text-center">
                <span className="text-fuchsia-400 text-xs md:text-sm font-bold mb-2 tracking-widest">획득 성공!</span>
                <div className="relative w-24 h-24 md:w-28 md:h-28">
                  <Image src={wonItem.image} alt={wonItem.name} fill unoptimized className="object-contain drop-shadow-2xl" />
                </div>
                <h3 className="text-xl md:text-3xl font-black text-white mt-4 break-keep">
                  {wonItem.id === 'piece' ? '인챈트북 조각!' : wonItem.name} {wonItem.amount > 1 ? `(x${wonItem.amount})` : ''}
                </h3>
              </div>
            )}
          </div>
          <div className="flex justify-center"><button onClick={handleOpen} disabled={isSpinning || !activeBox} className="w-full md:w-auto bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black text-lg md:text-xl px-20 py-4 md:py-5 rounded-xl shadow-lg transform active:scale-95 transition-all">{isSpinning ? '개봉 중...' : '1회 개봉하기'}</button></div>
        </div>
      )}

      {/* 검증 및 저격 모드는 기존 로직을 유지하되 테이블만 가로 스크롤 허용 */}
      {mode === 'test' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10 gap-4">
            <div className="text-center sm:text-left"><h3 className="text-lg md:text-xl font-black text-white">대규모 시뮬레이션</h3><p className="text-xs text-gray-500 mt-1">1만번 시행을 통해 실제 확률을 검증합니다.</p></div>
            <button onClick={handleMassTest} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all">즉시 1만번 실행</button>
          </div>
          {testCount > 0 && (
            <div className="bg-black/40 border border-white/10 rounded-2xl overflow-x-auto">
              <table className="w-full text-xs md:text-sm text-left whitespace-nowrap">
                <thead className="text-gray-500 bg-white/5 uppercase"><tr><th className="px-4 py-3">보상</th><th className="px-4 py-3">공식</th><th className="px-4 py-3">실제</th><th className="px-4 py-3">횟수</th></tr></thead>
                <tbody>
                  {currentRewards.map(reward => {
                    const count = testResults[reward.id] || 0; const actual = (count / 10000) * 100;
                    return (
                      <tr key={reward.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 font-bold text-white flex items-center gap-2">
                          <div className="relative w-6 h-6"><Image src={reward.image} alt="R" fill unoptimized style={{ imageRendering: 'pixelated' }} /></div>
                          {reward.name}
                        </td>
                        <td className="px-4 py-4 text-gray-400">{reward.prob.toFixed(4)}%</td>
                        <td className={`px-4 py-4 font-black ${Math.abs(reward.prob - actual) < 1.0 ? 'text-green-400' : 'text-yellow-400'}`}>{actual.toFixed(4)}%</td>
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
          <div className="bg-[#0a0a0a] border border-rose-500/20 rounded-2xl p-6 md:p-8 shadow-xl">
            <h3 className="text-lg md:text-xl font-black text-rose-400 mb-4">아이템 저격 모드</h3>
            <div className="flex flex-col gap-4">
              <select value={snipeTargetId} onChange={(e) => setSnipeTargetId(e.target.value)} className="w-full bg-black border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-rose-500">
                <option value="">저격할 목표 아이템을 선택하세요</option>
                {currentRewards.map(r => (<option key={r.id} value={r.id}>{r.name} - 확률 {r.prob}%</option>))}
              </select>
              <button onClick={handleSnipe} disabled={!snipeTargetId || isSniping} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all">{isSniping ? '찾는 중...' : '나올 때까지 개봉'}</button>
            </div>
            {snipeResult && (
              <div className="mt-8 bg-black/50 border border-white/10 rounded-xl p-6 flex flex-col items-center animate-fade-in-up">
                <span className="text-rose-400 text-xs font-bold tracking-widest mb-4">TARGET OBTAINED</span>
                <div className="relative w-20 h-20 mb-4"><Image src={snipeResult.target.image} alt="T" fill unoptimized /></div>
                <div className="text-xl font-black text-white text-center break-keep">
                  <span className="text-indigo-400">[{snipeResult.target.name}]</span> 획득을 위해 <br className="md:hidden" />
                  <span className="text-rose-400 px-1">{snipeResult.attempts.toLocaleString()}</span>회 개봉했습니다.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 확률표 모달 (모달 너비 조정) */}
      {showProbModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowProbModal(false)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-black text-fuchsia-400">{activeBox?.name}</h3><button onClick={() => setShowProbModal(false)} className="text-gray-400 hover:text-white">✕</button></div>
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {currentRewards.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg text-[11px] md:text-sm">
                  <div className="relative w-8 h-8 shrink-0"><Image src={item.image} alt="I" fill unoptimized /></div>
                  <span className="text-gray-200 flex-1 font-medium">{item.name}</span>
                  <span className="text-white font-bold bg-fuchsia-500/20 text-fuchsia-300 px-2 py-1 rounded">{item.prob.toFixed(4)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}