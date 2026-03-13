export interface SailingReward {
  name: string;
  amount: number;
  prob: number;
  image: string;
}

export interface Island {
  id: string;
  name: string;
  type: string;
  points: number;
  time: string;
  image: string;
  rewards: SailingReward[];
}

const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

export const ISLANDS: Island[] = [
  {
    id: 'lavion', name: '라비온', type: '소형 섬', points: 850, time: '4시간 5분', image: `${STORAGE_BASE_URL}/sailing/island_1_1.png`,
    rewards: [
      { name: '음산한 열쇠', amount: 1, prob: 25, image: `${STORAGE_BASE_URL}/sailing/spawner_key.png` },
      { name: '골든티켓', amount: 1, prob: 20, image: `${STORAGE_BASE_URL}/sailing/golden_ticket.png` },
      { name: '야생 장비 파괴 방지권', amount: 1, prob: 25, image: `${STORAGE_BASE_URL}/sailing/protect_scroll.png` },
      { name: '그린 일반 인챈트 캡슐', amount: 1, prob: 15, image: `${STORAGE_BASE_URL}/f1/general_g_box.png` },
      { name: '강철 물뿌리개', amount: 1, prob: 10, image: `${STORAGE_BASE_URL}/sailing/iron2.png` },
      { name: '블루 일반 인챈트 캡슐', amount: 1, prob: 5, image: `${STORAGE_BASE_URL}/f1/general_b_box.png` },
    ]
  },
  {
    id: 'kerua', name: '케르아', type: '소형 섬', points: 850, time: '4시간 5분', image: `${STORAGE_BASE_URL}/sailing/island_1_3.png`,
    rewards: [
      { name: '은은한 결정', amount: 3, prob: 14, image: `${STORAGE_BASE_URL}/sailing/mine_common_quality_piece.png` },
      { name: '용감한 결정', amount: 3, prob: 14, image: `${STORAGE_BASE_URL}/sailing/mob_common_quality_piece.png` },
      { name: '고요한 결정', amount: 3, prob: 14, image: `${STORAGE_BASE_URL}/sailing/fish_common_quality_piece.png` },
      { name: '소박한 결정', amount: 3, prob: 14, image: `${STORAGE_BASE_URL}/sailing/wood_common_quality_piece.png` },
      { name: '아련한 결정', amount: 3, prob: 14, image: `${STORAGE_BASE_URL}/sailing/flower_common_quality_piece.png` },
      { name: '광휘의 결정', amount: 1, prob: 6, image: `${STORAGE_BASE_URL}/sailing/mine_rare_quality_piece.png` },
      { name: '위대한 결정', amount: 1, prob: 6, image: `${STORAGE_BASE_URL}/sailing/mob_rare_quality_piece.png` },
      { name: '청명한 결정', amount: 1, prob: 6, image: `${STORAGE_BASE_URL}/sailing/fish_rare_quality_piece.png` },
      { name: '영롱한 결정', amount: 1, prob: 6, image: `${STORAGE_BASE_URL}/sailing/wood_rare_quality_piece.png` },
      { name: '화사한 결정', amount: 1, prob: 6, image: `${STORAGE_BASE_URL}/sailing/flower_rare_quality_piece.png` },
    ]
  },
  {
    id: 'morane', name: '모레인', type: '소형 섬', points: 850, time: '4시간 5분', image: `${STORAGE_BASE_URL}/sailing/island_1_2.png`,
    rewards: [
      { name: '모험 램프', amount: 1, prob: 35, image: `${STORAGE_BASE_URL}/sailing/weapon_lamp.png` },
      { name: '탐험 램프', amount: 1, prob: 35, image: `${STORAGE_BASE_URL}/sailing/normal_lamp.png` },
      { name: '모험 램프', amount: 2, prob: 10, image: `${STORAGE_BASE_URL}/sailing/weapon_lamp.png` },
      { name: '탐험 램프', amount: 2, prob: 10, image: `${STORAGE_BASE_URL}/sailing/normal_lamp.png` },
      { name: '모험 램프', amount: 3, prob: 5, image: `${STORAGE_BASE_URL}/sailing/weapon_lamp.png` },
      { name: '탐험 램프', amount: 3, prob: 5, image: `${STORAGE_BASE_URL}/sailing/normal_lamp.png` },
    ]
  },
  {
    id: 'yusila', name: '유실라', type: '소형 섬', points: 850, time: '4시간 5분', image: `${STORAGE_BASE_URL}/sailing/island_1_5.png`,
    rewards: [
      { name: '루키 열쇠 (거래 불가)', amount: 2, prob: 30, image: `${STORAGE_BASE_URL}/ocean_items/rookie_key.png` },
      { name: '노멀 열쇠 (거래 불가)', amount: 2, prob: 25, image: `${STORAGE_BASE_URL}/ocean_items/normal_key.png` },
      { name: '어빌리티 스톤', amount: 1, prob: 10, image: `${STORAGE_BASE_URL}/icons/ability_stone.png` },
      { name: '스킬 프리즘', amount: 1, prob: 10, image: `${STORAGE_BASE_URL}/sailing/skill_prism.png` },
      { name: '스킬 아크', amount: 1, prob: 10, image: `${STORAGE_BASE_URL}/icons/skill_arc.png` },
      { name: '하급 라이프스톤', amount: 1, prob: 5, image: `${STORAGE_BASE_URL}/tools/lifestone1.png` },
      { name: '중급 라이프스톤', amount: 1, prob: 5, image: `${STORAGE_BASE_URL}/tools/lifestone2.png` },
      { name: '상급 라이프스톤', amount: 1, prob: 5, image: `${STORAGE_BASE_URL}/tools/lifestone3.png` },
    ]
  },
  {
    id: 'belderic', name: '벨데릭', type: '소형 섬', points: 850, time: '4시간 5분', image: `${STORAGE_BASE_URL}/sailing/island_1_8.png`,
    rewards: [
      { name: '스태미나 드링크 I (거래 불가)', amount: 1, prob: 40, image: `${STORAGE_BASE_URL}/stamina/stamina_drink_1.png` },
      { name: '스태미나 드링크 II (거래 불가)', amount: 1, prob: 30, image: `${STORAGE_BASE_URL}/stamina/stamina_drink_2.png` },
      { name: '스태미나 드링크 III (거래 불가)', amount: 1, prob: 15, image: `${STORAGE_BASE_URL}/stamina/stamina_drink_3.png` },
      { name: '스태미나 드링크 IV (거래 불가)', amount: 1, prob: 10, image: `${STORAGE_BASE_URL}/stamina/stamina_drink_4.png` },
      { name: '스태미나 드링크 V (거래 불가)', amount: 1, prob: 5, image: `${STORAGE_BASE_URL}/stamina/stamina_drink_5.png` },
    ]
  },
  {
    id: 'toren', name: '토르엔', type: '소형 섬', points: 850, time: '4시간 5분', image: `${STORAGE_BASE_URL}/sailing/island_1_6.png`,
    rewards: [
      { name: '봉인된 홍옥의 팔찌 (거래 불가)', amount: 1, prob: 12.5, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge1.png` },
      { name: '봉인된 회복의 팔찌 (거래 불가)', amount: 1, prob: 12.5, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge3.png` },
      { name: '봉인된 도약의 원반 (거래 불가)', amount: 1, prob: 12.5, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge5.png` },
      { name: '봉인된 번개의 활 (거래 불가)', amount: 1, prob: 12.5, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge7.png` },
      { name: '봉인된 가벼운 바람깃 (거래 불가)', amount: 1, prob: 12.5, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge9.png` },
      { name: '봉인된 가벼운 도끼날 (거래 불가)', amount: 1, prob: 12.5, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge11.png` },
      { name: '봉인된 완충의 양산 (거래 불가)', amount: 1, prob: 12.5, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge13.png` },
      { name: '봉인된 심해의 결정 (거래 불가)', amount: 1, prob: 12.5, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge15.png` },
    ]
  },
  {
    id: 'kaien', name: '카이엔', type: '중형 섬', points: 5000, time: '12시간', image: `${STORAGE_BASE_URL}/sailing/island_2_1.png`,
    rewards: [
      { name: '인챈트북 조각', amount: 3, prob: 20.0, image: `${STORAGE_BASE_URL}/f1/enchant_book_piece.png` },
      { name: '가벼운 착지 인챈트북 (30%)', amount: 1, prob: 14.0, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png` },
      { name: '영혼 가속 인챈트북 (30%)', amount: 1, prob: 14.0, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png` },
      { name: '급류 인챈트북 (30%)', amount: 1, prob: 14.0, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png` },
      { name: '신속한 잠행 인챈트북 (30%)', amount: 1, prob: 14.0, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png` },
      { name: '전설 특수 인챈트 캡슐', amount: 1, prob: 6.0, image: `${STORAGE_BASE_URL}/f1/legendary_special_box.png` },
      { name: '신화 특수 인챈트 캡슐', amount: 1, prob: 4.0, image: `${STORAGE_BASE_URL}/f1/mythic_special_box.png` },
      { name: '호흡 인챈트북 (30%)', amount: 1, prob: 3.5, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png` },
      { name: '친수성 인챈트북 (30%)', amount: 1, prob: 3.5, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png` },
      { name: '물갈퀴 인챈트북 (30%)', amount: 1, prob: 3.5, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png` },
      { name: '약탈 인챈트북 (30%)', amount: 1, prob: 3.5, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png` },
    ]
  },
  {
    id: 'beloa', name: '벨로아', type: '중형 섬', points: 5000, time: '12시간', image: `${STORAGE_BASE_URL}/sailing/island_2_2.png`,
    rewards: [
      { name: '봉인된 맑은 생명의 조각 (거래 불가)', amount: 1, prob: 12.5, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge2.png` },
      { name: '봉인된 재생의 백합 (거래 불가)', amount: 1, prob: 12.5, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge4.png` },
      { name: '봉인된 경쾌한 새 친구 (거래 불가)', amount: 1, prob: 12.5, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge6.png` },
      { name: '봉인된 심해의 삼지창 (거래 불가)', amount: 1, prob: 12.5, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge8.png` },
      { name: '봉인된 속행의 묘약 (거래 불가)', amount: 1, prob: 12.5, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge10.png` },
      { name: '봉인된 영혼의 도끼 (거래 불가)', amount: 1, prob: 12.5, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge12.png` },
      { name: '봉인된 분홍 나비 날개 (거래 불가)', amount: 1, prob: 12.5, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge14.png` },
      { name: '봉인된 해류의 투구 (거래 불가)', amount: 1, prob: 12.5, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge16.png` },
    ]
  },
  {
    id: 'arsea', name: '아르세아', type: '일반 대륙', points: 14000, time: '24시간', image: `${STORAGE_BASE_URL}/sailing/island_3_2.png`,
    rewards: [
      { name: '스킬 아크 (x10)', amount: 1, prob: 25, image: `${STORAGE_BASE_URL}/icons/skill_arc.png` },
      { name: '전설 열쇠', amount: 3, prob: 25, image: `${STORAGE_BASE_URL}/ocean_items/legendary_key.png` },
      { name: '투시 인챈트북 (20%)', amount: 1, prob: 8, image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png` },
      { name: '노련한 손길 인챈트북 (20%)', amount: 1, prob: 8, image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png` },
      { name: '가속화 인챈트북 (20%)', amount: 1, prob: 8, image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png` },
      { name: '서두름 인챈트북 (20%)', amount: 1, prob: 8, image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png` },
      { name: '완벽한 착지 인챈트북 (20%)', amount: 1, prob: 8, image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png` },
      { name: '견고함 인챈트북 (20%)', amount: 1, prob: 8, image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png` },
      { name: '봉인된 해풍의 나비 (거래 불가)', amount: 1, prob: 1, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge17.png` },
      { name: '봉인된 추락한 날개의 편린 (거래 불가)', amount: 1, prob: 1, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge18.png` },
    ]
  },
  {
    id: 'kairent', name: '카이렌트', type: '일반 대륙', points: 14000, time: '24시간', image: `${STORAGE_BASE_URL}/sailing/island_3_4.png`,
    rewards: [
      { name: '스킬 프리즘', amount: 10, prob: 33, image: `${STORAGE_BASE_URL}/sailing/skill_prism.png` },
      { name: '스태미나 드링크 V (거래 불가)', amount: 3, prob: 33, image: `${STORAGE_BASE_URL}/stamina/stamina_drink_5.png` },
      { name: '상급 날카로움 인챈트북 (10%)', amount: 1, prob: 8, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png` },
      { name: '상급 보호 인챈트북 (10%)', amount: 1, prob: 8, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png` },
      { name: '상급 효율 인챈트북 (10%)', amount: 1, prob: 8, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png` },
      { name: '상급 행운 인챈트북 (10%)', amount: 1, prob: 8, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png` },
      { name: '봉인된 설계자의 서신 (거래 불가)', amount: 1, prob: 1, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge20.png` },
      { name: '봉인된 건축용 톱날 (거래 불가)', amount: 1, prob: 1, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge21.png` },
    ]
  },
  {
    id: 'ricarseon', name: '리카르세온', type: '대형 대륙', points: 30000, time: '48시간', image: `${STORAGE_BASE_URL}/sailing/island_4_1.png`,
    rewards: [
      { name: '전설 열쇠', amount: 5, prob: 20, image: `${STORAGE_BASE_URL}/ocean_items/legendary_key.png` },
      { name: '스킬 아크 (x10)', amount: 10, prob: 20, image: `${STORAGE_BASE_URL}/icons/skill_arc.png` },
      { name: '신화 열쇠 (거래 불가)', amount: 3, prob: 19, image: `${STORAGE_BASE_URL}/ocean_items/mythic_key.png` },
      { name: '투시 인챈트북 (30%)', amount: 1, prob: 5, image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png` },
      { name: '노련한 손길 인챈트북 (30%)', amount: 1, prob: 5, image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png` },
      { name: '가속화 인챈트북 (30%)', amount: 1, prob: 5, image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png` },
      { name: '서두름 인챈트북 (30%)', amount: 1, prob: 5, image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png` },
      { name: '완벽한 착지 인챈트북 (30%)', amount: 1, prob: 5, image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png` },
      { name: '견고함 인챈트북 (30%)', amount: 1, prob: 5, image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png` },
      { name: '상급 미끼 인챈트북 (20%) (거래 불가)', amount: 1, prob: 5, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png` },
      { name: '랜덤 뱃지 보급품', amount: 1, prob: 2, image: `${STORAGE_BASE_URL}/sailing/diamond_chest.png` },
      { name: '봉인된 활강의 영약', amount: 1, prob: 2, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge19.png` },
      { name: '봉인된 거인의 여신상', amount: 1, prob: 2, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge23.png` },
    ]
  },
  {
    id: 'kairosent', name: '카이로센트', type: '대형 대륙', points: 30000, time: '48시간', image: `${STORAGE_BASE_URL}/sailing/island_4_2.png`,
    rewards: [
      { name: '어빌리티 스톤', amount: 30, prob: 23, image: `${STORAGE_BASE_URL}/icons/ability_stone.png` },
      { name: '스킬 프리즘', amount: 30, prob: 23, image: `${STORAGE_BASE_URL}/sailing/skill_prism.png` },
      { name: '스태미나 드링크 V', amount: 3, prob: 23, image: `${STORAGE_BASE_URL}/stamina/stamina_drink_5.png` },
      { name: '상급 날카로움 인챈트북 (20%)', amount: 1, prob: 5, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png` },
      { name: '상급 효율 인챈트북 (20%)', amount: 1, prob: 5, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png` },
      { name: '상급 보호 인챈트북 (20%)', amount: 1, prob: 5, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png` },
      { name: '상급 행운 인챈트북 (20%)', amount: 1, prob: 5, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png` },
      { name: '상급 약탈 인챈트북 (20%)', amount: 1, prob: 5, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png` },
      { name: '겉날개', amount: 1, prob: 2, image: `${STORAGE_BASE_URL}/sailing/ItemSprite_elytra.png` },
      { name: '봉인된 불가사의한 상자', amount: 1, prob: 2, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge22.png` },
      { name: '봉인된 소중한 귀걸이', amount: 1, prob: 2, image: `${STORAGE_BASE_URL}/sailing/locked_sailing_badge24.png` },
    ]
  }
];

export const drawSailingReward = (rewards: SailingReward[]): SailingReward => {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const reward of rewards) {
    cumulative += reward.prob;
    if (rand <= cumulative) return reward;
  }
  return rewards[rewards.length - 1];
};