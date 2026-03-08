'use client';

import { useState } from 'react';

export default function TradeCalculator() {
  const [soldPrice, setSoldPrice] = useState<string>('');
  const numPrice = parseInt(soldPrice.replace(/,/g, '')) || 0;
  const remittanceAmount = Math.floor(numPrice / 1.05);
  const feeAmount = Math.floor(remittanceAmount * 0.05);
  const leftover = numPrice - (remittanceAmount + feeAmount);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setSoldPrice(value);
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl w-[360px] flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          대리 판매 정산기
        </h3>
        <div className="bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-lg text-[10px] font-bold">
          수수료 5% 포함
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-400 mb-1.5 block">판매 금액</label>
        <div className="relative">
          <input
            type="text"
            value={numPrice === 0 ? '' : numPrice.toLocaleString()}
            onChange={handlePriceChange}
            placeholder="0"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-4 pr-10 text-white text-right text-xl font-black focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">G</span>
        </div>
      </div>

      {/* 결과 영역 */}
      <div className="bg-black/50 border border-white/5 rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400 font-bold">총 판매 대금</span>
          <span className="text-gray-200 font-bold">{numPrice.toLocaleString()} G</span>
        </div>
        
        <div className="h-px w-full bg-white/5"></div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            최적 송금액
          </span>
          <span className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]">
            {remittanceAmount.toLocaleString()} G
          </span>
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 font-bold text-[11px]">발생 수수료 (5%)</span>
          <span className="text-rose-400/80 font-bold">-{feeAmount.toLocaleString()} G</span>
        </div>
      </div>

      {numPrice > 0 && (
        <div className="text-center text-[11px] text-gray-400 font-bold bg-white/5 py-2.5 rounded-lg border border-white/5">
          <span className="text-white">{remittanceAmount.toLocaleString()}G</span> 송금 시, 수수료 포함<br/>총 <span className="text-rose-400">{(remittanceAmount + feeAmount).toLocaleString()}G</span>가 인벤토리에서 빠져나갑니다.<br/>
          <span className="text-gray-500 text-[10px]">(오차 잔돈: +{leftover}G)</span>
        </div>
      )}
    </div>
  );
}