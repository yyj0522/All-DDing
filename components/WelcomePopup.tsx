'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const hideUntil = localStorage.getItem('hideWelcomePopup');
    if (hideUntil) {
      const now = new Date().getTime();
      if (now < parseInt(hideUntil, 10)) {
        return; 
      } else {
        localStorage.removeItem('hideWelcomePopup');
      }
    }
    const timer = setTimeout(() => setIsOpen(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    if (dontShowToday) {
      const now = new Date().getTime();
      const nextDay = now + 24 * 60 * 60 * 1000;
      localStorage.setItem('hideWelcomePopup', nextDay.toString());
    }
    setIsOpen(false);
  };

  if (!isOpen || pathname !== '/') return null;

  return (
    <div className="fixed top-20 left-4 md:top-24 md:left-8 z-[999] animate-fade-in pointer-events-auto max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] flex flex-col transition-colors duration-300">
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl w-full md:w-[760px] lg:w-[1150px] shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col max-h-full overflow-hidden transition-colors">
        
        {/* 상단바 배경을 검은색(bg-black), 텍스트를 흰색(text-white)으로 고정 */}
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

          {/* 두 번째 단: 기존 업데이트 안내 */}
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

          {/* 세 번째 단: 투표 결과 및 업데이트 계획 안내 */}
          <div className="flex-1 p-6 space-y-6 bg-indigo-50/50 dark:bg-indigo-950/10 transition-colors">
            <div>
              <h3 className="text-base font-black text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                로그인 기능 도입 투표 결과
              </h3>
              <p className="text-[12px] text-gray-800 dark:text-gray-300 break-keep leading-relaxed transition-colors mb-3">
                지난 2일간 진행된 '로그인 기능 도입' 투표에 총 <strong>139명</strong>의 유저분들이 참여해 주셨으며, 그중 약 <strong>88%(122명)</strong>가 찬성해 주셨습니다. 참여해 주셔서 감사합니다!
              </p>

              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-3 transition-colors">
                <p className="text-[11px] text-amber-800 dark:text-amber-200 font-bold leading-relaxed break-keep transition-colors">
                  ※ 로그인을 하지 않아도 사이트의 모든 기능은 그대로 이용하실 수 있습니다. 단, 이번처럼 부득이하게 도메인이 변경되는 경우 <span className="text-red-600 dark:text-red-400 underline underline-offset-2">저장했던 개인 설정이 초기화되며, 미로그인 상태의 데이터는 보호 및 복구가 불가능</span>하다는 점 양해 부탁드립니다.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111] border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-5 shadow-sm transition-colors">
              <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                향후 업데이트 우선순위 안내
              </h4>
              <p className="text-[11px] text-gray-700 dark:text-gray-400 leading-relaxed break-keep mb-4 transition-colors">
                로그인 기능은 사이트 코드를 전반적으로 재설계해야 하는 큰 작업입니다. 따라서 오늘 진행되는 인게임 대규모 업데이트 내용을 사이트에 먼저 반영한 후 순차적으로 개발할 예정입니다.
              </p>
              
              <ul className="space-y-2 text-[11px] font-bold">
                <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-500/20 transition-colors">
                  <span className="bg-emerald-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">1</span>
                  RPG 대규모 업데이트 데이터 동기화
                </li>
                <li className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-100 dark:border-amber-500/20 transition-colors">
                  <span className="bg-amber-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">2</span>
                  사냥꾼 전문가 일일 수익 계산기 구현
                </li>
                <li className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-2 rounded-lg border border-indigo-100 dark:border-indigo-500/20 transition-colors">
                  <span className="bg-indigo-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">3</span>
                  개인 설정 데이터 보호용 로그인 기능 추가
                </li>
              </ul>
            </div>
          </div>

        </div>

        <div className="bg-gray-100 dark:bg-[#050505] border-t border-gray-200 dark:border-white/5 px-6 py-4 flex items-center justify-between shrink-0 transition-colors">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                className="peer appearance-none w-5 h-5 border-2 border-gray-400 dark:border-gray-600 rounded bg-white dark:bg-transparent checked:bg-fuchsia-500 dark:checked:bg-fuchsia-600 checked:border-fuchsia-500 dark:checked:border-fuchsia-600 transition-all cursor-pointer"
                checked={dontShowToday}
                onChange={(e) => setDontShowToday(e.target.checked)}
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
            onClick={handleClose}
            className="bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-900 dark:text-white text-sm font-bold px-8 py-2.5 rounded-lg transition-all border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 shadow-sm dark:shadow-none"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}