'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function WelcomePopup() {
  const [isOpenMain, setIsOpenMain] = useState(false);
  const [dontShowTodayMain, setDontShowTodayMain] = useState(false);
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

    const timer = setTimeout(() => {
      if (shouldOpenMain) setIsOpenMain(true);
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

  if (!isOpenMain || pathname !== '/') return null;

  return (
    <div className="fixed top-20 left-4 md:top-24 md:left-8 z-[999] pointer-events-none animate-fade-in-up">
      <div className="pointer-events-auto bg-white dark:bg-gray-950 w-[400px] h-[650px] rounded-none shadow-[0_10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden border border-gray-300 dark:border-gray-700">
        
        <div className="bg-indigo-600 px-6 py-5 shrink-0 text-center relative z-10 rounded-none border-none">
          <h2 className="text-[1.1rem] sm:text-xl font-black text-white tracking-tighter drop-shadow-md">
            올띵에 오신 것을 환영합니다!
          </h2>
        </div>
        <div className="flex-1 flex flex-col p-5 pt-7 gap-3 text-gray-800 dark:text-gray-100 z-0 overflow-hidden bg-white dark:bg-transparent">
          
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-700 rounded-none p-3 text-center shrink-0">
            <p className="text-rose-600 dark:text-rose-400 text-[12px] sm:text-[13px] font-black leading-snug break-keep tracking-tight">
              본 사이트는 띵타이쿤 유저가 개인적으로 제작한 <br className="hidden sm:block"/>
              <span className="underline underline-offset-2 decoration-rose-400 dark:decoration-rose-500/50">비공식 유저 웹사이트</span>이며, 공식 서비스가 아닙니다.
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-2.5 justify-center">
            
            <div className="flex gap-3 items-center bg-white dark:bg-gray-900 rounded-none p-3 shadow-sm border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
              <div className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 w-8 h-8 flex items-center justify-center shrink-0 font-black text-sm rounded-none border border-rose-200 dark:border-rose-700 shadow-inner">!</div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-[12px] font-black text-gray-900 dark:text-gray-100 mb-0.5 transition-colors">정보의 최신성 보장 불가</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 dark:text-gray-400 leading-tight break-keep transition-colors">제공 데이터는 최신이 아닐 수 있으며, 리소스 출처는 '띵타이쿤 온라인'에 있습니다.</p>
              </div>
            </div>

            <div className="flex gap-3 items-center bg-white dark:bg-gray-900 rounded-none p-3 shadow-sm border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
              <div className="bg-fuchsia-100 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400 w-8 h-8 flex items-center justify-center shrink-0 font-black text-sm rounded-none border border-fuchsia-200 dark:border-fuchsia-700 shadow-inner">⚙</div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-[12px] font-black text-gray-900 dark:text-gray-100 mb-0.5 transition-colors">개인설정 필수</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 dark:text-gray-400 leading-tight break-keep transition-colors">우측 상단 톱니바퀴에서 스탯을 설정해야 정확한 수익 계산이 이루어집니다.</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-center bg-white dark:bg-gray-900 rounded-none p-3 shadow-sm border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
              <div className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 w-8 h-8 flex items-center justify-center shrink-0 font-black text-sm rounded-none border border-indigo-200 dark:border-indigo-700 shadow-inner">💻</div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-[12px] font-black text-gray-900 dark:text-gray-100 mb-0.5 transition-colors">PC 접속 강력 권장</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 dark:text-gray-400 leading-tight break-keep transition-colors">수많은 표와 시뮬레이터가 포함되어 있어 PC 환경에 최적화되어 있습니다.</p>
              </div>
            </div>

            <div className="flex gap-3 items-center bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-700 rounded-none p-3 shadow-sm mt-1 transition-colors">
              <div className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center shrink-0 font-black rounded-none text-[12px] border border-blue-700 dark:border-blue-500 shadow-inner">N</div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-[12px] font-black text-blue-900 dark:text-blue-100 mb-0.5 transition-colors">05-14 업데이트 적용 완료</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-blue-700/80 dark:text-blue-300/80 leading-tight break-keep mb-1.5 transition-colors">새로운 기능과 변경점들을 확인하세요!</p>
                <Link href="/note" onClick={handleCloseMain} className="inline-block bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-none active:scale-95 transition-all shadow-sm">패치노트 보기</Link>
              </div>
            </div>

          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-900 px-6 py-5 flex items-center justify-between shrink-0 border-t border-gray-300 dark:border-gray-700 rounded-none border-x-none border-b-none">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative flex items-center justify-center w-5 h-5 bg-white dark:bg-gray-950 border-2 border-gray-400 dark:border-gray-600 rounded-none">
              <input 
                type="checkbox" 
                className="peer appearance-none w-full h-full cursor-pointer rounded-none"
                checked={dontShowTodayMain}
                onChange={(e) => setDontShowTodayMain(e.target.checked)}
              />
              {dontShowTodayMain && <span className="absolute text-indigo-600 text-[16px] font-black pointer-events-none pb-[2px]">✓</span>}
            </div>
            <span className="text-[11px] sm:text-[12px] font-black text-gray-600 dark:text-gray-400 select-none group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
              오늘 하루 보지 않기
            </span>
          </label>
          
          <button 
            onClick={handleCloseMain}
            className="bg-gray-800 hover:bg-black dark:bg-gray-200 dark:hover:bg-white text-white dark:text-gray-950 text-[11px] sm:text-[12px] font-black px-6 py-2.5 rounded-none transition-all active:scale-95 shadow-md border-none"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
}