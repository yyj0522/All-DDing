'use client';

import Image from 'next/image';
import { Profession } from '@/lib/skillData';
import SkillTree from '@/components/SkillTree';

interface Props {
  profTab: Profession;
  setProfTab: (tab: Profession) => void;
  levels: Record<string, number>;
  handleLevelChange: (id: string, delta: number) => void;
  resetTree: () => void;
  saveAll: () => void;
  diffCost: { gold: number; stone: number; point: number };
  activeEffects: string[];
}

export default function SkillTreeTab({ profTab, setProfTab, levels, handleLevelChange, resetTree, saveAll, diffCost, activeEffects }: Props) {
  const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up w-full max-w-[1600px] mx-auto px-1 sm:px-0 transition-colors duration-300">
      <div className="w-full max-w-2xl mx-auto mb-2">
        <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-inner transition-colors">
          {(['재배', '채광', '해양', '사냥'] as Profession[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setProfTab(tab)}
              className={`py-2.5 sm:py-3 rounded-xl font-bold transition-all text-[11px] sm:text-sm ${
                profTab === tab 
                ? 'bg-amber-600 text-white shadow-md dark:shadow-lg' 
                : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full justify-center items-start transition-colors">
        <div className="w-full lg:flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[2rem] p-5 sm:p-8 shadow-sm dark:shadow-2xl overflow-hidden flex flex-col order-1 lg:max-w-[1500px] transition-colors">
          <div className="flex justify-between items-center mb-6 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white transition-colors">{profTab} 전문가 스킬</h2>
            </div>
            <button onClick={resetTree} className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">트리 초기화</button>
          </div>
          
          {profTab === '재배' && (
            <div className="mb-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-2xl text-[10px] sm:text-xs font-bold text-center leading-relaxed break-keep transition-colors">
              [씨앗은 덤이야], [왕 크니까 왕 좋아], [오늘도 풍년이다!] 스킬은<br className="sm:hidden" />
              요리 효율 분석의 <span className="text-gray-900 dark:text-white">베이스 원가 기댓값</span>에 자동 반영됩니다.
            </div>
          )}
          
          <div className="w-full overflow-x-auto custom-scrollbar pb-6 flex-1 cursor-grab active:cursor-grabbing">
            <div className="min-w-max flex justify-center">
              <SkillTree profTab={profTab} levels={levels} onLevelChange={handleLevelChange} />
            </div>
            <div className="mt-6 flex justify-center lg:hidden transition-colors">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full border border-gray-200 dark:border-white/5 transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                좌우로 스크롤하여 전체 트리를 확인하세요
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0 order-2 transition-colors">
          <div className="bg-white dark:bg-[#0a0a0a] dark:bg-gradient-to-br dark:from-amber-900/20 dark:to-black border border-gray-200 dark:border-amber-500/20 rounded-[2rem] p-6 shadow-sm dark:shadow-2xl transition-colors">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1 transition-colors">추가 요구 재화</h3>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 mb-6 transition-colors">저장 시점 대비 소모 예상 비용</p>
            <div className="space-y-4">
              {[
                { label: '필요 골드', val: diffCost.gold, img: 'coin.png', color: 'text-amber-600 dark:text-amber-400' },
                { label: '어빌리티 스톤', val: diffCost.stone, img: 'icons/ability_stone.png', color: 'text-blue-600 dark:text-blue-400', pixel: true },
                { label: '스킬 포인트', val: diffCost.point, img: 'icons/skill_arc.png', color: 'text-emerald-600 dark:text-emerald-400', pixel: true }
              ].map((item, i) => (
                <div key={i} className={`flex justify-between items-center ${i < 2 ? 'border-b border-gray-100 dark:border-white/5 pb-4' : ''} transition-colors`}>
                  <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400 transition-colors">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-black ${item.color} text-base sm:text-lg transition-colors`}>{item.val.toLocaleString()}</span>
                    <div className="relative w-5 h-5">
                      <Image src={`${STORAGE_BASE_URL}/${item.img}`} alt="icon" fill unoptimized className="object-contain drop-shadow-sm dark:drop-shadow-none" style={item.pixel ? { imageRendering: 'pixelated' } : {}} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button onClick={saveAll} className="w-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-black px-8 py-4 rounded-[1.25rem] transition-all shadow-md dark:shadow-xl hover:scale-[1.02] active:scale-95 text-sm sm:text-base">
            설정 저장하기
          </button>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 shadow-sm dark:shadow-2xl flex-1 min-h-[250px] lg:min-h-[400px] flex flex-col transition-colors">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors">
              <svg className="w-5 h-5 text-emerald-500 dark:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              활성 효과 요약
            </h3>
            <div className="overflow-y-auto custom-scrollbar flex-1 space-y-2 pr-1 transition-colors">
              {activeEffects.length > 0 ? activeEffects.map((eff, i) => (
                <div key={i} className="text-[11px] font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-white/5 leading-tight transition-colors">
                  {eff}
                </div>
              )) : (
                <div className="text-xs text-gray-400 dark:text-gray-600 text-center py-16 font-bold transition-colors">활성화된 스킬이 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}