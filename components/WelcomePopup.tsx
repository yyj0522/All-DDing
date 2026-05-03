'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function WelcomePopup() {
  const [isOpenMain, setIsOpenMain] = useState(false);
  const [isOpenRpg, setIsOpenRpg] = useState(false);
  const [dontShowTodayMain, setDontShowTodayMain] = useState(false);
  const [dontShowTodayRpg, setDontShowTodayRpg] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const now = new Date().getTime();
    
    const hideMainUntil = localStorage.getItem('hideWelcomePopup');
    let shouldOpenMain = true;
    if (hideMainUntil && now < parseInt(hideMainUntil, 10)) {
      shouldOpenMain = false;
    } else if (hideMainUntil) {
      localStorage.removeItem('hideWelcomePopup');
    }

    const hideRpgUntil = localStorage.getItem('hideRpgPopup');
    let shouldOpenRpg = true;
    if (hideRpgUntil && now < parseInt(hideRpgUntil, 10)) {
      shouldOpenRpg = false;
    } else if (hideRpgUntil) {
      localStorage.removeItem('hideRpgPopup');
    }

    const timer = setTimeout(() => {
      if (shouldOpenMain) setIsOpenMain(true);
      if (shouldOpenRpg) setIsOpenRpg(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleCloseMain = () => {
    if (dontShowTodayMain) {
      const nextDay = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem('hideWelcomePopup', nextDay.toString());
    }
    setIsOpenMain(false);
  };

  const handleCloseRpg = () => {
    if (dontShowTodayRpg) {
      const nextDay = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem('hideRpgPopup', nextDay.toString());
    }
    setIsOpenRpg(false);
  };

  if ((!isOpenMain && !isOpenRpg) || pathname !== '/') return null;

  return (
    <div className="fixed top-20 left-4 md:top-24 md:left-8 z-[999] pointer-events-none flex flex-col xl:flex-row gap-5 lg:gap-6 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] overflow-y-auto xl:overflow-x-hidden custom-scrollbar">
      
      {isOpenMain ? (
        <div className="pointer-events-auto animate-fade-in bg-white dark:bg-[#111113] border-2 border-gray-300 dark:border-transparent rounded-[2rem] w-full md:w-[760px] lg:w-[850px] shadow-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[calc(100vh-6rem)] overflow-hidden shrink-0 transition-colors">
          
          <div className="bg-gray-100 dark:bg-black px-6 pt-6 pb-5 md:px-8 md:pt-8 md:pb-6 shrink-0 transition-colors border-b-2 border-gray-300 dark:border-transparent">
            <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 dark:from-indigo-400 dark:to-fuchsia-400 tracking-tighter transition-colors">
              올띵에 오신 것을 환영합니다!
            </h2>
          </div>
          
          <div className="flex flex-col lg:flex-row overflow-y-auto custom-scrollbar bg-white dark:bg-transparent">
            <div className="flex-1 p-6 md:p-8 space-y-5 border-b-2 lg:border-b-0 lg:border-r-2 border-gray-300 dark:border-transparent transition-colors">
              
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-transparent rounded-2xl p-5 shadow-sm transition-colors">
                <p className="text-rose-600 dark:text-rose-400 text-sm font-black leading-relaxed text-center break-keep transition-colors tracking-tight">
                  본 사이트는 띵타이쿤 유저가 개인적으로 제작한 <br className="hidden sm:block" />
                  <span className="text-rose-500 dark:text-rose-300 underline underline-offset-4 decoration-rose-400 dark:decoration-rose-500/50 transition-colors">비공식 유저 웹사이트</span>이며, 공식 서비스가 아닙니다.
                </p>
              </div>

              <ul className="space-y-4">
                <li className="flex gap-4 items-start bg-gray-50 dark:bg-black rounded-2xl p-5 border border-gray-300 dark:border-transparent shadow-sm transition-colors">
                  <div className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-base shadow-inner transition-colors">
                    !
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-gray-100 mb-1.5 transition-colors tracking-tight">정보의 최신성 보장 불가 안내</p>
                    <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 leading-relaxed break-keep transition-colors">
                      본 사이트에서 제공하는 모든 데이터와 텍스트는 <span className="font-black text-rose-600 dark:text-rose-400 transition-colors">최신 정보가 아닐 수 있습니다.</span> 또한 사이트 내 모든 게임 리소스의 출처와 저작권은 전적으로 <span className="font-black text-gray-900 dark:text-gray-200 transition-colors">'띵타이쿤 온라인'</span>에 있습니다.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4 items-start bg-gray-50 dark:bg-black rounded-2xl p-5 border border-gray-300 dark:border-transparent shadow-sm transition-colors">
                  <div className="bg-fuchsia-100 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-base shadow-inner transition-colors">
                    ⚙
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-gray-100 mb-1.5 transition-colors tracking-tight">우측 상단 개인설정 필수</p>
                    <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 leading-relaxed break-keep transition-colors">자신의 인게임 스탯과 능력을 설정해야 정확한 시세 및 수익 계산이 이루어집니다.</p>
                  </div>
                </li>
                
                <li className="flex gap-4 items-start bg-gray-50 dark:bg-black rounded-2xl p-5 border border-gray-300 dark:border-transparent shadow-sm transition-colors">
                  <div className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-base shadow-inner transition-colors">
                    💻
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-gray-100 mb-1.5 transition-colors tracking-tight">PC 접속 강력 권장</p>
                    <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 leading-relaxed break-keep transition-colors">수많은 데이터 표와 시뮬레이터가 포함되어 있어, 모바일보다 PC 환경에 최적화되어 있습니다.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="flex-1 p-6 md:p-8 space-y-6 bg-gray-50 dark:bg-[#0a0a0a] transition-colors flex flex-col">
              <div>
                <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white mb-2 transition-colors tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                  업데이트 및 의견 제보 안내
                </h3>
                <p className="text-[11px] md:text-xs font-bold text-gray-500 dark:text-gray-400 break-keep leading-relaxed transition-colors pl-3.5">
                  올띵은 유저 여러분의 피드백으로 완성됩니다. 새로 추가된 기능이나 개선이 필요한 부분에 대해 자유롭게 의견을 남겨주세요!
                </p>
              </div>

              <div className="space-y-4 flex-1 flex flex-col justify-center">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-300 dark:border-transparent rounded-2xl p-6 shadow-sm transition-colors text-center">
                  <h4 className="text-sm font-black text-indigo-700 dark:text-indigo-400 mb-2 transition-colors tracking-tight">
                    05-04 업데이트가 적용되었습니다!<br/>자세한 내용은 패치노트에서 확인하세요
                  </h4>
                  <p className="text-[11px] font-bold text-indigo-600/80 dark:text-indigo-400/80 break-keep mb-5 transition-colors">
                    상단 메뉴의 '패치노트' 게시판을 통해 이번 업데이트의 모든 상세 내역을 확인하실 수 있습니다.
                  </p>
                  <a href="/note" className="inline-block bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white dark:text-gray-900 text-xs font-black px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 border border-indigo-700 dark:border-transparent">
                    패치노트 바로가기
                  </a>
                </div>

                <div className="bg-white dark:bg-black border border-gray-300 dark:border-transparent rounded-2xl p-5 shadow-sm transition-colors">
                  <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-500 mb-1.5 transition-colors tracking-tight">필요한 툴을 제안해 주세요</h4>
                  <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 leading-relaxed break-keep transition-colors">
                    현재 사이트에 없지만, 띵타이쿤 플레이에 도움이 될 만한 계산기나 편의 기능이 있다면 적극적으로 아이디어를 제보해 주세요.
                  </p>
                </div>

                <div className="bg-fuchsia-50 dark:bg-fuchsia-900/20 border border-fuchsia-300 dark:border-transparent rounded-2xl p-5 relative overflow-hidden group shadow-sm transition-colors">
                  <div className="absolute inset-0 bg-fuchsia-100 dark:bg-fuchsia-500/10 translate-y-full group-hover:translate-y-0 transition-all duration-300"></div>
                  <div className="relative z-10">
                    <h4 className="text-sm font-black text-fuchsia-800 dark:text-fuchsia-400 mb-2 transition-colors tracking-tight">
                      우측 하단 버튼을 적극 활용해 주세요!
                    </h4>
                    <p className="text-[11px] font-bold text-fuchsia-700/80 dark:text-fuchsia-300/80 leading-relaxed break-keep transition-colors">
                      화면 <span className="font-black text-fuchsia-600 dark:text-fuchsia-300 bg-fuchsia-200/60 dark:bg-fuchsia-500/30 px-1.5 py-0.5 rounded-md transition-colors border border-fuchsia-300 dark:border-transparent">우측 하단의 [의견 남기기]</span> 버튼을 통해 어떤 의견이든 편하게 남겨주시면 큰 힘이 됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-200 dark:bg-[#050505] border-t-2 border-gray-300 dark:border-transparent px-6 md:px-8 py-5 flex items-center justify-between shrink-0 transition-colors">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5">
                <input 
                  type="checkbox" 
                  className="peer appearance-none w-full h-full border-2 border-gray-400 dark:border-transparent rounded bg-white dark:bg-white/10 checked:bg-fuchsia-500 dark:checked:bg-fuchsia-600 checked:border-transparent transition-all cursor-pointer shadow-inner"
                  checked={dontShowTodayMain}
                  onChange={(e) => setDontShowTodayMain(e.target.checked)}
                />
                <span className="absolute text-white text-[12px] font-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity pb-[1px]">✓</span>
              </div>
              <span className="text-sm font-black text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors select-none tracking-tight">
                오늘 하루 보지 않기
              </span>
            </label>
            
            <button 
              onClick={handleCloseMain}
              className="bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 text-sm font-black px-8 py-3 rounded-xl transition-all shadow-md active:scale-95 border border-gray-900 dark:border-transparent"
            >
              닫기
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden xl:block w-full md:w-[760px] lg:w-[850px] shrink-0 pointer-events-none" />
      )}
    </div>
  );
}