import { OCEAN_RECIPES as RAW_OCEAN_RECIPES, OCEAN_FIXED_PRICES, getImagePath } from '@/lib/professionData';

export { OCEAN_FIXED_PRICES, getImagePath };

export const PATCHED_OCEAN_RECIPES = RAW_OCEAN_RECIPES.map(r => {
  if (['수호의 정수(1성)', '파동의 정수(1성)', '생명의 정수(1성)', '부식의 정수(1성)', '혼란의 정수(1성)', 
       '수호 에센스', '파동 에센스', '생명 에센스', '부식 에센스', '혼란 에센스'].includes(r.name)) {
    return { ...r, note: '1회 2개 제작' };
  }
  return r;
});

export const PARSED_RECIPES = PATCHED_OCEAN_RECIPES.map(r => {
  let yieldAmount = 1;
  if (r.note && r.note.includes('2개 제작')) yieldAmount = 2;
  if (r.name.includes('(2개)')) yieldAmount = 2;

  return {
    name: r.name,
    yieldAmount,
    time: r.time,
    ingredients: r.ingredients.map(ing => {
      const match = ing.match(/(.+?)(?:\s+(\d+)개)?$/);
      return { name: match ? match[1].trim() : ing, req: match && match[2] ? parseInt(match[2], 10) : 1 };
    })
  };
});

export const TIER1 = ["굴(1성)", "소라(1성)", "문어(1성)", "미역(1성)", "성게(1성)"];
export const TIER2 = ["굴(2성)", "소라(2성)", "문어(2성)", "미역(2성)", "성게(2성)"];
export const TIER3 = ["굴(3성)", "소라(3성)", "문어(3성)", "미역(3성)", "성게(3성)"];
export const FISH = ["새우", "도미", "청어", "금붕어", "농어"];

export const CORE_BASE_SHELLS = [...TIER1, ...TIER2, ...TIER3];

export const VANILLA = ["점토", "모래", "자갈", "화강암", "흙", "해초", "참나무잎", "가문비나무잎", "자작나무잎", "아카시아나무잎", "벚나무잎", "켈프", "청금석 블록", "레드스톤 블록", "철 주괴", "금 주괴", "다이아몬드", "불우렁쉥이", "유리병", "네더랙", "마그마블록", "영혼 흙", "진홍빛 자루", "뒤틀린 자루", "말린 켈프", "발광 열매", "죽은 관 산호 블록", "죽은 사방산호 블록", "죽은 거품 산호 블록", "죽은 불 산호 블록", "죽은 뇌 산호 블록", ...FISH];

export const sortOceanItems = (items: string[]) => {
  const order = ['수호', '파동', '혼란', '생명', '부식'];
  return [...items].sort((a, b) => {
    let scoreA = 99;
    let scoreB = 99;
    order.forEach((kw, idx) => { if (a.includes(kw)) scoreA = Math.min(scoreA, idx); });
    order.forEach((kw, idx) => { if (b.includes(kw)) scoreB = Math.min(scoreB, idx); });
    if (scoreA !== scoreB) return scoreA - scoreB;
    return items.indexOf(a) - items.indexOf(b);
  });
};

export const ALCHEMY_T1_JEONGSU = ["수호의 정수(1성)", "파동의 정수(1성)", "혼란의 정수(1성)", "생명의 정수(1성)", "부식의 정수(1성)"];
export const ALCHEMY_T1_ESSENCE = ["수호 에센스", "파동 에센스", "혼란 에센스", "생명 에센스", "부식 에센스"];
export const ALCHEMY_T1_ELIXIR = ["수호의 엘릭서", "파동의 엘릭서", "혼란의 엘릭서", "생명의 엘릭서", "부식의 엘릭서"];
export const ALCHEMY_T1 = [...ALCHEMY_T1_JEONGSU, ...ALCHEMY_T1_ESSENCE, ...ALCHEMY_T1_ELIXIR];

export const ALCHEMY_T2_CORE = sortOceanItems(["물결 수호의 핵", "파동 오염의 핵", "질서 파괴의 핵", "활력 붕괴의 핵", "침식 방어의 핵"]);
export const ALCHEMY_T2_CRYSTAL = sortOceanItems(["활기 보존의 결정", "파도 침식의 결정", "격류 재생의 결정", "맹독 혼란의 결정", "방어 오염의 결정"]);
export const ALCHEMY_T2_POTION = sortOceanItems(["불멸 재생의 영약", "파동 장벽의 영약", "생명 광란의 영약", "맹독 파동의 영약", "타락 침식의 영약"]);
export const ALCHEMY_T2 = [...ALCHEMY_T2_CORE, ...ALCHEMY_T2_CRYSTAL, ...ALCHEMY_T2_POTION];

export const ALCHEMY_T3 = ["영생의 아쿠티스", "크라켄의 광란체", "리바이던의 깃털", "해구의 파동 코어", "침묵의 심해 비약", "청해룡의 날개", "아쿠아 펄스 파편", "나우틸러스의 손", "무저의 척추", "추출된 희석액"];

export const CORE_ITEMS = [...CORE_BASE_SHELLS, ...FISH, ...ALCHEMY_T1, ...ALCHEMY_T2];

export const BATCH_MATS = ['수호의 정수(1성)', '파동의 정수(1성)', '생명의 정수(1성)', '부식의 정수(1성)', '혼란의 정수(1성)', '수호 에센스', '파동 에센스', '생명 에센스', '부식 에센스', '혼란 에센스'];

export const INVENTORY_GROUPS = [
  { title: "1성 어패류", subGroups: [TIER1] },
  { title: "2성 어패류", subGroups: [TIER2] },
  { title: "3성 어패류", subGroups: [TIER3] },
  { title: "물고기", subGroups: [FISH] },
  { title: "1단계 연금품", subGroups: [ALCHEMY_T1_JEONGSU, ALCHEMY_T1_ESSENCE, ALCHEMY_T1_ELIXIR] },
  { title: "2단계 연금품", subGroups: [ALCHEMY_T2_CORE, ALCHEMY_T2_CRYSTAL, ALCHEMY_T2_POTION] }
];

export const RECIPE_FIXES: Record<string, {ing: string, req: number, yield: number}> = {
  '깐 새우': { ing: '새우', req: 1, yield: 2 },
  '도미 회': { ing: '도미', req: 1, yield: 2 },
  '청어 회': { ing: '청어', req: 1, yield: 2 },
  '금붕어 회': { ing: '금붕어', req: 1, yield: 2 },
  '농어 회': { ing: '농어', req: 1, yield: 2 },
  '굴(2성)': { ing: '굴(1성)', req: 3, yield: 1 },
  '소라(2성)': { ing: '소라(1성)', req: 3, yield: 1 },
  '문어(2성)': { ing: '문어(1성)', req: 3, yield: 1 },
  '미역(2성)': { ing: '미역(1성)', req: 3, yield: 1 },
  '성게(2성)': { ing: '성게(1성)', req: 3, yield: 1 },
};

export const ROD_BASE_DROPS = [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 10];
export const O11_BONUS = [0, 0.05, 0.07, 0.10, 0.15, 0.20];
export const O13_EFFECTS = [0, 0.1, 0.2, 0.3, 0.5, 0.7];
export const O14_BONUS = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10];
export const O17_BONUS = [0, 0.01, 0.03, 0.05, 0.07, 0.10, 0.15];

export const parseCraftTime = (timeStr: string) => {
  if (!timeStr || timeStr === '즉시' || timeStr === '0초') return 0;
  let sec = 0;
  if (timeStr.includes('시간')) {
    const match = timeStr.match(/(\d+)시간/);
    if (match) sec += parseInt(match[1]) * 3600;
  }
  if (timeStr.includes('분')) {
    const match = timeStr.match(/(\d+)분/);
    if (match) sec += parseInt(match[1]) * 60;
  }
  if (timeStr.includes('초')) {
    const match = timeStr.match(/(\d+)초/);
    if (match) sec += parseInt(match[1]);
  }
  return sec;
};

export const formatTime = (seconds: number) => {
  if (seconds <= 0) return '즉시';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  let res = [];
  if (h > 0) res.push(`${h}시간`);
  if (m > 0) res.push(`${m}분`);
  if (s > 0 || res.length === 0) res.push(`${s}초`);
  return res.join(' ');
};

export const simulateCraftPure = (targetList: Record<string, number>, initialStock: Record<string, number>, allowTierUpgrade: boolean = false) => {
  const tempStock = { ...initialStock };
  const missing: Record<string, number> = {};
  const craftedLog: Record<string, number> = {};

  const getReq = (name: string, q: number) => {
    if (q <= 0) return;
    const use = Math.min(q, tempStock[name] || 0);
    tempStock[name] = (tempStock[name] || 0) - use;
    const rem = q - use;
    if (rem <= 0) return;

    if (RECIPE_FIXES[name]) {
      const fix = RECIPE_FIXES[name];
      if (!allowTierUpgrade && TIER2.includes(name) && TIER1.includes(fix.ing)) {
        missing[name] = (missing[name] || 0) + rem;
        return;
      }
      const craftsNeeded = Math.ceil(rem / fix.yield);
      const leftover = (craftsNeeded * fix.yield) - rem;
      if (leftover > 0) tempStock[name] = (tempStock[name] || 0) + leftover;
      craftedLog[name] = (craftedLog[name] || 0) + craftsNeeded * fix.yield;
      getReq(fix.ing, fix.req * craftsNeeded);
      return;
    }

    const recipe = PARSED_RECIPES.find(r => r.name === name);
    if (!recipe) {
      missing[name] = (missing[name] || 0) + rem;
      return;
    }

    const yieldAmount = recipe.yieldAmount;
    const craftsNeeded = Math.ceil(rem / yieldAmount);
    const leftover = (craftsNeeded * yieldAmount) - rem;
    if (leftover > 0) tempStock[name] = (tempStock[name] || 0) + leftover;

    craftedLog[name] = (craftedLog[name] || 0) + craftsNeeded * yieldAmount;

    recipe.ingredients.forEach(ing => {
      getReq(ing.name, ing.req * craftsNeeded);
    });
  };

  Object.entries(targetList).forEach(([tItem, tQty]) => {
    getReq(tItem, tQty);
  });

  return { missing, stock: tempStock, craftedLog };
};

export const ALL_ITEMS = Array.from(new Set([...TIER1, ...TIER2, ...TIER3, ...FISH, ...ALCHEMY_T1, ...ALCHEMY_T2, ...ALCHEMY_T3, ...OCEAN_FIXED_PRICES.map(i=>i.name)]));

export const getCombinations = (bins: number, items: number): number[][] => {
  if (bins === 1) return [[items]];
  const combos: number[][] = [];
  for (let i = 0; i <= items; i++) {
    const subCombos = getCombinations(bins - 1, items - i);
    for (let j = 0; j < subCombos.length; j++) {
      combos.push([i, ...subCombos[j]]);
    }
  }
  return combos;
};

export const getItemBaseReqsPerUnit = (allowTierUpgrade: boolean) => {
  const reqsMap: Record<string, Record<string, number>> = {};
  ALL_ITEMS.forEach(name => {
    const sim = simulateCraftPure({ [name]: 1000 }, {}, allowTierUpgrade);
    const reqs: Record<string, number> = {};
    Object.entries(sim.missing).forEach(([m, q]) => {
      reqs[m] = (q as number) / 1000;
    });
    reqsMap[name] = reqs;
  });
  return reqsMap;
};

export const formatQty = (qty: number, globalSetMode: boolean) => {
  if (qty === 0) return '0개';
  if (!globalSetMode) return `${qty.toLocaleString()}개`;
  const BOX_SIZE = 3456;
  const SET_SIZE = 64;
  const boxes = Math.floor(qty / BOX_SIZE);
  const remAfterBoxes = qty % BOX_SIZE;
  const sets = Math.floor(remAfterBoxes / SET_SIZE);
  const items = remAfterBoxes % SET_SIZE;
  let result = [];
  if (boxes > 0) result.push(`${boxes.toLocaleString()}상자`);
  if (sets > 0) result.push(`${sets.toLocaleString()}셋`);
  if (items > 0) result.push(`${items.toLocaleString()}개`);
  return result.join(' ');
};