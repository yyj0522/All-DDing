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

  return (
    <div className="flex flex-col gap-8 w-full relative transition-colors duration-300">
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)}></div>
          <div className="relative z-10 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar animate-fade-in-up transition-colors">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-white/5 pb-4 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">일일 수익 계산 상세내역</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg text-sm font-bold border border-gray-200 dark:border-transparent">닫기 ✕</button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl p-4 transition-colors">
                <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-3 border-l-2 border-indigo-500 pl-2 transition-colors">1단계: 수중 어획 (행동력 소모)</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
                  • 설정된 총 스태미나 <span className="text-gray-900 dark:text-white font-bold">{userStats.stamina.toLocaleString()}</span> / 15 = <span className="text-gray-900 dark:text-white font-bold">{calcResults.actions.toLocaleString()}회</span> 채집 진행<br/>
                  • 1회당 획득량: 기본 <span className="text-gray-900 dark:text-white font-bold">{calcResults.baseDrop}개</span> + [심해 채집꾼] 보너스 <span className="text-gray-900 dark:text-white font-bold">{(calcResults.o11Bonus * 100).toFixed(0)}%</span> = 평균 <span className="text-gray-900 dark:text-white font-bold">{(calcResults.baseDrop * (1 + calcResults.o11Bonus)).toFixed(2)}개</span><br/>
                  • 하루 총 어패류 획득 기댓값: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{calcResults.totalSeafood.toLocaleString(undefined, {maximumFractionDigits:1})}개</span>
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl p-4 transition-colors">
                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 border-l-2 border-emerald-500 pl-2 transition-colors">2단계: 어패류 성급 분배 및 연금 제작</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-2 transition-colors">
                  [별별별!] 스킬 보너스를 적용하여 총 획득 어패류를 성급별로 나눈 후 최적 루트로 제작합니다.
                </p>
                <div className="space-y-2">
                  <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent p-2 rounded text-xs transition-colors">
                    <span className="text-gray-500 dark:text-gray-400">1성 어패류 ({(calcResults.rate1 * 100).toFixed(0)}%):</span> {calcResults.qty1.toLocaleString(undefined, {maximumFractionDigits:1})}개 획득 → 12개씩 묶어 <span className="text-gray-900 dark:text-white font-bold">리바이던의 깃털 {calcResults.crafts1}개</span> 제작
                  </div>
                  <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent p-2 rounded text-xs transition-colors">
                    <span className="text-gray-500 dark:text-gray-400">2성 어패류 ({(calcResults.rate2 * 100).toFixed(0)}%):</span> {calcResults.qty2.toLocaleString(undefined, {maximumFractionDigits:1})}개 획득 → 3개씩 묶어 <span className="text-gray-900 dark:text-white font-bold">청해룡의 날개 {calcResults.crafts2}개</span> 제작
                  </div>
                  <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent p-2 rounded text-xs transition-colors">
                    <span className="text-gray-500 dark:text-gray-400">3성 어패류 ({(calcResults.rate3 * 100).toFixed(0)}%):</span> {calcResults.qty3.toLocaleString(undefined, {maximumFractionDigits:1})}개 획득 → 6개씩 묶어 <span className="text-gray-900 dark:text-white font-bold">무저의 척추 {calcResults.crafts3}개</span> 제작
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl p-4 transition-colors">
                <h4 className="text-sm font-bold text-cyan-600 dark:text-cyan-400 mb-3 border-l-2 border-cyan-500 pl-2 transition-colors">3단계: 알쏭달쏭 조개 파밍</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
                  • 조개 등장 확률: 낚싯대 기본 <span className="text-gray-900 dark:text-white font-bold">{(calcResults.baseShellChance * 100).toFixed(0)}%</span> + [조개 무한리필] 보너스 <span className="text-gray-900 dark:text-white font-bold">{(calcResults.o14Bonus * 100).toFixed(0)}%</span> = <span className="text-gray-900 dark:text-white font-bold">{(calcResults.totalShellChance * 100).toFixed(0)}%</span><br/>
                  • 조개 등장 시 50% 확률로 획득하므로, 총 {calcResults.actions.toLocaleString()}회 중 <span className="text-cyan-600 dark:text-cyan-400 font-bold">{calcResults.mysteryShells.toLocaleString(undefined, {maximumFractionDigits:1})}개</span> 획득<br/>
                  • 알쏭달쏭 조개를 통해 획득한 진주(공예품)는 아래 최종 수익 합산에 포함되지 않습니다.
                </p>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl p-4 text-center transition-colors">
                <h4 className="text-sm font-black text-gray-900 dark:text-white mb-2 transition-colors">최종 합산 수익</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 transition-colors">순수 연금품 판매수익</p>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-colors">{calcResults.totalRevenue.toLocaleString()} G</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl shadow-sm dark:shadow-2xl relative overflow-hidden flex flex-col lg:flex-row transition-colors">
        <div className="w-full lg:w-1/3 bg-gray-50 dark:bg-black/40 p-8 border-r border-gray-200 dark:border-white/5 flex flex-col justify-between transition-colors">
          <div>
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-white/5 flex justify-between items-start transition-colors">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">적용된 내 능력치</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed">개인설정 보드에서 저장된 데이터가<br/>시뮬레이션에 자동 반영됩니다.</p>
              </div>
              <Link href="/settings" className="bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 transition-colors">설정 변경</Link>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white dark:bg-white/5 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/5 relative group cursor-help transition-colors">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">총 가용 스태미나</span><span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{userStats.stamina.toLocaleString()}</span>
                <div className="absolute left-0 -top-8 hidden group-hover:block bg-white dark:bg-black border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold px-2 py-1 rounded shadow-md dark:shadow-lg whitespace-nowrap z-20 transition-colors">
                  기본 {userStats.stamina - (userStats.stamina % 1000)} + 포션 {userStats.stamina % 1000}
                </div>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-white/5 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/5 relative group cursor-help transition-colors">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">세이지 낚싯대</span><span className="text-sm font-black text-stone-600 dark:text-stone-300">+{userStats.rodLv}</span>
                <div className="absolute left-0 -top-8 hidden group-hover:block bg-white dark:bg-black border border-stone-200 dark:border-stone-500/30 text-stone-600 dark:text-stone-300 text-[10px] font-bold px-2 py-1 rounded shadow-md dark:shadow-lg whitespace-nowrap z-20 transition-colors">
                  {userStats.rodLv > 0 ? `기본 채집 ${SAGE_TOOL_EFFECTS.rod[userStats.rodLv - 1]['어패류 드롭 수']}개 / 조개확률 ${SAGE_TOOL_EFFECTS.rod[userStats.rodLv - 1]['조개 등장 확률']}` : '기본 장비'}
                </div>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-white/5 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/5 relative group cursor-help transition-colors">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">[심해 채집꾼]</span><span className="text-sm font-black text-emerald-600 dark:text-emerald-400">Lv.{userStats.o11Lv}</span>
                <div className="absolute left-0 -top-8 hidden group-hover:block bg-white dark:bg-black border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold px-2 py-1 rounded shadow-md dark:shadow-lg whitespace-nowrap z-20 transition-colors">
                  어패류 드롭 수량 {(calcResults.o11Bonus * 100).toFixed(0)}% 증가
                </div>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-white/5 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/5 relative group cursor-help transition-colors">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">[조개 좀 사조개]</span><span className="text-sm font-black text-cyan-600 dark:text-cyan-400">Lv.{userStats.o12Lv}</span>
                <div className="absolute left-0 -top-8 hidden group-hover:block bg-white dark:bg-black border border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-[10px] font-bold px-2 py-1 rounded shadow-md dark:shadow-lg whitespace-nowrap z-20 transition-colors">
                  공예품 판매가 {([0, 0.05, 0.07, 0.10, 0.15, 0.20, 0.30, 0.40, 0.50][userStats.o12Lv] || 0) * 100}% 증가
                </div>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-white/5 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/5 relative group cursor-help transition-colors">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">[조개 무한리필]</span><span className="text-sm font-black text-rose-600 dark:text-rose-400">Lv.{userStats.o14Lv}</span>
                <div className="absolute left-0 -top-8 hidden group-hover:block bg-white dark:bg-black border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-300 text-[10px] font-bold px-2 py-1 rounded shadow-md dark:shadow-lg whitespace-nowrap z-20 transition-colors">
                  조개 등장 확률 {(calcResults.o14Bonus * 100).toFixed(0)}% 추가
                </div>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-white/5 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/5 relative group cursor-help transition-colors">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">[프리미엄 한정가]</span><span className="text-sm font-black text-amber-600 dark:text-amber-400">Lv.{userStats.o16Lv}</span>
                <div className="absolute left-0 -top-8 hidden group-hover:block bg-white dark:bg-black border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-300 text-[10px] font-bold px-2 py-1 rounded shadow-md dark:shadow-lg whitespace-nowrap z-20 transition-colors">
                  연금품 판매가 {(o16Bonus * 100).toFixed(0)}% 증가
                </div>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-white/5 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/5 relative group cursor-help transition-colors">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">[별별별!]</span><span className="text-sm font-black text-fuchsia-600 dark:text-fuchsia-400">Lv.{userStats.o17Lv}</span>
                <div className="absolute left-0 -top-8 hidden group-hover:block bg-white dark:bg-black border border-fuchsia-200 dark:border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-300 text-[10px] font-bold px-2 py-1 rounded shadow-md dark:shadow-lg whitespace-nowrap z-20 transition-colors">
                  3성 어패류 확률 {([0, 0.01, 0.03, 0.05, 0.07, 0.10, 0.15][userStats.o17Lv] || 0) * 100}% 추가
                </div>
              </div>
            </div>
          </div>
          {userStats.stamina === 3000 && userStats.rodLv === 0 && (
            <p className="text-[10px] text-rose-500 dark:text-rose-400/80 font-bold mt-6 text-center bg-rose-100 dark:bg-rose-500/10 py-2 rounded-lg border border-rose-200 dark:border-rose-500/20 transition-colors">능력치가 기본값입니다. 정확한 수익을 위해<br/>개인설정에서 데이터를 저장해주세요.</p>
          )}
        </div>
        <div className="w-full lg:w-2/3 p-8 flex flex-col bg-white dark:bg-gradient-to-br dark:from-[#0a0a0a] dark:to-[#0f0f13] transition-colors">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 transition-colors">일일 해양 수익</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 transition-colors">스태미나를 100% 소모했을 때의 가장 효율이 높은 연금 제작 루트 기준치입니다.</p>
              <p className="text-xs font-bold text-rose-500 dark:text-rose-400 transition-colors">※ 바닐라 재료는 무한하다고 가정한 결과입니다.</p>
            </div>
            <button onClick={() => setIsDetailModalOpen(true)} className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white text-xs font-bold px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              상세 계산식
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-2xl p-5 relative overflow-hidden group transition-colors">
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2 transition-colors">최고 효율 연금품 제작</p>
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2"><img src={getImagePath('리바이던의 깃털')||''} alt="" className="w-5 h-5 object-contain" /> <span className="text-xs text-gray-600 dark:text-gray-300 font-bold transition-colors">리바이던의 깃털 (1성)</span></div>
                  <span className="text-sm font-black text-gray-900 dark:text-white transition-colors">{calcResults.crafts1.toLocaleString()} 개</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2"><img src={getImagePath('청해룡의 날개')||''} alt="" className="w-5 h-5 object-contain" /> <span className="text-xs text-gray-600 dark:text-gray-300 font-bold transition-colors">청해룡의 날개 (2성)</span></div>
                  <span className="text-sm font-black text-gray-900 dark:text-white transition-colors">{calcResults.crafts2.toLocaleString()} 개</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2"><img src={getImagePath('무저의 척추')||''} alt="" className="w-5 h-5 object-contain" /> <span className="text-xs text-gray-600 dark:text-gray-300 font-bold transition-colors">무저의 척추 (3성)</span></div>
                  <span className="text-sm font-black text-gray-900 dark:text-white transition-colors">{calcResults.crafts3.toLocaleString()} 개</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/5 text-right transition-colors">
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(52,211,153,0.3)] transition-colors">+ {calcResults.totalAlchemyRev.toLocaleString()} G</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-2xl p-5 relative overflow-hidden group transition-colors">
              <div className="flex justify-between items-end mb-4 border-b border-gray-200 dark:border-white/5 pb-2 transition-colors">
                <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-2 transition-colors">
                  <img src={getImagePath('알쏭달쏭 조개')||''} alt="" className="w-5 h-5 object-contain" />
                  예상 알쏭달쏭 조개 획득량
                </p>
                <span className="text-lg font-black text-gray-900 dark:text-white transition-colors">{calcResults.mysteryShells.toLocaleString(undefined, {maximumFractionDigits:1})} 개</span>
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400 font-bold flex items-center gap-1.5 transition-colors"><img src={getImagePath('흑진주')||''} className="w-3 h-3" alt=""/>흑진주</span>
                  <span className="text-[11px] font-black text-gray-900 dark:text-white transition-colors">{calcResults.qtyBlack.toLocaleString(undefined, {maximumFractionDigits:1})} 개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400 font-bold flex items-center gap-1.5 transition-colors"><img src={getImagePath('보라빛 진주')||''} className="w-3 h-3" alt=""/>보라빛 진주</span>
                  <span className="text-[11px] font-black text-gray-900 dark:text-white transition-colors">{calcResults.qtyPurple.toLocaleString(undefined, {maximumFractionDigits:1})} 개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400 font-bold flex items-center gap-1.5 transition-colors"><img src={getImagePath('분홍빛 진주')||''} className="w-3 h-3" alt=""/>분홍빛 진주</span>
                  <span className="text-[11px] font-black text-gray-900 dark:text-white transition-colors">{calcResults.qtyPink.toLocaleString(undefined, {maximumFractionDigits:1})} 개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400 font-bold flex items-center gap-1.5 transition-colors"><img src={getImagePath('청록빛 진주')||''} className="w-3 h-3" alt=""/>청록빛 진주</span>
                  <span className="text-[11px] font-black text-gray-900 dark:text-white transition-colors">{calcResults.qtyTurq.toLocaleString(undefined, {maximumFractionDigits:1})} 개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400 font-bold flex items-center gap-1.5 transition-colors"><img src={getImagePath('푸른빛 진주')||''} className="w-3 h-3" alt=""/>푸른빛 진주</span>
                  <span className="text-[11px] font-black text-gray-900 dark:text-white transition-colors">{calcResults.qtyBlue.toLocaleString(undefined, {maximumFractionDigits:1})} 개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400 font-bold flex items-center gap-1.5 transition-colors"><img src={getImagePath('노란빛 진주')||''} className="w-3 h-3" alt=""/>노란빛 진주</span>
                  <span className="text-[11px] font-black text-gray-900 dark:text-white transition-colors">{calcResults.qtyYellow.toLocaleString(undefined, {maximumFractionDigits:1})} 개</span>
                </div>
                <div className="flex justify-between items-center col-span-2 pt-1 border-t border-gray-200 dark:border-white/5 mt-1 transition-colors">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400 font-bold flex items-center gap-1.5 transition-colors"><img src={getImagePath('깨진 조개껍데기')||''} className="w-3 h-3" alt=""/>깨진 조개껍데기</span>
                  <span className="text-[11px] font-black text-gray-900 dark:text-white transition-colors">{calcResults.qtyBroken.toLocaleString(undefined, {maximumFractionDigits:1})} 개</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 transition-colors">
            <div><p className="text-sm font-bold text-gray-700 dark:text-gray-400 mb-1 transition-colors">일일 총 예상 수익</p></div>
            <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">{calcResults.totalRevenue.toLocaleString()} G</span>
          </div>

          <div className="bg-gray-100 dark:bg-black/30 rounded-xl p-4 border border-gray-200 dark:border-white/5 flex flex-wrap items-center gap-3 transition-colors">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-500 transition-colors">제작 후 남는 잉여 어패류 :</span>
            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-white/5 px-2 py-1 rounded transition-colors">1성 어패류 <span className="text-gray-900 dark:text-white transition-colors">{calcResults.rem1}개</span></span>
            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-white/5 px-2 py-1 rounded transition-colors">2성 어패류 <span className="text-gray-900 dark:text-white transition-colors">{calcResults.rem2}개</span></span>
            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-white/5 px-2 py-1 rounded transition-colors">3성 어패류 <span className="text-gray-900 dark:text-white transition-colors">{calcResults.rem3}개</span></span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm dark:shadow-2xl mt-4 transition-colors">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-white/5 pb-4 transition-colors">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
            NPC 연금품 고정 매입가
          </h3>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-500">[프리미엄 한정가] 스킬 적용</p>
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 transition-colors">Lv.{userStats.o16Lv}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {OCEAN_FIXED_PRICES.map((item, idx) => {
            const buffedPrice = Math.ceil(item.base * (1 + o16Bonus));
            const imgPath = getImagePath(item.name);
            return (
              <div key={idx} className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden p-1.5 transition-colors">
                    {imgPath ? <img src={imgPath} alt={item.name} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }}/> : <span className="text-[8px] text-gray-400 dark:text-gray-600">IMG</span>}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 transition-colors">{item.name}</p>
                    <p className="text-[10px] text-gray-500">기본가: {item.base.toLocaleString()}G</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(52,211,153,0.3)] transition-colors">{buffedPrice.toLocaleString()} G</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}