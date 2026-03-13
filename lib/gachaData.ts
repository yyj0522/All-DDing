export interface Reward {
  id: string;
  name: string;
  image: string;
  prob: number;
  amount: number;
  grade: string;
}

const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

export const ENCHANT_BOXES = [
  { id: 'general_g', name: '그린 일반 인챈트 캡슐', image: `${STORAGE_BASE_URL}/f1/general_g_box.png`, active: true },
  { id: 'general_b', name: '블루 일반 인챈트 캡슐', image: `${STORAGE_BASE_URL}/f1/general_b_box.png`, active: true },
  { id: 'lower_special', name: '하급 특수 인챈트 캡슐', image: `${STORAGE_BASE_URL}/f1/lower_special_box.png`, active: true },
  { id: 'upper_special', name: '상급 특수 인챈트 캡슐', image: `${STORAGE_BASE_URL}/f1/upper_special_box.png`, active: true },
  { id: 'legendary_special', name: '전설 특수 인챈트 캡슐', image: `${STORAGE_BASE_URL}/f1/legendary_special_box.png`, active: true },
  { id: 'mythic_special', name: '신화 특수 인챈트 캡슐', image: `${STORAGE_BASE_URL}/f1/mythic_special_box.png`, active: true },
];

export const MYTHIC_REWARDS: Reward[] = [
  { id: 'haste', name: '가속화', image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png`, prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'insight', name: '투시', image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png`, prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'rush', name: '서두름', image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png`, prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'landing', name: '완벽한 착지', image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png`, prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'fire', name: '내화성', image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png`, prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'overcharge', name: '과충전', image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png`, prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'solid', name: '견고함', image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png`, prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'spring', name: '용수철', image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png`, prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'veteran', name: '노련한 손길', image: `${STORAGE_BASE_URL}/f1/mythic_special_enchant_book.png`, prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'piece', name: '인챈트북 조각', image: `${STORAGE_BASE_URL}/f1/enchant_book_piece.png`, prob: 70.0, amount: 30, grade: 'normal' },
];

export const GREEN_REWARDS: Reward[] = [
  { id: 'gr_r_1', name: '상급 행운 인챈트북(10%)', prob: 0.2, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png`, amount: 1, grade: 'rare' },
  { id: 'gr_r_2', name: '상급 효율 인챈트북(10%)', prob: 0.2, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png`, amount: 1, grade: 'rare' },
  { id: 'gr_r_3', name: '상급 날카로움 인챈트북(10%)', prob: 0.2, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png`, amount: 1, grade: 'rare' },
  { id: 'gr_r_4', name: '상급 보호 인챈트북(10%)', prob: 0.2, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png`, amount: 1, grade: 'rare' },
  { id: 'gr_r_5', name: '발화 인챈트북(10%)', prob: 0.2, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png`, amount: 1, grade: 'rare' },
  { id: 'gr_n_1', name: '친수성 인챈트북', prob: 1.0, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'gr_n_2', name: '물갈퀴 인챈트북', prob: 1.0, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'gr_n_3', name: '가벼운 착지 인챈트북', prob: 1.0, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'gr_n_4', name: '호흡 인챈트북', prob: 1.0, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'gr_n_5', name: '영혼 가속 인챈트북', prob: 1.0, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'gr_n_6', name: '신속한 잠행 인챈트북', prob: 1.0, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'gr_n_7', name: '약탈 인챈트 인챈트북', prob: 1.0, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'gr_n_8', name: '무한 인챈트북', prob: 1.0, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'gr_n_9', name: '충성 인챈트북', prob: 1.0, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'gr_n_10', name: '급류 인챈트북', prob: 1.0, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'gr_rk_1', name: '폭발 보호 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_2', name: '화염 보호 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_3', name: '차가운 걸음 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_4', name: '발사체 보호 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_5', name: '가시 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_6', name: '살충 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_7', name: '격파 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_8', name: '집전 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_9', name: '육중 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_10', name: '화염 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_11', name: '밀치기 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_12', name: '강타 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_13', name: '휩쓸기 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_14', name: '돌풍 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_15', name: '밀어내기 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_16', name: '다중 발사 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_17', name: '관통 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_18', name: '빠른 장전 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'gr_rk_19', name: '찌르기 인챈트북', prob: 4.6842, image: `${STORAGE_BASE_URL}/f1/rookie_general_enchant_book.png`, amount: 1, grade: 'rookie' }
];

export const BLUE_REWARDS: Reward[] = [
  { id: 'bl_r_1', name: '상급 행운 인챈트북(20%)', prob: 3.0, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png`, amount: 1, grade: 'rare' },
  { id: 'bl_r_2', name: '상급 효율 인챈트북(20%)', prob: 3.0, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png`, amount: 1, grade: 'rare' },
  { id: 'bl_r_3', name: '상급 날카로움 인챈트북(20%)', prob: 3.0, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png`, amount: 1, grade: 'rare' },
  { id: 'bl_r_4', name: '상급 보호 인챈트북(20%)', prob: 3.0, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png`, amount: 1, grade: 'rare' },
  { id: 'bl_r_5', name: '발화 인챈트북(20%)', prob: 3.0, image: `${STORAGE_BASE_URL}/f1/rare_general_enchant_book.png`, amount: 1, grade: 'rare' },
  { id: 'bl_n_1', name: '친수성 인챈트북', prob: 8.5, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'bl_n_2', name: '물갈퀴 인챈트북', prob: 8.5, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'bl_n_3', name: '가벼운 착지 인챈트북', prob: 8.5, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'bl_n_4', name: '호흡 인챈트북', prob: 8.5, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'bl_n_5', name: '영혼 가속 인챈트북', prob: 8.5, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'bl_n_6', name: '신속한 잠행 인챈트북', prob: 8.5, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'bl_n_7', name: '약탈 인챈트 인챈트북', prob: 8.5, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'bl_n_8', name: '무한 인챈트북', prob: 8.5, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'bl_n_9', name: '충성 인챈트북', prob: 8.5, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'bl_n_10', name: '급류 인챈트북', prob: 8.5, image: `${STORAGE_BASE_URL}/f1/normal_general_enchant_book.png`, amount: 1, grade: 'normal' }
];

export const LOWER_REWARDS: Reward[] = [
  { id: 'lo_c_1', name: '석탄 인챈트북', prob: 1.6666, image: `${STORAGE_BASE_URL}/f1/common_special_enchant_book.png`, amount: 1, grade: 'common' },
  { id: 'lo_c_2', name: '구리 인챈트북', prob: 1.6666, image: `${STORAGE_BASE_URL}/f1/common_special_enchant_book.png`, amount: 1, grade: 'common' },
  { id: 'lo_c_3', name: '금 인챈트북', prob: 1.6666, image: `${STORAGE_BASE_URL}/f1/common_special_enchant_book.png`, amount: 1, grade: 'common' },
  { id: 'lo_c_4', name: '철 인챈트북', prob: 1.6666, image: `${STORAGE_BASE_URL}/f1/common_special_enchant_book.png`, amount: 1, grade: 'common' },
  { id: 'lo_c_5', name: '청금석 인챈트북', prob: 1.6666, image: `${STORAGE_BASE_URL}/f1/common_special_enchant_book.png`, amount: 1, grade: 'common' },
  { id: 'lo_c_6', name: '석영 인챈트북', prob: 1.6666, image: `${STORAGE_BASE_URL}/f1/common_special_enchant_book.png`, amount: 1, grade: 'common' },
  { id: 'lo_c_7', name: '내폭성 인챈트북', prob: 1.6666, image: `${STORAGE_BASE_URL}/f1/common_special_enchant_book.png`, amount: 1, grade: 'common' },
  { id: 'lo_c_8', name: '회피 인챈트북', prob: 1.6666, image: `${STORAGE_BASE_URL}/f1/common_special_enchant_book.png`, amount: 1, grade: 'common' },
  { id: 'lo_c_9', name: '엔더 보호 인챈트북', prob: 1.6666, image: `${STORAGE_BASE_URL}/f1/common_special_enchant_book.png`, amount: 1, grade: 'common' },
  { id: 'lo_c_10', name: '서막 인챈트북', prob: 1.6666, image: `${STORAGE_BASE_URL}/f1/common_special_enchant_book.png`, amount: 1, grade: 'common' },
  { id: 'lo_c_11', name: '네더 보호 인챈트북', prob: 1.6666, image: `${STORAGE_BASE_URL}/f1/common_special_enchant_book.png`, amount: 1, grade: 'common' },
  { id: 'lo_c_12', name: '천벌 인챈트북', prob: 1.6666, image: `${STORAGE_BASE_URL}/f1/common_special_enchant_book.png`, amount: 1, grade: 'common' },
  { id: 'lo_rk_1', name: '추격 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_2', name: '심연 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_3', name: '참격 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_4', name: '반격 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_5', name: '위력 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_6', name: '골절 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_7', name: '광휘 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_8', name: '백신 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_9', name: '탈출 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_10', name: '소화 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_11', name: '마무리 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_12', name: '속박 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_13', name: '견갑 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_14', name: '흡혈 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_15', name: '잠행 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_16', name: '복원 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_17', name: '혈전 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_18', name: '불멸 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_19', name: '활력 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_20', name: '심호흡 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_21', name: '반사 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_22', name: '수호 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_23', name: '격퇴 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_24', name: '창공 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_25', name: '벌목 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_26', name: '흡혈귀 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_27', name: '흡수 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' },
  { id: 'lo_rk_28', name: '가벼운 걸음 인챈트북', prob: 2.8571, image: `${STORAGE_BASE_URL}/f1/rookie_special_enchant_book.png`, amount: 1, grade: 'rookie' }
];

export const UPPER_REWARDS: Reward[] = [
  { id: 'up_n_1', name: '자동 감기 인챈트북', prob: 1.2497, image: `${STORAGE_BASE_URL}/f1/normal_special_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'up_n_2', name: '출혈 인챈트북', prob: 1.2497, image: `${STORAGE_BASE_URL}/f1/normal_special_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'up_n_3', name: '다이아몬드 인챈트북', prob: 1.2497, image: `${STORAGE_BASE_URL}/f1/normal_special_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'up_n_4', name: '에메랄드 인챈트북', prob: 1.2497, image: `${STORAGE_BASE_URL}/f1/normal_special_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'up_n_5', name: '강인함 인챈트북', prob: 1.2497, image: `${STORAGE_BASE_URL}/f1/normal_special_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'up_n_6', name: '이중 타격 인챈트북', prob: 1.2497, image: `${STORAGE_BASE_URL}/f1/normal_special_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'up_n_7', name: '고대 잔해 인챈트북', prob: 1.2497, image: `${STORAGE_BASE_URL}/f1/normal_special_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'up_n_8', name: '낙하 인챈트북', prob: 1.2497, image: `${STORAGE_BASE_URL}/f1/normal_special_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'up_n_9', name: '좀비 인챈트북', prob: 1.2497, image: `${STORAGE_BASE_URL}/f1/normal_special_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'up_n_10', name: '스켈레톤 인챈트북', prob: 1.2497, image: `${STORAGE_BASE_URL}/f1/normal_special_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'up_n_11', name: '거미 인챈트북', prob: 1.2497, image: `${STORAGE_BASE_URL}/f1/normal_special_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'up_n_12', name: '크리퍼 인챈트북', prob: 1.2497, image: `${STORAGE_BASE_URL}/f1/normal_special_enchant_book.png`, amount: 1, grade: 'normal' },
  { id: 'up_r_1', name: '천적 인챈트북', prob: 1.4297, image: `${STORAGE_BASE_URL}/f1/rare_special_enchant_book.png`, amount: 1, grade: 'rare' },
  { id: 'up_r_2', name: '일격 인챈트북', prob: 1.4297, image: `${STORAGE_BASE_URL}/f1/rare_special_enchant_book.png`, amount: 1, grade: 'rare' },
  { id: 'up_r_3', name: '여명 인챈트북', prob: 1.4297, image: `${STORAGE_BASE_URL}/f1/rare_special_enchant_book.png`, amount: 1, grade: 'rare' },
  { id: 'up_r_4', name: '뜨거운 걸음 인챈트북', prob: 1.4297, image: `${STORAGE_BASE_URL}/f1/rare_special_enchant_book.png`, amount: 1, grade: 'rare' },
  { id: 'up_r_5', name: '심판 인챈트북', prob: 1.4297, image: `${STORAGE_BASE_URL}/f1/rare_special_enchant_book.png`, amount: 1, grade: 'rare' },
  { id: 'up_r_6', name: '밤기사 인챈트북', prob: 1.4297, image: `${STORAGE_BASE_URL}/f1/rare_special_enchant_book.png`, amount: 1, grade: 'rare' },
  { id: 'up_r_7', name: '뾰족함 인챈트북', prob: 1.4297, image: `${STORAGE_BASE_URL}/f1/rare_special_enchant_book.png`, amount: 1, grade: 'rare' },
  { id: 'up_e_1', name: '속격 인챈트북', prob: 1.6696, image: `${STORAGE_BASE_URL}/f1/epic_special_enchant_book.png`, amount: 1, grade: 'epic' },
  { id: 'up_e_2', name: '추진력 인챈트북', prob: 1.6696, image: `${STORAGE_BASE_URL}/f1/epic_special_enchant_book.png`, amount: 1, grade: 'epic' },
  { id: 'up_e_3', name: '냉혈함 인챈트북', prob: 1.6696, image: `${STORAGE_BASE_URL}/f1/epic_special_enchant_book.png`, amount: 1, grade: 'epic' },
  { id: 'piece', name: '인챈트북 조각', prob: 69.986, image: `${STORAGE_BASE_URL}/f1/enchant_book_piece.png`, amount: 10, grade: 'normal' }
];

export const LEGENDARY_REWARDS: Reward[] = [
  { id: 'leg_1', name: '아가미 인챈트북', prob: 5.0, image: `${STORAGE_BASE_URL}/f1/legendary_special_enchant_book.png`, amount: 1, grade: 'legendary' },
  { id: 'leg_2', name: '경험 인챈트북', prob: 5.0, image: `${STORAGE_BASE_URL}/f1/legendary_special_enchant_book.png`, amount: 1, grade: 'legendary' },
  { id: 'leg_3', name: '조급함 인챈트북', prob: 5.0, image: `${STORAGE_BASE_URL}/f1/legendary_special_enchant_book.png`, amount: 1, grade: 'legendary' },
  { id: 'leg_4', name: '바다의 경험 인챈트북', prob: 5.0, image: `${STORAGE_BASE_URL}/f1/legendary_special_enchant_book.png`, amount: 1, grade: 'legendary' },
  { id: 'leg_5', name: '학구열 인챈트북', prob: 5.0, image: `${STORAGE_BASE_URL}/f1/legendary_special_enchant_book.png`, amount: 1, grade: 'legendary' },
  { id: 'leg_6', name: '경감 인챈트북', prob: 5.0, image: `${STORAGE_BASE_URL}/f1/legendary_special_enchant_book.png`, amount: 1, grade: 'legendary' },
  { id: 'piece', name: '인챈트북 조각', prob: 70.0, image: `${STORAGE_BASE_URL}/f1/enchant_book_piece.png`, amount: 15, grade: 'normal' }
];

export const drawReward = (rewards: Reward[]): Reward => {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const reward of rewards) {
    cumulative += reward.prob;
    if (rand <= cumulative) return reward;
  }
  return rewards[rewards.length - 1];
};