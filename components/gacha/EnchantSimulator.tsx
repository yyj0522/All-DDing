'use client';

import { useState, useRef, useEffect } from 'react';
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
    setWonItem(null);
    setStrip([]);
    setSnipeTargetId('');
    setSnipeResult(null);
  }, [activeBox]);

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
    if (isSpinning || !activeBox) return;

    const winner = drawReward(currentRewards);

    if (!showAnimation) {
      setWonItem(winner);
      return;
    }

    setIsSpinning(false);
    setWonItem(null);
    setOffset(0);

    const newStrip: Reward[] = [];
    for (let i = 0; i < 100; i++) {
      newStrip.push(drawReward(currentRewards));
    }
    const targetIndex = 85;
    newStrip[targetIndex] = winner;
    
    setStrip(newStrip);

    setTimeout(() => {
      const itemWidth = 120;
      const containerWidth = trackRef.current?.parentElement?.offsetWidth || 800;
      const centerOffset = containerWidth / 2 - 74; 
      const finalOffset = -(targetIndex * itemWidth) + centerOffset;
      
      setIsSpinning(true);
      setOffset(finalOffset);

      setTimeout(() => {
        setIsSpinning(false);
        setWonItem(winner);
        triggerFancyConfetti();
      }, 5500);
    }, 50);
  };

  const handleMassTest = () => {
    const results: Record<string, number> = {};
    currentRewards.forEach(r => results[r.id] = 0);

    for (let i = 0; i < 10000; i++) {
      const reward = drawReward(currentRewards);
      results[reward.id]++;
    }

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
        pulled = drawReward(currentRewards);
        if (attempts > 50000) break;
      } while (pulled.id !== snipeTargetId);

      setSnipeResult({ attempts, target: pulled });
      setIsSniping(false);
    }, 100);
  };

  return (
    <div className="w-full space-y-8 relative">
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {ENCHANT_BOXES.map((box) => (
          <button
            key={box.id}
            disabled={!box.active}
            onClick={() => {
              if (isSpinning || isSniping) return;
              setActiveBox(box);
            }}
            className={`flex flex-col items-center p-4 rounded-2xl border min-w-[120px] transition-all ${
              !box.active ? 'opacity-30 cursor-not-allowed grayscale border-white/5' :
              activeBox?.id === box.id ? 'bg-fuchsia-500/10 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <img src={box.image} alt={box.name} className="w-16 h-16 object-contain mb-3 drop-shadow-lg" />
            <span className="text-xs font-bold text-center break-keep">{box.name}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between border-b border-white/10 pb-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setMode('normal')} className={`px-4 py-2 text-sm font-bold rounded-lg ${mode === 'normal' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>일반 개봉</button>
          <button onClick={() => setMode('test')} className={`px-4 py-2 text-sm font-bold rounded-lg ${mode === 'test' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>10,000번 확률 검증</button>
          <button onClick={() => setMode('snipe')} className={`px-4 py-2 text-sm font-bold rounded-lg ${mode === 'snipe' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-gray-500'}`}>특정 아이템 저격</button>
        </div>
        
        <div className="flex items-center gap-4">
          {mode === 'normal' && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="anim" checked={showAnimation} onChange={(e) => setShowAnimation(e.target.checked)} className="accent-fuchsia-500 w-4 h-4" />
              <label htmlFor="anim" className="text-sm font-bold text-gray-300 cursor-pointer select-none hover:text-white transition-colors">룰렛 연출 켜기</label>
            </div>
          )}
          <button 
            onClick={() => setShowProbModal(true)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-fuchsia-400 text-sm font-bold border border-fuchsia-500/30 rounded-lg transition-colors"
          >
            확률표 보기
          </button>
        </div>
      </div>

      {mode === 'normal' && (
        <div className="w-full space-y-8 animate-fade-in">
          <div ref={containerRef} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 relative overflow-hidden h-72 flex flex-col justify-center shadow-inner w-full">
            
            {(isSpinning || (strip.length > 0 && !wonItem)) && (
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[116px] h-[116px] border-4 border-red-500 rounded-2xl z-20 shadow-[0_0_20px_rgba(239,68,68,0.5)] pointer-events-none"></div>
            )}
            
            {isSpinning || strip.length > 0 ? (
              <div 
                ref={trackRef}
                className="flex gap-[20px]"
                style={{ 
                  transform: `translateX(${offset}px)`, 
                  transition: isSpinning ? 'transform 5s cubic-bezier(0.1, 0, 0.1, 1)' : 'none'
                }}
              >
                {strip.map((item, i) => (
                  <div key={i} className={`w-[100px] flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-xl border ${item.grade === 'mythic' ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-gray-800/50 border-gray-600'}`}>
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-contain drop-shadow-md" />
                    <span className="text-[10px] mt-2 text-center text-gray-300 line-clamp-1">{item.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-base font-bold">아래 개봉 버튼을 눌러 시뮬레이션을 시작하세요.</div>
            )}

            {!isSpinning && wonItem && (
              <div className="absolute inset-0 bg-black/85 z-30 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in">
                <span className="text-fuchsia-400 text-base font-bold mb-3 tracking-widest">획득!</span>
                <img src={wonItem.image} alt={wonItem.name} className="w-28 h-28 object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] animate-bounce" />
                <h3 className="text-3xl font-black text-white mt-6">
                  {wonItem.id === 'piece' ? '인챈트북 조각!' : `${wonItem.name} ${wonItem.name.includes('인챈트북') ? '' : '인챈트북!'}`} 
                  {wonItem.amount > 1 ? ` (x${wonItem.amount})` : ''}
                </h3>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button 
              onClick={handleOpen} 
              disabled={isSpinning || !activeBox}
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black text-xl px-20 py-5 rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {isSpinning ? '개봉 중...' : '1회 개봉하기'}
            </button>
          </div>
        </div>
      )}

      {mode === 'test' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10">
            <div>
              <h3 className="text-xl font-black text-white">10,000번 대규모 시뮬레이션</h3>
              <p className="text-sm text-gray-400 mt-1">서버의 공식 확률 데이터가 실제로 어떻게 적용되는지 대수의 법칙으로 검증합니다.</p>
            </div>
            <button onClick={handleMassTest} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">
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
                  {currentRewards.map(reward => {
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
                className="flex-1 bg-black border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500"
              >
                <option value="">저격할 목표 아이템을 선택하세요</option>
                {currentRewards.map(r => (
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
                  <img src={snipeResult.target.image} alt={snipeResult.target.name} className="w-24 h-24 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] animate-bounce" />
                  <div className="mt-6 text-2xl font-black text-white">
                    <span className="text-indigo-400 text-3xl">[{snipeResult.target.name}]</span> 획득 성공!
                  </div>
                  <div className="mt-3 text-gray-300 font-medium">
                    해당 아이템을 뽑기 위해 캡슐을 총 <span className="text-rose-400 font-black text-xl px-1">{snipeResult.attempts.toLocaleString()}</span>번 개봉했습니다.
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
              <h3 className="text-lg font-black text-fuchsia-400">
                {activeBox?.name || '확률표'}
              </h3>
              <button onClick={() => setShowProbModal(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {currentRewards.length > 0 ? (
                currentRewards.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg text-sm">
                    <img src={item.image} className="w-8 h-8 object-contain" />
                    <span className="text-gray-200 flex-1 font-medium">{item.name} {item.amount > 1 ? `x${item.amount}` : ''}</span>
                    <span className="text-white font-bold bg-fuchsia-500/20 text-fuchsia-300 px-2 py-1 rounded">
                      {item.prob.toFixed(4)}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm text-center py-10">확률 데이터가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}