import { Profession, SKILL_DATA } from '@/lib/skillData';
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
  return (
    <div className="flex flex-col gap-8 animate-fade-in-up w-full max-w-7xl mx-auto">
      <div className="flex justify-center gap-2 md:gap-4 mb-4 overflow-x-auto pb-2 custom-scrollbar w-full">
        {(['재배', '채광', '해양', '사냥'] as Profession[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setProfTab(tab)}
            className={`px-8 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${
              profTab === tab 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/50 shadow-[0_0_15px_rgba(251,191,36,0.1)]' 
              : 'bg-[#0a0a0a] border border-white/5 text-gray-500 hover:bg-white/5 hover:text-gray-300'
            }`}
          >
            {tab} 전문가
          </button>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-8 w-full justify-center">
        <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col w-full xl:max-w-[1100px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">{profTab} 스킬 트리</h2>
            <button onClick={resetTree} className="text-xs text-gray-400 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5">트리 초기화</button>
          </div>
          
          {profTab === '재배' && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-bold text-center">
              [씨앗은 덤이야], [왕 크니까 왕 좋아], [오늘도 풍년이다!] 스킬은 요리 효율 분석의 <span className="text-white">베이스 원가 기댓값</span>에 자동 반영됩니다.
            </div>
          )}
          
          <div className="w-full overflow-x-auto custom-scrollbar pb-8 flex-1">
            <SkillTree profTab={profTab} levels={levels} onLevelChange={handleLevelChange} />
          </div>
        </div>

        <div className="w-full xl:w-80 flex flex-col gap-5 flex-shrink-0">
          <div className="bg-gradient-to-br from-amber-900/20 to-black border border-amber-500/20 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">추가 요구 재화</h3>
            <p className="text-xs text-gray-400 mb-6">마지막 저장 시점 대비 누적 비용</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-sm font-bold text-gray-400">필요 골드</span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-amber-400 text-xl">{diffCost.gold.toLocaleString()}</span>
                  <img src="/coin.png" alt="G" className="w-5 h-5 object-contain" onError={(e) => {e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden')}} />
                  <span className="text-amber-400 font-bold hidden">G</span>
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-sm font-bold text-gray-400">어빌리티 스톤</span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-blue-400 text-xl">{diffCost.stone.toLocaleString()}</span>
                  <img src="/icons/ability_stone.png" alt="스톤" className="w-5 h-5 object-contain" style={{ imageRendering: 'pixelated' }} onError={(e) => {e.currentTarget.style.display='none';}} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-400">스킬 포인트</span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-emerald-400 text-xl">{diffCost.point.toLocaleString()}</span>
                  <img src="/icons/skill_arc.png" alt="P" className="w-5 h-5 object-contain" style={{ imageRendering: 'pixelated' }} onError={(e) => {e.currentTarget.style.display='none';}} />
                </div>
              </div>
            </div>
          </div>
          
          <button onClick={saveAll} className="w-full bg-white text-black hover:bg-gray-200 font-black px-8 py-3.5 rounded-2xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-[1.02]">
            전체 설정 저장하기
          </button>

          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl flex-1 min-h-[250px] flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              활성화된 효과 요약
            </h3>
            <div className="overflow-y-auto custom-scrollbar flex-1 space-y-2 pr-2">
              {activeEffects.length > 0 ? activeEffects.map((eff, i) => (
                <div key={i} className="text-xs font-bold text-gray-300 bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                  {eff}
                </div>
              )) : (
                <div className="text-sm text-gray-600 text-center py-10">활성화된 스킬이 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}