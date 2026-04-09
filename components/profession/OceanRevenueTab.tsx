'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getCachedPrices } from '@/lib/supabase';
import { SAGE_TOOL_EFFECTS } from '@/lib/sageData';
import { getImagePath, OCEAN_FIXED_PRICES } from '@/lib/professionData';

interface Props {
  userStats: any;
}

export default function OceanRevenueTab({ userStats }: Props) {
  const [dbData, setDbData] = useState<any[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const allData = await getCachedPrices();
      const data = allData.filter((d: any) => d.category === 'craft');
      if (data && data.length > 0) setDbData(data);
    };
    fetchData();
  }, []);

  const calcResults = useMemo(() => {
    const actions = Math.floor(userStats.stamina / 15);
    const rodData = userStats.rodLv > 0 ? SAGE_TOOL_EFFECTS.rod[userStats.rodLv - 1] : { '어패류 드롭 수': '1', '조개 등장 확률': '0%' };
    const baseDrop = parseInt(rodData['어패류 드롭 수']) || 1;
    const baseShellChance = parseFloat(rodData['조개 등장 확률']) / 100 || 0;

    const o11Bonus = [0, 0.05, 0.07, 0.10, 0.15, 0.20][userStats.o11Lv] || 0;
    const totalSeafood = actions * baseDrop * (1 + o11Bonus);

    const o17Bonus = [0, 0.01, 0.03, 0.05, 0.07, 0.10, 0.15][userStats.o17Lv] || 0;
    const rate3 = 0.10 + o17Bonus;
    const rate2 = 0.30;
    const rate1 = 1.0 - rate2 - rate3;

    const qty1 = totalSeafood * rate1;
    const qty2 = totalSeafood * rate2;
    const qty3 = totalSeafood * rate3;

    const crafts1 = Math.floor(qty1 / 12);
    const crafts2 = Math.floor(qty2 / 3);
    const crafts3 = Math.floor(qty3 / 6);

    const rem1 = Math.floor(qty1 % 12);
    const rem2 = Math.floor(qty2 % 3);
    const rem3 = Math.floor(qty3 % 6);

    const o16Bonus = [0, 0.05, 0.07, 0.09, 0.12, 0.15, 0.20, 0.25, 0.30][userStats.o16Lv] || 0;
    
    const unitPrice1 = Math.ceil(5393 * (1 + o16Bonus));
    const unitPrice2 = Math.ceil(11399 * (1 + o16Bonus));
    const unitPrice3 = Math.ceil(19328 * (1 + o16Bonus));

    const rev1 = crafts1 * unitPrice1;
    const rev2 = crafts2 * unitPrice2;
    const rev3 = crafts3 * unitPrice3;

    const totalAlchemyRev = rev1 + rev2 + rev3;

    const o14Bonus = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10][userStats.o14Lv] || 0;
    const totalShellChance = baseShellChance + o14Bonus;
    const mysteryShells = actions * totalShellChance * 0.5;

    const qtyBlack = mysteryShells * 0.01;
    const qtyPurple = mysteryShells * 0.02;
    const qtyPink = mysteryShells * 0.03;
    const qtyTurq = mysteryShells * 0.05;
    const qtyBlue = mysteryShells * 0.07;
    const qtyYellow = mysteryShells * 0.12;
    const qtyBroken = mysteryShells * 0.70;

    return { 
      actions, totalSeafood, rate1, rate2, rate3, qty1, qty2, qty3, baseDrop, o11Bonus, baseShellChance, o14Bonus, totalShellChance,
      totalRevenue: totalAlchemyRev, 
      totalAlchemyRev,
      crafts1, crafts2, crafts3, rev1, rev2, rev3,
      mysteryShells,
      qtyBlack, qtyPurple, qtyPink, qtyTurq, qtyBlue, qtyYellow, qtyBroken,
      rem1, rem2, rem3
    };
  }, [userStats]);

  const o16Bonus = [0, 0.05, 0.07, 0.09, 0.12, 0.15, 0.20, 0.25, 0.30][userStats.o16Lv] || 0;

  const activeSpecs = [
    { name: '세이지 낚싯대', val: userStats.rodLv > 0 ? `+${userStats.rodLv}` : '미장착', isLv: false },
    { name: '심해 채집꾼', val: userStats.o11Lv, isLv: true },
    { name: '조개 좀 사조개', val: userStats.o12Lv, isLv: true },
    { name: '조개 무한리필', val: userStats.o14Lv, isLv: true },
    { name: '프리미엄 한정가', val: userStats.o16Lv, isLv: true },
    { name: '별별별!', val: userStats.o17Lv, isLv: true },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full relative transition-colors duration-300 animate-fade-in-up">
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)}></div>
          <div className="relative z-10 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-xl dark:shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar animate-fade-in-up transition-colors">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-white/5 pb-4 transition-colors">
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">일일 수익 계산 상세내역</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-transparent shadow-sm">닫기 ✕</button>
            </div>
            
            <div className="space-y-5">
              <div className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-2xl p-5 shadow-inner transition-colors">
                <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 mb-3 border-l-4 border-indigo-500 pl-3 tracking-tight transition-colors">1단계: 수중 어획 (행동력 소모)</h4>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-loose transition-colors font-bold pl-2">
                  • 설정된 총 스태미나 <span className="text-indigo-600 dark:text-indigo-400 font-black">{userStats.stamina.toLocaleString()}</span> / 15 = <span className="text-indigo-600 dark:text-indigo-400 font-black">{calcResults.actions.toLocaleString()}회</span> 채집 진행<br/>
                  • 1회당 획득량: 기본 <span className="text-gray-900 dark:text-white font-black">{calcResults.baseDrop}개</span> + [심해 채집꾼] 보너스 <span className="text-emerald-600 dark:text-emerald-400 font-black">{(calcResults.o11Bonus * 100).toFixed(0)}%</span> = 평균 <span className="text-gray-900 dark:text-white font-black">{(calcResults.baseDrop * (1 + calcResults.o11Bonus)).toFixed(2)}개</span><br/>
                  • 하루 총 어패류 획득 기댓값: <span className="text-indigo-600 dark:text-indigo-400 font-black">{calcResults.totalSeafood.toLocaleString(undefined, {maximumFractionDigits:1})}개</span>
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-2xl p-5 shadow-inner transition-colors">
                <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-400 mb-3 border-l-4 border-emerald-500 pl-3 tracking-tight transition-colors">2단계: 어패류 성급 분배 및 연금 제작</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-bold leading-relaxed mb-4 transition-colors pl-2">
                  [별별별!] 스킬 보너스를 적용하여 총 획득 어패류를 성급별로 나눈 후 최적 루트로 제작합니다.
                </p>
                <div className="space-y-3 pl-2">
                  <div className="bg-white dark:bg-black border border-gray-200 dark:border-transparent p-3 rounded-xl text-xs font-bold shadow-sm transition-colors flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">1성 ({(calcResults.rate1 * 100).toFixed(0)}%) {calcResults.qty1.toLocaleString(undefined, {maximumFractionDigits:1})}개</span>
                    <span className="text-gray-900 dark:text-white font-black">리바이던의 깃털 {calcResults.crafts1}개</span>
                  </div>
                  <div className="bg-white dark:bg-black border border-gray-200 dark:border-transparent p-3 rounded-xl text-xs font-bold shadow-sm transition-colors flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">2성 ({(calcResults.rate2 * 100).toFixed(0)}%) {calcResults.qty2.toLocaleString(undefined, {maximumFractionDigits:1})}개</span>
                    <span className="text-gray-900 dark:text-white font-black">청해룡의 날개 {calcResults.crafts2}개</span>
                  </div>
                  <div className="bg-white dark:bg-black border border-gray-200 dark:border-transparent p-3 rounded-xl text-xs font-bold shadow-sm transition-colors flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">3성 ({(calcResults.rate3 * 100).toFixed(0)}%) {calcResults.qty3.toLocaleString(undefined, {maximumFractionDigits:1})}개</span>
                    <span className="text-gray-900 dark:text-white font-black">무저의 척추 {calcResults.crafts3}개</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-2xl p-5 shadow-inner transition-colors">
                <h4 className="text-sm font-black text-cyan-600 dark:text-cyan-400 mb-3 border-l-4 border-cyan-500 pl-3 tracking-tight transition-colors">3단계: 알쏭달쏭 조개 파밍</h4>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-loose transition-colors font-bold pl-2">
                  • 조개 등장 확률: 낚싯대 기본 <span className="text-gray-900 dark:text-white font-black">{(calcResults.baseShellChance * 100).toFixed(0)}%</span> + [조개 무한리필] 보너스 <span className="text-rose-600 dark:text-rose-400 font-black">{(calcResults.o14Bonus * 100).toFixed(0)}%</span> = <span className="text-gray-900 dark:text-white font-black">{(calcResults.totalShellChance * 100).toFixed(0)}%</span><br/>
                  • 조개 등장 시 50% 확률로 획득하므로, 총 {calcResults.actions.toLocaleString()}회 중 <span className="text-cyan-600 dark:text-cyan-400 font-black">{calcResults.mysteryShells.toLocaleString(undefined, {maximumFractionDigits:1})}개</span> 획득<br/>
                  <span className="text-rose-600 dark:text-rose-400">※ 알쏭달쏭 조개를 통해 획득한 진주(공예품)는 아래 최종 수익 합산에 포함되지 않습니다.</span>
                </p>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-transparent rounded-2xl p-6 text-center shadow-sm transition-colors">
                <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-100 mb-2 tracking-tight transition-colors">최종 일일 합산 수익</h4>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-500/80 font-bold mb-2 transition-colors">순수 연금품 판매수익</p>
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 drop-shadow-sm transition-colors">{calcResults.totalRevenue.toLocaleString()} G</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-5 md:p-6 shadow-md dark:shadow-2xl transition-colors">
        <div className="flex items-center justify-between mb-4 md:mb-5 px-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight transition-colors">적용 중인 내 해양 스펙</h3>
          </div>
          <Link href="/settings" className="bg-gray-100 dark:bg-[#111113] hover:bg-gray-200 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-gray-300 dark:border-transparent shadow-sm transition-colors whitespace-nowrap">설정 변경</Link>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-xl px-4 py-3 shadow-inner transition-colors">
            <span className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400 font-bold tracking-tight">총 가용 스태미나</span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold hidden sm:block">(기본 {userStats.stamina - (userStats.stamina % 1000)} + 포션 {userStats.stamina % 1000})</span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{userStats.stamina.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 md:gap-3">
            {activeSpecs.map((spec, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-100 dark:bg-[#111113] border border-gray-300 dark:border-transparent rounded-xl px-3 py-2 shadow-sm transition-colors">
                <span className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 font-bold whitespace-nowrap">{spec.name}</span>
                <span className={`text-xs md:text-sm font-black ${spec.val === '미장착' || spec.val === 0 ? 'text-gray-400 dark:text-gray-600' : 'text-blue-600 dark:text-blue-400'} whitespace-nowrap transition-colors`}>
                  {spec.isLv && spec.val !== 0 ? 'Lv.' : ''}{spec.val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {userStats.stamina === 3000 && userStats.rodLv === 0 && (
          <p className="text-[10px] text-rose-600 dark:text-rose-400/80 font-bold mt-4 text-center bg-rose-50 dark:bg-rose-500/10 py-2.5 rounded-xl border border-rose-200 dark:border-transparent transition-colors">능력치가 기본값입니다. 정확한 계산을 위해 개인설정에서 데이터를 최신화해주세요.</p>
        )}
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md dark:shadow-2xl transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8 border-b border-gray-200 dark:border-white/5 pb-5 transition-colors">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tight transition-colors">일일 해양 수익</h3>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 transition-colors">스태미나를 100% 소모했을 때의 효율 기반 기댓값입니다.</p>
          </div>
          <button onClick={() => setIsDetailModalOpen(true)} className="bg-gray-100 dark:bg-[#111113] hover:bg-gray-200 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[11px] md:text-xs font-black px-4 py-2.5 rounded-xl border border-gray-300 dark:border-transparent transition-colors text-center shadow-sm w-full sm:w-auto">
            상세 계산식 확인
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-transparent rounded-[1.5rem] p-5 md:p-6 relative overflow-hidden transition-colors shadow-sm">
            <p className="text-xs md:text-sm font-black text-emerald-600 dark:text-emerald-400 mb-4 tracking-tight transition-colors">최고 효율 연금품 제작</p>
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center bg-white dark:bg-black p-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm">
                <div className="flex items-center gap-2.5"><img src={getImagePath('리바이던의 깃털')||''} alt="" className="w-5 h-5 object-contain" /> <span className="text-[11px] md:text-xs text-gray-700 dark:text-gray-300 font-bold transition-colors">리바이던의 깃털 (1성)</span></div>
                <span className="text-xs md:text-sm font-black text-gray-900 dark:text-white transition-colors">{calcResults.crafts1.toLocaleString()} 개</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-black p-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm">
                <div className="flex items-center gap-2.5"><img src={getImagePath('청해룡의 날개')||''} alt="" className="w-5 h-5 object-contain" /> <span className="text-[11px] md:text-xs text-gray-700 dark:text-gray-300 font-bold transition-colors">청해룡의 날개 (2성)</span></div>
                <span className="text-xs md:text-sm font-black text-gray-900 dark:text-white transition-colors">{calcResults.crafts2.toLocaleString()} 개</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-black p-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm">
                <div className="flex items-center gap-2.5"><img src={getImagePath('무저의 척추')||''} alt="" className="w-5 h-5 object-contain" /> <span className="text-[11px] md:text-xs text-gray-700 dark:text-gray-300 font-bold transition-colors">무저의 척추 (3성)</span></div>
                <span className="text-xs md:text-sm font-black text-gray-900 dark:text-white transition-colors">{calcResults.crafts3.toLocaleString()} 개</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-white/5 text-right transition-colors flex justify-between items-end">
              <span className="text-[10px] font-bold text-gray-400">연금품 판매 총액</span>
              <p className="text-lg md:text-xl font-black text-emerald-600 dark:text-emerald-400 drop-shadow-sm transition-colors">+ {calcResults.totalAlchemyRev.toLocaleString()} G</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-transparent rounded-[1.5rem] p-5 md:p-6 relative overflow-hidden transition-colors shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs md:text-sm font-black text-cyan-600 dark:text-cyan-400 tracking-tight transition-colors">알쏭달쏭 조개 획득 기댓값</p>
              <span className="text-base md:text-lg font-black text-gray-900 dark:text-white transition-colors">{calcResults.mysteryShells.toLocaleString(undefined, {maximumFractionDigits:1})} 개</span>
            </div>
            
            <div className="bg-white dark:bg-black p-4 rounded-xl border border-gray-200 dark:border-transparent shadow-inner">
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] md:text-[11px] text-gray-600 dark:text-gray-400 font-bold flex items-center gap-1.5 transition-colors"><img src={getImagePath('흑진주')||''} className="w-3 h-3" alt=""/>흑진주</span>
                  <span className="text-[10px] md:text-[11px] font-black text-gray-900 dark:text-white transition-colors">{calcResults.qtyBlack.toLocaleString(undefined, {maximumFractionDigits:1})} 개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] md:text-[11px] text-gray-600 dark:text-gray-400 font-bold flex items-center gap-1.5 transition-colors"><img src={getImagePath('보라빛 진주')||''} className="w-3 h-3" alt=""/>보라빛 진주</span>
                  <span className="text-[10px] md:text-[11px] font-black text-gray-900 dark:text-white transition-colors">{calcResults.qtyPurple.toLocaleString(undefined, {maximumFractionDigits:1})} 개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] md:text-[11px] text-gray-600 dark:text-gray-400 font-bold flex items-center gap-1.5 transition-colors"><img src={getImagePath('분홍빛 진주')||''} className="w-3 h-3" alt=""/>분홍빛 진주</span>
                  <span className="text-[10px] md:text-[11px] font-black text-gray-900 dark:text-white transition-colors">{calcResults.qtyPink.toLocaleString(undefined, {maximumFractionDigits:1})} 개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] md:text-[11px] text-gray-600 dark:text-gray-400 font-bold flex items-center gap-1.5 transition-colors"><img src={getImagePath('청록빛 진주')||''} className="w-3 h-3" alt=""/>청록빛 진주</span>
                  <span className="text-[10px] md:text-[11px] font-black text-gray-900 dark:text-white transition-colors">{calcResults.qtyTurq.toLocaleString(undefined, {maximumFractionDigits:1})} 개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] md:text-[11px] text-gray-600 dark:text-gray-400 font-bold flex items-center gap-1.5 transition-colors"><img src={getImagePath('푸른빛 진주')||''} className="w-3 h-3" alt=""/>푸른빛 진주</span>
                  <span className="text-[10px] md:text-[11px] font-black text-gray-900 dark:text-white transition-colors">{calcResults.qtyBlue.toLocaleString(undefined, {maximumFractionDigits:1})} 개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] md:text-[11px] text-gray-600 dark:text-gray-400 font-bold flex items-center gap-1.5 transition-colors"><img src={getImagePath('노란빛 진주')||''} className="w-3 h-3" alt=""/>노란빛 진주</span>
                  <span className="text-[10px] md:text-[11px] font-black text-gray-900 dark:text-white transition-colors">{calcResults.qtyYellow.toLocaleString(undefined, {maximumFractionDigits:1})} 개</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-white/10 mt-3 transition-colors">
                <span className="text-[10px] md:text-[11px] text-gray-500 dark:text-gray-500 font-bold flex items-center gap-1.5 transition-colors"><img src={getImagePath('깨진 조개껍데기')||''} className="w-3 h-3" alt=""/>깨진 조개껍데기</span>
                <span className="text-[10px] md:text-[11px] font-black text-gray-500 transition-colors">{calcResults.qtyBroken.toLocaleString(undefined, {maximumFractionDigits:1})} 개</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-transparent rounded-[1.5rem] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 transition-colors shadow-inner dark:shadow-none">
          <div>
            <p className="text-sm md:text-base font-black text-gray-900 dark:text-white mb-1 tracking-tight transition-colors">일일 총 예상 수익</p>
            <p className="text-[10px] md:text-[11px] font-bold text-gray-500 break-keep">※ 바닐라 재료는 무한하다고 가정했으며, 미끼 등 부대비용은 제외된 수치입니다.</p>
          </div>
          <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 drop-shadow-sm tracking-tighter">
            {calcResults.totalRevenue.toLocaleString()} <span className="text-2xl text-indigo-500 font-black">G</span>
          </span>
        </div>

        <div className="bg-gray-50 dark:bg-black/30 rounded-xl p-4 border border-gray-200 dark:border-white/5 flex flex-wrap items-center gap-3 transition-colors">
          <span className="text-xs font-bold text-gray-600 dark:text-gray-500 transition-colors">연금품 제작 후 남는 잉여 어패류:</span>
          <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-[#111113] border border-gray-200 dark:border-transparent px-2.5 py-1.5 rounded-lg shadow-sm transition-colors">1성 <span className="text-gray-900 dark:text-white font-black transition-colors ml-1">{calcResults.rem1}개</span></span>
          <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-[#111113] border border-gray-200 dark:border-transparent px-2.5 py-1.5 rounded-lg shadow-sm transition-colors">2성 <span className="text-gray-900 dark:text-white font-black transition-colors ml-1">{calcResults.rem2}개</span></span>
          <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-[#111113] border border-gray-200 dark:border-transparent px-2.5 py-1.5 rounded-lg shadow-sm transition-colors">3성 <span className="text-gray-900 dark:text-white font-black transition-colors ml-1">{calcResults.rem3}개</span></span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md dark:shadow-2xl transition-colors">
        <div className="flex justify-between items-end mb-6 border-b border-gray-200 dark:border-white/5 pb-5 transition-colors">
          <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">NPC 연금품 고정 매입가</h3>
          <div className="text-right flex flex-col items-end">
            <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-transparent px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-black tracking-widest mb-1.5 transition-colors">프리미엄 한정가 적용</span>
            <span className="text-xs md:text-sm font-black text-gray-800 dark:text-gray-300 transition-colors">Lv.{userStats.o16Lv}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {OCEAN_FIXED_PRICES.map((item, idx) => {
            const buffedPrice = Math.ceil(item.base * (1 + o16Bonus));
            const imgPath = getImagePath(item.name);
            return (
              <div key={idx} className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-sm transition-colors">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-black/50 rounded-xl border border-gray-200 dark:border-transparent flex items-center justify-center overflow-hidden p-2 transition-colors shadow-inner">
                    {imgPath ? <img src={imgPath} alt={item.name} className="w-full h-full object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }}/> : <span className="text-[8px] text-gray-400 font-bold">IMG</span>}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm md:text-base font-black text-gray-900 dark:text-white tracking-tight transition-colors">{item.name}</p>
                    <p className="text-[10px] md:text-[11px] font-bold text-gray-500">기본가 {item.base.toLocaleString()}G</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg md:text-xl font-black text-emerald-600 dark:text-emerald-500 drop-shadow-sm transition-colors tracking-tight">{buffedPrice.toLocaleString()} <span className="text-sm font-bold">G</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}