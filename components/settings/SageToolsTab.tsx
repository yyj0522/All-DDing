import { SAGE_TOOLS, SAGE_TOOL_EFFECTS } from '@/lib/sageData';

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
  return (
    <div className="flex flex-col xl:flex-row gap-8 w-full justify-center max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">세이지 도구 현황</h2>
            <p className="text-sm text-gray-400">현재 소유 중인 세이지 도구의 강화 수치를 기록하세요.</p>
          </div>
          <button onClick={resetTools} className="text-xs text-gray-400 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5">도구 초기화</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SAGE_TOOLS.map((tool) => {
            const lv = toolLevels[tool.id] || 0;
            const isActive = activeToolId === tool.id;
            
            return (
              <div 
                key={tool.id} 
                onClick={() => setActiveToolId(tool.id)}
                className={`bg-black border rounded-2xl p-6 flex flex-col items-center gap-4 transition-all cursor-pointer ${
                  isActive 
                  ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-rose-500/5' 
                  : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div className={`w-32 h-32 bg-white/5 border rounded-2xl flex items-center justify-center text-gray-600 font-bold overflow-hidden shadow-inner relative transition-colors ${isActive ? 'border-rose-500/50' : 'border-white/10'}`}>
                  <img 
                    src={`/tools/${getToolImageName(tool.id, lv)}.png`} 
                    alt={tool.name} 
                    className="w-full h-full object-contain p-2"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }}
                  />
                  <span className="hidden">IMG</span>
                  
                  {lv > 0 && (
                    <div className="absolute top-2 right-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black text-xs px-2 py-0.5 rounded shadow-lg backdrop-blur-sm">
                      +{lv}
                    </div>
                  )}
                </div>
                
                <div className="text-center w-full">
                  <h3 className={`text-lg font-bold transition-colors ${isActive ? 'text-rose-400' : 'text-white'}`}>{tool.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">최대 강화 수치: +{tool.maxLevel}</p>
                </div>

                <div className={`flex items-center gap-4 bg-white/5 rounded-xl p-2 w-full justify-between border ${isActive ? 'border-rose-500/30' : 'border-white/5'}`}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleToolLevelChange(tool.id, -1, tool.maxLevel); }} 
                    disabled={lv === 0} 
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 bg-black rounded-lg transition-colors z-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                  </button>
                  <span className={`text-base font-black tracking-widest ${lv > 0 ? 'text-rose-400' : 'text-gray-500'}`}>
                    +{lv}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleToolLevelChange(tool.id, 1, tool.maxLevel); }} 
                    disabled={lv === tool.maxLevel} 
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 bg-black rounded-lg transition-colors z-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full xl:w-80 flex flex-col gap-5 flex-shrink-0">
        <div className="bg-gradient-to-br from-rose-900/20 to-black border border-rose-500/20 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-2">누적 소모 기댓값</h3>
          <p className="text-xs text-gray-400 mb-5">저장 시점 대비 강화 시뮬레이션 비용</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-sm font-bold text-gray-400">필요 코인</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-amber-400 text-lg">{diffToolCost.coin.toLocaleString()}</span>
                <img src="/coin.png" alt="C" className="w-4 h-4 object-contain" onError={(e) => {e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden')}} />
                <span className="text-amber-400 font-bold hidden bg-amber-500/20 px-1.5 rounded text-[10px]">C</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-sm font-bold text-gray-400">필요 루비</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-rose-400 text-lg">{diffToolCost.ruby.toLocaleString()}</span>
                <img src="/ruby.png" alt="R" className="w-4 h-4 object-contain" onError={(e) => {e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden')}} />
                <span className="text-rose-400 font-bold hidden bg-rose-500/20 px-1.5 rounded text-[10px]">R</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-gray-500">하급 라이프스톤</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-300 text-sm">{diffToolCost.stone1.toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
                <img src="/tools/lifestone1.png" alt="하급" className="w-4 h-4 object-contain" style={{ imageRendering: 'pixelated' }} onError={(e) => {e.currentTarget.style.display='none';}} />
              </div>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-gray-500">중급 라이프스톤</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-300 text-sm">{diffToolCost.stone2.toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
                <img src="/tools/lifestone2.png" alt="중급" className="w-4 h-4 object-contain" style={{ imageRendering: 'pixelated' }} onError={(e) => {e.currentTarget.style.display='none';}} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500">상급 라이프스톤</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-300 text-sm">{diffToolCost.stone3.toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
                <img src="/tools/lifestone3.png" alt="상급" className="w-4 h-4 object-contain" style={{ imageRendering: 'pixelated' }} onError={(e) => {e.currentTarget.style.display='none';}} />
              </div>
            </div>
          </div>
        </div>

        <button onClick={saveAll} className="w-full bg-white text-black hover:bg-gray-200 font-black px-8 py-3.5 rounded-2xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-[1.02]">
          전체 설정 저장하기
        </button>
        
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 flex-1 flex flex-col min-h-[250px]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            {SAGE_TOOLS.find(t => t.id === activeToolId)?.name} 효과
          </h3>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 mb-4">
            {(toolLevels[activeToolId] || 0) === 0 ? (
              <div className="text-sm text-gray-600 text-center py-10 mt-4 font-bold bg-white/5 rounded-xl border border-white/5">
                강화되지 않은 도구입니다.
              </div>
            ) : (
              Object.entries(SAGE_TOOL_EFFECTS[activeToolId][(toolLevels[activeToolId] || 1) - 1]).map(([key, value], idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                  <span className="text-xs font-bold text-gray-400">{key}</span>
                  <span className="text-sm font-black text-rose-300">{value}</span>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/10 pt-4 mt-auto">
            <p className="text-[10px] text-gray-500 font-bold leading-relaxed text-center">
              ※ 위 강화 기댓값은 확률에 따른 단순 평균값이며,<br/>
              실제 게임 내 결과와는 다를 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}