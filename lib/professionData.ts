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

export const FOOD_NAMES = [
  "토마토 스파게티", "어니언 링", "갈릭 케이크", "삼겹살 토마토 찌개",
  "삼색 아이스크림", "마늘 양갈비 핫도그", "달콤 시리얼", "로스트 치킨 파이",
  "스윗 치킨 햄버거", "토마토 파인애플 피자", "양파 수프", "허브 삼겹살 찜",
  "토마토 라자냐", "딥 크림 빠네", "트리플 소갈비 꼬치"
];

export const CRAFT_NAMES = [
  "조개껍데기 브로치", "푸른 향수병", "자개 손거울", "분홍 헤어핀", "자개 부채", "흑진주 시계"
];

export const FOOD_MAX_PRICES: Record<string, number> = {
  "토마토 스파게티": 861,
  "어니언 링": 1021,
  "갈릭 케이크": 758,
  "삼겹살 토마토 찌개": 2017,
  "삼색 아이스크림": 3036,
  "마늘 양갈비 핫도그": 1700,
  "달콤 시리얼": 2579,
  "로스트 치킨 파이": 2131,
  "스윗 치킨 햄버거": 3167,
  "토마토 파인애플 피자": 3465,
  "양파 수프": 3803,
  "허브 삼겹살 찜": 2985,
  "토마토 라자냐": 4196,
  "딥 크림 빠네": 3859,
  "트리플 소갈비 꼬치": 4306
};

export const CRAFT_MAX_PRICES: Record<string, number> = {
  "조개껍데기 브로치": 50000,
  "푸른 향수병": 150000,
  "자개 손거울": 300000,
  "분홍 헤어핀": 500000,
  "자개 부채": 700000,
  "흑진주 시계": 1000000
};

export const getImagePath = (name: string) => {
  const map: Record<string, string> = {
    '토마토 스파게티': '/foods/tomato_spaghetti.png',
    '어니언 링': '/foods/onion_ring.png',
    '갈릭 케이크': '/foods/garlic_cake.png',
    '삼겹살 토마토 찌개': '/foods/pork_tomato_stew.png',
    '삼색 아이스크림': '/foods/tricolor_ice_cream.png',
    '마늘 양갈비 핫도그': '/foods/garlic_mutton_hotdog.png',
    '달콤 시리얼': '/foods/sweet_cereal.png',
    '로스트 치킨 파이': '/foods/roast_chicken_pie.png',
    '스윗 치킨 햄버거': '/foods/sweet_chicken_burger.png',
    '토마토 파인애플 피자': '/foods/tomato_pineapple_pizza.png',
    '양파 수프': '/foods/onion_soup.png',
    '허브 삼겹살 찜': '/foods/herb_pork_belly_steam.png',
    '토마토 라자냐': '/foods/tomato_lasagna.png',
    '딥 크림 빠네': '/foods/deep_cream_pane.png',
    '트리플 소갈비 꼬치': '/foods/triple_beef_rib_skewer.png',
    '토마토 베이스': '/ingredients/tomato_base.png',
    '양파 베이스': '/ingredients/onion_base.png',
    '마늘 베이스': '/ingredients/garlic_base.png',
    '버터 조각': '/ingredients/butter_piece.png',
    '치즈 조각': '/ingredients/cheese_piece.png',
    '요리용 소금': '/ingredients/cooking_salt.png',
    '설탕 큐브': '/ingredients/sugar_cube.png',
    '밀가루 반죽': '/ingredients/dough.png',
    '비트 묶음': '/ingredients/beet_bundle.png',
    '당근 묶음': '/ingredients/carrot_bundle.png',
    '감자 묶음': '/ingredients/potato_bundle.png',
    '호박 묶음': '/ingredients/pumpkin_bundle.png',
    '수박 묶음': '/ingredients/watermelon_bundle.png',
    '달콤한 열매 묶음': '/ingredients/sweet_berry_bundle.png',
    '요리용 달걀': '/ingredients/cooking_egg.png',
    '요리용 우유': '/ingredients/cooking_milk.png',
    '소금': '/ingredients/salt.png',
    '오일': '/ingredients/oil.png',
    '토마토': '/ingredients/tomato.png',
    '양파': '/ingredients/onion.png',
    '마늘': '/ingredients/garlic.png',
    '비트': '/ingredients/Beetroot.png',
    '당근': '/ingredients/Carrot.png',
    '감자': '/ingredients/Potato.png',
    '호박': '/ingredients/Pumpkin.png',
    '수박': '/ingredients/Melon.png',
    '달콤한 열매': '/ingredients/Sweet_Berries.png',
    '밀': '/ingredients/Wheat.png',
    '설탕': '/ingredients/Sugar.png',
    '심층암 조약돌 뭉치': '/mining_items/cobbled_deepslate_bundle.png',
    '조약돌 뭉치': '/mining_items/cobblestone_bundle.png',
    '코룸 주괴': '/mining_items/corum_ingot.png',
    '리프톤 주괴': '/mining_items/leaftone_ingot.png',
    '세렌트 주괴': '/mining_items/serent_ingot.png',
    '강화 횃불': '/mining_items/reinforced_torch.png',
    '하급 라이프스톤': '/tools/lifestone1.png',
    '중급 라이프스톤': '/tools/lifestone2.png',
    '상급 라이프스톤': '/tools/lifestone3.png',
    '어빌리티 스톤': '/icons/ability_stone.png',
    '코룸(광석)': '/mining_items/corum.png',
    '코룸': '/mining_items/corum.png',
    '리프톤(광석)': '/mining_items/leaftone.png',
    '리프톤': '/mining_items/leaftone.png',
    '세렌트(광석)': '/mining_items/serent.png',
    '세렌트': '/mining_items/serent.png',
    '그라밋': '/mining_items/gramit.png',
    '에메리오': '/mining_items/emerio.png',
    '샤인플레어': '/mining_items/shineflare.png',
    '바닐라 횃불': '/mining_items/Torch.png',
    '심층암 조약돌': '/mining_items/Cobbled_Deepslate.png',
    '조약돌': '/mining_items/Cobblestone.png',
    '구리블록': '/mining_items/Block_of_Copper.png',
    '레드스톤블록': '/mining_items/Block_of_Redstone.png',
    '청금석블록': '/mining_items/Block_of_Lapis_Lazuli.png',
    '철블록': '/mining_items/Block_of_Iron.png',
    '다이아몬드블록': '/mining_items/Block_of_Diamond.png',
    '자수정블록': '/mining_items/Block_of_Amethyst.png',
    '금블록': '/mining_items/Block_of_Gold.png',
    '조개껍데기 브로치': '/crafts/shell_brooch.png',
    '푸른 향수병': '/crafts/blue_perfume_bottle.png',
    '자개 손거울': '/crafts/mother_of_pearl_hand_mirror.png',
    '분홍 헤어핀': '/crafts/pink_hairpin.png',
    '자개 부채': '/crafts/mother_of_pearl_fan.png',
    '흑진주 시계': '/crafts/black_pearl_watch.png'
  };

  if (map[name]) return map[name];

  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (name.includes(key)) {
      return map[key];
    }
  }

  return null;
};

export const MINE_RECIPES = [
  { name: '강화 횃불', facility: '채광물 가공 시설', time: '7초', ingredients: ['바닐라 횃불 4개'], type: '가공' },
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

export const FARMING_RECIPES = [
  { name: '토마토 베이스', facility: '농작물 가공 시설', time: '15초', ingredients: ['토마토 8개'], type: '가공' },
  { name: '양파 베이스', facility: '농작물 가공 시설', time: '15초', ingredients: ['양파 8개'], type: '가공' },
  { name: '마늘 베이스', facility: '농작물 가공 시설', time: '15초', ingredients: ['마늘 8개'], type: '가공' },
  { name: '버터 조각', facility: '농작물 가공 시설', time: '15초', ingredients: ['요리용 우유 8개', '소금 4개', '오일 4개'], type: '가공' },
  { name: '치즈 조각', facility: '농작물 가공 시설', time: '15초', ingredients: ['요리용 우유 8개', '소금 8개'], type: '가공' },
  { name: '요리용 소금', facility: '농작물 가공 시설', time: '15초', ingredients: ['소금 16개'], type: '가공' },
  { name: '설탕 큐브', facility: '농작물 가공 시설', time: '3초', ingredients: ['설탕 64개'], type: '가공' },
  { name: '밀가루 반죽', facility: '농작물 가공 시설', time: '15초', ingredients: ['밀 12개', '요리용 달걀 4개'], type: '가공' },
  { name: '비트 묶음', facility: '농작물 가공 시설', time: '3초', ingredients: ['비트 64개'], type: '압축' },
  { name: '당근 묶음', facility: '농작물 가공 시설', time: '3초', ingredients: ['당근 64개'], type: '압축' },
  { name: '감자 묶음', facility: '농작물 가공 시설', time: '3초', ingredients: ['감자 64개'], type: '압축' },
  { name: '호박 묶음', facility: '농작물 가공 시설', time: '3초', ingredients: ['호박 64개'], type: '압축' },
  { name: '수박 묶음', facility: '농작물 가공 시설', time: '3초', ingredients: ['수박 64개'], type: '압축' },
  { name: '달콤한 열매 묶음', facility: '농작물 가공 시설', time: '3초', ingredients: ['달콤한 열매 64개'], type: '압축' },
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
export const FLAMING_PICKAXE_EFFECTS = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.15];
export const PRICE_BUFF_EFFECTS = [0, 0.05, 0.07, 0.10, 0.20, 0.30, 0.50];
export const AVG_RELIC_POINTS = 250;

export const getCookingPeriod = () => {
  const now = new Date();
  const adjustedNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const baseDate = new Date('2026-02-24T00:00:00');
  const diffTime = adjustedNow.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const cycle = Math.floor(diffDays / 3);
  const start = new Date(baseDate.getTime() + cycle * 3 * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 3 * 24 * 60 * 60 * 1000);
  const sStr = `${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
  const eStr = `${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
  return `${sStr}~${eStr}`;
};

export const getCraftingPeriod = () => {
  const now = new Date();
  const adjustedNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return `${String(adjustedNow.getMonth() + 1).padStart(2, '0')}-${String(adjustedNow.getDate()).padStart(2, '0')}`;
};