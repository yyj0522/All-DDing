'use client';

import { SAGE_TOOLS, SAGE_TOOL_EFFECTS } from '@/lib/sageData';
import { useTheme } from 'next-themes';

interface Props {
  activeToolId: string;
  setActiveToolId: (id: string) => void;
  toolLevels: Record<string, number>;
  handleToolLevelChange: (id: string, delta: number, max: number) => void;
  resetTools: () => void;
  saveAll: () => void;
  diffToolCost: { coin: number; ruby: number; stone1: number; stone2: number; stone3: number };
  getToolImageName: (toolId: string, level: number) => string;
}

export default function SageToolsTab({ activeToolId, setActiveToolId, toolLevels, handleToolLevelChange, resetTools, saveAll, diffToolCost, getToolImageName }: Props) {
  const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";
  const { theme } = useTheme();

  return (
    <div className="flex flex-col xl:flex-row gap-8 w-full justify-center max-w-7xl mx-auto animate-fade-in-up transition-colors duration-300">
      <div className="flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm dark:shadow-2xl transition-colors">
        <div className="flex justify-between items-center mb-10 transition-colors">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">세이지 도구 현황</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">현재 소유 중인 세이지 도구의 강화 수치를 기록하세요.</p>
          </div>
          <button onClick={resetTools} className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">도구 초기화</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-colors">
          {SAGE_TOOLS.map((tool) => {
            const lv = toolLevels[tool.id] || 0;
            const isActive = activeToolId === tool.id;
            
            return (
              <div 
                key={tool.id} 
                onClick={() => setActiveToolId(tool.id)}
                className={`bg-gray-50 dark:bg-black border rounded-2xl p-6 flex flex-col items-center gap-4 transition-all cursor-pointer ${
                  isActive 
                  ? 'border-rose-400 dark:border-rose-500 shadow-sm dark:shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-rose-50 dark:bg-rose-500/5' 
                  : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/30'
                }`}
              >
                <div className={`w-32 h-32 bg-white dark:bg-white/5 border rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-600 font-bold overflow-hidden shadow-sm dark:shadow-inner relative transition-colors ${isActive ? 'border-rose-400 dark:border-rose-500/50' : 'border-gray-200 dark:border-white/10'}`}>
                  <img 
                    src={`${STORAGE_BASE_URL}/tools/${getToolImageName(tool.id, lv)}.png`} 
                    alt={tool.name} 
                    className="w-full h-full object-contain p-2 drop-shadow-sm dark:drop-shadow-none"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }}
                  />
                  <span className="hidden">IMG</span>
                  
                  {lv > 0 && (
                    <div className="absolute top-2 right-2 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 font-black text-xs px-2 py-0.5 rounded shadow-sm dark:shadow-lg backdrop-blur-sm transition-colors">
                      +{lv}
                    </div>
                  )}
                </div>
                
                <div className="text-center w-full transition-colors">
                  <h3 className={`text-lg font-bold transition-colors ${isActive ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>{tool.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 transition-colors">최대 강화 수치: +{tool.maxLevel}</p>
                </div>

                <div className={`flex items-center gap-4 bg-white dark:bg-white/5 rounded-xl p-2 w-full justify-between border transition-colors ${isActive ? 'border-rose-200 dark:border-rose-500/30' : 'border-gray-200 dark:border-white/5'}`}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleToolLevelChange(tool.id, -1, tool.maxLevel); }} 
                    disabled={lv === 0} 
                    className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 bg-gray-100 dark:bg-black rounded-lg transition-colors z-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                  </button>
                  <span className={`text-base font-black tracking-widest transition-colors ${lv > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    +{lv}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleToolLevelChange(tool.id, 1, tool.maxLevel); }} 
                    disabled={lv === tool.maxLevel} 
                    className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 bg-gray-100 dark:bg-black rounded-lg transition-colors z-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full xl:w-80 flex flex-col gap-5 flex-shrink-0 transition-colors duration-300">
        <div className="bg-white dark:bg-[#0a0a0a] dark:bg-gradient-to-br dark:from-rose-900/20 dark:to-black border border-gray-200 dark:border-rose-500/20 rounded-3xl p-6 shadow-sm dark:shadow-2xl transition-colors">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors">누적 소모 기댓값</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 transition-colors">저장 시점 대비 강화 시뮬레이션 비용</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2 transition-colors">
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400 transition-colors">필요 코인</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-amber-600 dark:text-amber-400 text-lg transition-colors">{diffToolCost.coin.toLocaleString()}</span>
                <img src={`${STORAGE_BASE_URL}/coin.png`} alt="C" className="w-4 h-4 object-contain" onError={(e) => {e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden')}} />
                <span className="text-amber-600 dark:text-amber-400 font-bold hidden bg-amber-100 dark:bg-amber-500/20 px-1.5 rounded text-[10px] transition-colors">C</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2 transition-colors">
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400 transition-colors">필요 루비</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-rose-600 dark:text-rose-400 text-lg transition-colors">{diffToolCost.ruby.toLocaleString()}</span>
                <img src={`${STORAGE_BASE_URL}/ruby.png`} alt="R" className="w-4 h-4 object-contain" onError={(e) => {e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden')}} />
                <span className="text-rose-600 dark:text-rose-400 font-bold hidden bg-rose-100 dark:bg-rose-500/20 px-1.5 rounded text-[10px] transition-colors">R</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2 transition-colors">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-500 transition-colors">하급 라이프스톤</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-700 dark:text-gray-300 text-sm transition-colors">{diffToolCost.stone1.toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
                <img src={`${STORAGE_BASE_URL}/tools/lifestone1.png`} alt="하급" className="w-4 h-4 object-contain drop-shadow-sm dark:drop-shadow-none" style={{ imageRendering: 'pixelated' }} onError={(e) => {e.currentTarget.style.display='none';}} />
              </div>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2 transition-colors">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-500 transition-colors">중급 라이프스톤</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-700 dark:text-gray-300 text-sm transition-colors">{diffToolCost.stone2.toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
                <img src={`${STORAGE_BASE_URL}/tools/lifestone2.png`} alt="중급" className="w-4 h-4 object-contain drop-shadow-sm dark:drop-shadow-none" style={{ imageRendering: 'pixelated' }} onError={(e) => {e.currentTarget.style.display='none';}} />
              </div>
            </div>
            <div className="flex justify-between items-center transition-colors">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-500 transition-colors">상급 라이프스톤</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-700 dark:text-gray-300 text-sm transition-colors">{diffToolCost.stone3.toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
                <img src={`${STORAGE_BASE_URL}/tools/lifestone3.png`} alt="상급" className="w-4 h-4 object-contain drop-shadow-sm dark:drop-shadow-none" style={{ imageRendering: 'pixelated' }} onError={(e) => {e.currentTarget.style.display='none';}} />
              </div>
            </div>
          </div>
        </div>

        <button onClick={saveAll} className="w-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-black px-8 py-3.5 rounded-2xl transition-all shadow-md dark:shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-[1.02]">
          전체 설정 저장하기
        </button>
        
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-6 flex-1 flex flex-col min-h-[250px] shadow-sm dark:shadow-none transition-colors">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors">
            <svg className="w-5 h-5 text-rose-500 dark:text-rose-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            {SAGE_TOOLS.find(t => t.id === activeToolId)?.name} 효과
          </h3>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 mb-4 transition-colors">
            {(toolLevels[activeToolId] || 0) === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-600 text-center py-10 mt-4 font-bold bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 transition-colors">
                강화되지 않은 도구입니다.
              </div>
            ) : (
              Object.entries(SAGE_TOOL_EFFECTS[activeToolId][(toolLevels[activeToolId] || 1) - 1]).map(([key, value], idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-white/5 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/5 transition-colors">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 transition-colors">{key}</span>
                  <span className="text-sm font-black text-rose-600 dark:text-rose-300 transition-colors">{value}</span>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-white/10 pt-4 mt-auto transition-colors">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold leading-relaxed text-center transition-colors">
              ※ 위 강화 기댓값은 확률에 따른 단순 평균값이며,<br/>
              실제 게임 내 결과와는 다를 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}