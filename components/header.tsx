'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();

  const getLinkClass = (path: string, activeColor: string) => {
    if (pathname && pathname.startsWith(path)) {
      return `${activeColor} transition-colors`;
    }
    return "text-gray-400 hover:text-white transition-colors";
  };

  return (
    <div className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="flex items-center justify-between w-full max-w-6xl px-6 py-4 bg-black/80 border border-white/5 backdrop-blur-xl rounded-2xl md:rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <Link href="/" className="flex-shrink-0 md:mr-8 group">
          <span 
            className="text-xl md:text-2xl font-black text-white tracking-widest transition-all duration-500 group-hover:tracking-[0.3em]" 
            style={{ textShadow: '0 0 10px rgba(255,255,255,0.8)' }}
          >
            올띵
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[13px] lg:text-sm font-semibold tracking-wide flex-1 justify-center whitespace-nowrap">
          <Link href="/efficiency" className={getLinkClass('/efficiency', 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]')}>
            요리 효율
          </Link>
          <Link href="/profession" className={getLinkClass('/profession', 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]')}>
            전문가
          </Link>
          <Link href="/gacha" className={getLinkClass('/gacha', 'text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]')}>
            확률형 아이템
          </Link>
          <Link href="/map" className={getLinkClass('/map', 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]')}>
            아일랜드 지도
          </Link>
          <Link href="/resources" className={getLinkClass('/resources', 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]')}>
            자료실
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/settings" className={`p-2 rounded-full transition-all ${pathname === '/settings' ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
          <div className="md:hidden text-gray-400 cursor-pointer p-2" onClick={onMenuClick}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
        </div>
      </nav>
    </div>
  );
}