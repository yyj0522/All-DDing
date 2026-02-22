'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Profession } from '@/lib/skillData';

const TABS = [
  { id: '재배', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/50' },
  { id: '채광', color: 'text-stone-400', bg: 'bg-stone-500/10', border: 'border-stone-500/50' },
  { id: '해양', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/50' },
  { id: '사냥', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/50' }
] as const;

export default function ProfessionPage() {
  const [activeTab, setActiveTab] = useState<Profession>('재배');

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-amber-500/30 relative flex flex-col">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <Header />

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 pt-32 md:pt-40 pb-20 flex flex-col items-center">
        <div className="mb-10 text-center w-full">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">전문가별 편의성 기능</h1>
          <p className="text-gray-400 text-sm md:text-base tracking-wide mx-auto whitespace-normal w-full max-w-2xl px-4">
            각 직업별 수익률 계산, 경험치 효율, 수급량 예측 등 최적화된 편의 기능을 제공합니다.
          </p>
        </div>

        <div className="flex justify-center gap-2 md:gap-4 mb-10 overflow-x-auto pb-2 custom-scrollbar w-full max-w-2xl">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Profession)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? `${tab.bg} ${tab.color} border ${tab.border} shadow-[0_0_15px_rgba(251,191,36,0.1)]` 
                : 'bg-[#0a0a0a] border border-white/5 text-gray-500 hover:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              {tab.id} 전문가
            </button>
          ))}
        </div>

        <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 min-h-[400px] flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
           <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           
           <div className="relative z-10 w-20 h-20 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-6 text-gray-600">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
           </div>
           <h2 className="relative z-10 text-2xl font-bold text-white mb-2">{activeTab} 도구 준비 중</h2>
           <p className="relative z-10 text-gray-500 text-sm max-w-md leading-relaxed">
             {activeTab} 전문가를 위한 최적화 도구를 개발 중입니다. <br/>
             계산기 및 편의 기능이 곧 업데이트됩니다.
           </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}