'use client';

import { useState, useEffect, useMemo } from 'react';
import { SAGE_TOOLS, SAGE_TOOL_EFFECTS } from '@/lib/sageData';
import { useTheme } from 'next-themes';

interface Props {
  activeToolId: string;
  setActiveToolId: (id: string) => void;
  toolLevels: Record<string, number>;
  handleToolLevelChange: (id: string, delta: number, max: number) => void;
  resetTools: () => void;
  saveAll: () => void;
  diffToolCost: { coin: number; ruby: number; stone1: number; stone2: number; stone3: number };
  getToolImageName: (toolId: string, level: number) => string;
  toolImprints?: Record<string, Record<string, number>>;
  savedToolImprints?: Record<string, Record<string, number>>;
  handleImprintChange?: (toolId: string, imprintId: string, level: number) => void;
}

const normalizeId = (id: string) => id.replace(/^sage_/, '');

const IMPRINT_SYSTEM: Record<string, { category: string; contract: string; contractName: string; items: { id: string; name: string; reqs: number[] }[] }> = {
  hoe: {
    category: 'farm', contract: 'prosperity', contractName: '번영의 영혼 계약서',
    items: [
      { id: 'hoe_power', name: '채집 강화', reqs: [5, 7, 9] },
      { id: 'hoe_speed', name: '채집 가속', reqs: [3, 5, 7] },
      { id: 'hoe_seed', name: '씨앗 행운', reqs: [5, 7, 9, 11] },
      { id: 'hoe_fruit', name: '과일 행운', reqs: [5, 7, 9, 11] },
      { id: 'hoe_fruit_speed', name: '과일 가속', reqs: [3, 5, 7] },
      { id: 'hoe_bean', name: '원두 행운', reqs: [5, 7, 9, 11] },
      { id: 'hoe_fast', name: '빠른 농부', reqs: [9, 9, 11, 11, 13] },
      { id: 'hoe_box', name: '작물 상자', reqs: [7, 7, 9, 9, 11] },
      { id: 'hoe_basket', name: '과일 바구니', reqs: [9, 9, 11, 11, 13] },
      { id: 'hoe_meteor', name: '유성 낙하', reqs: [9, 9, 11, 11, 13] },
      { id: 'hoe_roulette', name: '농부 룰렛', reqs: [5, 5, 7, 7, 9] }
    ]
  },
  pickaxe: {
    category: 'mine', contract: 'shatter', contractName: '파쇄의 영혼 계약서',
    items: [
      { id: 'pick_power', name: '채광 강화', reqs: [5, 7, 9] },
      { id: 'pick_speed', name: '채광 가속', reqs: [3, 5, 7] },
      { id: 'pick_ore', name: '광물 행운', reqs: [5, 7, 9, 11] },
      { id: 'pick_relic', name: '유물 탐색', reqs: [3, 5, 7] },
      { id: 'pick_coby', name: '코비 탐색', reqs: [3, 5, 7] },
      { id: 'pick_fast', name: '빠른 광부', reqs: [9, 9, 11, 11, 13] },
      { id: 'pick_gem_coby', name: '보석 코비', reqs: [9, 9, 11, 11, 13] },
      { id: 'pick_cart', name: '광산 수레', reqs: [7, 7, 9, 9, 11] },
      { id: 'pick_roulette', name: '광부 룰렛', reqs: [5, 5, 7, 7, 9] }
    ]
  },
  rod: {
    category: 'fish', contract: 'hightide', contractName: '만조의 영혼 계약서',
    items: [
      { id: 'rod_fish', name: '낚시 행운', reqs: [5, 7, 9, 11] },
      { id: 'rod_power', name: '어획 강화', reqs: [5, 7, 9] },
      { id: 'rod_shell_find', name: '조개 탐색', reqs: [3, 5, 7] },
      { id: 'rod_shell', name: '어패 행운', reqs: [5, 7, 9, 11] },
      { id: 'rod_breath', name: '수중 호흡', reqs: [9] },
      { id: 'rod_fast', name: '빠른 어부', reqs: [9, 9, 11, 11, 13] },
      { id: 'rod_whale', name: '정령 고래', reqs: [7, 7, 9, 9, 11] },
      { id: 'rod_ray', name: '가오리 인도', reqs: [9, 9, 11, 11, 13] },
      { id: 'rod_roulette', name: '어부 룰렛', reqs: [5, 5, 7, 7, 9] }
    ]
  },
  sword: {
    category: 'hunt', contract: 'conquest', contractName: '정복의 영혼 계약서',
    items: [
      { id: 'sword_power', name: '공격 강화', reqs: [5, 7, 9] },
      { id: 'sword_speed', name: '공격 가속', reqs: [3, 5, 7] },
      { id: 'sword_loot', name: '전리품 행운', reqs: [5, 7, 9, 11] },
      { id: 'sword_piece', name: '조각 탐색', reqs: [5, 7, 9] },
      { id: 'sword_fast', name: '빠른 사냥꾼', reqs: [9, 9, 11, 11, 13] },
      { id: 'sword_track', name: '흔적 추적', reqs: [7, 7, 9, 9, 11] },
      { id: 'sword_resonance', name: '조각 공명', reqs: [9, 9, 11, 11, 13] },
      { id: 'sword_blackhole', name: '흡인 사냥', reqs: [9, 9, 11, 11, 13] },
      { id: 'sword_roulette', name: '사냥꾼 룰렛', reqs: [5, 5, 7, 7, 9] }
    ]
  }
};

const IMPRINT_EFFECTS: Record<string, string[]> = {
  hoe_power: ['채집력이 15% 증가합니다.', '채집력이 25% 증가합니다.', '채집력이 40% 증가합니다.'],
  hoe_speed: ['채집 속도가 10% 증가합니다.', '채집 속도가 15% 증가합니다.', '채집 속도가 30% 증가합니다.'],
  hoe_seed: ['작물 채집 시 25% 확률로 씨앗 2개를 추가 드롭합니다.', '작물 채집 시 50% 확률로 씨앗 2개를 추가 드롭합니다.', '작물 채집 시 75% 확률로 씨앗 2개를 추가 드롭합니다.', '작물 채집 시 100% 확률로 씨앗 2개를 추가 드롭합니다.'],
  hoe_fruit: ['과일 채집 시 25% 확률로 과일 1개를 추가 드롭합니다.', '과일 채집 시 50% 확률로 과일 1개를 추가 드롭합니다.', '과일 채집 시 75% 확률로 과일 1개를 추가 드롭합니다.', '과일 채집 시 100% 확률로 과일 1개를 추가 드롭합니다.'],
  hoe_fruit_speed: ['과일 채집 시 채집 시간이 20% 감소합니다.', '과일 채집 시 채집 시간이 40% 감소합니다.', '과일 채집 시 채집 시간이 70% 감소합니다.'],
  hoe_bean: ['두더지 처치 시 25% 확률로 원두 2개를 추가 드롭합니다.', '두더지 처치 시 50% 확률로 원두 2개를 추가 드롭합니다.', '두더지 처치 시 75% 확률로 원두 2개를 추가 드롭합니다.', '두더지 처치 시 100% 확률로 원두 2개를 추가 드롭합니다.'],
  hoe_fast: ['도구를 들면 신속 I을 부여합니다.', '도구를 들면 신속 II를 부여합니다.', '도구를 들면 신속 III을 부여합니다.', '도구를 들면 신속 IV를 부여합니다.', '도구를 들면 신속 V를 부여합니다.'],
  hoe_box: ['작물 채집 시 1% 확률로 작물 상자가 등장합니다.', '작물 채집 시 2% 확률로 작물 상자가 등장합니다.', '작물 채집 시 3% 확률로 작물 상자가 등장합니다.', '작물 채집 시 4% 확률로 작물 상자가 등장합니다.', '작물 채집 시 5% 확률로 작물 상자가 등장합니다.'],
  hoe_basket: ['과일 채집 시 3% 확률로 과일 바구니가 등장합니다.', '과일 채집 시 6% 확률로 과일 바구니가 등장합니다.', '과일 채집 시 9% 확률로 과일 바구니가 등장합니다.', '과일 채집 시 12% 확률로 과일 바구니가 등장합니다.', '과일 채집 시 15% 확률로 과일 바구니가 등장합니다.'],
  hoe_meteor: ['작물 채집 시 2% 확률로 하늘에서 유성이 떨어집니다.', '작물 채집 시 4% 확률로 하늘에서 유성이 떨어집니다.', '작물 채집 시 6% 확률로 하늘에서 유성이 떨어집니다.', '작물 채집 시 8% 확률로 하늘에서 유성이 떨어집니다.', '작물 채집 시 10% 확률로 하늘에서 유성이 떨어집니다.'],
  hoe_roulette: ['작물 채집 시 1% 확률로 주사위가 등장합니다.', '작물 채집 시 2% 확률로 주사위가 등장합니다.', '작물 채집 시 3% 확률로 주사위가 등장합니다.', '작물 채집 시 4% 확률로 주사위가 등장합니다.', '작물 채집 시 5% 확률로 주사위가 등장합니다.'],
  pick_power: ['채광력이 15% 증가합니다.', '채광력이 25% 증가합니다.', '채광력이 40% 증가합니다.'],
  pick_speed: ['채광 속도가 10% 증가합니다.', '채광 속도가 15% 증가합니다.', '채광 속도가 30% 증가합니다.'],
  pick_ore: ['광석 채광 시 25% 확률로 광물 1개를 추가 드롭합니다.', '광석 채광 시 50% 확률로 광물 1개를 추가 드롭합니다.', '광석 채광 시 75% 확률로 광물 1개를 추가 드롭합니다.', '광석 채광 시 100% 확률로 광물 1개를 추가 드롭합니다.'],
  pick_relic: ['유물 획득 확률이 1% 증가합니다.', '유물 획득 확률이 3% 증가합니다.', '유물 획득 확률이 5% 증가합니다.'],
  pick_coby: ['코비 소환 확률이 1% 증가합니다.', '코비 소환 확률이 3% 증가합니다.', '코비 소환 확률이 5% 증가합니다.'],
  pick_fast: ['도구를 들면 신속 I을 부여합니다.', '도구를 들면 신속 II를 부여합니다.', '도구를 들면 신속 III을 부여합니다.', '도구를 들면 신속 IV를 부여합니다.', '도구를 들면 신속 V를 부여합니다.'],
  pick_gem_coby: ['코비 등장 시 5% 확률로 보석 코비로 변신합니다.', '코비 등장 시 10% 확률로 보석 코비로 변신합니다.', '코비 등장 시 20% 확률로 보석 코비로 변신합니다.', '코비 등장 시 30% 확률로 보석 코비로 변신합니다.', '코비 등장 시 50% 확률로 보석 코비로 변신합니다.'],
  pick_cart: ['광석 채광 시 0.5% 확률로 광산 수레가 등장합니다.', '광석 채광 시 1% 확률로 광산 수레가 등장합니다.', '광석 채광 시 1.5% 확률로 광산 수레가 등장합니다.', '광석 채광 시 2% 확률로 광산 수레가 등장합니다.', '광석 채광 시 3% 확률로 광산 수레가 등장합니다.'],
  pick_roulette: ['광석 채집 시 1% 확률로 주사위가 등장합니다.', '광석 채집 시 2% 확률로 주사위가 등장합니다.', '광석 채집 시 3% 확률로 주사위가 등장합니다.', '광석 채집 시 4% 확률로 주사위가 등장합니다.', '광석 채집 시 5% 확률로 주사위가 등장합니다.'],
  rod_fish: ['낚시 시 25% 확률로 물고기 1개를 추가 드롭합니다.', '낚시 시 50% 확률로 물고기 1개를 추가 드롭합니다.', '낚시 시 75% 확률로 물고기 1개를 추가 드롭합니다.', '낚시 시 100% 확률로 물고기 1개를 추가 드롭합니다.'],
  rod_power: ['수중 어획력이 15% 증가합니다.', '수중 어획력이 25% 증가합니다.', '수중 어획력이 40% 증가합니다.'],
  rod_shell_find: ['조개 등장 확률이 1% 증가합니다.', '조개 등장 확률이 3% 증가합니다.', '조개 등장 확률이 5% 증가합니다.'],
  rod_shell: ['수중 어획 시 25% 확률로 어패류 1개를 추가 드롭합니다.', '수중 어획 시 50% 확률로 어패류 1개를 추가 드롭합니다.', '수중 어획 시 75% 확률로 어패류 1개를 추가 드롭합니다.', '수중 어획 시 100% 확률로 어패류 1개를 추가 드롭합니다.'],
  rod_breath: ['수중 호흡을 부여합니다.'],
  rod_fast: ['도구를 들면 신속 I을 부여합니다.', '도구를 들면 신속 II를 부여합니다.', '도구를 들면 신속 III을 부여합니다.', '도구를 들면 신속 IV를 부여합니다.', '도구를 들면 신속 V를 부여합니다.'],
  rod_whale: ['수중 어획 시 1% 확률로 정령 고래가 등장합니다.', '수중 어획 시 2% 확률로 정령 고래가 등장합니다.', '수중 어획 시 3% 확률로 정령 고래가 등장합니다.', '수중 어획 시 4% 확률로 정령 고래가 등장합니다.', '수중 어획 시 5% 확률로 정령 고래가 등장합니다.'],
  rod_ray: ['수중 어획 시 1% 확률로 가오리가 등장합니다.', '수중 어획 시 2% 확률로 가오리가 등장합니다.', '수중 어획 시 3% 확률로 가오리가 등장합니다.', '수중 어획 시 4% 확률로 가오리가 등장합니다.', '수중 어획 시 5% 확률로 가오리가 등장합니다.'],
  rod_roulette: ['수중 어획 시 1% 확률로 주사위가 등장합니다.', '수중 어획 시 2% 확률로 주사위가 등장합니다.', '수중 어획 시 3% 확률로 주사위가 등장합니다.', '수중 어획 시 4% 확률로 주사위가 등장합니다.', '수중 어획 시 5% 확률로 주사위가 등장합니다.'],
  sword_power: ['공격력이 5% 증가합니다.', '공격력이 7% 증가합니다.', '공격력이 10% 증가합니다.'],
  sword_speed: ['공격 속도가 8% 증가합니다.', '공격 속도가 15% 증가합니다.', '공격 속도가 25% 증가합니다.'],
  sword_loot: ['초식 동물 사냥 시 25% 확률로 전리품 1개를 추가 드롭합니다.', '초식 동물 사냥 시 50% 확률로 전리품 1개를 추가 드롭합니다.', '초식 동물 사냥 시 75% 확률로 전리품 1개를 추가 드롭합니다.', '초식 동물 사냥 시 100% 확률로 전리품 1개를 추가 드롭합니다.'],
  sword_piece: ['조각 획득 확률이 1% 증가합니다.', '조각 획득 확률이 3% 증가합니다.', '조각 획득 확률이 5% 증가합니다.'],
  sword_fast: ['도구를 들면 신속 I을 부여합니다.', '도구를 들면 신속 II를 부여합니다.', '도구를 들면 신속 III을 부여합니다.', '도구를 들면 신속 IV를 부여합니다.', '도구를 들면 신속 V를 부여합니다.'],
  sword_track: ['초식 동물 사냥 시 1% 확률로 발자국 흔적을 추적합니다.', '초식 동물 사냥 시 2% 확률로 발자국 흔적을 추적합니다.', '초식 동물 사냥 시 3% 확률로 발자국 흔적을 추적합니다.', '초식 동물 사냥 시 4% 확률로 발자국 흔적을 추적합니다.', '초식 동물 사냥 시 5% 확률로 발자국 흔적을 추적합니다.'],
  sword_resonance: ['초식 동물 사냥 시 0.5% 확률로 각인석이 공명합니다.', '초식 동물 사냥 시 1% 확률로 각인석이 공명합니다.', '초식 동물 사냥 시 1.5% 확률로 각인석이 공명합니다.', '초식 동물 사냥 시 2% 확률로 각인석이 공명합니다.', '초식 동물 사냥 시 3% 확률로 각인석이 공명합니다.'],
  sword_blackhole: ['초식 동물 사냥 시 2% 확률로 중력 폭탄을 발사합니다.', '초식 동물 사냥 시 4% 확률로 중력 폭탄을 발사합니다.', '초식 동물 사냥 시 6% 확률로 중력 폭탄을 발사합니다.', '초식 동물 사냥 시 8% 확률로 중력 폭탄을 발사합니다.', '초식 동물 사냥 시 10% 확률로 중력 폭탄을 발사합니다.'],
  sword_roulette: ['초식 동물 사냥 시 1% 확률로 주사위가 등장합니다.', '초식 동물 사냥 시 2% 확률로 주사위가 등장합니다.', '초식 동물 사냥 시 3% 확률로 주사위가 등장합니다.', '초식 동물 사냥 시 4% 확률로 주사위가 등장합니다.', '초식 동물 사냥 시 5% 확률로 주사위가 등장합니다.']
};

const PROB_COSTS = {
  10: { gold: 100000, ruby: 3, grade: 'rough' },
  20: { gold: 200000, ruby: 5, grade: 'neat' },
  30: { gold: 300000, ruby: 7, grade: 'exquisite' }
};

export default function SageToolsTab({ activeToolId, setActiveToolId, toolLevels, handleToolLevelChange, resetTools, saveAll, diffToolCost, getToolImageName, toolImprints, savedToolImprints, handleImprintChange }: Props) {
  const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";
  const { theme } = useTheme();

  const [localImprints, setLocalImprints] = useState<Record<string, Record<string, number>>>({});
  const [localSavedImprints, setLocalSavedImprints] = useState<Record<string, Record<string, number>>>({});
  const [selectedProb, setSelectedProb] = useState<10 | 20 | 30>(10);

  useEffect(() => {
    const saved = localStorage.getItem('alldding_sage_tools');
    if (saved && !toolImprints) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.imprints) {
          setLocalImprints(parsed.imprints);
          setLocalSavedImprints(parsed.imprints);
        }
      } catch (e) {}
    }
  }, [toolImprints]);

  const effectiveImprints = toolImprints || localImprints;
  const effectiveSavedImprints = savedToolImprints || localSavedImprints;
  
  const setEffectiveImprints = (toolId: string, imprintId: string, level: number) => {
    const sId = normalizeId(toolId);
    if (handleImprintChange) {
      handleImprintChange(toolId, imprintId, level);
    } else {
      const updated = { ...localImprints, [sId]: { ...(localImprints[sId] || {}), [imprintId]: level } };
      setLocalImprints(updated);
    }
  };

  const handleResetCurrentImprints = () => {
    const sId = normalizeId(activeToolId);
    if (imprintConfig) {
      if (handleImprintChange) {
        imprintConfig.items.forEach(item => {
          if ((effectiveImprints[sId]?.[item.id] || 0) > 0) {
            handleImprintChange(activeToolId, item.id, 0);
          }
        });
      } else {
        const updated = { ...localImprints };
        updated[sId] = {};
        setLocalImprints(updated);
      }
    }
  };

  const handleSafeSaveAll = () => {
    if (!handleImprintChange) {
      const currentSaved = localStorage.getItem('alldding_sage_tools');
      try {
        const parsed = currentSaved ? JSON.parse(currentSaved) : {};
        localStorage.setItem('alldding_sage_tools', JSON.stringify({ ...parsed, levels: toolLevels, imprints: localImprints }));
        setLocalSavedImprints(localImprints);
      } catch (e) {}
    }
    saveAll();
  };

  const safeToolId = normalizeId(activeToolId);
  const activeToolData = SAGE_TOOLS.find(t => normalizeId(t.id) === safeToolId);
  const activeToolLv = toolLevels[activeToolId] || 0;
  const imprintConfig = IMPRINT_SYSTEM[safeToolId];

  const handleLevelUp = (imprintId: string, reqs: number[]) => {
    const currentLv = effectiveImprints[safeToolId]?.[imprintId] || 0;
    if (currentLv >= reqs.length) return;
    const reqToolLv = reqs[currentLv];
    
    if (activeToolLv < reqToolLv) {
      alert(`도구 강화 +${reqToolLv}강 이상이 선행되어야 합니다.`);
      return;
    }
    setEffectiveImprints(activeToolId, imprintId, currentLv + 1);
  };

  const handleLevelDown = (imprintId: string) => {
    const currentLv = effectiveImprints[safeToolId]?.[imprintId] || 0;
    if (currentLv <= 0) return;
    setEffectiveImprints(activeToolId, imprintId, currentLv - 1);
  };

  const imprintExpectations = useMemo(() => {
    let expectedGold = 0;
    let expectedRuby = 0;
    let expectedStones = 0;
    let expectedContracts = 0;

    if (!imprintConfig) return { expectedGold, expectedRuby, expectedStones, expectedContracts };

    const probData = PROB_COSTS[selectedProb];
    const attemptsMultiplier = 100 / selectedProb;

    imprintConfig.items.forEach(item => {
      const currentLv = effectiveImprints[safeToolId]?.[item.id] || 0;
      const savedLv = effectiveSavedImprints[safeToolId]?.[item.id] || 0;
      
      if (currentLv > savedLv) {
        for (let i = savedLv + 1; i <= currentLv; i++) {
          expectedGold += probData.gold * attemptsMultiplier;
          expectedRuby += probData.ruby * attemptsMultiplier;
          expectedStones += 1 * attemptsMultiplier;
          expectedContracts += (i * 5) * attemptsMultiplier;
        }
      }
    });

    return { expectedGold, expectedRuby, expectedStones, expectedContracts };
  }, [effectiveImprints, effectiveSavedImprints, safeToolId, selectedProb, imprintConfig]);

  const allImprintsExpectations = useMemo(() => {
    let totalGold = 0;
    
    Object.keys(IMPRINT_SYSTEM).forEach(tId => {
      const config = IMPRINT_SYSTEM[tId];
      const probData = PROB_COSTS[selectedProb];
      const attemptsMultiplier = 100 / selectedProb;

      config.items.forEach(item => {
        const currentLv = effectiveImprints[tId]?.[item.id] || 0;
        const savedLv = effectiveSavedImprints[tId]?.[item.id] || 0;

        if (currentLv > savedLv) {
          for (let i = savedLv + 1; i <= currentLv; i++) {
            totalGold += probData.gold * attemptsMultiplier;
          }
        }
      });
    });

    return totalGold;
  }, [effectiveImprints, effectiveSavedImprints, selectedProb]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-fade-in-up transition-colors duration-300">
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
        {SAGE_TOOLS.map((tool) => (
          <button 
            key={tool.id}
            onClick={() => setActiveToolId(tool.id)}
            className={`py-4 rounded-2xl font-black text-xs transition-all shadow-sm flex flex-col sm:flex-row items-center justify-center gap-2 ${
              activeToolId === tool.id 
              ? 'bg-rose-500 text-white border-transparent shadow-rose-500/30' 
              : 'bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-white/5'
            }`}
          >
            <img src={`${STORAGE_BASE_URL}/tools/${getToolImageName(tool.id, toolLevels[tool.id] || 0)}.png`} className="w-5 h-5 sm:w-6 sm:h-6 object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} alt="" />
            <span>{tool.name}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-6 w-full transition-colors">
        <div className="flex-[2] flex flex-col gap-6 transition-colors">
          
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-2xl transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl flex items-center justify-center relative shadow-inner shrink-0">
                <img 
                  src={`${STORAGE_BASE_URL}/tools/${getToolImageName(activeToolId, activeToolLv)}.png`} 
                  alt={activeToolData?.name} 
                  className="w-full h-full object-contain p-4 drop-shadow-md"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="flex flex-col items-center sm:items-start gap-2">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{activeToolData?.name}</h2>
                <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
                  <div className="flex items-center gap-4 bg-gray-50 dark:bg-black rounded-xl p-2 w-max border border-gray-200 dark:border-white/10">
                    <button 
                      onClick={() => handleToolLevelChange(activeToolId, -1, activeToolData?.maxLevel || 15)} 
                      disabled={activeToolLv === 0} 
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-30 bg-white dark:bg-[#16161a] rounded-lg shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                    </button>
                    <span className={`text-xl font-black w-10 text-center ${activeToolLv > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'}`}>
                      +{activeToolLv}
                    </span>
                    <button 
                      onClick={() => handleToolLevelChange(activeToolId, 1, activeToolData?.maxLevel || 15)} 
                      disabled={activeToolLv === activeToolData?.maxLevel} 
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-30 bg-white dark:bg-[#16161a] rounded-lg shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                  <button 
                    onClick={() => handleToolLevelChange(activeToolId, -activeToolLv, activeToolData?.maxLevel || 15)} 
                    disabled={activeToolLv === 0}
                    className="px-3 py-2 bg-gray-100 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-600 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 font-bold rounded-xl transition-colors text-[11px] h-10 disabled:opacity-30 border border-gray-200 dark:border-transparent flex items-center gap-1.5 shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    강화 초기화
                  </button>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-auto mt-4 md:mt-0">
              <button onClick={handleSafeSaveAll} className="w-full md:w-32 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-black py-3.5 rounded-2xl transition-all shadow-md active:scale-95 text-sm">전체 저장</button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-2xl transition-colors">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 border-b border-gray-100 dark:border-white/5 pb-6">
              <div className="flex items-center gap-3">
                {imprintConfig && (
                  <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0">
                    <img src={`${STORAGE_BASE_URL}/engraving/stone_${imprintConfig.category}_exquisite.png`} className="w-6 h-6 object-contain" alt=""/>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white">도구 각인 설정</h3>
                    <button 
                      onClick={handleResetCurrentImprints} 
                      className="px-2 py-1 bg-gray-100 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-600 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 font-bold rounded-lg transition-colors text-[10px] flex items-center gap-1 border border-gray-200 dark:border-transparent"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      각인 초기화
                    </button>
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-500">확률을 선택하고 레벨을 설정하세요. 선행 강화 수치가 부족하면 각인할 수 없습니다.</p>
                </div>
              </div>
              
              <div className="flex bg-gray-100 dark:bg-black p-1 rounded-xl w-full lg:w-auto shadow-inner">
                {[10, 20, 30].map(prob => (
                  <button
                    key={prob}
                    onClick={() => setSelectedProb(prob as 10|20|30)}
                    className={`flex-1 lg:w-24 py-2.5 text-xs font-black rounded-lg transition-all ${selectedProb === prob ? 'bg-white dark:bg-[#202024] text-rose-600 dark:text-rose-400 shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                  >
                    {prob}% 각인석
                  </button>
                ))}
              </div>
            </div>

            {imprintConfig && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {imprintConfig.items.map(item => {
                  const currentLv = effectiveImprints[safeToolId]?.[item.id] || 0;
                  const isMax = currentLv === item.reqs.length;
                  const nextReq = isMax ? null : item.reqs[currentLv];
                  const canUpgrade = !isMax && activeToolLv >= (nextReq || 0);

                  return (
                    <div key={item.id} className={`border rounded-2xl p-4 flex flex-col transition-colors relative group ${currentLv > 0 ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30' : 'bg-gray-50 dark:bg-[#111113] border-gray-200 dark:border-white/5'}`}>
                      
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-700">
                        {isMax ? '최대 레벨입니다.' : `${activeToolData?.name} +${nextReq}강 이상이 선행되어야 합니다.`}
                      </div>

                      <div className="flex items-center justify-between mb-3 cursor-help">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-white dark:bg-black rounded-full flex items-center justify-center shadow-sm shrink-0 border border-gray-100 dark:border-white/10">
                            <img src={`${STORAGE_BASE_URL}/engraving/stone_${imprintConfig.category}_${PROB_COSTS[selectedProb].grade}.png`} className="w-4 h-4 object-contain" alt=""/>
                          </div>
                          <span className={`text-sm font-black truncate ${currentLv > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-gray-800 dark:text-gray-200'}`}>{item.name}</span>
                        </div>
                        <span className={`text-xs font-black px-2 py-1 rounded bg-white dark:bg-black shadow-sm shrink-0 border border-gray-100 dark:border-white/10 ${currentLv > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'}`}>
                          Lv.{currentLv} <span className="text-gray-300 font-normal">/ {item.reqs.length}</span>
                        </span>
                      </div>
                      
                      <div className="mt-auto pt-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                        <div className="text-[10px] font-bold text-gray-500">
                          {isMax ? (
                            <span className="text-rose-500">최대 레벨 달성</span>
                          ) : (
                            <span className={canUpgrade ? 'text-emerald-500' : 'text-rose-400'}>
                              요구: +{nextReq}강 이상
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-white/10">
                          <button onClick={() => handleLevelDown(item.id)} disabled={currentLv === 0} className="w-8 h-7 flex items-center justify-center text-gray-500 hover:text-rose-500 disabled:opacity-30 transition-colors">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                          </button>
                          <button onClick={() => handleLevelUp(item.id, item.reqs)} disabled={!canUpgrade} className={`w-8 h-7 flex items-center justify-center disabled:opacity-30 transition-colors ${canUpgrade ? 'text-gray-500 hover:text-emerald-500' : 'text-gray-300'}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="mt-8 bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-5">
               <div className="flex items-center gap-3">
                 {imprintConfig && (
                   <div className="w-10 h-10 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                     <img src={`${STORAGE_BASE_URL}/engraving/stone_${imprintConfig.category}_${PROB_COSTS[selectedProb].grade}.png`} className="w-6 h-6 object-contain" alt=""/>
                   </div>
                 )}
                 <div>
                   <h4 className="text-sm font-black text-gray-800 dark:text-gray-200">현재 탭 각인석 소모 기댓값 <span className="text-rose-500 ml-1">({selectedProb}%)</span></h4>
                   <p className="text-[10px] text-gray-500 font-bold mt-0.5">저장 시점 대비 추가 설정된 각인 기준 누적치</p>
                 </div>
               </div>
               <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 sm:gap-4 w-full md:w-auto">
                 <div className="flex items-center gap-1.5 bg-white dark:bg-black px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm">
                   {imprintConfig && <img src={`${STORAGE_BASE_URL}/engraving/stone_${imprintConfig.category}_${PROB_COSTS[selectedProb].grade}.png`} className="w-4 h-4 object-contain" alt=""/>}
                   <span className="text-[11px] font-black text-gray-700 dark:text-gray-300">{imprintExpectations.expectedStones.toLocaleString()}개</span>
                 </div>
                 <div className="flex items-center gap-1.5 bg-white dark:bg-black px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm">
                   {imprintConfig && <img src={`${STORAGE_BASE_URL}/engraving/contract_${imprintConfig.contract}.png`} className="w-4 h-4 object-contain" alt=""/>}
                   <span className="text-[11px] font-black text-gray-700 dark:text-gray-300">{imprintExpectations.expectedContracts.toLocaleString()}장</span>
                 </div>
                 <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/20 shadow-sm">
                   <img src={`${STORAGE_BASE_URL}/ruby.png`} className="w-4 h-4 object-contain" alt=""/>
                   <span className="text-[11px] font-black text-rose-600 dark:text-rose-400">{imprintExpectations.expectedRuby.toLocaleString()}</span>
                 </div>
                 <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-500/20 shadow-sm">
                   <img src={`${STORAGE_BASE_URL}/coin.png`} className="w-4 h-4 object-contain" alt=""/>
                   <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">{imprintExpectations.expectedGold.toLocaleString()}</span>
                 </div>
               </div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full xl:w-[400px] flex flex-col gap-6 shrink-0 transition-colors">
          <div className="bg-white dark:bg-[#0a0a0a] dark:bg-gradient-to-br dark:from-rose-900/20 dark:to-black border border-gray-200 dark:border-rose-500/20 rounded-3xl p-6 shadow-sm dark:shadow-2xl transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">누적 소모 기댓값</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">저장 시점 대비 전체 4종 도구 강화 시뮬레이션 비용</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-3">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">필요 코인</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-amber-600 dark:text-amber-400 text-base">{(Math.max(0, diffToolCost.coin) + allImprintsExpectations).toLocaleString()}</span>
                  <img src={`${STORAGE_BASE_URL}/coin.png`} alt="C" className="w-4 h-4 object-contain" onError={(e) => {e.currentTarget.style.display='none'}} />
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-3">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">필요 루비</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-rose-600 dark:text-rose-400 text-base">{Math.max(0, diffToolCost.ruby).toLocaleString()}</span>
                  <img src={`${STORAGE_BASE_URL}/ruby.png`} alt="R" className="w-4 h-4 object-contain" onError={(e) => {e.currentTarget.style.display='none'}} />
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2 transition-colors">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-500 transition-colors">하급 라이프스톤</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-700 dark:text-gray-300 text-sm transition-colors">{Math.max(0, diffToolCost.stone1).toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
                  <img src={`${STORAGE_BASE_URL}/tools/lifestone1.png`} alt="하급" className="w-4 h-4 object-contain drop-shadow-sm dark:drop-shadow-none" style={{ imageRendering: 'pixelated' }} onError={(e) => {e.currentTarget.style.display='none';}} />
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2 transition-colors">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-500 transition-colors">중급 라이프스톤</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-700 dark:text-gray-300 text-sm transition-colors">{Math.max(0, diffToolCost.stone2).toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
                  <img src={`${STORAGE_BASE_URL}/tools/lifestone3.png`} alt="중급" className="w-4 h-4 object-contain drop-shadow-sm dark:drop-shadow-none" style={{ imageRendering: 'pixelated' }} onError={(e) => {e.currentTarget.style.display='none';}} />
                </div>
              </div>
              <div className="flex justify-between items-center transition-colors">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-500 transition-colors">상급 라이프스톤</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-700 dark:text-gray-300 text-sm transition-colors">{Math.max(0, diffToolCost.stone3).toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
                  <img src={`${STORAGE_BASE_URL}/tools/lifestone2.png`} alt="상급" className="w-4 h-4 object-contain drop-shadow-sm dark:drop-shadow-none" style={{ imageRendering: 'pixelated' }} onError={(e) => {e.currentTarget.style.display='none';}} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-6 flex-1 flex flex-col min-h-[300px] shadow-sm transition-colors">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-4 bg-emerald-500 rounded-full"></div>
              {activeToolData?.name} 적용 효과
            </h3>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-5">
              <div>
                <h4 className="text-[10px] font-black text-gray-400 mb-2.5 border-b border-gray-100 dark:border-white/5 pb-1.5">기본 강화 효과</h4>
                {activeToolLv === 0 ? (
                  <div className="text-[11px] text-gray-500 text-center py-5 font-bold bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
                    강화되지 않은 도구입니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(SAGE_TOOL_EFFECTS[activeToolId]?.[activeToolLv - 1] || {}).map(([key, value], idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-white/5 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/5">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{key}</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-[10px] font-black text-gray-400 mb-2.5 border-b border-gray-100 dark:border-white/5 pb-1.5">부여된 각인 효과</h4>
                {imprintConfig?.items.filter(item => (effectiveImprints[safeToolId]?.[item.id] || 0) > 0).length === 0 ? (
                  <div className="text-[11px] text-gray-500 text-center py-5 font-bold bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
                    부여된 각인이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {imprintConfig?.items.map(item => {
                      const lv = effectiveImprints[safeToolId]?.[item.id] || 0;
                      if (lv === 0) return null;
                      const effectText = IMPRINT_EFFECTS[item.id]?.[lv - 1] || '효과 정보 없음';
                      return (
                        <div key={item.id} className="flex flex-col gap-2 bg-rose-50 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-100 dark:border-rose-500/20">
                          <div className="flex items-center gap-1.5">
                            <img src={`${STORAGE_BASE_URL}/engraving/stone_${imprintConfig.category}_${PROB_COSTS[selectedProb].grade}.png`} className="w-3.5 h-3.5 object-contain" alt=""/>
                            <span className="text-[11px] font-black text-rose-700 dark:text-rose-300">{item.name} <span className="text-[9px] text-rose-500 bg-white dark:bg-rose-950 px-1.5 py-0.5 rounded shadow-sm ml-1 border border-rose-100 dark:border-rose-500/30">Lv.{lv}</span></span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 leading-relaxed pl-5">{effectText}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}