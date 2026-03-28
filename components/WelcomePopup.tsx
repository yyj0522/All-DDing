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
    <div className="fixed top-20 left-4 md:top-24 md:left-8 z-[999] pointer-events-none flex flex-col xl:flex-row gap-4 lg:gap-6 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] overflow-y-auto xl:overflow-x-hidden custom-scrollbar">
      
      {isOpenMain ? (
        <div className="pointer-events-auto animate-fade-in bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl w-full md:w-[760px] lg:w-[1150px] shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[calc(100vh-6rem)] overflow-hidden shrink-0 transition-colors">
          <div className="bg-black border-b border-white/10 px-6 py-5 shrink-0 transition-colors">
            <h2 className="text-lg font-black text-white tracking-tight transition-colors">
              올띵(All-Dding)에 오신 것을 환영합니다!
            </h2>
          </div>
          
          <div className="flex flex-col lg:flex-row overflow-y-auto custom-scrollbar">
            <div className="flex-1 p-6 space-y-5 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/5 transition-colors">
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 transition-colors">
                <p className="text-red-600 dark:text-red-400 text-sm font-bold leading-relaxed text-center break-keep transition-colors">
                  본 사이트는 띵타이쿤 유저가 개인적으로 제작한 <br className="hidden sm:block" />
                  <span className="text-red-500 dark:text-red-300 underline underline-offset-4 decoration-red-300 dark:decoration-red-500/50 transition-colors">비공식 유저 웹사이트</span>이며, 공식 서비스가 아닙니다.
                </p>
              </div>

              <ul className="space-y-3">
                <li className="flex gap-4 items-start bg-rose-50 dark:bg-rose-500/5 rounded-xl p-4 border border-rose-100 dark:border-rose-500/20 transition-colors">
                  <div className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 p-2 rounded-lg shrink-0 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-200 mb-1 transition-colors">정보의 최신성 보장 불가 안내</p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed break-keep transition-colors">
                      본 사이트에서 제공하는 모든 데이터와 텍스트는 <span className="font-bold text-gray-900 dark:text-gray-300 transition-colors">최신 정보가 아닐 수 있습니다.</span> 또한 사이트 내 모든 게임 리소스의 출처와 저작권은 전적으로 <span className="font-bold text-gray-900 dark:text-gray-300 transition-colors">'띵타이쿤 온라인'</span>에 있습니다.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4 items-start bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 transition-colors">
                  <div className="bg-fuchsia-100 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400 p-2 rounded-lg shrink-0 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-200 mb-1 transition-colors">우측 상단 개인설정 필수</p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed break-keep transition-colors">자신의 인게임 스탯과 능력을 설정해야 정확한 시세 및 수익 계산이 이루어집니다.</p>
                  </div>
                </li>
                
                <li className="flex gap-4 items-start bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 transition-colors">
                  <div className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 p-2 rounded-lg shrink-0 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-200 mb-1 transition-colors">PC 접속 강력 권장</p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed break-keep transition-colors">수많은 데이터 표와 시뮬레이터가 포함되어 있어, 모바일보다 PC 환경에 최적화되어 있습니다.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="flex-1 p-6 space-y-6 bg-gray-50 dark:bg-black/20 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/5 transition-colors">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2 transition-colors">
                  업데이트 및 의견 제보 안내
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 break-keep leading-relaxed transition-colors">
                  올띵은 유저 여러분의 피드백으로 완성됩니다. 새로 추가된 기능이나 개선이 필요한 부분에 대해 자유롭게 의견을 남겨주세요!
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-xl p-4 shadow-sm dark:shadow-none transition-colors">
                  <h4 className="text-sm font-bold text-amber-600 dark:text-amber-500 mb-1 transition-colors">사냥꾼 관련 제보 요청</h4>
                  <p className="text-[11px] text-gray-700 dark:text-gray-400 leading-relaxed break-keep transition-colors">
                    전문가 페이지에 사냥꾼 전용 아이템 레시피가 추가되었습니다. 사냥꾼의 수익구조와 플레이 루틴등을 제보해주시면 큰 도움이 될 것 같습니다.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-xl p-4 shadow-sm dark:shadow-none transition-colors">
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-500 mb-1 transition-colors">필요한 툴을 제안해 주세요</h4>
                  <p className="text-[11px] text-gray-700 dark:text-gray-400 leading-relaxed break-keep transition-colors">
                    현재 사이트에 없지만, 띵타이쿤 플레이에 도움이 될 만한 계산기나 편의 기능이 있다면 적극적으로 아이디어를 제보해 주세요.
                  </p>
                </div>

                <div className="bg-fuchsia-50 dark:bg-fuchsia-900/10 border border-fuchsia-200 dark:border-fuchsia-500/20 rounded-xl p-4 relative overflow-hidden group shadow-sm dark:shadow-none transition-colors">
                  <div className="absolute inset-0 bg-fuchsia-100 dark:bg-fuchsia-500/5 translate-y-full group-hover:translate-y-0 transition-all duration-300"></div>
                  <div className="relative z-10">
                    <h4 className="text-sm font-black text-gray-900 dark:text-fuchsia-400 mb-1.5 flex items-center gap-2 transition-colors">
                      우측 하단 버튼을 적극 활용해 주세요!
                    </h4>
                    <p className="text-[11px] text-gray-700 dark:text-gray-400 leading-relaxed break-keep transition-colors">
                      화면 <span className="font-bold text-fuchsia-600 dark:text-fuchsia-300 bg-fuchsia-100 dark:bg-fuchsia-500/20 px-1 py-0.5 rounded transition-colors">우측 하단의 [의견 남기기]</span> 버튼을 통해 어떤 의견이든 편하게 남겨주시면 큰 힘이 됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-6 bg-indigo-50/50 dark:bg-indigo-950/10 transition-colors">
              <div>
                <h3 className="text-base font-black text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                  03/27 올띵 업데이트 안내
                </h3>
                <p className="text-[12px] text-gray-800 dark:text-gray-300 break-keep leading-relaxed transition-colors mb-3">
                  새로운 기능과 변경사항이 포함된 <strong>03/27 올띵 업데이트</strong>가 적용되었습니다!
                </p>

                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-3 transition-colors mb-4">
                  <p className="text-[11px] text-amber-800 dark:text-amber-200 font-bold leading-relaxed break-keep transition-colors">
                    ※ 개인 설정 데이터 보호용 클라우드 동기화(로그인) 기능이 추가되었습니다.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#111] border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-5 shadow-sm transition-colors text-center">
                <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-2 transition-colors">
                  자세한 내용은 패치노트에서 확인하세요
                </h4>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 break-keep mb-4 transition-colors">
                  상단 메뉴의 '패치노트' 게시판을 통해 이번 업데이트의 모든 상세 내역을 확인하실 수 있습니다.
                </p>
                <a href="/note" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-colors">
                  패치노트 바로가기
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-[#050505] border-t border-gray-200 dark:border-white/5 px-6 py-4 flex items-center justify-between shrink-0 transition-colors">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="peer appearance-none w-5 h-5 border-2 border-gray-400 dark:border-gray-600 rounded bg-white dark:bg-transparent checked:bg-fuchsia-500 dark:checked:bg-fuchsia-600 checked:border-fuchsia-500 dark:checked:border-fuchsia-600 transition-all cursor-pointer"
                  checked={dontShowTodayMain}
                  onChange={(e) => setDontShowTodayMain(e.target.checked)}
                />
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors select-none">
                오늘 하루 보지 않기
              </span>
            </label>
            
            <button 
              onClick={handleCloseMain}
              className="bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-900 dark:text-white text-sm font-bold px-8 py-2.5 rounded-lg transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 shadow-sm dark:shadow-none"
            >
              닫기
            </button>
          </div>
        </div>
      ) : (
        // xl 화면에서 메인 팝업이 닫혔을 때 공간 유지용 플레이스홀더
        <div className="hidden xl:block w-[1150px] shrink-0 pointer-events-none" />
      )}

      {isOpenRpg && (
        <div className="pointer-events-auto animate-fade-in bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl w-full md:w-[400px] h-fit shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden shrink-0 transition-colors relative">
          
          <div className="border-b border-gray-100 dark:border-white/5 px-6 py-5 shrink-0 transition-colors">
            <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight">
              RPG 업데이트 제보 안내
            </h2>
          </div>
          
          <div className="flex-1 px-8 py-10 flex flex-col justify-center text-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight break-keep">
                필요한 툴 및 기능 제보 요청
              </h3>
              <div className="w-8 h-1 bg-gray-300 dark:bg-gray-700 mx-auto rounded-full" />
              <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed break-keep">
                RPG 콘텐츠 출시에 따라 올띵에 추가되었으면 하는 툴이나 기능을 제보해 주시기 바랍니다.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-5">
              <p className="text-[12px] text-gray-800 dark:text-gray-300 font-bold break-keep leading-relaxed">
                화면 우측 하단의 <span className="inline-block font-black text-indigo-600 dark:text-indigo-400 px-1">[의견 남기기]</span> 버튼을 통해 제보하실 수 있습니다.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-[#050505] border-t border-gray-200 dark:border-white/5 px-6 py-4 flex items-center justify-between shrink-0 transition-colors">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="peer appearance-none w-5 h-5 border-2 border-gray-400 dark:border-gray-600 rounded bg-white dark:bg-transparent checked:bg-indigo-500 dark:checked:bg-indigo-600 checked:border-indigo-500 dark:checked:border-indigo-600 transition-all cursor-pointer"
                  checked={dontShowTodayRpg}
                  onChange={(e) => setDontShowTodayRpg(e.target.checked)}
                />
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors select-none">
                오늘 하루 보지 않기
              </span>
            </label>
            
            <button 
              onClick={handleCloseRpg}
              className="bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-900 dark:text-white text-sm font-bold px-8 py-2.5 rounded-lg transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 shadow-sm dark:shadow-none"
            >
              닫기
            </button>
          </div>
        </div>
      )}

    </div>
  );
}