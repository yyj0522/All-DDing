'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes'; 
import CloudSyncModal from '@/components/CloudSyncModal';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false); 
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem('alldding_logged_in_user');
    if (user) setLoggedInUser(user);
  }, []);

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

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?\n로그아웃하면 로그인 전(게스트) 상태의 데이터로 돌아갑니다.')) {
      
      const SYNC_KEYS = ['ocean_trade_v2', 'alldding_profession', 'alldding_sage_tools', 'alldding_prices', 'alldding_misc_settings', 'alldding_skill'];
      
      SYNC_KEYS.forEach(key => {
        const backupData = localStorage.getItem(`guest_backup_${key}`);
        if (backupData) {
          localStorage.setItem(key, backupData);
          localStorage.removeItem(`guest_backup_${key}`);
        } else {
          localStorage.removeItem(key);
        }
      });

      localStorage.removeItem('alldding_logged_in_user');
      setLoggedInUser(null);
      window.location.reload();
    }
  };

  const navLinks = [
    { name: '요리 효율', href: '/efficiency', color: 'text-indigo-600 dark:text-indigo-400', shadow: 'rgba(99,102,241,0.5)' },
    { name: '전문가', href: '/profession', color: 'text-amber-600 dark:text-amber-400', shadow: 'rgba(251,191,36,0.5)' },
    { name: '확률형 아이템', href: '/gacha', color: 'text-fuchsia-600 dark:text-fuchsia-400', shadow: 'rgba(217,70,239,0.5)' },
    { name: '아일랜드 지도', href: '/map', color: 'text-emerald-600 dark:text-emerald-400', shadow: 'rgba(16,185,129,0.5)' },
    { name: '자료실', href: '/resources', color: 'text-cyan-600 dark:text-cyan-400', shadow: 'rgba(34,211,238,0.5)' },
    { name: '패치노트', href: '/note', color: 'text-rose-600 dark:text-rose-400', shadow: 'rgba(244,63,94,0.5)' },
  ];

  const getLinkClass = (path: string, activeColor: string, activeShadow: string) => {
    const isActive = pathname && pathname.startsWith(path);
    if (isActive) {
      return `${activeColor} bg-white dark:bg-transparent px-3 py-1.5 rounded-lg drop-shadow-md dark:drop-shadow-[0_0_8px_${activeShadow}] transition-all`;
    }
    return "text-gray-900 dark:text-gray-400 hover:text-gray-600 dark:hover:text-white px-3 py-1.5 transition-colors";
  };

  return (
    <>
      <div className="fixed top-4 md:top-6 left-0 right-0 z-[60] flex justify-center px-4">
        <nav className="flex items-center justify-between w-full max-w-6xl px-6 py-4 bg-white dark:bg-black/80 border border-gray-200 dark:border-white/5 backdrop-blur-xl rounded-2xl md:rounded-full shadow-lg dark:shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-colors">
          <Link href="/" className="flex-shrink-0 md:mr-8 group relative z-[70]">
            <span className="text-xl md:text-2xl font-black text-black dark:text-white tracking-widest transition-all duration-500 group-hover:tracking-[0.3em] drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
              올띵
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-2 lg:gap-4 text-[13px] lg:text-sm font-black tracking-wide flex-1 justify-center whitespace-nowrap">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={getLinkClass(link.href, link.color, link.shadow)}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4 relative z-[70]">
            <Link href="/settings" className={`p-2 rounded-full transition-all ${pathname === '/settings' ? 'bg-gray-100 dark:bg-white/10 text-black dark:text-white shadow-inner dark:shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'text-gray-900 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </Link>

            {loggedInUser ? (
              <button onClick={handleLogout} className="p-2 rounded-full text-indigo-600 dark:text-indigo-400 hover:text-white hover:bg-indigo-500 dark:hover:bg-indigo-500/20 transition-all shadow-sm" title="로그아웃 (클라우드 연동 중)">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="p-2 rounded-full text-gray-900 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all" title="클라우드 동기화 (로그인)">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </button>
            )}

            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full text-gray-900 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all" aria-label="Toggle Dark Mode">
              {mounted ? (
                theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> 
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )
              ) : (
                <div className="w-5 h-5"></div>
              )}
            </button>

            <button className="md:hidden text-gray-900 dark:text-gray-400 hover:text-black dark:hover:text-white p-2 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
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

      <div className={`fixed inset-0 z-50 md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-2xl transition-all duration-500 ease-in-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-8 px-6 text-center">
          {navLinks.map((link, idx) => {
            const isActive = pathname && pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-2xl font-black tracking-tighter transition-all duration-300 transform ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <span className={`block text-xs uppercase tracking-[0.3em] mb-1 ${link.color}`}>{link.href.replace('/', '')}</span>
                {link.name}
              </Link>
            );
          })}
          <div className={`w-12 h-px bg-gray-300 dark:bg-white/10 my-4 transition-all duration-700 ${isMenuOpen ? 'scale-x-100' : 'scale-x-0'}`} />
          <Link href="/settings" className={`text-gray-500 dark:text-gray-400 font-bold hover:text-gray-900 dark:hover:text-white transition-all ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '600ms' }}>설정 및 데이터 관리</Link>
        </div>
      </div>

      <CloudSyncModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}