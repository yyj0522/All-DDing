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
    { name: '요리 효율', href: '/efficiency', color: 'text-indigo-600 dark:text-indigo-400' },
    { name: '전문가', href: '/profession', color: 'text-amber-600 dark:text-amber-400' },
    { name: '스펙업 가이드', href: '/spec', color: 'text-violet-600 dark:text-violet-400' },
    { name: '확률형 아이템', href: '/gacha', color: 'text-fuchsia-600 dark:text-fuchsia-400' },
    { name: '아일랜드 지도', href: '/map', color: 'text-emerald-600 dark:text-emerald-400' },
    { name: '자료실', href: '/resources', color: 'text-cyan-600 dark:text-cyan-400' },
    { name: '패치노트', href: '/note', color: 'text-rose-600 dark:text-rose-400' },
  ];

  const getLinkClass = (path: string, activeColor: string) => {
    const isActive = pathname && pathname.startsWith(path);
    if (isActive) {
      return `${activeColor} bg-slate-200 dark:bg-zinc-700 px-3 py-1.5 rounded-lg border-b-2 border-slate-300 dark:border-zinc-900 shadow-[0_2px_0_rgba(0,0,0,0.05)] dark:shadow-[0_2px_0_rgba(0,0,0,0.3)] transition-all font-black`;
    }
    return "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors font-bold";
  };

  return (
    <>
      <div className="absolute top-4 md:top-6 left-0 right-0 z-[60] flex justify-center px-4">
        <nav className={`flex items-center justify-between w-full max-w-6xl px-6 py-3 rounded-2xl transition-all duration-300 border-2 border-b-4 ${
          isMenuOpen 
            ? 'border-transparent bg-transparent shadow-none backdrop-blur-none dark:border-transparent dark:bg-transparent md:bg-slate-50/95 md:dark:bg-zinc-800/95 md:border-slate-200 md:dark:border-zinc-700 md:shadow-[4px_4px_0_rgba(0,0,0,0.05)] md:dark:shadow-[4px_4px_0_rgba(0,0,0,0.3)] md:backdrop-blur-xl' 
            : 'bg-slate-50/95 dark:bg-zinc-800/95 border-slate-200 dark:border-zinc-700 shadow-[4px_4px_0_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_0_rgba(0,0,0,0.3)] backdrop-blur-xl'
        }`}>
          <Link href="/" className="flex-shrink-0 md:mr-8 group relative z-[70] hover:scale-105 active:scale-95 transition-transform">
            <span className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-widest transition-all duration-300 drop-shadow-sm">
              올띵
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1 lg:gap-3 text-[13px] lg:text-sm flex-1 justify-center whitespace-nowrap">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={getLinkClass(link.href, link.color)}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 relative z-[70]">
            <Link href="/settings" className={`p-2 rounded-xl transition-all border-2 border-transparent active:translate-y-0.5 ${pathname === '/settings' ? 'bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-white border-slate-300 dark:border-zinc-900' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-700'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </Link>

            {loggedInUser ? (
              <button onClick={handleLogout} className="p-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:text-white hover:bg-indigo-500 transition-all border-2 border-transparent active:translate-y-0.5" title="로그아웃">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all border-2 border-transparent active:translate-y-0.5" title="로그인">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </button>
            )}

            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all border-2 border-transparent active:translate-y-0.5" aria-label="Toggle Dark Mode">
              {mounted ? (
                theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> 
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )
              ) : (
                <div className="w-5 h-5"></div>
              )}
            </button>

            <button className="md:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-xl border-2 border-transparent transition-all active:translate-y-0.5" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </div>

      <div className={`fixed inset-0 z-50 md:hidden bg-slate-50/95 dark:bg-zinc-900/95 backdrop-blur-xl transition-all duration-500 ease-in-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-6 text-center">
          {navLinks.map((link, idx) => {
            const isActive = pathname && pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-2xl font-black tracking-tighter transition-all duration-300 transform ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <span className={`block text-xs font-bold uppercase tracking-widest mb-1 ${link.color}`}>{link.href.replace('/', '')}</span>
                {link.name}
              </Link>
            );
          })}
          <div className={`w-12 h-1 bg-slate-300 dark:bg-zinc-700 my-4 transition-all duration-700 rounded-full ${isMenuOpen ? 'scale-x-100' : 'scale-x-0'}`} />
          <Link href="/settings" className={`text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-slate-100 transition-all ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '600ms' }}>설정 및 데이터 관리</Link>
        </div>
      </div>

      <CloudSyncModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}