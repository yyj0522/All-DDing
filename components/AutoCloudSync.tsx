'use client';

import { useEffect, useState, useRef } from 'react';

const SYNC_KEYS = [
  'ocean_trade_v3',
  'ocean_trade_v2', 
  'alldding_profession', 
  'alldding_sage_tools', 
  'alldding_prices', 
  'alldding_misc_settings', 
  'alldding_skill',
  'alldding_cook_inventory',
  'alldding_cook_settings'
];

export default function AutoCloudSync() {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const lastSyncedDataRef = useRef<string | null>(null);

  useEffect(() => {
    const syncToCloud = async () => {
      const loggedInUser = localStorage.getItem('alldding_logged_in_user');
      if (!loggedInUser) return;

      const currentSettings: Record<string, any> = {};
      let hasData = false;

      SYNC_KEYS.forEach(key => {
        const localData = localStorage.getItem(key);
        if (localData) {
          currentSettings[key] = JSON.parse(localData);
          hasData = true;
        }
      });

      if (hasData) {
        const currentDataString = JSON.stringify(currentSettings);

        if (lastSyncedDataRef.current === currentDataString) {
          return; 
        }

        setIsSaving(true);
        
        try {
          const res = await fetch('/api/auth/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'sync',
              username: loggedInUser,
              settings: currentSettings
            })
          });

          if (res.ok) {
            lastSyncedDataRef.current = currentDataString;
            const now = new Date();
            setLastSavedTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
          }
        } catch (error) {
          console.error('동기화 오류:', error);
        }

        setTimeout(() => {
          setIsSaving(false);
        }, 3000);
      }
    };

    const intervalId = setInterval(syncToCloud, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const loggedInUser = typeof window !== 'undefined' ? localStorage.getItem('alldding_logged_in_user') : null;
  if (!loggedInUser) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] transition-all duration-500 transform ${isSaving ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
      <div className="bg-indigo-600/90 backdrop-blur-md border border-indigo-400/30 text-white px-5 py-3.5 rounded-2xl shadow-[0_10px_40px_rgba(79,70,229,0.3)] flex items-center gap-3">
        <svg className="w-5 h-5 animate-spin text-indigo-200" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight">클라우드 데이터 자동 저장 중...</span>
          {lastSavedTime && <span className="text-[10px] text-indigo-200 font-medium">최근 동기화: {lastSavedTime}</span>}
        </div>
      </div>
    </div>
  );
}