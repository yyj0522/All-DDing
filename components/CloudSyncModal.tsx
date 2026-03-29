'use client';

import { useState, useRef } from 'react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SYNC_KEYS = [
  'ocean_trade_v2', 
  'alldding_profession', 
  'alldding_sage_tools', 
  'alldding_prices', 
  'alldding_misc_settings', 
  'alldding_skill'
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#111] border border-indigo-200 dark:border-indigo-500/30 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col relative">
        <button onClick={handleClose} className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-white/5 p-1.5 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {mode === 'showKey' ? (
          <div className="p-6 md:p-8 flex flex-col items-center text-center mt-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">가입 완료! 복구 키 발급</h3>
            <p className="text-sm text-red-600 dark:text-red-400 font-bold mb-4 break-keep">
              아래 마스터 복구 키는 지금 딱 한 번만 보여집니다.<br />
              이 키가 없으면 절대 계정을 찾을 수 없으니 반드시 복사해 두세요.
            </p>
            
            <div className="flex items-center w-full bg-gray-100 dark:bg-black border border-gray-300 dark:border-white/20 rounded-xl p-2 mb-6 gap-2">
              <p className="flex-1 text-lg md:text-xl font-mono font-black text-indigo-600 dark:text-indigo-400 tracking-wider select-all text-center">
                {recoveryKey}
              </p>
              <button 
                onClick={copyToClipboard}
                className="p-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
                title="복사하기"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2zM12 2h8a2 2 0 012 2v10M12 2v10a2 2 0 01-2 2H8" /></svg>
              </button>
            </div>
            
            <button onClick={() => { handleClose(); window.location.reload(); }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors">
              안전하게 저장했습니다 (닫기)
            </button>
          </div>
        ) : mode === 'recover' ? (
          <div className="p-6 md:p-8 mt-4">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">비밀번호 찾기</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 break-keep">가입 시 발급받은 마스터 복구 키를 입력하여 비밀번호를 재설정합니다.</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">아이디</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">마스터 복구 키</label>
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
                        className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-1 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 font-mono tracking-widest text-center" 
                      />
                      {index < 2 && <span className="text-gray-400 font-bold">-</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">새 비밀번호</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="6자리 이상" className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              {errorMsg && <p className="text-xs font-bold text-red-500">{errorMsg}</p>}
            </div>

            <button onClick={handleRecover} disabled={isLoading} className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold py-3 rounded-xl transition-colors shadow-md mb-4">
              {isLoading ? '처리 중...' : '비밀번호 재설정'}
            </button>
            <div className="flex justify-center text-xs font-bold">
              <button onClick={() => { setMode('login'); setErrorMsg(''); }} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">로그인 화면으로 돌아가기</button>
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-8 mt-4">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">
              {mode === 'login' ? '올띵 로그인' : '올띵 회원가입'}
            </h3>
            
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3 mb-5">
              <p className="text-[11px] text-red-600 dark:text-red-400 font-bold leading-relaxed break-keep">
                보안 경고: 개인정보를 수집하지 않는 간이 로그인 방식입니다. 타 사이트(네이버 등)와 <span className="underline">동일한 실제 비밀번호를 절대 사용하지 마세요.</span>
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">아이디</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="영문, 숫자 (예: dding123)" className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">비밀번호</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6자리 이상" className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              {errorMsg && <p className="text-xs font-bold text-red-500">{errorMsg}</p>}
            </div>

            <button onClick={mode === 'login' ? handleLogin : handleRegister} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-colors shadow-md mb-4">
              {isLoading ? '처리 중...' : (mode === 'login' ? '로그인 (동기화)' : '가입하고 복구 키 받기')}
            </button>

            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrorMsg(''); }} className="hover:text-indigo-500">
                {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              </button>
              {mode === 'login' && (
                <button onClick={() => { setMode('recover'); setErrorMsg(''); }} className="text-gray-400 hover:text-gray-300">
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