import Link from 'next/link';
import { getImagePath, MINE_FIXED_PRICES, PRICE_BUFF_EFFECTS } from '@/lib/professionData';

interface Props {
  userStats: any;
  targetZone: string;
  setTargetZone: (zone: any) => void;
  results: any;
}

export default function MiningStatsTab({ userStats, targetZone, setTargetZone, results }: Props) {
  const { expectedIngots, expectedGems, expectedRelics, expectedRelicPoints, ingotRevenue, gemRevenue, totalRevenue } = results;

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/3 bg-black/40 p-8 border-r border-white/5 flex flex-col justify-between">
          <div>
            <div className="mb-6 pb-6 border-b border-white/5 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">적용된 내 능력치</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed">개인설정 보드에서 저장된 데이터가<br/>시뮬레이션에 자동 반영됩니다.</p>
              </div>
              <Link href="/settings" className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
                설정 변경
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-gray-400">총 가용 스태미나</span>
                <span className="text-sm font-black text-indigo-400">{userStats.stamina.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-gray-400">세이지 곡괭이</span>
                <span className="text-sm font-black text-stone-300">+{userStats.pickaxeLv}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-gray-400">[럭키 히트]</span>
                <span className="text-sm font-black text-emerald-400">Lv.{userStats.luckyHitLv}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-gray-400">[불붙은 곡괭이]</span>
                <span className="text-sm font-black text-orange-400">Lv.{userStats.flamingPickLv}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-gray-400">[반짝임의 시작]</span>
                <span className="text-sm font-black text-fuchsia-400">Lv.{userStats.gemDropLv}</span>
              </div>
            </div>
          </div>
          
          {userStats.stamina === 3000 && userStats.pickaxeLv === 0 && (
            <p className="text-[10px] text-rose-400/80 font-bold mt-6 text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">
              능력치가 기본값입니다. 정확한 수익을 위해<br/>개인설정에서 데이터를 저장해주세요.
            </p>
          )}
        </div>

        <div className="w-full lg:w-2/3 p-8 flex flex-col justify-between bg-gradient-to-br from-[#0a0a0a] to-[#0f0f13]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-2xl font-black text-white mb-2">일일 채광 수익</h3>
              <p className="text-sm text-gray-400">스태미나를 100% 소모했을 때의 예상 평균치입니다.</p>
            </div>
            
            <div className="flex items-center gap-3 bg-black border border-white/10 px-4 py-2.5 rounded-xl">
              <span className="text-xs font-bold text-gray-500">광물</span>
              <select 
                value={targetZone}
                onChange={(e) => setTargetZone(e.target.value as any)}
                className="bg-transparent text-white text-sm font-bold focus:outline-none"
              >
                <option value="코룸" className="bg-[#0a0a0a]">코룸</option>
                <option value="리프톤" className="bg-[#0a0a0a]">리프톤</option>
                <option value="세렌트" className="bg-[#0a0a0a]">세렌트</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-black/50 border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <img src={getImagePath(`${targetZone} 주괴`) || ''} className="w-24 h-24 object-contain" alt="주괴" />
              </div>
              <p className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                <img src={getImagePath(`${targetZone} 주괴`) || ''} className="w-5 h-5 object-contain" alt="" />
                {targetZone} 주괴 획득량 (제작+직발)
              </p>
              <div className="flex items-end gap-3 mb-1">
                <span className="text-3xl font-black text-white">{expectedIngots.toLocaleString()}</span>
                <span className="text-sm font-bold text-gray-500 mb-1">개</span>
              </div>
              <p className="text-lg font-black text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">
                + {ingotRevenue.toLocaleString()} G
              </p>
            </div>

            <div className="bg-black/50 border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <img src={getImagePath(targetZone === '코룸' ? '그라밋' : targetZone === '리프톤' ? '에메리오' : '샤인플레어') || ''} className="w-24 h-24 object-contain" alt="보석" />
              </div>
              <p className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                <img src={getImagePath(targetZone === '코룸' ? '그라밋' : targetZone === '리프톤' ? '에메리오' : '샤인플레어') || ''} className="w-5 h-5 object-contain" alt="" />
                {targetZone} 보석 획득량
              </p>
              <div className="flex items-end gap-3 mb-1">
                <span className="text-3xl font-black text-white">{expectedGems.toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
                <span className="text-sm font-bold text-gray-500 mb-1">개</span>
              </div>
              <p className="text-lg font-black text-fuchsia-400 drop-shadow-[0_0_5px_rgba(232,121,249,0.3)]">
                + {gemRevenue.toLocaleString()} G
              </p>
            </div>
          </div>

          <div className="bg-black/50 border border-cyan-500/20 rounded-2xl p-5 relative overflow-hidden group mb-8">
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
               <svg className="w-32 h-32 text-cyan-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-4">
              <div>
                <p className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                  <img src="/mining_items/mining_relic5.png" alt="유물" className="w-5 h-5 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                  예상 획득 유물 (전체)
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-white">{expectedRelics.toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
                  <span className="text-xs font-bold text-gray-500 mb-1">개</span>
                </div>
              </div>
              <div className="sm:text-right w-full sm:w-auto bg-cyan-500/5 px-4 py-3 rounded-xl border border-cyan-500/10">
                <p className="text-[11px] font-bold text-cyan-500/80 mb-1 uppercase tracking-widest">항해 수하물 포인트 기댓값</p>
                <p className="text-xl font-black text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]">
                  + {expectedRelicPoints.toLocaleString(undefined, {maximumFractionDigits: 0})} Pt
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm font-bold text-gray-400 mb-1">일일 총 예상 수익</p>
              <p className="text-[10px] text-gray-500">※ 부자재(강화 횃불 등) 비용이 제외된 단순 매출액입니다.</p>
            </div>
            <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
              {totalRevenue.toLocaleString()} G
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              NPC 주괴 매입가
            </h3>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-500">[주괴 좀 사주괴] 스킬 적용</p>
              <p className="text-sm font-black text-amber-400">Lv.{userStats.ingotBuffLv}</p>
            </div>
          </div>
          <div className="space-y-3">
            {MINE_FIXED_PRICES.ingots.map((item, idx) => {
              const buffedPrice = Math.floor(item.base * (1 + (PRICE_BUFF_EFFECTS[userStats.ingotBuffLv] || 0)));
              const imgPath = getImagePath(item.name);
              return (
                <div key={idx} className="bg-black border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden p-1.5">
                       {imgPath ? <img src={imgPath} alt={item.name} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }}/> : <span className="text-[8px] text-gray-600">IMG</span>}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-200">{item.name}</p>
                      <p className="text-[10px] text-gray-500">기본가: {item.base.toLocaleString()}G</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">{buffedPrice.toLocaleString()} G</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              NPC 보석 매입가
            </h3>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-500">[반짝반짝 눈이부셔] 스킬 적용</p>
              <p className="text-sm font-black text-fuchsia-400">Lv.{userStats.gemBuffLv}</p>
            </div>
          </div>
          <div className="space-y-3">
            {MINE_FIXED_PRICES.gems.map((item, idx) => {
              const buffedPrice = Math.floor(item.base * (1 + (PRICE_BUFF_EFFECTS[userStats.gemBuffLv] || 0)));
              const imgPath = getImagePath(item.name);
              return (
                <div key={idx} className="bg-black border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden p-1.5">
                       {imgPath ? <img src={imgPath} alt={item.name} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }}/> : <span className="text-[8px] text-gray-600">IMG</span>}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-200">{item.name}</p>
                      <p className="text-[10px] text-gray-500">{item.type} / 기본가: {item.base.toLocaleString()}G</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-fuchsia-400 drop-shadow-[0_0_5px_rgba(232,121,249,0.3)]">{buffedPrice.toLocaleString()} G</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}