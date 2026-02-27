'use client';

import { useState } from 'react';
import { ISLANDS, Island, SailingReward, drawSailingReward } from '@/lib/sailingData';

interface SpawnedIsland {
  uniqueId: string;
  island: Island;
  x: number;
  y: number;
  state: 'ready' | 'sailing';
}

export default function SailingSimulator() {
  const [activeIslands, setActiveIslands] = useState<SpawnedIsland[]>([]);
  const [history, setHistory] = useState<{ islandName: string, reward: SailingReward }[]>([]);
  const [wonItem, setWonItem] = useState<{ islandName: string, reward: SailingReward } | null>(null);
  const [mode, setMode] = useState<'sandbox' | 'test'>('sandbox');
  const [testIsland, setTestIsland] = useState<Island>(ISLANDS[0]);
  const [testResults, setTestResults] = useState<Record<string, number>>({});
  const [testCount, setTestCount] = useState(0);

  const spawnIsland = (island: Island) => {
    if (activeIslands.length >= 5) {
      alert("바다에 띄울 수 있는 섬은 최대 5개입니다.");
      return;
    }

    let newX = 0;
    let newY = 0;
    let isValidPosition = false;
    let attempts = 0;

    while (!isValidPosition && attempts < 100) {
      newX = Math.floor(Math.random() * 70) + 15; 
      newY = Math.floor(Math.random() * 60) + 20; 
      isValidPosition = true;

      for (const existing of activeIslands) {
        const dx = existing.x - newX;
        const dy = existing.y - newY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 20) {
          isValidPosition = false;
          break;
        }
      }
      attempts++;
    }

    if (!isValidPosition) {
      alert("섬을 배치할 공간이 부족합니다. 다른 섬의 보상을 먼저 수령해주세요.");
      return;
    }

    const newIsland: SpawnedIsland = {
      uniqueId: Math.random().toString(36).substr(2, 9),
      island,
      x: newX,
      y: newY,
      state: 'ready'
    };
    setActiveIslands([...activeIslands, newIsland]);
  };

  const handleIslandClick = (uniqueId: string) => {
    const targetIndex = activeIslands.findIndex(i => i.uniqueId === uniqueId);
    if (targetIndex === -1) return;

    const target = activeIslands[targetIndex];

    if (target.state === 'ready') {
      const updated = [...activeIslands];
      updated[targetIndex] = { ...target, state: 'sailing' };
      setActiveIslands(updated);
    } else if (target.state === 'sailing') {
      const reward = drawSailingReward(target.island.rewards);
      setWonItem({ islandName: target.island.name, reward });
      setHistory(prev => [{ islandName: target.island.name, reward }, ...prev].slice(0, 10));
      
      setActiveIslands(activeIslands.filter(i => i.uniqueId !== uniqueId));
    }
  };

  const clearSea = () => {
    if (confirm("바다 위에 있는 모든 섬을 제거하시겠습니까?")) {
      setActiveIslands([]);
    }
  };

  const handleMassTest = () => {
    const results: Record<string, number> = {};
    testIsland.rewards.forEach(r => results[r.name] = 0);

    for (let i = 0; i < 10000; i++) {
      const reward = drawSailingReward(testIsland.rewards);
      results[reward.name]++;
    }

    setTestResults(results);
    setTestCount(10000);
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <div className="flex flex-wrap gap-4 items-center justify-between border-b border-white/10 pb-4">
        <div className="flex gap-2">
          <button onClick={() => setMode('sandbox')} className={`px-4 py-2 text-sm font-bold rounded-lg ${mode === 'sandbox' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-gray-400 hover:text-white'}`}>항해</button>
          <button onClick={() => setMode('test')} className={`px-4 py-2 text-sm font-bold rounded-lg ${mode === 'test' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-gray-400 hover:text-white'}`}>10,000번 확률 검증</button>
        </div>
      </div>

      {mode === 'sandbox' && (
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="w-full xl:w-[280px] shrink-0 flex flex-col gap-3">
            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl mb-2">
              <p className="text-xs text-blue-200 leading-relaxed font-medium break-keep">
                아래 목록에서 섬을 클릭하여 바다에 띄워보세요. (최대 5개)<br/><br/>
                바다 위의 섬을 클릭하면 <span className="text-white font-bold">항해 시작</span>,<br/>
                한 번 더 클릭하면 <span className="text-white font-bold">보상 수령</span>입니다.
              </p>
            </div>
            <div className="space-y-5">
              {['소형 섬', '중형 섬', '일반 대륙', '대형 대륙'].map(type => (
                <div key={type}>
                  <h4 className="text-[11px] font-black text-gray-500 mb-2 border-b border-white/5 pb-1">{type}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {ISLANDS.filter(i => i.type === type).map(island => (
                      <button
                        key={island.id}
                        onClick={() => spawnIsland(island)}
                        className="bg-black border border-white/10 hover:border-blue-500/50 rounded-lg p-2.5 flex flex-col items-center gap-1.5 transition-all group shadow-sm"
                      >
                        <img src={island.image} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" style={{ imageRendering: 'pixelated' }} />
                        <span className="text-[11px] text-gray-300 font-bold whitespace-nowrap">{island.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <div className="relative w-full rounded-2xl overflow-hidden border-2 border-[#b8860b] shadow-[0_0_30px_rgba(59,130,246,0.15)] bg-[#050505]">
              <img src="/sailing/sailing.png" alt="바다 UI" className="w-full h-auto block select-none" style={{ imageRendering: 'pixelated' }} />
              
              <button onClick={clearSea} className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white text-xs font-bold px-4 py-2 rounded border border-white/20 backdrop-blur-sm transition-colors z-20 shadow-lg">
                바다 비우기
              </button>

              {activeIslands.map(item => (
                <div 
                  key={item.uniqueId} 
                  className="absolute cursor-pointer flex flex-col items-center group transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105"
                  style={{ left: `${item.x}%`, top: `${item.y}%`, zIndex: item.state === 'sailing' ? 10 : 5 }}
                  onClick={() => handleIslandClick(item.uniqueId)}
                >
                  <div className="relative">
                    <img src={item.island.image} alt={item.island.name} className="w-16 md:w-20 lg:w-24 h-auto object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)]" style={{ imageRendering: 'pixelated' }} />
                    
                    {item.state === 'sailing' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center animate-bounce shadow-xl z-10">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 flex flex-col items-center">
                    <span className="bg-black/80 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded backdrop-blur-sm whitespace-nowrap border border-white/20 shadow-md">
                      {item.island.name}
                    </span>
                    <span className={`mt-1.5 text-[10px] md:text-xs font-black px-3 py-1 rounded shadow-lg whitespace-nowrap transition-colors ${item.state === 'ready' ? 'bg-amber-500 text-black group-hover:bg-amber-400' : 'bg-green-500 text-white group-hover:bg-green-400'}`}>
                      {item.state === 'ready' ? '항해 보내기' : '보상 받기'}
                    </span>
                  </div>
                </div>
              ))}

              {wonItem && (
                <div className="absolute inset-0 bg-black/85 z-30 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in" onClick={() => setWonItem(null)}>
                  <span className="text-blue-400 text-base font-bold mb-3 tracking-widest">[{wonItem.islandName}] 항해 보상</span>
                  {wonItem.reward.image !== '/unknown.png' && (
                    <img src={wonItem.reward.image} alt={wonItem.reward.name} className="w-16 h-16 object-contain mt-4 animate-bounce" style={{ imageRendering: 'pixelated' }} />
                  )}
                  <h3 className="text-4xl sm:text-5xl font-black text-white mt-4 text-center leading-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {wonItem.reward.name} <br/>
                    <span className="text-blue-400 text-3xl">x{wonItem.reward.amount}</span>
                  </h3>
                  <p className="text-gray-400 text-sm mt-8 font-bold">(화면을 클릭하여 닫기)</p>
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 w-full shadow-lg">
              <h3 className="text-xs font-bold text-gray-400 mb-4 tracking-widest uppercase flex items-center justify-between">
                <span>최근 수령한 보상 (최대 10개)</span>
                <span className="text-gray-600 font-mono">{history.length} / 10</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[...Array(10)].map((_, idx) => {
                  const h = history[idx];
                  return (
                    <div key={idx} className={`flex flex-col items-center justify-start gap-2 p-3 rounded-xl h-36 transition-all ${h ? 'bg-[#0a0a0a] border border-white/10 animate-fade-in-up' : 'bg-black/30 border border-white/5 border-dashed'}`}>
                      {h ? (
                        <>
                          <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 w-full text-center truncate shrink-0">{h.islandName}</span>
                          <div className="flex-1 flex flex-col items-center justify-center w-full">
                            {/* 이미지가 있을 경우 출력 */}
                            {h.reward.image !== '/unknown.png' && (
                              <img src={h.reward.image} alt={h.reward.name} className="w-6 h-6 object-contain mb-1.5" style={{ imageRendering: 'pixelated' }} />
                            )}
                            <span className="text-[11px] text-gray-200 text-center leading-tight font-medium break-keep line-clamp-2">
                              {h.reward.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-white font-black bg-white/10 px-2.5 py-0.5 rounded-full shadow-inner mt-auto shrink-0">x{h.reward.amount}</span>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-700 text-[10px] font-bold tracking-widest uppercase">Empty</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {mode === 'test' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#0a0a0a] border border-blue-500/20 rounded-2xl p-6 sm:p-8 shadow-[0_0_30px_rgba(59,130,246,0.05)]">
            <h3 className="text-xl font-black text-blue-400 mb-2">섬 개별 10,000번 대량 검증</h3>
            <p className="text-sm text-gray-400 mb-6">원하는 섬을 선택하고 대수의 법칙을 통해 실제 획득 확률을 확인해보세요.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <select 
                value={testIsland.id} 
                onChange={(e) => setTestIsland(ISLANDS.find(i => i.id === e.target.value) || ISLANDS[0])}
                className="flex-1 bg-black border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              >
                {ISLANDS.map(island => (
                  <option key={island.id} value={island.id}>[{island.type}] {island.name}</option>
                ))}
              </select>
              <button 
                onClick={handleMassTest}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all whitespace-nowrap"
              >
                즉시 1만번 돌리기
              </button>
            </div>

            {testCount > 0 && (
              <div className="bg-black/40 border border-white/10 rounded-xl overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-gray-500 uppercase bg-white/5">
                    <tr>
                      <th className="px-4 py-3">보상 아이템</th>
                      <th className="px-4 py-3">공식 확률</th>
                      <th className="px-4 py-3">시뮬레이션 실제 확률</th>
                      <th className="px-4 py-3">획득 횟수 (1만번 기준)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testIsland.rewards.map((reward, idx) => {
                      const count = testResults[reward.name] || 0;
                      const actualProb = (count / 10000) * 100;
                      const diff = Math.abs(reward.prob - actualProb);
                      const isAccurate = diff < 1.0; 

                      return (
                        <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4 font-bold text-white flex items-center gap-2">
                            {reward.image !== '/unknown.png' && (
                              <img src={reward.image} alt={reward.name} className="w-5 h-5 object-contain" style={{ imageRendering: 'pixelated' }} />
                            )}
                            {reward.name} <span className="text-blue-400 text-xs ml-1">x{reward.amount}</span>
                          </td>
                          <td className="px-4 py-4 text-gray-400">{reward.prob.toFixed(2)}%</td>
                          <td className={`px-4 py-4 font-black ${isAccurate ? 'text-green-400' : 'text-yellow-400'}`}>
                            {actualProb.toFixed(2)}%
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
        </div>
      )}
    </div>
  );
}