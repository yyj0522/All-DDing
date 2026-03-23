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

const GACHA_CATEGORIES = [
  '인챈트 캡슐', 
  '항해 보상',
  '세이지 도구 강화', 
  '아일랜드 보물상자', 
  '랜덤 뱃지 보급품', 
  '랜덤 공룡펫 보급품', 
  '한글 닉네임 변경 캡슐', 
  '대두 치장 캡슐'
];

export default function GachaPage() {
  const [activeCategory, setActiveCategory] = useState(GACHA_CATEGORIES[0]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-200 dark:selection:bg-blue-500/30 relative flex flex-col overflow-x-hidden transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-full h-[50%] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none transition-colors duration-300"></div>

      <Header />

      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-4 pt-28 md:pt-40 pb-20 flex flex-col">
        <div className="mb-8 md:mb-12 text-center md:text-left border-b border-gray-200 dark:border-white/5 pb-6 md:pb-8 px-2 transition-colors">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3 md:mb-4 transition-colors">
            확률형 아이템 <span className="text-blue-600 dark:text-blue-500">시뮬레이터</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-base tracking-wide max-w-2xl break-keep transition-colors">
            게임 내 확률형 콘텐츠를 미리 시도해보세요. 실제 확률 데이터를 기반으로 기댓값과 수익률을 분석할 수 있습니다.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 md:gap-8">
          <div className="w-full xl:w-72 flex-shrink-0">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.2em] uppercase mb-4 pl-2 hidden xl:block transition-colors">
              SELECT CONTENT
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:flex xl:flex-col gap-2 px-1">
              {GACHA_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-3 md:px-5 md:py-3.5 rounded-xl font-bold transition-all text-center xl:text-left border-2 flex items-center justify-center xl:justify-start ${
                    activeCategory === cat 
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/50 shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                    : 'bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-500 hover:border-gray-300 dark:hover:border-white/20 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="text-[11px] md:text-sm leading-tight break-keep">
                    {cat}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-10 shadow-sm dark:shadow-2xl relative overflow-hidden flex flex-col min-h-[500px] md:min-h-[700px] transition-colors">
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03] pointer-events-none transition-opacity" 
              style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
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
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}