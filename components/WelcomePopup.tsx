'use client';

import { useState, useEffect } from 'react';

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        
        <div className="bg-gradient-to-r from-fuchsia-600/10 via-fuchsia-500/5 to-transparent border-b border-white/5 px-6 py-5">
          <h2 className="text-lg font-black text-white tracking-tight">
            올띵(All-Dding)에 오신 것을 환영합니다!
          </h2>
        </div>
        
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 text-sm font-bold leading-relaxed text-center">
              본 사이트는 띵타이쿤 유저가 개인적으로 제작한 <br/>
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
                <p className="text-[11px] text-gray-400 leading-relaxed">
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
                <p className="text-[11px] text-gray-400 leading-relaxed">자신의 인게임 스탯과 능력을 설정해야 정확한 시세 및 수익 계산이 이루어집니다.</p>
              </div>
            </li>
            
            <li className="flex gap-4 items-start bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="bg-blue-500/20 text-blue-400 p-2 rounded-lg shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-200 mb-1">PC 접속 강력 권장</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">수많은 데이터 표와 시뮬레이터가 포함되어 있어, 모바일보다 PC 환경에 최적화되어 있습니다.</p>
              </div>
            </li>

            <li className="flex gap-4 items-start bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-200 mb-1">데이터 부족 및 제보 환영</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">개인이 제작하다보니 일부 전문가/콘텐츠의 경우 아직 데이터나 이해도가 부족할 수 있습니다. 우측 하단 <span className="text-gray-300 font-bold">[문의/오류 제보]</span>를 통해 의견을 남겨주시면 반영하겠습니다!</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-[#050505] border-t border-white/5 px-6 py-4 flex items-center justify-between">
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
            className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-all border border-white/10 hover:border-white/20"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}