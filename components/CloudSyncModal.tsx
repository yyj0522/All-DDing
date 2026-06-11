'use client';

import { useState, useRef } from 'react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function CloudSyncModal({ isOpen, onClose }: CloudSyncModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'showKey' | 'recover'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  
  const [keyParts, setKeyParts] = useState(['', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const generateRecoveryKey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let key = '';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) key += '-';
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const handleRegister = async () => {
    if (!username || password.length < 6) {
      setErrorMsg('아이디를 입력하고 비밀번호를 6자리 이상 설정해주세요.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    try {
      const newKey = generateRecoveryKey();
      const currentSettings: Record<string, any> = {};
      
      SYNC_KEYS.forEach(key => {
        const localData = localStorage.getItem(key);
        if (localData) {
          currentSettings[key] = JSON.parse(localData);
          localStorage.setItem(`guest_backup_${key}`, localData);
        }
      });

      const res = await fetch('/api/auth/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          username,
          password,
          recoveryKey: newKey,
          settings: currentSettings
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '회원가입에 실패했습니다.');
      }

      localStorage.setItem('alldding_logged_in_user', username);
      setRecoveryKey(newKey);
      setMode('showKey');

    } catch (err: any) {
      setErrorMsg('오류가 발생했습니다: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMsg('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      localStorage.setItem('alldding_logged_in_user', username);

      SYNC_KEYS.forEach(key => {
        const localData = localStorage.getItem(key);
        if (localData) {
          localStorage.setItem(`guest_backup_${key}`, localData);
        }
      });

      if (data.settings && Object.keys(data.settings).length > 0) {
        Object.entries(data.settings).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });
        alert('클라우드 데이터를 성공적으로 불러왔습니다! 화면이 새로고침됩니다.');
      } else {
        alert('저장된 클라우드 데이터가 없어 현재 로컬 설정이 클라우드로 동기화됩니다.');
      }
      
      onClose();
      window.location.reload();

    } catch (err: any) {
      setErrorMsg('오류가 발생했습니다: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPartChange = (index: number, value: string) => {
    const val = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const newParts = [...keyParts];
    newParts[index] = val.slice(0, 4);
    setKeyParts(newParts);

    if (val.length === 4 && index < 2) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPartKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && keyParts[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleKeyPartPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (pastedText) {
      const p1 = pastedText.slice(0, 4);
      const p2 = pastedText.slice(4, 8);
      const p3 = pastedText.slice(8, 12);
      
      setKeyParts([p1, p2, p3]);
      
      if (pastedText.length >= 9) {
        inputRefs.current[2]?.focus();
      } else if (pastedText.length >= 5) {
        inputRefs.current[1]?.focus();
      } else {
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleRecover = async () => {
    const fullRecoveryKey = keyParts.join('-');
    
    if (!username || keyParts.some(part => part.length !== 4) || newPassword.length < 6) {
      setErrorMsg('아이디, 12자리 복구 키를 모두 입력하고 새 비밀번호를 6자리 이상 설정해주세요.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recover',
          username,
          recoveryKey: fullRecoveryKey,
          newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '비밀번호 재설정에 실패했습니다.');
      }

      alert('비밀번호가 성공적으로 변경되었습니다. 새로운 비밀번호로 로그인해주세요.');
      setMode('login');
      setPassword('');
      setNewPassword('');
      setKeyParts(['', '', '']);

    } catch (err: any) {
      setErrorMsg('오류가 발생했습니다: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recoveryKey);
    alert('마스터 복구 키가 클립보드에 복사되었습니다!');
  };

  const handleClose = () => {
    setMode('login');
    setUsername('');
    setPassword('');
    setNewPassword('');
    setRecoveryKey('');
    setKeyParts(['', '', '']);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden flex flex-col relative transition-colors">
        <button onClick={handleClose} className="absolute top-5 right-5 z-20 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-[#111113] hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 rounded-xl font-black transition-colors shadow-sm dark:shadow-none">
          ✕
        </button>

        {mode === 'showKey' ? (
          <div className="p-6 md:p-8 flex flex-col items-center text-center mt-2">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-transparent text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
              <span className="text-3xl font-black">!</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">가입 완료! 복구 키 발급</h3>
            <p className="text-xs md:text-sm text-red-600 dark:text-red-400 font-bold mb-6 break-keep leading-relaxed bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-200 dark:border-transparent shadow-sm">
              아래 마스터 복구 키는 지금 딱 한 번만 보여집니다.<br />
              이 키가 없으면 절대 계정을 찾을 수 없으니 반드시 복사해 두세요.
            </p>
            
            <div className="flex items-center w-full bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-transparent rounded-xl p-2.5 mb-8 gap-2 shadow-inner">
              <p className="flex-1 text-lg font-mono font-black text-indigo-600 dark:text-indigo-400 tracking-wider select-all text-center">
                {recoveryKey}
              </p>
              <button 
                onClick={copyToClipboard}
                className="px-4 py-2.5 bg-white dark:bg-black border border-gray-300 dark:border-transparent rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors font-black text-xs text-gray-700 dark:text-gray-300 shadow-sm active:scale-95"
                title="복사하기"
              >
                복사
              </button>
            </div>
            
            <button onClick={() => { handleClose(); window.location.reload(); }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl transition-all active:scale-95 shadow-md">
              안전하게 저장했습니다 (닫기)
            </button>
          </div>
        ) : mode === 'recover' ? (
          <div className="p-6 md:p-8 mt-2">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">비밀번호 찾기</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-8 break-keep font-bold">가입 시 발급받은 마스터 복구 키를 입력하여 비밀번호를 재설정합니다.</p>

            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-[11px] font-black text-gray-700 dark:text-gray-400 mb-1.5 px-1 tracking-widest">아이디</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-transparent rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner dark:shadow-none transition-colors" />
              </div>
              
              <div>
                <label className="block text-[11px] font-black text-gray-700 dark:text-gray-400 mb-1.5 px-1 tracking-widest">마스터 복구 키</label>
                <div className="flex items-center gap-2">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="flex items-center gap-2 flex-1">
                      <input 
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text" 
                        value={keyParts[index]} 
                        onChange={(e) => handleKeyPartChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyPartKeyDown(index, e)}
                        onPaste={index === 0 ? handleKeyPartPaste : undefined}
                        maxLength={4}
                        placeholder="XXXX" 
                        className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-transparent rounded-xl px-1 py-3 text-gray-900 dark:text-white text-sm font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono tracking-widest text-center shadow-inner dark:shadow-none transition-colors" 
                      />
                      {index < 2 && <span className="text-gray-400 dark:text-gray-600 font-black">-</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-700 dark:text-gray-400 mb-1.5 px-1 tracking-widest">새 비밀번호</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="6자리 이상" className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-transparent rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner dark:shadow-none transition-colors" />
              </div>
              {errorMsg && <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-200 dark:border-transparent">{errorMsg}</p>}
            </div>

            <button onClick={handleRecover} disabled={isLoading} className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-black py-4 rounded-xl transition-all shadow-md active:scale-95 mb-5">
              {isLoading ? '처리 중...' : '비밀번호 재설정'}
            </button>
            <div className="flex justify-center">
              <button onClick={() => { setMode('login'); setErrorMsg(''); }} className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors bg-gray-100 dark:bg-[#111113] px-4 py-2 rounded-lg border border-gray-200 dark:border-transparent shadow-sm">로그인 화면으로 돌아가기</button>
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-8 mt-2">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
              {mode === 'login' ? '올띵 로그인' : '올띵 회원가입'}
            </h3>
            
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-transparent rounded-xl p-4 mb-6 shadow-sm">
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold leading-relaxed break-keep">
                보안 경고: 개인정보를 수집하지 않는 간이 로그인 방식입니다. 타 사이트(네이버 등)와 <span className="underline decoration-rose-300 dark:decoration-rose-500/50 underline-offset-2">동일한 실제 비밀번호를 절대 사용하지 마세요.</span>
              </p>
            </div>

            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-[11px] font-black text-gray-700 dark:text-gray-400 mb-1.5 px-1 tracking-widest">아이디</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="영문, 숫자 (예: dding123)" className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-transparent rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner dark:shadow-none transition-colors placeholder-gray-400 dark:placeholder-gray-600" />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-700 dark:text-gray-400 mb-1.5 px-1 tracking-widest">비밀번호</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6자리 이상" className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-transparent rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner dark:shadow-none transition-colors placeholder-gray-400 dark:placeholder-gray-600" />
              </div>
              {errorMsg && <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-200 dark:border-transparent">{errorMsg}</p>}
            </div>

            <button onClick={mode === 'login' ? handleLogin : handleRegister} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black py-4 rounded-xl transition-all shadow-md active:scale-95 mb-6">
              {isLoading ? '처리 중...' : (mode === 'login' ? '로그인 (동기화)' : '가입하고 복구 키 받기')}
            </button>

            <div className="flex items-center justify-between bg-gray-50 dark:bg-[#111113] p-2 rounded-xl border border-gray-200 dark:border-transparent shadow-inner">
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrorMsg(''); }} className="text-[11px] font-bold text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 transition-colors">
                {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              </button>
              {mode === 'login' && (
                <button onClick={() => { setMode('recover'); setErrorMsg(''); }} className="text-[11px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-black border border-gray-300 dark:border-transparent px-3 py-2 rounded-lg shadow-sm transition-colors">
                  비밀번호 찾기
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}