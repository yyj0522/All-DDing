'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import EnchantSimulator from '@/components/gacha/EnchantSimulator';
import SailingSimulator from '@/components/gacha/SailingSimulator';
import SageSimulator from '@/components/gacha/SageSimulator';
import NicknameCapsuleSimulator from '@/components/gacha/NicknameCapsuleSimulator';
import BigHeadCapsuleSimulator from '@/components/gacha/BigHeadCapsuleSimulator';
import RandomBadgeSimulator from '@/components/gacha/RandomBadgeSimulator';
import DinoPetSimulator from '@/components/gacha/DinoPetSimulator';
import IslandBoxSimulator from '@/components/gacha/IslandBoxSimulator';
import EngravingSimulator from '@/components/gacha/EngravingSimulator';

const GACHA_CATEGORIES = [
  '인챈트 캡슐', 
  '항해 보상',
  '세이지 도구 강화', 
  '아일랜드 보물상자', 
  '랜덤 뱃지 보급품', 
  '랜덤 공룡펫 보급품', 
  '한글 닉네임 변경 캡슐', 
  '대두 치장 캡슐',
  '각인석'
];

export default function GachaPage() {
  const [activeCategory, setActiveCategory] = useState(GACHA_CATEGORIES[0]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-200 dark:selection:bg-blue-500/30 relative flex flex-col overflow-x-hidden transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[150px] pointer-events-none transition-colors duration-300"></div>

      <Header />

      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-4 pt-28 md:pt-40 pb-24 md:pb-20 flex flex-col items-center">
        <div className="mb-8 text-center w-full px-2 transition-colors">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3 transition-colors">
            확률형 아이템 <span className="text-blue-600 dark:text-blue-500 transition-colors">시뮬레이터</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-base tracking-wide max-w-xl mx-auto break-keep opacity-80 transition-colors">
            게임 내 확률형 콘텐츠를 미리 시도해보세요. 실제 확률 데이터를 기반으로 기댓값과 수익률을 분석할 수 있습니다.
          </p>
        </div>

        <div className="w-full max-w-4xl mx-auto flex items-center justify-center mb-8 relative">
          <div className="w-full flex flex-wrap justify-center gap-2 md:gap-2.5 px-1">
            {GACHA_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full text-[11px] md:text-xs font-bold transition-all border whitespace-nowrap shadow-sm ${
                  activeCategory === cat 
                  ? 'bg-blue-600 text-white border-transparent shadow-blue-500/30 scale-105' 
                  : 'bg-white dark:bg-[#111113] border-gray-300 dark:border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-5xl flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-5 md:p-10 shadow-md dark:shadow-2xl relative overflow-hidden flex flex-col min-h-[500px] md:min-h-[700px] transition-colors">
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none transition-opacity" 
            style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
          </div>
          
          <div className="relative z-10 w-full h-full flex flex-col">
            {activeCategory === '인챈트 캡슐' && <EnchantSimulator />}
            {activeCategory === '항해 보상' && <SailingSimulator />}
            {activeCategory === '세이지 도구 강화' && <SageSimulator />}
            {activeCategory === '아일랜드 보물상자' && <IslandBoxSimulator />}
            {activeCategory === '랜덤 뱃지 보급품' && <RandomBadgeSimulator />}
            {activeCategory === '랜덤 공룡펫 보급품' && <DinoPetSimulator />}
            {activeCategory === '한글 닉네임 변경 캡슐' && <NicknameCapsuleSimulator />}
            {activeCategory === '대두 치장 캡슐' && <BigHeadCapsuleSimulator />}
            {activeCategory === '각인석' && <EngravingSimulator />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}