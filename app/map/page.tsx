'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function MapPage() {
  const [activeFilter, setActiveFilter] = useState<string>('전체');

  const filters = ['전체', '농장', '양식장', '서식지', '파란석상'];

  const markers = [
    { id: 1, type: '파란석상', name: '중앙 마을 광장 석상', x: '50%', y: '50%' },
    { id: 2, type: '농장', name: '북부 대농장', x: '30%', y: '20%' },
    { id: 3, type: '서식지', name: '서부 동물 서식지', x: '25%', y: '60%' },
    { id: 4, type: '양식장', name: '남부 해안 양식장', x: '60%', y: '80%' },
    { id: 5, type: '파란석상', name: '해안가 워프 석상', x: '65%', y: '75%' },
  ];

  const filteredMarkers = activeFilter === '전체' ? markers : markers.filter(m => m.type === activeFilter);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-emerald-500/30 flex flex-col relative">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <Header />

      <main className="relative z-10 flex-1 max-w-[1600px] w-full mx-auto px-4 pt-32 md:pt-40 pb-20 flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-80 flex flex-col gap-6 h-full">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl flex-shrink-0">
            <h1 className="text-2xl font-black tracking-tight text-white mb-2">위치 탐색기</h1>
            <p className="text-gray-500 text-xs mb-6 leading-relaxed">지도상에 표시할 주요 거점을 필터링하여 빠르게 찾아보세요.</p>
            
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
                    activeFilter === filter 
                      ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                      : 'bg-black border border-white/10 text-gray-400 hover:border-emerald-500/50 hover:text-emerald-400'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl min-h-[300px]">
            <div className="bg-white/5 px-6 py-4 border-b border-white/5 font-bold text-sm tracking-widest text-gray-400">
              탐색 결과 ({filteredMarkers.length})
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredMarkers.map((marker) => (
                <div key={marker.id} className="bg-black border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-emerald-500/30 transition-colors cursor-pointer group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors flex-shrink-0 ${
                    marker.type === '파란석상' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 group-hover:bg-blue-500/20' :
                    marker.type === '농장' ? 'bg-green-500/10 border-green-500/30 text-green-400 group-hover:bg-green-500/20' :
                    marker.type === '서식지' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 group-hover:bg-rose-500/20' :
                    'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/20'
                  }`}>
                    {marker.type === '파란석상' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    {marker.type === '농장' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                    {marker.type === '서식지' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                    {marker.type === '양식장' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0 1.172 1.953 1.172 5.119 0 7.072z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-emerald-500 mb-1">{marker.type}</div>
                    <div className="text-sm font-bold text-gray-200 truncate">{marker.name}</div>
                  </div>
                </div>
              ))}
              {filteredMarkers.length === 0 && (
                <div className="text-center py-10 text-gray-600 font-bold text-sm">해당하는 위치가 없습니다.</div>
              )}
            </div>
          </div>
        </aside>

        <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-3xl relative overflow-hidden shadow-2xl min-h-[500px] flex items-center justify-center">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
          <div className="absolute inset-0 flex items-center justify-center z-0">
             <div className="text-gray-800 font-black text-6xl opacity-30 tracking-[0.5em] uppercase">MAP AREA</div>
          </div>
          {filteredMarkers.map((marker) => (
            <div 
              key={marker.id} 
              className="absolute z-10 group cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: marker.x, top: marker.y }}
            >
              <div className="relative flex flex-col items-center">
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg pointer-events-none">
                  <div className="text-[10px] font-bold text-emerald-400 mb-0.5">{marker.type}</div>
                  <div className="text-xs font-bold text-white">{marker.name}</div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.8)] border-2 ${
                  marker.type === '파란석상' ? 'bg-blue-600 border-blue-300 text-white' :
                  marker.type === '농장' ? 'bg-green-600 border-green-300 text-white' :
                  marker.type === '서식지' ? 'bg-rose-600 border-rose-300 text-white' :
                  'bg-cyan-600 border-cyan-300 text-white'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                </div>
                <div className={`w-1 h-3 -mt-1 rounded-b-full ${
                  marker.type === '파란석상' ? 'bg-blue-600' :
                  marker.type === '농장' ? 'bg-green-600' :
                  marker.type === '서식지' ? 'bg-rose-600' :
                  'bg-cyan-600'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}