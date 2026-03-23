'use client';

import { useTheme } from 'next-themes';

interface Props {
  townRank: string;
  setTownRank: (rank: string) => void;
  drinkRoutine: number[];
  addDrinkToRoutine: (val: number) => void;
  removeDrinkFromRoutine: (idx: number) => void;
  saveAll: () => void;
  currentTownEmoji: string;
  currentMaxStamina: number;
  dailyDrinkRecovery: number;
  totalDailyStamina: number;
  TOWN_RANKS: any[];
  STAMINA_DRINKS: any[];
}

export default function MiscSettingsTab({ townRank, setTownRank, drinkRoutine, addDrinkToRoutine, removeDrinkFromRoutine, saveAll, currentTownEmoji, currentMaxStamina, dailyDrinkRecovery, totalDailyStamina, TOWN_RANKS, STAMINA_DRINKS }: Props) {
  const { theme } = useTheme();
  const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

  const getTownImage = (rank: string) => {
    switch (rank) {
      case '숲': return `${STORAGE_BASE_URL}/town_fund_ranking/town_1.png`;
      case '열매': return `${STORAGE_BASE_URL}/town_fund_ranking/town_2.png`;
      case '꽃': return `${STORAGE_BASE_URL}/town_fund_ranking/town_3.png`;
      case '새싹': return `${STORAGE_BASE_URL}/town_fund_ranking/town_4.png`;
      default: return null;
    }
  };

  const townImg = getTownImage(townRank);

  return (
    <div className="flex flex-col xl:flex-row gap-8 w-full justify-center max-w-7xl mx-auto animate-fade-in-up transition-colors duration-300">
      <div className="flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm dark:shadow-2xl transition-colors">
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-white/5 pb-4 transition-colors">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">부가 정보 설정</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">마을 투자 혜택 및 일일 스태미나 회복 패턴을 기록하여 추후 고급 시뮬레이션에 활용합니다.</p>
          </div>
          <button onClick={saveAll} className="hidden md:block bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-black px-6 py-2.5 rounded-xl transition-all shadow-md dark:shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-[1.02]">
            설정 저장
          </button>
        </div>

        <div className="flex flex-col gap-10">
          <div>
            <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-4 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              소속 마을 투자 등급
            </h3>
            <div className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-6 transition-colors">
              <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden transition-colors">
                {townImg ? (
                  <img src={townImg} alt={townRank} className="w-16 h-16 object-contain drop-shadow-sm dark:drop-shadow-md" style={{ imageRendering: 'pixelated' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <svg className="w-10 h-10 text-emerald-300 dark:text-emerald-500/30 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">마을의 투자 등급에 따라 최대 스태미나 상한이 증가합니다.</p>
                <div className="flex items-center gap-4">
                  <label className="text-gray-900 dark:text-white font-bold whitespace-nowrap transition-colors">현재 등급</label>
                  <select 
                    value={townRank}
                    onChange={(e) => setTownRank(e.target.value)}
                    className="w-48 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl py-2 px-4 text-gray-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                  >
                    {TOWN_RANKS.map(rank => (
                      <option key={rank.value} value={rank.value} className="bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white">{rank.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-4 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              일일 스태미나 회복 패턴
            </h3>
            <div className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/5 rounded-2xl p-6 transition-colors">
              <div className="flex justify-between items-center mb-4 transition-colors">
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">평소 마시는 스태미나 드링크를 순서대로 채워주세요. (클릭하여 제거)</p>
                <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black px-3 py-1 rounded-lg text-sm border border-indigo-200 dark:border-indigo-500/30 transition-colors">
                  {drinkRoutine.length} / 5
                </span>
              </div>
              
              <div className="flex gap-3 sm:gap-4 mb-6">
                {[0, 1, 2, 3, 4].map(idx => {
                  const drinkVal = drinkRoutine[idx];
                  return (
                    <div 
                      key={idx}
                      onClick={() => drinkVal && removeDrinkFromRoutine(idx)}
                      className={`flex-1 aspect-square rounded-2xl border-2 flex items-center justify-center transition-all ${
                        drinkVal 
                        ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:border-rose-400 dark:hover:border-rose-500 group relative' 
                        : 'border-dashed border-gray-300 dark:border-white/10 bg-white dark:bg-white/5'
                      }`}
                      title={drinkVal ? "클릭하여 제거" : "아래 목록에서 선택"}
                    >
                      {drinkVal ? (
                        <>
                          <img 
                            src={`${STORAGE_BASE_URL}/stamina/stamina_drink_${drinkVal}.png`} 
                            className="w-10 h-10 object-contain drop-shadow-sm dark:drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] group-hover:scale-90 transition-transform" 
                            style={{imageRendering: 'pixelated'}} 
                            alt={`드링크 ${drinkVal}`}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <div className="absolute inset-0 bg-rose-500/10 dark:bg-rose-500/20 hidden group-hover:flex items-center justify-center rounded-2xl backdrop-blur-[1px] transition-colors">
                            <svg className="w-6 h-6 text-rose-500 dark:text-rose-400 drop-shadow-sm dark:drop-shadow-md transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600 font-bold text-xl transition-colors">+</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="h-px w-full bg-gray-200 dark:bg-white/5 mb-6 transition-colors"></div>

              <label className="text-xs font-bold text-gray-500 dark:text-gray-500 mb-3 block transition-colors">추가할 드링크를 클릭하세요</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {STAMINA_DRINKS.map(drink => (
                  <button 
                    key={drink.value} 
                    onClick={() => addDrinkToRoutine(drink.value)} 
                    disabled={drinkRoutine.length >= 5}
                    className="flex flex-col items-center gap-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-xl p-3 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-gray-50 dark:hover:bg-white/5 transition-all disabled:opacity-50 dark:disabled:opacity-30 disabled:cursor-not-allowed group"
                  >
                    <img 
                      src={`${STORAGE_BASE_URL}/stamina/stamina_drink_${drink.value}.png`} 
                      className="w-10 h-10 object-contain drop-shadow-sm dark:drop-shadow-md group-hover:-translate-y-1 transition-transform" 
                      style={{imageRendering: 'pixelated'}} 
                      alt={drink.name}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="text-center w-full">
                      <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis w-full transition-colors">
                        {drink.name.replace('스태미나 ', '')}
                      </div>
                      <div className="text-xs font-black text-blue-600 dark:text-blue-400 mt-0.5 transition-colors">+{drink.recovery}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <button onClick={saveAll} className="mt-8 md:hidden w-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-black px-6 py-3.5 rounded-xl transition-all shadow-md dark:shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          설정 저장하기
        </button>
      </div>

      <div className="w-full xl:w-80 flex flex-col gap-5 flex-shrink-0 transition-colors duration-300">
        <div className="bg-white dark:bg-gradient-to-br dark:from-indigo-900/20 dark:to-black border border-gray-200 dark:border-indigo-500/20 rounded-3xl p-6 shadow-sm dark:shadow-2xl transition-colors">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors">일일 가용 스태미나</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 transition-colors">투자 등급과 드링크를 합산한 총량</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-white/5 pb-2 transition-colors">
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400 transition-colors">기본 최대 상한</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg transition-colors">{currentMaxStamina.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-white/5 pb-2 transition-colors">
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400 transition-colors">드링크 회복량</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-lg transition-colors">+{dailyDrinkRecovery.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2 transition-colors">
              <span className="text-sm font-black text-gray-900 dark:text-white transition-colors">총 스태미나</span>
              <span className="font-black text-indigo-600 dark:text-indigo-400 text-2xl drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-colors">
                {totalDailyStamina.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}