'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { getImagePath } from '@/lib/professionData';

interface HuntRevenueTabProps {
  userStats: {
    stamina: number;
    swordLv: number;
    h2Lv: number;
    h5Lv: number;
    h6Lv: number;
    h12Lv: number;
    h13Lv: number;
    h14Lv: number;
    h15Lv: number;
  };
  toolImprints?: Record<string, Record<string, number>>;
}

const SWORD_TROPHY = [1, 2, 2, 2, 3, 3, 3, 4, 4, 6, 6, 7, 7, 8, 10];
const SWORD_STONE_CHANCE = [0.01, 0.03, 0.03, 0.05, 0.05, 0.07, 0.07, 0.10, 0.10, 0.15, 0.15, 0.20, 0.20, 0.25, 0.30];

const COMBO_BONUS = [0, 0.03, 0.05, 0.10, 0.21, 0.40]; 
const H5_TROPHY_BONUS = [0, 0.03, 0.05, 0.07, 0.10, 0.15, 0.20, 0.30]; 
const H13_SPAWN_RATE = [0, 0.03, 0.07, 0.10]; 
const H14_CARNI_PRICE = [0, 0.05, 0.07, 0.10, 0.20, 0.30, 0.50]; 
const H15_CATCH_RATE = [0, 0.12, 0.15, 0.17, 0.20, 0.25, 0.30]; 

const CARNIVORE_BASE_AVG_VALUE = (22893 * 0.6) + (45785 * 0.3) + (98111 * 0.1); 

const IMPRINT_SWORD_LOOT_CHANCE = [0, 0.25, 0.50, 0.75, 1.00];
const IMPRINT_SWORD_PIECE_CHANCE = [0, 0.01, 0.03, 0.05];
const IMPRINT_SWORD_RESONANCE_CHANCE = [0, 0.005, 0.01, 0.015, 0.02, 0.03];
const IMPRINT_SWORD_BLACKHOLE_CHANCE = [0, 0.02, 0.04, 0.06, 0.08, 0.10];
const IMPRINT_SWORD_ROULETTE_CHANCE = [0, 0.01, 0.02, 0.03, 0.04, 0.05];

const SWORD_IMPRINTS_MAP: Record<string, string> = {
  'sword_power': '공격 강화',
  'sword_speed': '공격 가속',
  'sword_loot': '전리품 행운',
  'sword_piece': '조각 탐색',
  'sword_fast': '빠른 사냥꾼',
  'sword_track': '흔적 추적',
  'sword_resonance': '조각 공명',
  'sword_blackhole': '흡인 사냥',
  'sword_roulette': '사냥꾼 룰렛'
};

export default function HuntRevenueTab({ userStats, toolImprints }: HuntRevenueTabProps) {
  const [loaded, setLoaded] = useState(false);
  const [weakenBonus, setWeakenBonus] = useState<number>(40); 
  const [haggleRate, setHaggleRate] = useState<number>(10);
  const [isHaggle, setIsHaggle] = useState<boolean>(true);
  
  const [isSelfFarm, setIsSelfFarm] = useState<boolean>(false);
  const [heartZombiePrice, setHeartZombiePrice] = useState<number>(100000);
  const [heartSkeletonPrice, setHeartSkeletonPrice] = useState<number>(100000);
  const [heartSpiderPrice, setHeartSpiderPrice] = useState<number>(100000);
  const [heartCreeperPrice, setHeartCreeperPrice] = useState<number>(200000);
  const [contractPrice, setContractPrice] = useState<number>(23000);
  
  const [excludeStone, setExcludeStone] = useState<boolean>(false);
  const [stoneRough, setStoneRough] = useState<number>(100000);
  const [stoneNeat, setStoneNeat] = useState<number>(1000000);
  const [stoneFine, setStoneFine] = useState<number>(2500000);
  
  const [potionCost, setPotionCost] = useState<number>(0);
  const [actualStoneProfit, setActualStoneProfit] = useState<number>(0);

  const [rcptContracts, setRcptContracts] = useState<number>(0);
  const [rcptHearts, setRcptHearts] = useState<number>(0);
  const [rcptHeartCost, setRcptHeartCost] = useState<number>(0);
  const [rcptWeak, setRcptWeak] = useState<number>(0);
  const [rcptNormal, setRcptNormal] = useState<number>(0);
  const [rcptHealthy, setRcptHealthy] = useState<number>(0);
  const [rcptIsHaggle, setRcptIsHaggle] = useState<boolean>(true);
  const [rcptIdAttempts, setRcptIdAttempts] = useState<number>(0);
  const [rcptIdFails, setRcptIdFails] = useState<number>(0);
  const [rcptStoneProfit, setRcptStoneProfit] = useState<number>(0);
  const [rcptPotionCost, setRcptPotionCost] = useState<number>(0);

  useEffect(() => {
    const p = JSON.parse(localStorage.getItem('alldding_prices') || '{}');
    const m = JSON.parse(localStorage.getItem('alldding_misc_settings') || '{}');
    
    if(p.hunt_heart_zombie !== undefined) setHeartZombiePrice(p.hunt_heart_zombie);
    if(p.hunt_heart_skeleton !== undefined) setHeartSkeletonPrice(p.hunt_heart_skeleton);
    if(p.hunt_heart_spider !== undefined) setHeartSpiderPrice(p.hunt_heart_spider);
    if(p.hunt_heart_creeper !== undefined) setHeartCreeperPrice(p.hunt_heart_creeper);
    if(p.hunt_contract !== undefined) setContractPrice(p.hunt_contract);
    if(p.hunt_stone_rough !== undefined) setStoneRough(p.hunt_stone_rough);
    if(p.hunt_stone_neat !== undefined) setStoneNeat(p.hunt_stone_neat);
    if(p.hunt_stone_fine !== undefined) setStoneFine(p.hunt_stone_fine);
    
    if(m.hunt_heart_self !== undefined) setIsSelfFarm(m.hunt_heart_self);
    if(m.hunt_haggle !== undefined) setIsHaggle(m.hunt_haggle);
    if(m.hunt_stone_exclude !== undefined) setExcludeStone(m.hunt_stone_exclude);
    if(m.hunt_potion_cost !== undefined) setPotionCost(m.hunt_potion_cost);
    if(m.hunt_weaken !== undefined) setWeakenBonus(m.hunt_weaken);
    if(m.hunt_haggle_rate !== undefined) setHaggleRate(m.hunt_haggle_rate);
    
    setLoaded(true);
  }, []);

  useEffect(() => {
    if(!loaded) return;
    const p = JSON.parse(localStorage.getItem('alldding_prices') || '{}');
    const m = JSON.parse(localStorage.getItem('alldding_misc_settings') || '{}');
    
    p.hunt_heart_zombie = heartZombiePrice;
    p.hunt_heart_skeleton = heartSkeletonPrice;
    p.hunt_heart_spider = heartSpiderPrice;
    p.hunt_heart_creeper = heartCreeperPrice;
    p.hunt_contract = contractPrice;
    p.hunt_stone_rough = stoneRough;
    p.hunt_stone_neat = stoneNeat;
    p.hunt_stone_fine = stoneFine;
    localStorage.setItem('alldding_prices', JSON.stringify(p));

    m.hunt_heart_self = isSelfFarm;
    m.hunt_haggle = isHaggle;
    m.hunt_stone_exclude = excludeStone;
    m.hunt_potion_cost = potionCost;
    m.hunt_weaken = weakenBonus;
    m.hunt_haggle_rate = haggleRate;
    localStorage.setItem('alldding_misc_settings', JSON.stringify(m));
  }, [heartZombiePrice, heartSkeletonPrice, heartSpiderPrice, heartCreeperPrice, contractPrice, stoneRough, stoneNeat, stoneFine, isSelfFarm, isHaggle, excludeStone, potionCost, weakenBonus, haggleRate, loaded]);

  const results = useMemo(() => {
    let totalKills = Math.floor(userStats.stamina / 10);
    const swordImprints = toolImprints?.['sword'] || {};

    const blackholeLv = swordImprints['sword_blackhole'] || 0;
    const blackholeChance = IMPRINT_SWORD_BLACKHOLE_CHANCE[blackholeLv];
    
    let simulatedStamina = userStats.stamina;
    let actualKills = 0;
    
    if (blackholeChance > 0) {
      let attempts = Math.floor(simulatedStamina / 10);
      actualKills = attempts;
    } else {
      actualKills = totalKills;
    }

    const baseTrophy = userStats.swordLv > 0 ? SWORD_TROPHY[userStats.swordLv - 1] : 1;
    const comboDropBonus = COMBO_BONUS[userStats.h2Lv] || 0;
    const h5Bonus = H5_TROPHY_BONUS[userStats.h5Lv] || 0;
    
    const lootImprintLv = swordImprints['sword_loot'] || 0;
    const extraLootChance = IMPRINT_SWORD_LOOT_CHANCE[lootImprintLv];
    const extraLootCount = actualKills * extraLootChance;

    const rouletteImprintLv = swordImprints['sword_roulette'] || 0;
    const rouletteChance = IMPRINT_SWORD_ROULETTE_CHANCE[rouletteImprintLv];
    const rouletteEncounters = actualKills * rouletteChance;
    const rouletteAvgTrophies = rouletteEncounters * ((3.5 * 5 * 0.9) + (3.5 * 10 * 0.1));

    const totalTrophyMultiplier = 1 + comboDropBonus + h5Bonus;
    const expectedTrophies = Math.floor((actualKills * baseTrophy * totalTrophyMultiplier) + extraLootCount + rouletteAvgTrophies);
    
    const craftableSouls = Math.floor(expectedTrophies / 16);
    const expectedContracts = Math.floor(craftableSouls / 2);
    const requiredHearts = expectedContracts * 8; 

    const heartCostPerContract = isSelfFarm ? 0 : 2 * (heartZombiePrice + heartSkeletonPrice + heartSpiderPrice + heartCreeperPrice) / 64;
    const contractCostTotal = expectedContracts * heartCostPerContract;
    const contractRevenue = expectedContracts * contractPrice;
    const contractProfit = contractRevenue - contractCostTotal;

    const carnivoreSpawnRate = H13_SPAWN_RATE[userStats.h13Lv] || 0;
    const carnivoreEncounters = actualKills * carnivoreSpawnRate;
    
    const baseCatchRate = 0.10;
    const h15Bonus = H15_CATCH_RATE[userStats.h15Lv] || 0;
    const finalCatchRate = Math.min(baseCatchRate + (weakenBonus / 100) + h15Bonus, 0.80);
    const expectedCaught = carnivoreEncounters * finalCatchRate;

    const weakCnt = expectedCaught * 0.6;
    const normCnt = expectedCaught * 0.3;
    const healCnt = expectedCaught * 0.1;

    const boostedCarniPrice = CARNIVORE_BASE_AVG_VALUE * (1 + (H14_CARNI_PRICE[userStats.h14Lv] || 0));
    
    const haggleExpectedMult = (0.7 * 1.075) + (0.3 * 0.925);
    const haggleTotalMult = Math.pow(haggleExpectedMult, 3);
    const finalHaggleMult = isHaggle ? haggleTotalMult : 1;
    
    const carniProfit = expectedCaught * boostedCarniPrice * finalHaggleMult;

    const baseStoneChance = userStats.swordLv > 0 ? SWORD_STONE_CHANCE[userStats.swordLv - 1] : 0.01;
    const pieceImprintLv = swordImprints['sword_piece'] || 0;
    const extraPieceChance = IMPRINT_SWORD_PIECE_CHANCE[pieceImprintLv];
    
    const resonanceImprintLv = swordImprints['sword_resonance'] || 0;
    const resonanceChance = IMPRINT_SWORD_RESONANCE_CHANCE[resonanceImprintLv];
    const resonanceAvgPieces = (actualKills * resonanceChance) * 3; 

    const expectedStonePieces = Math.floor((actualKills * (baseStoneChance + extraPieceChance)) + resonanceAvgPieces);
    
    const idSuccessRate = Math.min(0.30 + (userStats.h12Lv * 0.05), 0.50);
    const avgPiecesPerAttempt = 4 + idSuccessRate;
    const stoneAttempts = Math.floor(expectedStonePieces / avgPiecesPerAttempt);
    const expectedStones = stoneAttempts;

    const stoneCost = stoneAttempts * 50000;
    const stoneSuccesses = stoneAttempts * idSuccessRate;
    const stoneFails = stoneAttempts * (1 - idSuccessRate);

    const expectedRough = stoneSuccesses * 0.70;
    const expectedNeat = stoneSuccesses * 0.20;
    const expectedFine = stoneSuccesses * 0.10;

    const stoneRevenue = (expectedRough * stoneRough) + (expectedNeat * stoneNeat) + (expectedFine * stoneFine);
    const calculatedStoneProfit = stoneRevenue - stoneCost;

    const effectiveStoneProfit = excludeStone ? actualStoneProfit : calculatedStoneProfit;

    const totalPotionCost = potionCost * 10000;
    const totalProfit = contractProfit + carniProfit + effectiveStoneProfit - totalPotionCost;

    return { 
      totalKills: actualKills, expectedTrophies, craftableSouls, expectedContracts, requiredHearts, contractCostTotal, contractProfit,
      expectedStonePieces, expectedStones, stoneAttempts, stoneCost, stoneSuccesses, stoneFails, calculatedStoneProfit,
      carnivoreEncounters, expectedCaught, weakCnt, normCnt, healCnt, carniProfit, finalCatchRate,
      totalProfit, totalPotionCost, effectiveStoneProfit, totalTrophyMultiplier
    };
  }, [userStats, weakenBonus, haggleRate, isHaggle, isSelfFarm, heartZombiePrice, heartSkeletonPrice, heartSpiderPrice, heartCreeperPrice, contractPrice, excludeStone, stoneRough, stoneNeat, stoneFine, potionCost, actualStoneProfit, toolImprints]);

  const loadExpectedResults = () => {
    setRcptContracts(results.expectedContracts);
    setRcptHearts(results.requiredHearts);
    setRcptHeartCost(Math.floor(results.contractCostTotal));
    setRcptWeak(Math.floor(results.weakCnt));
    setRcptNormal(Math.floor(results.normCnt));
    setRcptHealthy(Math.floor(results.healCnt));
    setRcptIsHaggle(isHaggle);
    setRcptIdAttempts(results.stoneAttempts);
    setRcptIdFails(Math.floor(results.stoneFails));
    setRcptStoneProfit(Math.floor(results.effectiveStoneProfit));
    setRcptPotionCost(results.totalPotionCost);
  };

  const autoCarniProfit = useMemo(() => {
    const h14Bonus = 1 + (H14_CARNI_PRICE[userStats.h14Lv] || 0);
    const haggleExpectedMult = (0.7 * 1.075) + (0.3 * 0.925);
    const haggleTotalMult = Math.pow(haggleExpectedMult, 3);
    const finalHaggleMult = rcptIsHaggle ? haggleTotalMult : 1;
    
    return Math.floor(
      ((rcptWeak || 0) * 22893 + 
       (rcptNormal || 0) * 45785 + 
       (rcptHealthy || 0) * 98111) * h14Bonus * finalHaggleMult
    );
  }, [rcptWeak, rcptNormal, rcptHealthy, rcptIsHaggle, userStats.h14Lv]);

  const autoTotalProfit = useMemo(() => {
    const contractsRevenue = (rcptContracts || 0) * contractPrice;
    return Math.floor(
      contractsRevenue - 
      (rcptHeartCost || 0) + 
      autoCarniProfit + 
      (rcptStoneProfit || 0) - 
      (rcptPotionCost || 0)
    );
  }, [rcptContracts, contractPrice, rcptHeartCost, autoCarniProfit, rcptStoneProfit, rcptPotionCost]);

  const executeDownloadReceipt = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 700;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;

    ctx.fillStyle = '#111113';
    ctx.fillRect(0, 0, 700, 850);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    
    const dateStr = new Date().toISOString().split('T')[0];
    ctx.fillText(`${dateStr} 사냥꾼 통계`, 350, 70);
    
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 100);
    ctx.lineTo(650, 100);
    ctx.stroke();

    ctx.font = '22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#dddddd';
    let y = 160;
    const lineH = 45;

    ctx.fillText(`▶ 영혼 계약서 획득: ${rcptContracts.toLocaleString()} 장`, 50, y); y += lineH;
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#999999';
    ctx.fillText(`   - 심장 소모: ${rcptHearts.toLocaleString()} 개`, 50, y); y += lineH;
    ctx.fillText(`   - 심장 비용: ${rcptHeartCost.toLocaleString()} G`, 50, y); y += lineH * 1.2;

    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#dddddd';
    ctx.fillText(`▶ 육식동물 포획: 총 ${(rcptWeak + rcptNormal + rcptHealthy).toLocaleString()} 마리`, 50, y); y += lineH;
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#999999';
    ctx.fillText(`   - 쇠약한: ${rcptWeak} / 평범한: ${rcptNormal} / 건강한: ${rcptHealthy}`, 50, y); y += lineH;
    ctx.fillText(`   - 육식동물 판매 대금: ${autoCarniProfit.toLocaleString()} G (흥정 ${rcptIsHaggle ? 'O' : 'X'})`, 50, y); y += lineH * 1.2;

    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#dddddd';
    ctx.fillText(`▶ 각인석 조사 시도: ${rcptIdAttempts.toLocaleString()} 회`, 50, y); y += lineH;
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#999999';
    ctx.fillText(`   - 성공: ${rcptIdAttempts - rcptIdFails} 회 / 실패: ${rcptIdFails} 회`, 50, y); y += lineH;
    ctx.fillText(`   - 각인석 수익: ${rcptStoneProfit.toLocaleString()} G`, 50, y); y += lineH * 1.2;

    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#dddddd';
    ctx.fillText(`▶ 포션 지출: -${rcptPotionCost.toLocaleString()} G`, 50, y); y += lineH * 1.5;

    ctx.beginPath();
    ctx.moveTo(50, y - 20);
    ctx.lineTo(650, y - 20);
    ctx.stroke();

    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#60a5fa';
    ctx.textAlign = 'right';
    ctx.fillText(`최종 순수익: ${autoTotalProfit.toLocaleString()} G`, 650, y + 40);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dateStr}_사냥꾼_통계.png`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full relative transition-colors duration-300 animate-fade-in-up pb-10">
      
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md dark:shadow-2xl transition-colors">
        <div className="flex items-center justify-between mb-6 px-1 border-b border-gray-200 dark:border-white/5 pb-4">
          <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">수익 계산기 상세 설정</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 px-1">
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 border-b border-gray-200 dark:border-white/5 pb-2">1. 부산물 및 심장 설정</h4>
            
            <label className="flex items-center gap-2 cursor-pointer group w-max">
              <input type="checkbox" className="hidden" checked={isSelfFarm} onChange={(e) => setIsSelfFarm(e.target.checked)} />
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelfFarm ? 'bg-indigo-500 border-indigo-500' : 'bg-white dark:bg-black border-gray-300 dark:border-gray-600 group-hover:border-indigo-400'}`}>
                {isSelfFarm && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">심장 직접 구함 (비용 0원)</span>
            </label>
            
            {!isSelfFarm && (
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500">좀비 심장 1세트 가격 (G)</span>
                  <input type="number" value={heartZombiePrice} onChange={(e) => setHeartZombiePrice(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-black text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500">스켈레톤 심장 1세트 가격 (G)</span>
                  <input type="number" value={heartSkeletonPrice} onChange={(e) => setHeartSkeletonPrice(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-black text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500">거미 심장 1세트 가격 (G)</span>
                  <input type="number" value={heartSpiderPrice} onChange={(e) => setHeartSpiderPrice(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-black text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500">크리퍼 심장 1세트 가격 (G)</span>
                  <input type="number" value={heartCreeperPrice} onChange={(e) => setHeartCreeperPrice(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-black text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-1.5 mt-2">
              <span className="text-[10px] font-bold text-gray-500">영혼 계약서 판매 가격 (G)</span>
              <input type="number" value={contractPrice} onChange={(e) => setContractPrice(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-black text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-400 border-b border-gray-200 dark:border-white/5 pb-2">2. 스태미나 포션 설정</h4>
          
              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-[10px] font-bold text-gray-500">스태미나 포션 사용 총 금액 (만 단위, 미입력 시 0)</span>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" value={potionCost || ''} onChange={(e) => setPotionCost(Number(e.target.value))} placeholder="예: 50" className="flex-1 bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-black text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  <span className="text-xs font-bold text-gray-500 shrink-0">만 골드</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-black text-purple-600 dark:text-purple-400 border-b border-gray-200 dark:border-white/5 pb-2">3. 각인석 수익 설정</h4>
              
              <label className="flex items-center gap-2 cursor-pointer group w-max mb-2">
                <input type="checkbox" className="hidden" checked={excludeStone} onChange={(e) => setExcludeStone(e.target.checked)} />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${excludeStone ? 'bg-purple-500 border-purple-500' : 'bg-white dark:bg-black border-gray-300 dark:border-gray-600 group-hover:border-purple-400'}`}>
                  {excludeStone && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">각인석 수익 제외하고 계산하기</span>
              </label>

              {excludeStone ? (
                <div className="flex flex-col gap-1.5 p-4 bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 rounded-xl">
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400">실제 획득한 각인석 총 수익 입력 (G)</span>
                  <input type="number" value={actualStoneProfit || ''} onChange={(e) => setActualStoneProfit(Number(e.target.value))} placeholder="0" className="w-full bg-white dark:bg-[#111113] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-black text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-gray-500">투박한 각인석 평균가 (G)</span>
                    <input type="number" value={stoneRough} onChange={(e) => setStoneRough(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-black text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-gray-500">단정한 각인석 평균가 (G)</span>
                    <input type="number" value={stoneNeat} onChange={(e) => setStoneNeat(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-black text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className="text-[10px] font-bold text-gray-500">정교한 각인석 평균가 (G)</span>
                    <input type="number" value={stoneFine} onChange={(e) => setStoneFine(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-black text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] shadow-md dark:shadow-2xl relative overflow-hidden flex flex-col lg:flex-row transition-colors items-stretch">
        <div className="w-full lg:w-1/3 bg-gray-50 dark:bg-[#111113] p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/5 flex flex-col transition-colors rounded-t-[2rem] lg:rounded-tr-none lg:rounded-l-[2rem]">
          <div className="mb-6 pb-5 border-b border-gray-200 dark:border-white/5 flex justify-between items-start transition-colors">
            <div>
              <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tight transition-colors">적용된 내 능력치</h3>
              <p className="text-[10px] md:text-[11px] font-bold text-gray-500 leading-relaxed">개인설정 보드에서 저장된 데이터가<br/>시뮬레이션에 자동 반영됩니다.</p>
            </div>
            <Link href="/settings" className="bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[10px] md:text-xs font-bold px-3 py-2 rounded-xl border border-gray-300 dark:border-transparent shadow-sm transition-colors whitespace-nowrap">설정 변경</Link>
          </div>
          
          <div className="space-y-5 flex-1 w-full">
            <div>
              <h4 className="text-[10px] font-black text-gray-400 mb-2 px-1 tracking-widest uppercase">기본 능력치</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 tracking-tight">가용 스태미나</span>
                  <span className="text-[11px] md:text-xs font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{userStats.stamina.toLocaleString()}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 tracking-tight">세이지 대검</span>
                  <span className="text-[11px] md:text-xs font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">{userStats.swordLv > 0 ? `+${userStats.swordLv}` : '미장착'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-gray-400 mb-2 px-1 tracking-widest uppercase">전문가 스킬</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 tracking-tight">[끝까지 간다!]</span>
                  <span className="text-[11px] md:text-xs font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">Lv.{userStats.h2Lv}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 tracking-tight">[남들과는 다르게]</span>
                  <span className="text-[11px] md:text-xs font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">Lv.{userStats.h5Lv}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 tracking-tight">[값어치 증명]</span>
                  <span className="text-[11px] md:text-xs font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">Lv.{userStats.h6Lv}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-purple-600 dark:text-purple-400 tracking-tight">[검증된 방식]</span>
                  <span className="text-[11px] md:text-xs font-black text-purple-600 dark:text-purple-400 whitespace-nowrap">Lv.{userStats.h12Lv}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-amber-600 dark:text-amber-400 tracking-tight">[피 냄새가 나]</span>
                  <span className="text-[11px] md:text-xs font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">Lv.{userStats.h13Lv}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-amber-600 dark:text-amber-400 tracking-tight">[상태 좋네!]</span>
                  <span className="text-[11px] md:text-xs font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">Lv.{userStats.h14Lv}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-amber-600 dark:text-amber-400 tracking-tight">[넌 이제 내 거야!]</span>
                  <span className="text-[11px] md:text-xs font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">Lv.{userStats.h15Lv}</span>
                </div>
              </div>
            </div>

            {toolImprints?.['sword'] && Object.values(toolImprints['sword']).some(lv => lv > 0) && (
              <div>
                <h4 className="text-[10px] font-black text-gray-400 mb-2 px-1 tracking-widest uppercase">부여된 각인석</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(toolImprints['sword']).map(([key, lv]) => {
                    if (lv === 0) return null;
                    const name = SWORD_IMPRINTS_MAP[key];
                    if (!name) return null;
                    return (
                      <div key={key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-black px-3 py-2.5 rounded-xl border border-gray-200 dark:border-transparent shadow-sm transition-colors gap-1 sm:gap-0">
                        <span className="text-[10px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 tracking-tight truncate">[{name}]</span>
                        <span className="text-[11px] md:text-xs font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Lv.{lv}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {userStats.stamina === 3000 && userStats.swordLv === 0 && (
              <p className="text-[10px] text-rose-600 dark:text-rose-400/80 font-bold mt-4 text-center bg-rose-50 dark:bg-rose-500/10 py-2.5 rounded-xl border border-rose-200 dark:border-transparent transition-colors">능력치가 기본값입니다. 정확한 계산을 위해 개인설정에서 데이터를 최신화해주세요.</p>
            )}
          </div>
        </div>
        
        <div className="w-full lg:w-2/3 p-6 md:p-8 flex flex-col justify-between bg-white dark:bg-gradient-to-br dark:from-[#0a0a0a] dark:to-[#0f0f13] transition-colors rounded-b-[2rem] lg:rounded-bl-none lg:rounded-r-[2rem]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tight transition-colors">일일 사냥 획득 및 수익 분석</h3>
              <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 transition-colors">스태미나 효율 및 입력된 환경 변수를 바탕으로 기댓값을 계산합니다.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="relative p-4 rounded-2xl border border-blue-400 shadow-md bg-blue-50 dark:bg-blue-950/20 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest text-white shadow-sm bg-blue-500">
                처치
              </div>
              <p className="text-[10px] font-black text-gray-500 mt-1 mb-2 text-center tracking-tight truncate px-1">초식동물 총 처치 수</p>
              <p className="text-lg md:text-xl font-black text-center tracking-tighter text-blue-600 dark:text-blue-400">
                {results.totalKills.toLocaleString()} <span className="text-xs font-bold">마리</span>
              </p>
            </div>
            
            <div className="relative p-4 rounded-2xl border border-cyan-400 shadow-md bg-cyan-50 dark:bg-cyan-950/20 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest text-white shadow-sm bg-cyan-500">
                획득
              </div>
              <p className="text-[10px] font-black text-gray-500 mt-1 mb-2 text-center tracking-tight truncate px-1">획득 예상 전리품</p>
              <div className="flex flex-col items-center">
                <p className="text-lg md:text-xl font-black text-center tracking-tighter text-cyan-600 dark:text-cyan-400">
                  {results.expectedTrophies.toLocaleString()} <span className="text-xs font-bold">개</span>
                </p>
                <p className="text-[9px] text-cyan-500 font-bold mt-0.5">배율 {(results.totalTrophyMultiplier * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div className="relative p-4 rounded-2xl border border-indigo-400 shadow-md bg-indigo-50 dark:bg-indigo-950/20 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest text-white shadow-sm bg-indigo-500">
                획득
              </div>
              <p className="text-[10px] font-black text-gray-500 mt-1 mb-2 text-center tracking-tight truncate px-1">수상한 각인석 조각</p>
              <p className="text-lg md:text-xl font-black text-center tracking-tighter text-indigo-600 dark:text-indigo-400">
                {results.expectedStonePieces.toLocaleString()} <span className="text-xs font-bold">개</span>
              </p>
            </div>

            <div className="relative p-4 rounded-2xl border border-emerald-400 shadow-md bg-emerald-50 dark:bg-emerald-950/20 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest text-white shadow-sm bg-emerald-500 whitespace-nowrap">
                포획 기댓값
              </div>
              <p className="text-[10px] font-black text-gray-500 mt-1 mb-2 text-center tracking-tight truncate px-1">육식동물 조우</p>
              <div className="flex flex-col items-center">
                <p className="text-lg md:text-xl font-black text-center tracking-tighter text-emerald-600 dark:text-emerald-400">
                  {results.carnivoreEncounters.toFixed(1)} <span className="text-xs font-bold">마리</span>
                </p>
                <p className="text-[9px] text-emerald-500 font-bold mt-0.5">포획률 {(results.finalCatchRate * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-transparent rounded-3xl p-6 md:p-8 flex flex-col shadow-inner transition-colors mb-6">
            <div className="mb-6">
              <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter transition-colors">획득 및 소모 연산결과</h4>
              <p className="text-[10px] md:text-[11px] font-bold text-indigo-700/70 dark:text-indigo-400 transition-colors break-keep">전리품과 각인석 조각을 영혼과 완제품으로 변환한 최종 수량입니다.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <div className="bg-white dark:bg-black/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-500/20 shadow-sm transition-colors flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10 shrink-0">
                      <img src={getImagePath('수상한 각인석') || undefined} alt="수상한 각인석" className="w-5 h-5 object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[9px] font-black mb-0.5 tracking-widest uppercase text-purple-600 dark:text-purple-400">완제품 획득</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white transition-colors tracking-tight leading-tight truncate">수상한 각인석</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-purple-50 dark:border-white/5">
                  <div className="flex justify-between items-center text-[10px] md:text-[11px] font-bold text-gray-500 transition-colors">
                    <span>최종 수량</span>
                    <span className="text-xs md:text-sm font-black text-purple-700 dark:text-purple-400">{results.expectedStones.toLocaleString()}개</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-black/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 shadow-sm transition-colors flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10 shrink-0">
                      <img src={getImagePath('만조의 영혼 계약서') || undefined} alt="영혼 계약서" className="w-5 h-5 object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[9px] font-black mb-0.5 tracking-widest uppercase text-emerald-600 dark:text-emerald-400">완제품 획득</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white transition-colors tracking-tight leading-tight truncate">영혼 계약서</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-emerald-50 dark:border-white/5">
                  <div className="flex justify-between items-center text-[10px] md:text-[11px] font-bold text-gray-500 transition-colors">
                    <span>최종 수량</span>
                    <span className="text-xs md:text-sm font-black text-emerald-700 dark:text-emerald-400">{results.expectedContracts.toLocaleString()}장</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-black/40 p-4 rounded-2xl border border-rose-200 dark:border-rose-500/20 shadow-sm transition-colors flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10 shrink-0">
                      <img src={getImagePath('좀비의 심장') || undefined} alt="몬스터 심장" className="w-5 h-5 object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[9px] font-black mb-0.5 tracking-widest uppercase text-rose-600 dark:text-rose-400">필요 재료</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white transition-colors tracking-tight leading-tight truncate max-w-[100px] sm:max-w-[130px]">소모 몬스터 심장</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-rose-50 dark:border-white/5">
                  <div className="flex justify-between items-center text-[10px] md:text-[11px] font-bold text-gray-500 transition-colors">
                    <span>필요 수량</span>
                    <span className="text-xs md:text-sm font-black text-rose-700 dark:text-rose-400">{results.requiredHearts.toLocaleString()}개</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-transparent rounded-[1.5rem] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors shadow-inner dark:shadow-none mb-6">
            <div>
              <p className="text-sm md:text-base font-black text-gray-900 dark:text-white mb-1 tracking-tight transition-colors">일일 총 순수익 예상액</p>
              <p className="text-[10px] md:text-[11px] font-bold text-gray-500 break-keep">
                ※ 모든 지출(스태미나 포션, 심장 구매, 각인석 조사비)이 차감된 최종 기댓값입니다.
              </p>
            </div>
            <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 drop-shadow-sm tracking-tighter whitespace-nowrap">
              {Math.floor(results.totalProfit).toLocaleString()} <span className="text-2xl text-indigo-500 font-black">G</span>
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md dark:shadow-2xl transition-colors mt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-6 border-b border-gray-200 dark:border-white/5 gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">실제 사냥 결과 입력 및 정산</h3>
            <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">인게임에서 실제로 획득하고 지출한 수치를 입력하여 통계 이미지를 저장하세요.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadExpectedResults} className="bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap shadow-sm">
              예상 기댓값 불러오기
            </button>
            <button onClick={executeDownloadReceipt} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-black px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap">
              결과 이미지 저장
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-[12px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg inline-block">1. 영혼 계약서 및 심장</h4>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-[#111113] p-5 rounded-2xl border border-gray-200 dark:border-white/5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500">획득한 영혼 계약서 (장)</span>
                  <input type="number" value={rcptContracts || ''} onChange={(e) => setRcptContracts(Number(e.target.value))} className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm font-black text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500">소모한 몬스터 심장 (개)</span>
                  <input type="number" value={rcptHearts || ''} onChange={(e) => setRcptHearts(Number(e.target.value))} className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm font-black text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <span className="text-[10px] font-bold text-gray-500">심장 구매 지출액 (G)</span>
                  <input type="number" value={rcptHeartCost || ''} onChange={(e) => setRcptHeartCost(Number(e.target.value))} placeholder={isSelfFarm ? '자급자족 (0원)' : ''} className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm font-black text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[12px] font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-3 py-1.5 rounded-lg inline-block">2. 각인석 조사</h4>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-[#111113] p-5 rounded-2xl border border-gray-200 dark:border-white/5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500">조사 횟수 (회)</span>
                  <input type="number" value={rcptIdAttempts || ''} onChange={(e) => setRcptIdAttempts(Number(e.target.value))} className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm font-black text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500">실패 횟수 (회)</span>
                  <input type="number" value={rcptIdFails || ''} onChange={(e) => setRcptIdFails(Number(e.target.value))} className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm font-black text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <span className="text-[10px] font-bold text-gray-500">각인석 순수익 (G)</span>
                  <input type="number" value={rcptStoneProfit || ''} onChange={(e) => setRcptStoneProfit(Number(e.target.value))} className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm font-black text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-[12px] font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-lg inline-block">3. 육식동물 판매</h4>
              <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-[#111113] p-5 rounded-2xl border border-gray-200 dark:border-white/5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500">쇠약한 (마리)</span>
                  <input type="number" value={rcptWeak || ''} onChange={(e) => setRcptWeak(Number(e.target.value))} className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm font-black text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500">평범한 (마리)</span>
                  <input type="number" value={rcptNormal || ''} onChange={(e) => setRcptNormal(Number(e.target.value))} className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm font-black text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500">건강한 (마리)</span>
                  <input type="number" value={rcptHealthy || ''} onChange={(e) => setRcptHealthy(Number(e.target.value))} className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm font-black text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="flex items-center gap-2 mt-1 col-span-3">
                  <input type="checkbox" id="rcptHaggle" checked={rcptIsHaggle} onChange={(e) => setRcptIsHaggle(e.target.checked)} className="w-4 h-4 accent-orange-500" />
                  <label htmlFor="rcptHaggle" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">흥정하여 판매 완료</label>
                </div>
                <div className="flex flex-col gap-1.5 col-span-3">
                  <span className="text-[10px] font-bold text-gray-500">육식동물 판매 대금 (G)</span>
                  <div className="w-full bg-gray-200/50 dark:bg-[#1a1a1c] border border-gray-300 dark:border-white/5 rounded-lg px-3 py-2.5 text-sm font-black text-gray-500 dark:text-gray-400 flex items-center">
                    {autoCarniProfit.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[12px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-lg inline-block">4. 지출 및 최종 정산</h4>
              <div className="grid grid-cols-1 gap-4 bg-gray-50 dark:bg-[#111113] p-5 rounded-2xl border border-gray-200 dark:border-white/5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500">포션 사용 지출액 (G)</span>
                  <input type="number" value={rcptPotionCost || ''} onChange={(e) => setRcptPotionCost(Number(e.target.value))} className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm font-black text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="flex flex-col gap-1.5 mt-2 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800/50">
                  <span className="text-[12px] font-black text-blue-700 dark:text-blue-400">최종 순수익 (G)</span>
                  <div className="w-full bg-blue-100/50 dark:bg-[#0a0a0a] border border-blue-300/50 dark:border-blue-500/30 rounded-lg px-3 py-3 text-lg font-black text-blue-800 dark:text-blue-400 flex items-center shadow-sm">
                    {autoTotalProfit.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}