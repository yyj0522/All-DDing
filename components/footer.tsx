'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-gray-200 dark:border-white/5 bg-white dark:bg-[#050505] mt-auto transition-colors pb-8 md:pb-0">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
          <span className="text-xl font-black text-black dark:text-white tracking-widest mb-1 drop-shadow-md dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            올띵
          </span>
          <span className="text-xs font-medium text-fuchsia-600 dark:text-fuchsia-500/80 tracking-wide mb-4">
            띵타이쿤 플레이어를 위한 비공식 종합 도구 모음
          </span>
          
          <div className="text-[10px] text-gray-500 dark:text-gray-500/70 space-y-1.5 font-medium leading-relaxed">
            <p>
              올띵(All-Dding)은 띵타이쿤 유저가 제작한 <span className="font-bold text-gray-700 dark:text-gray-400">비공식 사이트</span>이며 공식 운영진과 무관합니다.
            </p>
            <p>
              사이트 내 사용된 모든 게임 관련 이미지 및 리소스의 출처와 저작권은 <span className="font-bold text-gray-700 dark:text-gray-400">'띵타이쿤 온라인'</span>에 있습니다.
            </p>
            <div className="mt-3 flex items-center justify-center md:justify-start gap-3">
              <Link href="/privacy" className="text-gray-700 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-bold underline underline-offset-4 decoration-gray-300 dark:decoration-white/20">
                개인정보 처리방침
              </Link>
              <span className="w-1 h-1 bg-gray-300 dark:bg-white/10 rounded-full"></span>
              <span className="text-[9px]">© 2026 All-Dding</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end text-sm shrink-0 gap-4">
          <div className="flex flex-col items-center md:items-end">
            <span className="text-gray-500 dark:text-gray-400 font-bold mb-1 text-xs">문의 및 오류 제보</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">우측 하단의 채팅 버튼을 이용해주세요.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}