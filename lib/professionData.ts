export const TOWN_RANKS = [
  { name: '숲 (1~3위)', value: '숲', maxStamina: 3300 },
  { name: '열매 (상위 5%)', value: '열매', maxStamina: 3200 },
  { name: '꽃 (상위 30%)', value: '꽃', maxStamina: 3100 },
  { name: '새싹 (상위 70%)', value: '새싹', maxStamina: 3000 },
  { name: '씨앗 (순위 밖)', value: '씨앗', maxStamina: 3000 },
];

export const STAMINA_DRINKS = [
  { name: '스태미나 드링크 I', value: 1, recovery: 100 },
  { name: '스태미나 드링크 II', value: 2, recovery: 300 },
  { name: '스태미나 드링크 III', value: 3, recovery: 500 },
  { name: '스태미나 드링크 IV', value: 4, recovery: 700 },
  { name: '스태미나 드링크 V', value: 5, recovery: 1000 },
];

export const getImagePath = (name: string) => {
  if (name.includes('심층암 조약돌 뭉치')) return '/mining_items/cobbled_deepslate_bundle.png';
  if (name.includes('조약돌 뭉치')) return '/mining_items/cobblestone_bundle.png';
  if (name.includes('코룸 주괴')) return '/mining_items/corum_ingot.png';
  if (name.includes('리프톤 주괴')) return '/mining_items/leaftone_ingot.png';
  if (name.includes('세렌트 주괴')) return '/mining_items/serent_ingot.png';
  if (name.includes('강화 횃불')) return '/mining_items/reinforced_torch.png';
  
  if (name.includes('하급 라이프스톤')) return '/tools/lifestone1.png';
  if (name.includes('중급 라이프스톤')) return '/tools/lifestone2.png';
  if (name.includes('상급 라이프스톤')) return '/tools/lifestone3.png';
  if (name.includes('어빌리티 스톤')) return '/icons/ability_stone.png';

  if (name.includes('코룸(광석)') || name === '코룸') return '/mining_items/corum.png';
  if (name.includes('리프톤(광석)') || name === '리프톤') return '/mining_items/leaftone.png';
  if (name.includes('세렌트(광석)') || name === '세렌트') return '/mining_items/serent.png';
  if (name.includes('그라밋')) return '/mining_items/gramit.png';
  if (name.includes('에메리오')) return '/mining_items/emerio.png';
  if (name.includes('샤인플레어')) return '/mining_items/shineflare.png';

  if (name.includes('횃불')) return '/mining_items/Torch.png';
  if (name.includes('심층암 조약돌')) return '/mining_items/Cobbled_Deepslate.png';
  if (name.includes('조약돌')) return '/mining_items/Cobblestone.png';
  if (name.includes('구리블록')) return '/mining_items/Block_of_Copper.png';
  if (name.includes('레드스톤블록')) return '/mining_items/Block_of_Redstone.png';
  if (name.includes('청금석블록')) return '/mining_items/Block_of_Lapis_Lazuli.png';
  if (name.includes('철블록')) return '/mining_items/Block_of_Iron.png';
  if (name.includes('다이아몬드블록')) return '/mining_items/Block_of_Diamond.png';
  if (name.includes('자수정블록')) return '/mining_items/Block_of_Amethyst.png';
  if (name.includes('금블록')) return '/mining_items/Block_of_Gold.png';

  return null;
};

export const MINE_RECIPES = [
  { name: '강화 횃불', facility: '채광물 가공 시설', time: '7초', ingredients: ['횃불 4개'], type: '가공' },
  { name: '코룸 주괴', facility: '채광 제작 시설', time: '20초', ingredients: ['코룸(광석) 16개', '강화 횃불 2개'], type: '제작' },
  { name: '리프톤 주괴', facility: '채광 제작 시설', time: '30초', ingredients: ['리프톤(광석) 16개', '강화 횃불 4개'], type: '제작' },
  { name: '세렌트 주괴', facility: '채광 제작 시설', time: '40초', ingredients: ['세렌트(광석) 16개', '강화 횃불 8개'], type: '제작' },
  { name: '조약돌 뭉치', facility: '강화 제작 시설', time: '5초', ingredients: ['조약돌 64개'], note: '7세트로 7개 동시 제작 가능', type: '압축' },
  { name: '심층암 조약돌 뭉치', facility: '강화 제작 시설', time: '7초', ingredients: ['심층암 조약돌 64개'], note: '7세트로 7개 동시 제작 가능', type: '압축' },
  { name: '어빌리티 스톤', facility: '강화 제작 시설', time: '2분', ingredients: ['코룸 주괴 1개', '리프톤 주괴 1개', '세렌트 주괴 1개'], type: '특수' },
  { name: '하급 라이프스톤', facility: '강화 제작 시설', time: '1분', ingredients: ['조약돌 뭉치 2개', '구리블록 8개', '레드스톤블록 3개', '코룸 주괴 1개'], type: '특수' },
  { name: '중급 라이프스톤', facility: '강화 제작 시설', time: '2분', ingredients: ['심층암 조약돌 뭉치 2개', '청금석블록 5개', '철블록 5개', '다이아몬드블록 3개', '리프톤 주괴 2개'], type: '특수' },
  { name: '상급 라이프스톤', facility: '강화 제작 시설', time: '5분', ingredients: ['구리블록 30개', '자수정블록 20개', '철블록 7개', '금블록 7개', '다이아몬드블록 5개', '세렌트 주괴 3개'], type: '특수' },
];

export const MINE_FIXED_PRICES = {
  ingots: [
    { name: '코룸 주괴', zone: '코룸', base: 3675 },
    { name: '리프톤 주괴', zone: '리프톤', base: 3938 },
    { name: '세렌트 주괴', zone: '세렌트', base: 4200 },
  ],
  gems: [
    { name: '그라밋', type: '코룸 보석', zone: '코룸', base: 7000 },
    { name: '에메리오', type: '리프톤 보석', zone: '리프톤', base: 7500 },
    { name: '샤인플레어', type: '세렌트 보석', zone: '세렌트', base: 8000 },
  ]
};

export const PICKAXE_BASE_DROPS = [2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 12];
export const PICKAXE_RELIC_CHANCES = [0, 0.01, 0.01, 0.01, 0.02, 0.02, 0.02, 0.03, 0.03, 0.03, 0.05, 0.05, 0.05, 0.05, 0.10];
export const LUCKY_HIT_EFFECTS = [
  { chance: 0, amount: 0 }, { chance: 0.01, amount: 1 }, { chance: 0.02, amount: 1 },
  { chance: 0.03, amount: 1 }, { chance: 0.04, amount: 1 }, { chance: 0.05, amount: 1 },
  { chance: 0.06, amount: 1 }, { chance: 0.07, amount: 1 }, { chance: 0.08, amount: 2 },
  { chance: 0.10, amount: 2 }, { chance: 0.15, amount: 3 }
];
export const GEM_DROP_EFFECTS = [
  { chance: 0, amount: 0 }, { chance: 0.03, amount: 1 }, { chance: 0.07, amount: 1 }, { chance: 0.10, amount: 2 }
];
export const FLAMING_PICKAXE_EFFECTS = [
  0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.15
];

export const PRICE_BUFF_EFFECTS = [0, 0.05, 0.07, 0.10, 0.20, 0.30, 0.50];
export const AVG_RELIC_POINTS = 250;