'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import EnchantSimulator from '@/components/gacha/EnchantSimulator';

const GACHA_CATEGORIES = [
  '인챈트 캡슐', 
  '인챈트북', 
  '세이지 도구 강화', 
  '아일랜드 보물상자', 
  '랜덤 뱃지 보급품', 
  '랜덤 공룡펫 보급품', 
  '한글 닉네임 변경 캡슐', 
  '대두 치장 캡슐', 
  '야생 겉날개 스킨 캡슐', 
  '항해 보상'
];

export default function GachaPage() {
  const [activeCategory, setActiveCategory] = useState(GACHA_CATEGORIES[0]);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-fuchsia-500/30 relative flex flex-col overflow-x-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <Header />

      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-4 pt-32 md:pt-40 pb-20 flex flex-col">
        <div className="mb-10 text-center md:text-left border-b border-white/5 pb-8">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">확률형 아이템 시뮬레이터</h1>
          <p className="text-gray-400 text-sm md:text-base tracking-wide">
            게임 내에 존재하는 모든 확률형 콘텐츠를 웹에서 미리 시도해보고 기댓값을 분석할 수 있습니다.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          <div className="w-full xl:w-64 flex-shrink-0">
            <h3 className="text-xs font-black text-gray-500 tracking-widest uppercase mb-4 pl-2 hidden xl:block">콘텐츠 선택</h3>
            <div className="flex xl:flex-col gap-2 overflow-x-auto xl:overflow-visible pb-4 xl:pb-0 custom-scrollbar">
              {GACHA_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-3.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap xl:whitespace-normal text-left ${
                    activeCategory === cat 
                    ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.15)]' 
                    : 'bg-[#0a0a0a] border border-white/5 text-gray-500 hover:bg-white/5 hover:text-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden flex flex-col min-h-[600px]">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            <div className="relative z-10 w-full h-full flex flex-col">
              {activeCategory === '인챈트 캡슐' ? (
                <EnchantSimulator />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <span className="inline-block px-3 py-1 rounded bg-fuchsia-500/20 text-fuchsia-400 font-black text-[10px] tracking-widest border border-fuchsia-500/30 uppercase">
                    Under Construction
                  </span>
                  <h2 className="text-3xl font-black text-white text-center">
                    <span className="text-fuchsia-400">[{activeCategory}]</span><br/>데이터 수집 중
                  </h2>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}