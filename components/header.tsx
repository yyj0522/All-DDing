'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: '요리 효율', href: '/efficiency', color: 'text-indigo-400', shadow: 'rgba(99,102,241,0.5)' },
    { name: '전문가', href: '/profession', color: 'text-amber-400', shadow: 'rgba(251,191,36,0.5)' },
    { name: '확률형 아이템', href: '/gacha', color: 'text-fuchsia-400', shadow: 'rgba(217,70,239,0.5)' },
    { name: '아일랜드 지도', href: '/map', color: 'text-emerald-400', shadow: 'rgba(16,185,129,0.5)' },
    { name: '자료실', href: '/resources', color: 'text-cyan-400', shadow: 'rgba(34,211,238,0.5)' },
  ];

  const getLinkClass = (path: string, activeColor: string, activeShadow: string) => {
    const isActive = pathname && pathname.startsWith(path);
    if (isActive) {
      return `${activeColor} transition-colors drop-shadow-[0_0_8px_${activeShadow}]`;
    }
    return "text-gray-400 hover:text-white transition-colors";
  };

  return (
    <>
      <div className="fixed top-4 md:top-6 left-0 right-0 z-[60] flex justify-center px-4">
        <nav className="flex items-center justify-between w-full max-w-6xl px-6 py-4 bg-black/80 border border-white/5 backdrop-blur-xl rounded-2xl md:rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          <Link href="/" className="flex-shrink-0 md:mr-8 group relative z-[70]">
            <span 
              className="text-xl md:text-2xl font-black text-white tracking-widest transition-all duration-500 group-hover:tracking-[0.3em]" 
              style={{ textShadow: '0 0 10px rgba(255,255,255,0.8)' }}
            >
              올띵
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[13px] lg:text-sm font-semibold tracking-wide flex-1 justify-center whitespace-nowrap">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={getLinkClass(link.href, link.color, link.shadow)}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4 relative z-[70]">
            <Link href="/settings" className={`p-2 rounded-full transition-all ${pathname === '/settings' ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            <button 
              className="md:hidden text-gray-400 hover:text-white p-2 transition-colors" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </div>

      <div 
        className={`fixed inset-0 z-50 md:hidden bg-black/95 backdrop-blur-2xl transition-all duration-500 ease-in-out ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8 px-6 text-center">
          {navLinks.map((link, idx) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-2xl font-black tracking-tighter transition-all duration-300 transform ${
                isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ 
                transitionDelay: `${idx * 100}ms`,
                color: pathname && pathname.startsWith(link.href) ? 'white' : 'rgb(156 163 175)'
              }}
            >
              <span className={`block text-xs uppercase tracking-[0.3em] mb-1 ${link.color}`}>
                {link.href.replace('/', '')}
              </span>
              {link.name}
            </Link>
          ))}
          
          <div className={`w-12 h-px bg-white/10 my-4 transition-all duration-700 ${isMenuOpen ? 'scale-x-100' : 'scale-x-0'}`} />
          
          <Link 
            href="/settings"
            className={`text-gray-400 font-bold hover:text-white transition-all ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: '600ms' }}
          >
            설정 및 데이터 관리
          </Link>
        </div>
      </div>
    </>
  );
}