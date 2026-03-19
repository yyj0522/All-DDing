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
    <div className="fixed top-20 left-4 md:top-24 md:left-8 z-[999] animate-fade-in pointer-events-auto max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] flex flex-col">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full md:w-[760px] lg:w-[840px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col max-h-full overflow-hidden">
        
        <div className="bg-gradient-to-r from-fuchsia-600/10 via-fuchsia-500/5 to-transparent border-b border-white/5 px-6 py-5 shrink-0">
          <h2 className="text-lg font-black text-white tracking-tight">
            올띵(All-Dding)에 오신 것을 환영합니다!
          </h2>
        </div>
        
        <div className="flex flex-col md:flex-row overflow-y-auto">
          <div className="flex-1 p-6 space-y-5 border-b md:border-b-0 md:border-r border-white/5">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-sm font-bold leading-relaxed text-center break-keep">
                본 사이트는 띵타이쿤 유저가 개인적으로 제작한 <br className="hidden sm:block" />
                <span className="text-red-300 underline underline-offset-4 decoration-red-500/50">비공식 유저 웹사이트</span>이며, 공식 서비스가 아닙니다.
              </p>
            </div>

            <ul className="space-y-3">
              <li className="flex gap-4 items-start bg-rose-500/5 rounded-xl p-4 border border-rose-500/20">
                <div className="bg-rose-500/20 text-rose-400 p-2 rounded-lg shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-200 mb-1">정보의 최신성 보장 불가 안내</p>
                  <p className="text-[11px] text-gray-400 leading-relaxed break-keep">
                    본 사이트에서 제공하는 모든 데이터와 텍스트는 <span className="font-bold text-gray-300">최신 정보가 아닐 수 있습니다.</span> 또한 사이트 내 모든 게임 리소스(이미지 등)의 출처와 저작권은 전적으로 <span className="font-bold text-gray-300">'띵타이쿤 온라인'</span>에 있습니다.
                  </p>
                </div>
              </li>

              <li className="flex gap-4 items-start bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="bg-fuchsia-500/20 text-fuchsia-400 p-2 rounded-lg shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-200 mb-1">우측 상단 개인설정 필수</p>
                  <p className="text-[11px] text-gray-400 leading-relaxed break-keep">자신의 인게임 스탯과 능력을 설정해야 정확한 시세 및 수익 계산이 이루어집니다.</p>
                </div>
              </li>
              
              <li className="flex gap-4 items-start bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="bg-blue-500/20 text-blue-400 p-2 rounded-lg shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-200 mb-1">PC 접속 강력 권장</p>
                  <p className="text-[11px] text-gray-400 leading-relaxed break-keep">수많은 데이터 표와 시뮬레이터가 포함되어 있어, 모바일보다 PC 환경에 최적화되어 있습니다.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="flex-1 p-6 space-y-6 bg-gradient-to-br from-amber-500/5 to-emerald-500/5">
            <div>
              <h3 className="text-base font-black text-white mb-2 flex items-center gap-2">
                업데이트 및 의견 제보 안내
              </h3>
              <p className="text-xs text-gray-400 break-keep leading-relaxed">
                올띵은 유저 여러분의 피드백으로 완성됩니다. 새로 추가된 기능이나 개선이 필요한 부분에 대해 자유롭게 의견을 남겨주세요!
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <h4 className="text-sm font-bold text-amber-400 mb-1">사냥꾼 관련 제보 요청</h4>
                <p className="text-[11px] text-gray-300 leading-relaxed break-keep">
                  전문가 페이지에 사냥꾼 전용 아이템 레시피가 추가되었습니다. 일일수익 및 사냥꾼 관련 툴을 구현하기에 이해도와 정보가 부족한 상황입니다. 사냥꾼의 수익구조와 플레이 루틴등을 제보해주시면 큰 도움이 될 것 같습니다.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <h4 className="text-sm font-bold text-emerald-400 mb-1">필요한 툴을 제안해 주세요</h4>
                <p className="text-[11px] text-gray-300 leading-relaxed break-keep">
                  현재 사이트에 없지만, 전문가 활동이나 띵타이쿤 플레이에 <span className="text-white font-bold">도움이 될 만한 계산기나 편의 기능</span>이 있다면 적극적으로 아이디어를 제보해 주세요.
                </p>
              </div>

              <div className="bg-gradient-to-r from-fuchsia-600/20 to-purple-600/20 border border-fuchsia-500/30 rounded-xl p-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-fuchsia-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative z-10">
                  <h4 className="text-sm font-black text-white mb-1.5 flex items-center gap-2">
                    우측 하단 버튼을 적극 활용해 주세요!
                  </h4>
                  <p className="text-[11px] text-fuchsia-100/80 leading-relaxed break-keep">
                    화면 <span className="font-bold text-white bg-fuchsia-500/30 px-1 py-0.5 rounded">우측 하단의 [의견 남기기]</span> 버튼을 통해 오타, 잘못된 데이터 수정 요청, 새로운 아이디어 등 어떤 의견이든 편하게 남겨주시면 큰 힘이 됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#050505] border-t border-white/5 px-6 py-4 flex items-center justify-between shrink-0">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-transparent checked:bg-fuchsia-600 checked:border-fuchsia-600 transition-all cursor-pointer"
                checked={dontShowToday}
                onChange={(e) => setDontShowToday(e.target.checked)}
              />
              <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors select-none">
              오늘 하루 보지 않기
            </span>
          </label>
          
          <button 
            onClick={handleClose}
            className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-8 py-2.5 rounded-lg transition-all border border-white/10 hover:border-white/20"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}