'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Profession, SKILL_DATA } from '@/lib/skillData';
import { TOOL_UPGRADE_COST } from '@/lib/sageData';
import { PRICE_BUFF_EFFECTS, LUCKY_HIT_EFFECTS, GEM_DROP_EFFECTS } from '@/lib/professionData';

const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

const DISCLAIMER_1 = "※ 본 스펙업 추천 로드맵은 스탯이 없는 상태(0강, 0렙)에서 출발하여, 최적의 가성비 목표를 향해 1레벨씩 누적 연산한 경로 지표입니다.";
const DISCLAIMER_2 = "※ 개인이 작성한 계산 로직으로 효율을 추정합니다. 참고용으로만 활용하시고, 본 가이드를 따라 투자하여 발생한 게임 내 재화 손실 등은 일절 책임지지 않습니다.";
const RUBY_DISCLAIMER = "※ 루비는 거래 불가 재화이므로 골드 환산 가치 및 내부 비용 연산에서 제외되었습니다.";
const CONVENIENCE_DISCLAIMER_1 = "※ 야생 서버 전용 효율 스킬 및 단순 편의성 스킬은 아일랜드 일수익과 무관하여 계산에서 배제되었습니다.";
const CONVENIENCE_DISCLAIMER_2 = "※ 단, 타 스킬 개방을 위한 필수 선행 조건일 경우 1레벨까지만 로드맵에 반영됩니다.";

const IMPRINT_CATEGORIES: Record<string, { toolId: string; category: string; contractKey: string; items: { id: string; name: string; maxLv: number }[] }> = {
  '채광': { toolId: 'pickaxe', category: 'mine', contractKey: 'contract_mine', items: [
    { id: 'pick_ore', name: '광물 행운', maxLv: 4 }, 
    { id: 'pick_relic', name: '유물 탐색', maxLv: 3 }, 
    { id: 'pick_coby', name: '코비 탐색', maxLv: 3 }, 
    { id: 'pick_gem_coby', name: '보석 코비', maxLv: 5 }, 
    { id: 'pick_cart', name: '광산 수레', maxLv: 5 }, 
    { id: 'pick_roulette', name: '광부 룰렛', maxLv: 5 }
  ]},
  '해양': { toolId: 'rod', category: 'fish', contractKey: 'contract_fish', items: [
    { id: 'rod_fish', name: '낚시 행운', maxLv: 4 }, { id: 'rod_shell_find', name: '조개 탐색', maxLv: 3 }, { id: 'rod_shell', name: '어패 행운', maxLv: 4 }, 
    { id: 'rod_whale', name: '정령 고래', maxLv: 5 }, { id: 'rod_ray', name: '가오리 인도', maxLv: 5 }, { id: 'rod_roulette', name: '어부 룰렛', maxLv: 5 }
  ]},
  '사냥': { toolId: 'sword', category: 'hunt', contractKey: 'contract_hunt', items: [
    { id: 'sword_loot', name: '전리품 행운', maxLv: 4 }, { id: 'sword_piece', name: '조각 탐색', maxLv: 3 }, { id: 'sword_resonance', name: '조각 공명', maxLv: 5 }, 
    { id: 'sword_blackhole', name: '흡인 사냥', maxLv: 5 }, { id: 'sword_roulette', name: '사냥꾼 룰렛', maxLv: 5 }
  ]}
};

const getToolImg = (toolId: string, lv: number) => {
  const prefix = toolId === 'rod' ? 'fish' : toolId;
  const suffix = lv >= 15 ? '4' : lv >= 10 ? '3' : lv >= 6 ? '2' : '1';
  return `${STORAGE_BASE_URL}/tools/${prefix}${suffix}.png`;
};

const getSkillImg = (profTab: string, id: string) => {
  const folderMap: any = { '채광': 'mine_skill', '해양': 'ocean_skill', '사냥': 'hunt_skill' };
  const folderName = folderMap[profTab] || 'mine_skill';
  let imageId = id;
  if (id === 'h14') imageId = 'h6'; if (id === 'h15') imageId = 'h14'; if (id === 'h16') imageId = 'h15';
  if (id === 'm16') imageId = 'm5'; if (id === 'o19') imageId = 'o18';
  return `${STORAGE_BASE_URL}/${folderName}/${imageId}_on.png`;
};

const getBaseDrop = (lv: number) => [1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 8, 10, 13, 15, 18][lv - 1] || 18;
const getBaseCoby = (lv: number) => [0.01, 0.01, 0.02, 0.02, 0.03, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.10, 0.13, 0.15, 0.20][lv - 1] || 0.20;
const getBaseTrophy = (lv: number) => [1, 2, 2, 2, 3, 3, 3, 4, 4, 6, 6, 7, 7, 8, 10][lv - 1] || 10;

const inputBaseClass = "w-full bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-transparent rounded-lg px-3 py-2 text-xs font-black text-gray-900 dark:text-white focus:ring-1 focus:ring-violet-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

interface SpecState { toolLv: number; skills: Record<string, number>; imprints: Record<string, number>; }
interface SpecItem { id: string; name: string; type: 'tool' | 'skill' | 'imprint'; img: string; targetLevel: number; costGold: number; increaseDailyRev: number; efficiency: number; pathEfficiency: number; isAchieved: boolean; prerequisiteMsg?: string; }

export default function SpecUpPage() {
  const [activeTab, setActiveTab] = useState<string>('채광');
  const [isLoaded, setIsLoaded] = useState(false);
  const [marketPrices, setMarketPrices] = useState({ 
    lifestone1: 0, lifestone2: 0, lifestone3: 0, abilityStone: 0, skillArc: 0, 
    contract_mine: 0, contract_fish: 0, contract_hunt: 0,
    sailingPoint100: 5500, royalCert: 10000,
    gemBlock: 0, redstoneSet: 0, lapisSet: 0, goldSet: 0,
    ingotMarketPrice: 6500
  });
  const [imprintPrices, setImprintPrices] = useState<Record<string, Record<number, number>>>({});
  const [userAchieved, setUserAchieved] = useState<SpecState>({ toolLv: 0, skills: {}, imprints: {} });
  const [stamina, setStamina] = useState(3000);

  useEffect(() => {
    const savedPrices = localStorage.getItem('alldding_spec_prices');
    const savedImprintPrices = localStorage.getItem('alldding_spec_imprint_prices');
    const sLevels = localStorage.getItem('alldding_profession');
    const sTools = localStorage.getItem('alldding_sage_tools');
    const sMisc = localStorage.getItem('alldding_misc_settings');

    if (savedPrices) setMarketPrices(prev => ({ ...prev, ...JSON.parse(savedPrices) }));
    if (savedImprintPrices) setImprintPrices(JSON.parse(savedImprintPrices));
    
    let currentStamina = 3000;
    if (sMisc) {
      const m = JSON.parse(sMisc);
      if (m.townRank === '숲') currentStamina = 4000; else if (m.townRank === '열매') currentStamina = 3500; else if (m.townRank === '꽃') currentStamina = 3300;
    }
    setStamina(currentStamina);

    const activeToolId = IMPRINT_CATEGORIES[activeTab]?.toolId;
    let toolLv = 0, skills = {}, imprints = {};
    if (sLevels) skills = JSON.parse(sLevels);
    if (sTools && activeToolId) {
      const t = JSON.parse(sTools);
      if (t.levels) { toolLv = t.levels[activeToolId] || 0; imprints = t.imprints[activeToolId] || {}; }
      else { toolLv = t[activeToolId] || 0; }
    }
    setUserAchieved({ toolLv, skills, imprints });
    setIsLoaded(true);
  }, [activeTab]);

  const handlePriceChange = (key: string, value: string) => {
    const num = parseFloat(value);
    const next = { ...marketPrices, [key]: isNaN(num) ? 0 : Math.round(num) };
    setMarketPrices(next);
    localStorage.setItem('alldding_spec_prices', JSON.stringify(next));
  };

  const handleImprintPriceChange = (id: string, prob: number, val: string) => {
    const updated = { ...imprintPrices };
    if (!updated[id]) updated[id] = { 10: 0, 20: 0, 30: 0 };
    const num = parseFloat(val);
    updated[id][prob] = isNaN(num) ? 0 : Math.round(num);
    setImprintPrices(updated);
    localStorage.setItem('alldding_spec_imprint_prices', JSON.stringify(updated));
  };

  const valuableUnitValueBase = 436333;
  const craftMaterialCost = Math.round(marketPrices.royalCert + (3 * marketPrices.gemBlock) + marketPrices.redstoneSet + marketPrices.lapisSet + ((10/64) * marketPrices.goldSet));
  const ingotCost = Math.round(20 * Math.max(3500, marketPrices.ingotMarketPrice || 0)); 
  const currentCraftMargin = Math.round(valuableUnitValueBase - craftMaterialCost - ingotCost);

  const simulateRevenue = (tab: string, state: SpecState) => {
    let rev = 0;
    if (tab === '채광') {
      const actions = Math.floor(stamina / 10);
      const baseDrop = state.toolLv > 0 ? getBaseDrop(state.toolLv) : 1;
      
      const m6Lv = state.skills['m6'] || 0;
      const luckyHitExpected = m6Lv > 0 ? [
        0.01 * 1,   
        0.02 * 2,   
        0.03 * 3,   
        0.04 * 4,   
        0.05 * 6,   
        0.06 * 8,   
        0.07 * 10,  
        0.08 * 12,  
        0.10 * 16,  
        0.15 * 20   
      ][m6Lv - 1] || 0 : 0;
      
      const oreImprint = [0, 0.25, 0.5, 0.75, 1][state.imprints['pick_ore'] || 0] || 0;
      const rouletteImprint = [0, 0.01, 0.02, 0.03, 0.04, 0.05][state.imprints['pick_roulette'] || 0] || 0;
      const cartImprint = [0, 0.01, 0.02, 0.03, 0.04, 0.05][state.imprints['pick_cart'] || 0] || 0; 

      const totalOres = (actions * baseDrop) + (actions * luckyHitExpected) + (actions * oreImprint) + (actions * rouletteImprint * 23.1) + (actions * cartImprint * 30);

      const m7Lv = state.skills['m7'] || 0;
      const flamingChance = m7Lv > 0 ? [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.15][m7Lv - 1] || 0 : 0;
      const totalIngots = (totalOres / 16) + (actions * flamingChance);
      
      const m5Lv = state.skills['m5'] || 0;
      const ingotBuff = m5Lv > 0 ? [0.05, 0.07, 0.10, 0.20, 0.30, 0.50][m5Lv - 1] || 0 : 0;
      const npcIngotPrice = Math.round(3500 * (1 + ingotBuff));
      
      const ingotUnitValue = Math.max(npcIngotPrice, marketPrices.ingotMarketPrice || 0);

      const m3Lv = state.skills['m3'] || 0;
      const gemDropExpected = m3Lv > 0 ? [0.03 * 1, 0.07 * 1, 0.10 * 2][m3Lv - 1] || 0 : 0;
      
      const baseCoby = state.toolLv > 0 ? getBaseCoby(state.toolLv) : 0;
      const m11Lv = state.skills['m11'] || 0;
      const m11Bonus = m11Lv > 0 ? [0.01, 0.015, 0.02, 0.025, 0.03, 0.04, 0.05, 0.06][m11Lv - 1] || 0 : 0;
      const pickCobyBonus = [0, 0.01, 0.02, 0.03][state.imprints['pick_coby'] || 0] || 0;
      const finalCobyChance = baseCoby + m11Bonus + pickCobyBonus;
      const gemCobyChance = [0, 0.05, 0.1, 0.2, 0.3, 0.5][state.imprints['pick_gem_coby'] || 0] || 0;
      
      const totalGems = (actions * gemDropExpected) + (actions * finalCobyChance * gemCobyChance);
      
      const m4Lv = state.skills['m4'] || 0;
      const gemBuff = m4Lv > 0 ? [0.05, 0.07, 0.10, 0.20, 0.30, 0.50][m4Lv - 1] || 0 : 0;
      const gemUnitValue = Math.round(7500 * (1 + gemBuff));

      const possibleCrafts = Math.min(Math.floor(totalIngots / 20), 5); 
      const m16Lv = state.skills['m16'] || 0;
      const m16Buff = m16Lv > 0 ? [0.05, 0.07, 0.10, 0.15, 0.20, 0.30][m16Lv - 1] || 0 : 0;
      const valuableUnitValue = Math.round(436333 * (1 + m16Buff)); 
      
      const craftCost = Math.round(marketPrices.royalCert + (3 * marketPrices.gemBlock) + marketPrices.redstoneSet + marketPrices.lapisSet + ((10/64) * marketPrices.goldSet));
      
      let crafts = 0;
      if (valuableUnitValue - craftCost > (20 * ingotUnitValue)) crafts = possibleCrafts;

      const leftoverIngots = totalIngots - (crafts * 20);
      const alchemyRev = Math.round((crafts * (valuableUnitValue - craftCost)) + (leftoverIngots * ingotUnitValue) + (totalGems * gemUnitValue));

      const relicChance = [0, 0.005, 0.01, 0.02][state.imprints['pick_relic'] || 0] || 0;
      const avgSailingPoints = 250; 
      const relicRev = Math.round((actions * relicChance) * (avgSailingPoints / 100) * marketPrices.sailingPoint100);

      rev = Math.round(alchemyRev + relicRev);
    } else if (tab === '해양') {
      const actions = Math.floor(stamina / 15);
      const o11Lv = state.skills['o11'] || 0;
      const o11Bonus = o11Lv > 0 ? [0.05, 0.07, 0.1, 0.15, 0.2][o11Lv - 1] || 0 : 0;
      const totalSeafood = (actions * 1 * (1 + o11Bonus)) + (actions * ([0, 0.25, 0.5, 0.75, 1][state.imprints['rod_shell'] || 0] || 0)) + (actions * ([0, 0.01, 0.02, 0.03, 0.04, 0.05][state.imprints['rod_roulette'] || 0] || 0) * 19.25);
      
      const o17Lv = state.skills['o17'] || 0;
      const rate3 = 0.1 + (o17Lv > 0 ? [0.01, 0.03, 0.05, 0.07, 0.1, 0.15][o17Lv - 1] || 0 : 0);
      const o16Lv = state.skills['o16'] || 0;
      const o16Bonus = o16Lv > 0 ? [0.05, 0.07, 0.09, 0.12, 0.15, 0.2, 0.25, 0.3][o16Lv - 1] || 0 : 0;
      
      rev = Math.round((Math.floor((totalSeafood * (1 - 0.3 - rate3)) / 12) * Math.ceil(5393 * (1 + o16Bonus))) + (Math.floor((totalSeafood * 0.3) / 3) * Math.ceil(11399 * (1 + o16Bonus))) + (Math.floor((totalSeafood * rate3) / 6) * Math.ceil(19328 * (1 + o16Bonus))));
    } else if (tab === '사냥') {
      const actions = Math.floor(stamina / 10);
      const h2Lv = state.skills['h2'] || 0;
      const h5Lv = state.skills['h5'] || 0;
      const comboMult = 1 + (h2Lv > 0 ? [0.03, 0.05, 0.1, 0.21, 0.4][h2Lv - 1] || 0 : 0) + (h5Lv > 0 ? [0.03, 0.05, 0.07, 0.1, 0.15, 0.2, 0.3][h5Lv - 1] || 0 : 0);
      
      const trophies = (actions * getBaseTrophy(state.toolLv > 0 ? state.toolLv : 1) * comboMult) + (actions * ([0, 0.25, 0.5, 0.75, 1][state.imprints['sword_loot'] || 0] || 0)) + (actions * ([0, 0.01, 0.02, 0.03, 0.04, 0.05][state.imprints['sword_roulette'] || 0] || 0) * 15.75);
      
      const h13Lv = state.skills['h13'] || 0;
      const h15Lv = state.skills['h15'] || 0;
      const caught = (actions * (h13Lv > 0 ? [0.03, 0.07, 0.1][h13Lv - 1] || 0 : 0)) * Math.min(0.5 + (h15Lv > 0 ? [0.12, 0.15, 0.17, 0.2, 0.25, 0.3][h15Lv - 1] || 0 : 0), 0.8);
      
      const h6Lv = state.skills['h6'] || 0;
      const h14Lv = state.skills['h14'] || 0;
      rev = Math.round((Math.floor(trophies / 15) * Math.round(10000 * (1 + (h6Lv > 0 ? [0.05, 0.07, 0.1, 0.2, 0.3, 0.5][h6Lv - 1] || 0 : 0)))) + Math.floor(caught * Math.round(43605 * (1 + (h14Lv > 0 ? [0.05, 0.07, 0.1, 0.2, 0.3, 0.5][h14Lv - 1] || 0 : 0)))));
    }
    return rev;
  };

  const getToolCost = (lv: number) => {
    const c = TOOL_UPGRADE_COST[lv - 1];
    return c ? Math.round(c.coin + (c.stone1 * marketPrices.lifestone1) + (c.stone2 * marketPrices.lifestone2) + (c.stone3 * marketPrices.lifestone3)) : 0;
  };

  const getSkillCost = (tab: string, id: string, lv: number) => {
    const s = SKILL_DATA[tab as Profession]?.[id]?.costs[lv - 1];
    return s ? Math.round(s.g + (s.p * marketPrices.skillArc)) : 0;
  };

  const getImprintCost = (id: string, lv: number, contractPrice: number) => {
    const p = imprintPrices[id] || { 10: 0, 20: 0, 30: 0 };
    const stoneCost10 = p[10] * 10000; const stoneCost20 = p[20] * 10000; const stoneCost30 = p[30] * 10000;
    const c10 = Math.round(10 * (100000 + marketPrices.abilityStone + (lv * 5 * contractPrice) + stoneCost10));
    const c20 = Math.round(5 * (200000 + marketPrices.abilityStone + (lv * 5 * contractPrice) + stoneCost20));
    const c30 = Math.round(3.333 * (300000 + marketPrices.abilityStone + (lv * 5 * contractPrice) + stoneCost30));
    const best = Math.min(c10, c20, c30);
    return { best, prob: best === c10 ? 10 : best === c20 ? 20 : 30 };
  };

  const roadmapData = useMemo(() => {
    if (!isLoaded || activeTab !== '채광' || !IMPRINT_CATEGORIES[activeTab]) return [];
    
    const items: SpecItem[] = [];
    const cat = IMPRINT_CATEGORIES[activeTab];
    const contractPrice = marketPrices[cat.contractKey as keyof typeof marketPrices] || 0;
    
    let curState: SpecState = { toolLv: 0, skills: {}, imprints: {} };
    
    const validMiningSkills = ['m3', 'm4', 'm5', 'm6', 'm7', 'm11', 'm16'];
    const coreSkills = validMiningSkills;
    
    const allGoals: any[] = [];
    for (let l = 1; l <= 15; l++) allGoals.push({ type: 'tool', id: cat.toolId, lv: l });
    
    Object.values(SKILL_DATA[activeTab as Profession] || {}).forEach(s => {
      if (coreSkills.includes(s.id)) {
        for (let l = 1; l <= s.max; l++) allGoals.push({ type: 'skill', id: s.id, lv: l });
      } else {
        allGoals.push({ type: 'skill', id: s.id, lv: 1 });
      }
    });

    cat.items.forEach(i => {
      for (let l = 1; l <= i.maxLv; l++) allGoals.push({ type: 'imprint', id: i.id, lv: l });
    });

    const getRequiredSteps = (state: SpecState, goal: any) => {
      let steps: any[] = [];
      if (goal.type === 'tool') {
        for (let l = state.toolLv + 1; l <= goal.lv; l++) steps.push({ type: 'tool', id: goal.id, lv: l });
      } else if (goal.type === 'skill') {
        let reqs: any[] = [];
        let curr: string | null = goal.id;
        while (curr) {
          const sData = SKILL_DATA[activeTab as Profession][curr];
          if (!sData) break;
          
          let tempReqs: any[] = [];
          if (curr === goal.id) {
            for (let l = (state.skills[curr] || 0) + 1; l <= goal.lv; l++) tempReqs.push({ type: 'skill', id: curr, lv: l });
          } else {
            if ((state.skills[curr] || 0) < 1) tempReqs.push({ type: 'skill', id: curr, lv: 1 });
            else break;
          }
          
          reqs = [...tempReqs, ...reqs];
          curr = sData.req as string | null;
        }
        steps = reqs;
      } else if (goal.type === 'imprint') {
        if (state.toolLv < 3) {
          for (let l = state.toolLv + 1; l <= 3; l++) steps.push({ type: 'tool', id: cat.toolId, lv: l });
        }
        for (let l = (state.imprints[goal.id] || 0) + 1; l <= goal.lv; l++) steps.push({ type: 'imprint', id: goal.id, lv: l });
      }
      return steps;
    };

    let loopSafety = 0;
    while (loopSafety < 300) {
      loopSafety++;
      let bestTarget: any = null;
      let maxEff = -1;
      let minCostForZero = Infinity;

      const baseRev = simulateRevenue(activeTab, curState);

      for (const goal of allGoals) {
        const steps = getRequiredSteps(curState, goal);
        if (steps.length === 0) continue; 

        let cost = 0;
        let testState = JSON.parse(JSON.stringify(curState));
        for (const step of steps) {
          if (step.type === 'tool') { cost += getToolCost(step.lv); testState.toolLv = step.lv; }
          else if (step.type === 'skill') { cost += getSkillCost(activeTab, step.id, step.lv); testState.skills[step.id] = step.lv; }
          else { cost += getImprintCost(step.id, step.lv, contractPrice).best; testState.imprints[step.id] = step.lv; }
        }

        const delta = simulateRevenue(activeTab, testState) - baseRev;
        const eff = cost > 0 ? (delta / cost) * 100 : 0;

        if (eff > 0 && eff > maxEff) {
          maxEff = eff;
          bestTarget = { goal, steps, eff, delta, cost };
        } else if (maxEff <= 0 && eff === 0) {
          const isCoreGoal = goal.type !== 'skill' || coreSkills.includes(goal.id);
          if (isCoreGoal && cost < minCostForZero) {
            minCostForZero = cost;
            bestTarget = { goal, steps, eff, delta, cost };
          }
        }
      }

      if (!bestTarget) break;

      const firstStep = bestTarget.steps[0];
      let stepCost = 0;
      let nextState = JSON.parse(JSON.stringify(curState));
      let name = '', img = '';

      if (firstStep.type === 'tool') {
        stepCost = getToolCost(firstStep.lv);
        nextState.toolLv = firstStep.lv;
        name = `세이지 도구 +${firstStep.lv}`;
        img = getToolImg(cat.toolId, firstStep.lv);
      } else if (firstStep.type === 'skill') {
        stepCost = getSkillCost(activeTab, firstStep.id, firstStep.lv);
        nextState.skills[firstStep.id] = firstStep.lv;
        const sName = SKILL_DATA[activeTab as Profession][firstStep.id].name;
        name = `[${sName.includes(']') ? sName.split('] ')[1] : sName}] Lv.${firstStep.lv}`;
        img = getSkillImg(activeTab, firstStep.id);
      } else {
        const impData = getImprintCost(firstStep.id, firstStep.lv, contractPrice);
        stepCost = impData.best;
        nextState.imprints[firstStep.id] = firstStep.lv;
        const iName = cat.items.find(i => i.id === firstStep.id)?.name;
        name = `[각인] ${iName} Lv.${firstStep.lv}`;
        img = `${STORAGE_BASE_URL}/engraving/stone_${cat.category}_${impData.prob === 10 ? 'rough' : impData.prob === 20 ? 'neat' : 'exquisite'}.png`;
      }

      const stepDelta = simulateRevenue(activeTab, nextState) - baseRev;
      const isAchieved = firstStep.type === 'tool' ? userAchieved.toolLv >= firstStep.lv :
                         firstStep.type === 'skill' ? (userAchieved.skills[firstStep.id] || 0) >= firstStep.lv :
                         (userAchieved.imprints[firstStep.id] || 0) >= firstStep.lv;

      let msg = undefined;
      if (stepDelta === 0 && bestTarget.eff > 0) {
        let targetName = '';
        if (bestTarget.goal.type === 'tool') targetName = `세이지 도구 +${bestTarget.goal.lv}`;
        else if (bestTarget.goal.type === 'skill') targetName = SKILL_DATA[activeTab as Profession][bestTarget.goal.id].name;
        else targetName = cat.items.find(i => i.id === bestTarget.goal.id)?.name || '';
        
        const cleanName = targetName.replace(/\[.*?\]\s*/g, '');
        msg = `[${cleanName}]<br />선행 스펙업`;
      } else if (stepDelta === 0 && bestTarget.eff === 0) {
        msg = "단순 편의성 혹은<br />시간 단축 효과";
      }

      items.push({
        id: `${firstStep.type}_${firstStep.id}_${firstStep.lv}`,
        name,
        type: firstStep.type,
        img,
        targetLevel: firstStep.lv,
        costGold: Math.round(stepCost) || 1,
        increaseDailyRev: Math.round(stepDelta),
        efficiency: stepCost > 0 ? (stepDelta / stepCost) * 100 : 0,
        pathEfficiency: bestTarget.eff,
        isAchieved,
        prerequisiteMsg: msg
      });

      curState = nextState;
    }
    return items;
  }, [isLoaded, activeTab, marketPrices, imprintPrices, userAchieved, stamina]);

  if (!isLoaded) return <div className="min-h-screen bg-[#050505]"></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 flex flex-col relative transition-colors">
      <div className="absolute top-[-20%] left-[-10%] w-full h-[50%] bg-violet-400/10 dark:bg-violet-600/5 rounded-full blur-[150px] pointer-events-none transition-colors duration-300"></div>
      <Header />
      
      <main className="relative z-10 flex-1 max-w-[1600px] w-full mx-auto px-4 pt-28 md:pt-32 pb-24 flex flex-col items-center">
        <div className="mb-8 text-center w-full px-2">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3">스펙업 <span className="text-violet-600 dark:text-violet-500">가이드</span></h1>
        </div>

        <div className="w-full max-w-3xl mb-10 grid grid-cols-4 gap-2 bg-white dark:bg-white/5 p-2 rounded-3xl shadow-md border border-gray-200 dark:border-transparent">
          {['재배', '채광', '해양', '사냥'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 rounded-2xl font-bold transition-all text-[11px] sm:text-sm md:text-base shadow-sm ${activeTab === tab ? `bg-gray-900 text-white dark:bg-white dark:text-black scale-[1.02] shadow-md` : 'text-gray-500 hover:text-gray-900 dark:hover:text-white bg-transparent'}`}>{tab}</button>
          ))}
        </div>

        {activeTab === '채광' ? (
          <div className="w-full flex flex-col xl:flex-row gap-8 items-start">
            <div className="w-full xl:w-[420px] bg-white dark:bg-[#0a0a0a] rounded-[2rem] p-8 shadow-2xl border border-gray-300 dark:border-transparent xl:sticky xl:top-28 shrink-0">
              <h3 className="text-lg font-black mb-6 border-b dark:border-white/10 pb-4">통합 재료 시세 입력</h3>
              <div className="grid grid-cols-2 gap-4 border-b dark:border-white/10 pb-6 mb-6">
                {[
                  { id: 'skillArc', label: '스킬 아크 (1P)', desc: '보유 시 0' }, 
                  { id: `contract_mine`, label: `영혼 계약서`, desc: '채광' }, 
                  { id: 'abilityStone', label: '어빌리티 스톤' }, 
                  { id: 'lifestone1', label: '하급 라이프스톤' }, 
                  { id: 'lifestone2', label: '중급 라이프스톤' }, 
                  { id: 'lifestone3', label: '상급 라이프스톤' }
                ].map(item => (
                  <div key={item.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{item.label}</label>
                      {item.desc && <span className="text-[8px] font-bold text-violet-500">{item.desc}</span>}
                    </div>
                    <input type="number" value={marketPrices[item.id as keyof typeof marketPrices] === 0 ? '' : marketPrices[item.id as keyof typeof marketPrices]} onChange={(e) => handlePriceChange(item.id, e.target.value)} placeholder="0" className={inputBaseClass} />
                  </div>
                ))}
                
                <div className="col-span-2 mt-1 mb-1 border-t dark:border-white/5 pt-4 flex items-center justify-between">
                  <span className="text-[10px] font-black text-violet-600 dark:text-violet-400">귀중품 재료 및 유물 포인트 시세</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between ml-1"><label className="text-[10px] font-bold text-gray-700 dark:text-gray-300">항해 포인트 (100pt 당)</label><span className="text-[8px] font-bold text-emerald-500">유물</span></div>
                  <input type="number" value={marketPrices.sailingPoint100 === 0 ? '' : marketPrices.sailingPoint100} onChange={e => handlePriceChange('sailingPoint100', e.target.value)} placeholder="5500" className={inputBaseClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between ml-1"><label className="text-[10px] font-bold text-gray-700 dark:text-gray-300">주괴 (유저 거래가)</label><span className="text-[8px] font-bold text-emerald-500">채광</span></div>
                  <input type="number" value={marketPrices.ingotMarketPrice === 0 ? '' : marketPrices.ingotMarketPrice} onChange={e => handlePriceChange('ingotMarketPrice', e.target.value)} placeholder="6500" className={inputBaseClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between ml-1"><label className="text-[10px] font-bold text-gray-700 dark:text-gray-300">토파/사파/플래 (1개)</label><span className="text-[8px] font-bold text-emerald-500">귀중품</span></div>
                  <input type="number" value={marketPrices.gemBlock === 0 ? '' : marketPrices.gemBlock} onChange={e => handlePriceChange('gemBlock', e.target.value)} placeholder="0" className={inputBaseClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between ml-1"><label className="text-[10px] font-bold text-gray-700 dark:text-gray-300">레드스톤 블록 (1셋)</label></div>
                  <input type="number" value={marketPrices.redstoneSet === 0 ? '' : marketPrices.redstoneSet} onChange={e => handlePriceChange('redstoneSet', e.target.value)} placeholder="0" className={inputBaseClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between ml-1"><label className="text-[10px] font-bold text-gray-700 dark:text-gray-300">청금석 블록 (1셋)</label></div>
                  <input type="number" value={marketPrices.lapisSet === 0 ? '' : marketPrices.lapisSet} onChange={e => handlePriceChange('lapisSet', e.target.value)} placeholder="0" className={inputBaseClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between ml-1"><label className="text-[10px] font-bold text-gray-700 dark:text-gray-300">금블록 (1셋)</label></div>
                  <input type="number" value={marketPrices.goldSet === 0 ? '' : marketPrices.goldSet} onChange={e => handlePriceChange('goldSet', e.target.value)} placeholder="0" className={inputBaseClass} />
                </div>

                <div className="col-span-2 mt-2 bg-gray-100 dark:bg-[#1a1a1c] rounded-xl p-3 border border-gray-200 dark:border-white/5 flex flex-col gap-1 shadow-inner">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-600 dark:text-gray-400">
                    <span>현재 시세 기준 1개 제작 손익</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black text-gray-900 dark:text-white">귀중품 마진</span>
                    <span className={`text-sm font-black ${currentCraftMargin > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {currentCraftMargin > 0 ? '+' : ''}{currentCraftMargin.toLocaleString()} G
                    </span>
                  </div>
                  {currentCraftMargin <= 0 && (
                    <span className="text-[9px] font-bold text-rose-500 mt-1">※ 주괴 매각 대비 적자 구간 (귀중품 관련 스킬 후순위 배치)</span>
                  )}
                </div>
              </div>
              
              <h4 className="text-[11px] font-black text-violet-600 dark:text-violet-400 mb-3">각인석 단가 (만 G)</h4>
              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-2 text-[9px] font-black text-gray-500 text-center mb-3 px-1"><span>종류</span><span>10%</span><span>20%</span><span>30%</span></div>
              <div className="space-y-2">{IMPRINT_CATEGORIES['채광']?.items.map(im => (
                <div key={im.id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-2 items-center">
                  <span className="text-[10px] font-bold truncate text-gray-700 dark:text-gray-300 pl-1">{im.name}</span>
                  {[10, 20, 30].map(p => (
                    <div key={p} className="relative">
                      <input type="number" value={imprintPrices[im.id]?.[p] === 0 ? '' : imprintPrices[im.id]?.[p]} onChange={e => handleImprintPriceChange(im.id, p, e.target.value)} placeholder="0" className={`${inputBaseClass} !px-1.5 !py-1 text-[10px] text-center`} />
                    </div>
                  ))}
                </div>
              ))}</div>
            </div>

            <div className="flex-1 w-full flex flex-col gap-6">
              <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-4 border border-gray-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center shadow-sm">
                <span className="text-xs font-bold text-gray-500">달성 완료 스펙은 순위 변동 없이 아이콘만 <span className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-gray-400">흑백</span> 표시됩니다.</span>
              </div>

              <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-y-12 gap-x-4 place-items-center w-full px-1">
                {roadmapData.length > 0 ? roadmapData.map((item, idx) => {
                  const effiScore = (item.pathEfficiency).toFixed(3);
                  
                  return (
                    <div key={item.id} className="relative flex justify-center w-full group cursor-help">
                      <div className={`relative flex flex-col items-center justify-center w-[80px] h-[94px] rounded-[1.25rem] bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/10 shadow-sm hover:border-violet-500 hover:-translate-y-1 transition-all z-20 ${item.isAchieved ? 'opacity-60 grayscale' : ''}`}>
                        <div className={`absolute -top-3 px-2 py-0.5 rounded-md font-black text-[9px] shadow-sm z-30 ${item.isAchieved ? 'bg-gray-300 text-gray-500 dark:bg-gray-800 dark:text-gray-400' : 'bg-violet-600 text-white'}`}>{idx + 1}위</div>
                        <div className="w-10 h-10 mt-3 mb-1.5 rounded-xl overflow-hidden z-20">
                          <img src={item.img} alt="" className={`w-full h-full object-contain ${item.isAchieved ? 'opacity-40' : 'drop-shadow-sm'}`} style={{imageRendering: 'pixelated'}} />
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black text-white mb-1 z-20 ${item.isAchieved ? 'bg-gray-400 dark:bg-gray-700 text-gray-300' : (item.type === 'tool' ? 'bg-stone-500' : item.type === 'skill' ? 'bg-rose-500' : 'bg-emerald-500')}`}>{item.type === 'tool' ? '도구' : item.type === 'skill' ? '스킬' : '각인'}</span>
                        <h4 className={`text-[10px] font-black text-center px-1 truncate w-full z-20 ${item.isAchieved ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>Lv.{item.targetLevel}</h4>
                        {item.isAchieved && <div className="absolute -right-1 -bottom-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0a0a0a] shadow-sm z-30"><svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" /></svg></div>}
                      </div>

                      <svg className="absolute -right-[1rem] top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-700 z-10 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" /></svg>

                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[180px] bg-gray-900 border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity z-[999] p-4 rounded-2xl shadow-2xl scale-95 group-hover:scale-100 origin-bottom pointer-events-none">
                        <p className="text-xs font-black text-white text-center mb-2">{item.name}</p>
                        <div className="bg-white/10 p-3 rounded-xl border border-white/5 flex flex-col items-center justify-center min-h-[46px]">
                          {item.prerequisiteMsg ? (
                            <p className="text-[10px] text-amber-400 text-center font-black leading-tight" dangerouslySetInnerHTML={{ __html: item.prerequisiteMsg }}></p>
                          ) : (
                            <div className="text-center">
                              <p className="text-[9px] text-gray-400 font-bold mb-1">효율 수치</p>
                              <p className="text-[15px] text-violet-400 font-black tracking-tight leading-none">{effiScore}<span className="text-xs ml-0.5">%</span></p>
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 border-b border-r border-gray-700 rotate-45"></div>
                      </div>
                    </div>
                  );
                }) : <div className="w-full col-span-full py-32 text-center text-sm font-bold text-gray-500 bg-white dark:bg-[#111113] rounded-3xl border border-gray-200 dark:border-white/5">시뮬레이션 데이터를 계산하고 있습니다.</div>}
              </div>

              <div className="mt-16 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-sm flex flex-col gap-3 text-left pl-6">
                <p className="text-xs font-bold text-gray-500 leading-relaxed break-keep">{DISCLAIMER_1}</p>
                <p className="text-xs font-bold text-gray-500 leading-relaxed break-keep">{DISCLAIMER_2}</p>
                <p className="text-xs font-bold text-rose-500/80 leading-relaxed break-keep mt-2">{RUBY_DISCLAIMER}</p>
                <p className="text-xs font-bold text-indigo-500/80 leading-relaxed break-keep mt-2">{CONVENIENCE_DISCLAIMER_1}</p>
                <p className="text-xs font-bold text-indigo-500/80 leading-relaxed break-keep">{CONVENIENCE_DISCLAIMER_2}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full py-40 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{activeTab} 전문가 스펙업 가이드</h3>
            <p className="text-sm font-bold text-gray-500">현재 더욱 정밀한 효율 계산 로직을 구현 예정입니다.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}