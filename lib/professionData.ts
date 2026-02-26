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
    '비트': '/ingredients/beetroot.png',
    '당근': '/ingredients/carrot.png',
    '감자': '/ingredients/potato.png',
    '호박': '/ingredients/pumpkin.png',
    '수박': '/ingredients/melon.png',
    '달콤한 열매': '/ingredients/sweet_Berries.png',
    '밀': '/ingredients/wheat.png',
    '설탕': '/ingredients/sugar.png',
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
    '레드스톤블록': '/ocean_items/Block_of_Redstone.png',
    '청금석블록': '/ocean_items/Block_of_Lapis_Lazuli.png',
    '철블록': '/mining_items/Block_of_Iron.png',
    '다이아몬드블록': '/mining_items/Block_of_Diamond.png',
    '자수정블록': '/mining_items/Block_of_Amethyst.png',
    '금블록': '/mining_items/Block_of_Gold.png',
    '조개껍데기 브로치': '/ocean_items/shell_brooch.png',
    '푸른 향수병': '/ocean_items/blue_perfume_bottle.png',
    '자개 손거울': '/ocean_items/mother_of_pearl_hand_mirror.png',
    '분홍 헤어핀': '/ocean_items/pink_hairpin.png',
    '자개 부채': '/ocean_items/mother_of_pearl_fan.png',
    '흑진주 시계': '/ocean_items/black_pearl_watch.png',
    '소라': '/ocean_items/conch.png',
    '소라(1성)': '/ocean_items/1star_conch.png',
    '소라(2성)': '/ocean_items/2star_conch.png',
    '소라(3성)': '/ocean_items/3star_conch.png',
    '문어': '/ocean_items/octopus.png',
    '문어(1성)': '/ocean_items/1star_octopus.png',
    '문어(2성)': '/ocean_items/2star_octopus.png',
    '문어(3성)': '/ocean_items/3star_octopus.png',
    '굴': '/ocean_items/oyster.png',
    '굴(1성)': '/ocean_items/1star_oyster.png',
    '굴(2성)': '/ocean_items/2star_oyster.png',
    '굴(3성)': '/ocean_items/3star_oyster.png',
    '성게': '/ocean_items/sea_urchin.png',
    '성게(1성)': '/ocean_items/1star_sea_urchin.png',
    '성게(2성)': '/ocean_items/2star_sea_urchin.png',
    '성게(3성)': '/ocean_items/3star_sea_urchin.png',
    '미역': '/ocean_items/seaweed.png',
    '미역(1성)': '/ocean_items/1star_seaweed.png',
    '미역(2성)': '/ocean_items/2star_seaweed.png',
    '미역(3성)': '/ocean_items/3star_seaweed.png',
    '녹슨 무거운 평원 상자': '/ocean_items/rust_greendell_heavy_chest.png',
    '무거운 평원 상자': '/ocean_items/greendell_heavy_chest.png',
    '흑진주': '/ocean_items/black_pearl.png',
    '분홍빛 진주': '/ocean_items/pink_pearl.png',
    '보라빛 진주': '/ocean_items/purple_pearl.png',
    '청록빛 진주': '/ocean_items/turquoise_pearl.png',
    '노란빛 진주': '/ocean_items/yellow_pearl.png',
    '푸른빛 진주': '/ocean_items/blue_pearl.png',
    '알쏭달쏭 조개': '/ocean_items/mystery_shell.png',
    '금속 재활용품': '/ocean_items/metal_recyclable.png',
    '합금 재활용품': '/ocean_items/alloy_recyclable.png',
    '플라스틱 재활용품': '/ocean_items/plastic_recyclable.png',
    '합성수지 재활용품': '/ocean_items/synthetic_resin_recyclable.png',
    '섬유 재활용품': '/ocean_items/fiber_recyclable.png',
    '비닐봉지': '/ocean_items/plastic_bag.png',
    '페트병': '/ocean_items/plastic_bucket.png',
    '통조림': '/ocean_items/metal_tin.png',
    '신발': '/ocean_items/shoe.png',
    '캔': '/ocean_items/can.png',
    '깨진 조개껍데기': '/ocean_items/broken_mystery_shell.png',
    '수호의 정수(1성)': '/ocean_items/t1_1star_blue.png',
    '파동의 정수(1성)': '/ocean_items/t1_1star_orange.png',
    '생명의 정수(1성)': '/ocean_items/t1_1star_red.png',
    '부식의 정수(1성)': '/ocean_items/t1_1star_green.png',
    '혼란의 정수(1성)': '/ocean_items/t1_1star_purple.png',
    '물결 수호의 핵': '/ocean_items/t2_1star_blue.png',
    '파동 오염의 핵': '/ocean_items/t2_1star_orange.png',
    '질서 파괴의 핵': '/ocean_items/t2_1star_red.png',
    '활력 붕괴의 핵': '/ocean_items/t2_1star_green.png',
    '침식 방어의 핵': '/ocean_items/t2_1star_purple.png',
    '영생의 아쿠티스': '/ocean_items/t3_1star_powder.png',
    '크라켄의 광란체': '/ocean_items/t3_1star_coin.png',
    '리바이던의 깃털': '/ocean_items/t3_1star_feather.png',
    '해구의 파동 코어': '/ocean_items/t3_2star_core.png',
    '침묵의 심해 비약': '/ocean_items/t3_2star_fluid.png',
    '청해룡의 날개': '/ocean_items/t3_2star_wing.png',
    '아쿠아 펄스 파편': '/ocean_items/t3_3star_shard.png',
    '나우틸러스의 손': '/ocean_items/t3_3star_hand.png',
    '무저의 척추': '/ocean_items/t3_3star_spine.png',
    '추출된 희석액': '/ocean_items/t3_0star_tonic.png',
    '수호의 엘릭서': '/ocean_items/t1_3star_blue.png',
    '파동의 엘릭서': '/ocean_items/t1_3star_orange.png',
    '생명의 엘릭서': '/ocean_items/t1_3star_red.png',
    '부식의 엘릭서': '/ocean_items/t1_3star_green.png',
    '혼란의 엘릭서': '/ocean_items/t1_3star_purple.png',
    '수호 에센스': '/ocean_items/t1_2star_blue.png',
    '파동 에센스': '/ocean_items/t1_2star_orange.png',
    '생명 에센스': '/ocean_items/t1_2star_red.png',
    '부식 에센스': '/ocean_items/t1_2star_green.png',
    '혼란 에센스': '/ocean_items/t1_2star_purple.png',
    '활기 보존의 결정': '/ocean_items/t2_2star_blue.png',
    '파도 침식의 결정': '/ocean_items/t2_2star_orange.png',
    '격류 재생의 결정': '/ocean_items/t2_2star_red.png',
    '맹독 혼란의 결정': '/ocean_items/t2_2star_green.png',
    '방어 오염의 결정': '/ocean_items/t2_2star_purple.png',
    '불멸 재생의 영약': '/ocean_items/t2_3star_blue.png',
    '파동 장벽의 영약': '/ocean_items/t2_3star_orange.png',
    '타락 침식의 영약': '/ocean_items/t2_3star_purple.png',
    '생명 광란의 영약': '/ocean_items/t2_3star_red.png',
    '맹독 파동의 영약': '/ocean_items/t2_3star_green.png',
    '루키 열쇠 조각': '/ocean_items/rookie_key_piece.png',
    '노멀 열쇠 조각': '/ocean_items/normal_key_piece.png',
    '전설 열쇠 조각': '/ocean_items/legendary_key_piece.png',
    '신화 열쇠 조각': '/ocean_items/mythic_key_piece.png',
    '루키 열쇠': '/ocean_items/rookie_key.png',
    '노멀 열쇠': '/ocean_items/normal_key.png',
    '전설 열쇠': '/ocean_items/legendary_key.png',
    '신화 열쇠': '/ocean_items/mythic_key.png',
    '양동이': '/ocean_items/Bucket.png',
    '유리판': '/ocean_items/Glass_Pane.png',
    '대나무': '/ocean_items/Leafless_Bamboo.png',
    '분홍 꽃잎': '/ocean_items/Pink_Petals.png',
    '막대기': '/ocean_items/Stick.png',
    '자수정 조각': '/ocean_items/Amethyst_Shard.png',
    '흑요석': '/ocean_items/Obsidian.png',
    '시계': '/ocean_items/clock.png',
    '점토': '/ocean_items/Clay.png',
    '모래': '/ocean_items/Sand.png',
    '자갈': '/ocean_items/Gravel.png',
    '화강암': '/ocean_items/Granite.png',
    '흙': '/ocean_items/Dirt.png',
    '해초': '/ocean_items/BlockSprite_seagrass.png',
    '참나무잎': '/ocean_items/Oak_Leaves.png',
    '가문비나무잎': '/ocean_items/Spruce_Leaves.png',
    '자작나무잎': '/ocean_items/Birch_Leaves.png',
    '아카시아나무잎': '/ocean_items/Acacia_Leaves.png',
    '벚나무잎': '/ocean_items/Cherry_Leaves.png',
    '켈프': '/ocean_items/ItemSprite_kelp.png',
    '레드스톤 블록': '/ocean_items/Block_of_Redstone.png',
    '청금석 블록': '/ocean_items/Block_of_Lapis_Lazuli.png',
    '철 주괴': '/ocean_items/Iron_Ingot.png',
    '금 주괴': '/ocean_items/Gold_Ingot.png',
    '다이아몬드': '/ocean_items/Diamond.png',
    '불우렁쉥이': '/ocean_items/Sea_Pickle.png',
    '유리병': '/ocean_items/Glass_Bottle.png',
    '네더랙': '/ocean_items/Netherrack.png',
    '마그마블록': '/ocean_items/BlockSprite_magma-block.png',
    '진홍빛 자루': '/ocean_items/Crimson_Stem.png',
    '뒤틀린 자루': '/ocean_items/Warped_Stem.png',
    '말린 켈프': '/ocean_items/Dried_Kelp.png',
    '발광 열매': '/ocean_items/ItemSprite_glow-berries.png',
    '죽은 관 산호 블록': '/ocean_items/Dead_Tube_Coral_Block.png',
    '죽은 사방산호 블록': '/ocean_items/Dead_Horn_Coral_Block.png',
    '죽은 거품 산호 블록': '/ocean_items/Dead_Bubble_Coral_Block.png',
    '죽은 불 산호 블록': '/ocean_items/Dead_Fire_Coral_Block.png',
    '죽은 뇌 산호 블록': '/ocean_items/Dead_Brain_Coral_Block.png',
    '스태미나 드링크 I': '/ocean_items/stamina_drink_1.png',
    '스태미나 드링크 II': '/ocean_items/stamina_drink_2.png',
    '스태미나 드링크 III': '/ocean_items/stamina_drink_3.png',
    '스태미나 드링크 IV': '/ocean_items/stamina_drink_4.png',
    '스태미나 드링크 V': '/ocean_items/stamina_drink_5.png',
    '새우': '/f1/Ashirmp.png',
    '도미': '/f1/ASea bream.png',
    '청어': '/f1/Aherring.png',
    '금붕어': '/f1/AGoldfish.png',
    '농어': '/f1/ASea bass.png',
    '깐 새우': '/f1/shrimp.png',
    '도미 회': '/f1/Sea bream.png',
    '청어 회': '/f1/herring.png',
    '금붕어 회': '/f1/Goldfish.png',
    '농어 회': '/f1/Sea bass.png'
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

export const OCEAN_RECIPES = [
  { name: '깐 새우(2개)', facility: '대형 제작대', time: '0초', ingredients: ['익히지 않은 새우 1개'], note: '1회 2개 제작', type: '가공' },
  { name: '도미 회(2개)', facility: '대형 제작대', time: '0초', ingredients: ['익히지 않은 도미 1개'], note: '1회 2개 제작', type: '가공' },
  { name: '청어 회(2개)', facility: '대형 제작대', time: '0초', ingredients: ['익히지 않은 청어 1개'], note: '1회 2개 제작', type: '가공' },
  { name: '금붕어 회(2개)', facility: '대형 제작대', time: '0초', ingredients: ['금붕어 1개'], note: '1회 2개 제작', type: '가공' },
  { name: '농어 회(2개)', facility: '대형 제작대', time: '0초', ingredients: ['농어 1개'], note: '1회 2개 제작', type: '가공' },
  
  { name: '수호의 정수(1성)', facility: '연금 제작 시설', time: '5초', ingredients: ['굴(1성) 2개', '점토 2개'], type: '제작' },
  { name: '파동의 정수(1성)', facility: '연금 제작 시설', time: '5초', ingredients: ['소라(1성) 2개', '모래 4개'], type: '제작' },
  { name: '생명의 정수(1성)', facility: '연금 제작 시설', time: '5초', ingredients: ['미역(1성) 2개', '자갈 4개'], type: '제작' },
  { name: '부식의 정수(1성)', facility: '연금 제작 시설', time: '5초', ingredients: ['성게(1성) 2개', '화강암 2개'], type: '제작' },
  { name: '혼란의 정수(1성)', facility: '연금 제작 시설', time: '5초', ingredients: ['문어(1성) 2개', '흙 8개'], type: '제작' },
  
  { name: '물결 수호의 핵', facility: '연금 제작 시설', time: '10초', ingredients: ['수호의 정수(1성)', '파동의 정수(1성)', '깐 새우'], type: '제작' },
  { name: '파동 오염의 핵', facility: '연금 제작 시설', time: '10초', ingredients: ['파동의 정수(1성)', '혼란의 정수(1성)', '도미 회'], type: '제작' },
  { name: '질서 파괴의 핵', facility: '연금 제작 시설', time: '10초', ingredients: ['혼란의 정수(1성)', '생명의 정수(1성)', '청어 회'], type: '제작' },
  { name: '활력 붕괴의 핵', facility: '연금 제작 시설', time: '10초', ingredients: ['생명의 정수(1성)', '부식의 정수(1성)', '금붕어 회'], type: '제작' },
  { name: '침식 방어의 핵', facility: '연금 제작 시설', time: '10초', ingredients: ['부식의 정수(1성)', '수호의 정수(1성)', '농어 회'], type: '제작' },
  
  { name: '영생의 아쿠티스', facility: '연금 제작 시설', time: '30초', ingredients: ['물결 수호의 핵', '질서 파괴의 핵', '활력 붕괴의 핵'], type: '제작' },
  { name: '크라켄의 광란체', facility: '연금 제작 시설', time: '30초', ingredients: ['질서 파괴의 핵', '활력 붕괴의 핵', '파동 오염의 핵'], type: '제작' },
  { name: '리바이던의 깃털', facility: '연금 제작 시설', time: '30초', ingredients: ['침식 방어의 핵', '파동 오염의 핵', '물결 수호의 핵'], type: '제작' },
  { name: '수호 에센스', facility: '연금 제작 시설', time: '5초', ingredients: ['굴(2성)', '해초 6개', '참나무잎 6개'], note: '1회 2개 제작', type: '제작' },
  { name: '파동 에센스', facility: '연금 제작 시설', time: '5초', ingredients: ['소라(2성)', '해초 6개', '가문비나무잎 6개'], note: '1회 2개 제작', type: '제작' },
  { name: '혼란 에센스', facility: '연금 제작 시설', time: '5초', ingredients: ['문어(2성)', '해초 6개', '자작나무잎 6개'], note: '1회 2개 제작', type: '제작' },
  { name: '생명 에센스', facility: '연금 제작 시설', time: '5초', ingredients: ['미역(2성)', '해초 6개', '아카시아나무잎 6개'], note: '1회 2개 제작', type: '제작' },
  { name: '부식 에센스', facility: '연금 제작 시설', time: '5초', ingredients: ['성게(2성)', '해초 6개', '벚나무잎 6개'], note: '1회 2개 제작', type: '제작' },
  { name: '활기 보존의 결정', facility: '연금 제작 시설', time: '10초', ingredients: ['수호 에센스', '생명 에센스', '켈프 8개', '청금석 블록'], type: '제작' },
  { name: '파도 침식의 결정', facility: '연금 제작 시설', time: '10초', ingredients: ['파동 에센스', '부식 에센스', '켈프 8개', '레드스톤 블록'], type: '제작' },
  { name: '방어 오염의 결정', facility: '연금 제작 시설', time: '10초', ingredients: ['혼란 에센스', '수호 에센스', '켈프 8개', '철 주괴 3개'], type: '제작' },
  { name: '격류 재생의 결정', facility: '연금 제작 시설', time: '10초', ingredients: ['생명 에센스', '파동 에센스', '켈프 8개', '금 주괴 2개'], type: '제작' },
  { name: '맹독 혼란의 결정', facility: '연금 제작 시설', time: '10초', ingredients: ['부식 에센스', '혼란 에센스', '켈프 8개', '다이아몬드'], type: '제작' },
  { name: '해구의 파동 코어', facility: '연금 제작 시설', time: '30초', ingredients: ['활기 보존의 결정', '파도 침식의 결정', '격류 재생의 결정'], type: '제작' },
  { name: '침묵의 심해 비약', facility: '연금 제작 시설', time: '30초', ingredients: ['파도 침식의 결정', '격류 재생의 결정', '맹독 혼란의 결정'], type: '제작' },
  { name: '청해룡의 날개', facility: '연금 제작 시설', time: '30초', ingredients: ['방어 오염의 결정', '맹독 혼란의 결정', '활기 보존의 결정'], type: '제작' },
  { name: '수호의 엘릭서', facility: '연금 제작 시설', time: '10초', ingredients: ['굴(3성)', '불우렁쉥이 2개', '유리병 3개', '네더랙 8개'], type: '제작' },
  { name: '파동의 엘릭서', facility: '연금 제작 시설', time: '10초', ingredients: ['소라(3성)', '불우렁쉥이 2개', '유리병 3개', '마그마블록 4개'], type: '제작' },
  { name: '혼란의 엘릭서', facility: '연금 제작 시설', time: '10초', ingredients: ['문어(3성)', '불우렁쉥이 2개', '유리병 3개', '영혼 흙 4개'], type: '제작' },
  { name: '생명의 엘릭서', facility: '연금 제작 시설', time: '10초', ingredients: ['미역(3성)', '불우렁쉥이 2개', '유리병 3개', '진홍빛 자루 4개'], type: '제작' },
  { name: '부식의 엘릭서', facility: '연금 제작 시설', time: '10초', ingredients: ['성게(3성)', '불우렁쉥이 2개', '유리병 3개', '뒤틀린 자루 4개'], type: '제작' },
  { name: '불멸 재생의 영약', facility: '연금 제작 시설', time: '1분', ingredients: ['수호의 엘릭서', '생명의 엘릭서', '말린 켈프 12개', '발광 열매 4개', '죽은 관 산호 블록'], type: '제작' },
  { name: '파동 장벽의 영약', facility: '연금 제작 시설', time: '1분', ingredients: ['파동의 엘릭서', '수호의 엘릭서', '말린 켈프 12개', '발광 열매 4개', '죽은 사방산호 블록'], type: '제작' },
  { name: '타락 침식의 영약', facility: '연금 제작 시설', time: '1분', ingredients: ['혼란의 엘릭서', '부식의 엘릭서', '말린 켈프 12개', '발광 열매 4개', '죽은 거품 산호 블록'], type: '제작' },
  { name: '생명 광란의 영약', facility: '연금 제작 시설', time: '1분', ingredients: ['생명의 엘릭서', '혼란의 엘릭서', '말린 켈프 12개', '발광 열매 4개', '죽은 불 산호 블록'], type: '제작' },
  { name: '맹독 파동의 영약', facility: '연금 제작 시설', time: '1분', ingredients: ['부식의 엘릭서', '파동의 엘릭서', '말린 켈프 12개', '발광 열매 4개', '죽은 뇌 산호 블록'], type: '제작' },
  { name: '아쿠아 펄스 파편', facility: '연금 제작 시설', time: '1분', ingredients: ['불멸 재생의 영약', '파동 장벽의 영약', '맹독 파동의 영약'], type: '제작' },
  { name: '나우틸러스의 손', facility: '연금 제작 시설', time: '1분', ingredients: ['파동 장벽의 영약', '생명 광란의 영약', '불멸 재생의 영약'], type: '제작' },
  { name: '무저의 척추', facility: '연금 제작 시설', time: '1분', ingredients: ['타락 침식의 영약', '맹독 파동의 영약', '생명 광란의 영약'], type: '제작' },
  { name: '추출된 희석액', facility: '연금 제작 시설', time: '1분', ingredients: ['침식 방어의 핵 3개', '방어 오염의 결정 2개', '타락 침식의 영약'], type: '제작' },
  { name: '무거운 평원 상자', facility: '해양 제작 시설', time: '8분', ingredients: ['녹슨 무거운 평원 상자'], type: '제작' },
  { name: '스태미나 드링크 II', facility: '해양 제작 시설', time: '10초', ingredients: ['스태미나 드링크 I 5개'], type: '제작' },
  { name: '스태미나 드링크 III', facility: '해양 제작 시설', time: '10초', ingredients: ['스태미나 드링크 II 5개'], type: '제작' },
  { name: '스태미나 드링크 IV', facility: '해양 제작 시설', time: '10초', ingredients: ['스태미나 드링크 III 5개'], type: '제작' },
  { name: '스태미나 드링크 V', facility: '해양 제작 시설', time: '10초', ingredients: ['스태미나 드링크 IV 5개'], type: '제작' },
  { name: '금속 재활용품', facility: '해양 제작 시설', time: '30초', ingredients: ['캔 2개'], note: '1회 2개 제작', type: '가공' },
  { name: '합금 재활용품', facility: '해양 제작 시설', time: '30초', ingredients: ['통조림 2개'], note: '1회 2개 제작', type: '가공' },
  { name: '합성수지 재활용품', facility: '해양 제작 시설', time: '30초', ingredients: ['비닐봉지 2개'], note: '1회 2개 제작', type: '가공' },
  { name: '플라스틱 재활용품', facility: '해양 제작 시설', time: '30초', ingredients: ['페트병 2개'], note: '1회 2개 제작', type: '가공' },
  { name: '섬유 재활용품', facility: '해양 제작 시설', time: '30초', ingredients: ['신발 2개'], note: '1회 2개 제작', type: '가공' },
  { name: '루키 열쇠', facility: '해양 제작 시설', time: '1분', ingredients: ['루키 열쇠 조각 4개'], type: '제작' },
  { name: '노멀 열쇠', facility: '해양 제작 시설', time: '2분', ingredients: ['노멀 열쇠 조각 4개'], type: '제작' },
  { name: '전설 열쇠', facility: '해양 제작 시설', time: '3분', ingredients: ['전설 열쇠 조각 4개'], type: '제작' },
  { name: '신화 열쇠', facility: '해양 제작 시설', time: '5분', ingredients: ['신화 열쇠 조각 4개'], type: '제작' },
  { name: '조개껍데기 브로치', facility: '해양 제작 시설', time: '5분', ingredients: ['깨진 조개껍데기', '노란빛 진주', '금속 재활용품', '거미줄 4개'], type: '제작' },
  { name: '푸른 향수병', facility: '해양 제작 시설', time: '7분', ingredients: ['깨진 조개껍데기 2개', '푸른빛 진주', '합성수지 재활용품', '플라스틱 재활용품', '양동이 8개'], type: '제작' },
  { name: '자개 손거울', facility: '해양 제작 시설', time: '7분', ingredients: ['깨진 조개껍데기 3개', '청록빛 진주', '합금 재활용품 2개', '플라스틱 재활용품 2개', '유리판 16개'], type: '제작' },
  { name: '분홍 헤어핀', facility: '해양 제작 시설', time: '10분', ingredients: ['깨진 조개껍데기 4개', '분홍빛 진주', '합성수지 재활용품 3개', '섬유 재활용품 3개', '대나무 64개', '분홍 꽃잎 16개'], type: '제작' },
  { name: '자개 부채', facility: '해양 제작 시설', time: '10분', ingredients: ['깨진 조개껍데기 5개', '보라빛 진주', '합금 재활용품 5개', '합성수지 재활용품 5개', '막대기 64개', '자수정 조각 16개'], type: '제작' },
  { name: '흑진주 시계', facility: '해양 제작 시설', time: '15분', ingredients: ['깨진 조개껍데기 6개', '흑진주', '금속 재활용품 7개', '합금 재활용품 7개', '섬유 재활용품 7개', '흑요석 16개', '시계 8개'], type: '제작' }
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

export const OCEAN_FIXED_PRICES = [
  { name: '추출된 희석액', base: 18444 },
  { name: '영생의 아쿠티스', base: 5159 },
  { name: '크라켄의 광란체', base: 5234 },
  { name: '리바이던의 깃털', base: 5393 },
  { name: '해구의 파동 코어', base: 11131 },
  { name: '침묵의 심해 비약', base: 11242 },
  { name: '청해룡의 날개', base: 11399 },
  { name: '아쿠아 펄스 파편', base: 18985 },
  { name: '나우틸러스의 손', base: 19207 },
  { name: '무저의 척추', base: 19328 }
];

export const PICKAXE_BASE_DROPS = [2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 12];
export const PICKAXE_RELIC_CHANCES = [0, 0.01, 0.01, 0.01, 0.02, 0.02, 0.02, 0.03, 0.03, 0.03, 0.05, 0.05, 0.05, 0.05, 0.10];

export const LUCKY_HIT_EFFECTS = [
  { chance: 0, amount: 0 },
  { chance: 0.01, amount: 1 }, 
  { chance: 0.02, amount: 2 },
  { chance: 0.03, amount: 3 }, 
  { chance: 0.04, amount: 4 }, 
  { chance: 0.05, amount: 6 },
  { chance: 0.06, amount: 8 }, 
  { chance: 0.07, amount: 10 }, 
  { chance: 0.08, amount: 12 },
  { chance: 0.10, amount: 16 }, 
  { chance: 0.15, amount: 20 }
];

export const GEM_DROP_EFFECTS = [
  { chance: 0, amount: 0 }, { chance: 0.03, amount: 1 }, { chance: 0.07, amount: 1 }, { chance: 0.10, amount: 2 }
];
export const FLAMING_PICKAXE_EFFECTS = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.15];
export const PRICE_BUFF_EFFECTS = [0, 0.05, 0.07, 0.10, 0.20, 0.30, 0.50];
export const AVG_RELIC_POINTS = 250;

export const O11_EFFECTS = [0, 0.05, 0.07, 0.10, 0.15, 0.20];
export const O12_EFFECTS = [0, 0.05, 0.07, 0.10, 0.15, 0.20, 0.30, 0.40, 0.50];
export const O14_EFFECTS = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10];
export const O16_EFFECTS = [0, 0.05, 0.07, 0.09, 0.12, 0.15, 0.20, 0.25, 0.30];
export const O17_EFFECTS = [0, 0.01, 0.03, 0.05, 0.07, 0.10, 0.15];

export const getKSTParts = (offsetMs = 0) => {
  const targetDate = new Date(Date.now() + offsetMs);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(targetDate);
  let y = 0, m = 0, d = 0;
  for (const p of parts) {
    if (p.type === 'year') y = parseInt(p.value, 10);
    if (p.type === 'month') m = parseInt(p.value, 10);
    if (p.type === 'day') d = parseInt(p.value, 10);
  }
  return { y, m, d };
};

export const getCookingPeriod = () => {
  const { y, m, d } = getKSTParts(-3 * 60 * 60 * 1000); 
  const daysInMonth = new Date(y, m, 0).getDate(); 
  
  let start_d;
  if (y === 2026 && m === 2 && d >= 24) {
    start_d = d >= 27 ? 27 : 24;
  } else {
    const cycleIndex = Math.floor((d - 1) / 3);
    start_d = 1 + cycleIndex * 3;
  }
  
  let end_d = start_d + 3;
  let end_m = m;
  
  if (end_d > daysInMonth) {
    end_d = 1;
    end_m = m + 1;
    if (end_m > 12) end_m = 1; 
  }
  
  const sStr = `${String(m).padStart(2, '0')}-${String(start_d).padStart(2, '0')}`;
  const eStr = `${String(end_m).padStart(2, '0')}-${String(end_d).padStart(2, '0')}`;
  
  return `${sStr}~${eStr}`;
};

export const getCraftingPeriod = () => {
  const { m, d } = getKSTParts(-3 * 60 * 60 * 1000);
  return `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};