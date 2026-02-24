export const ENCHANT_BOXES = [
  { id: 'general_g', name: '그린 일반 인챈트 캡슐', image: '/f1/general_g_box.png', active: false },
  { id: 'general_b', name: '블루 일반 인챈트 캡슐', image: '/f1/general_b_box.png', active: false },
  { id: 'lower_special', name: '하급 특수 인챈트 캡슐', image: '/f1/lower_special_box.png', active: false },
  { id: 'upper_special', name: '상급 특수 인챈트 캡슐', image: '/f1/upper_special_box.png', active: false },
  { id: 'legendary_special', name: '전설 특수 인챈트 캡슐', image: '/f1/legendary_special_box.png', active: false },
  { id: 'mythic_special', name: '신화 특수 인챈트 캡슐', image: '/f1/mythic_special_box.png', active: true }, 
];

export type Reward = { id: string; name: string; image: string; prob: number; amount: number; grade: string };

export const MYTHIC_REWARDS: Reward[] = [
  { id: 'haste', name: '가속화', image: '/f1/mythic_special_enchant_book.png', prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'insight', name: '투시', image: '/f1/mythic_special_enchant_book.png', prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'rush', name: '서두름', image: '/f1/mythic_special_enchant_book.png', prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'landing', name: '완벽한 착지', image: '/f1/mythic_special_enchant_book.png', prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'fire', name: '내화성', image: '/f1/mythic_special_enchant_book.png', prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'overcharge', name: '과충전', image: '/f1/mythic_special_enchant_book.png', prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'solid', name: '견고함', image: '/f1/mythic_special_enchant_book.png', prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'spring', name: '용수철', image: '/f1/mythic_special_enchant_book.png', prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'veteran', name: '노련한 손길', image: '/f1/mythic_special_enchant_book.png', prob: 3.3333, amount: 1, grade: 'mythic' },
  { id: 'piece', name: '인챈트북 조각', image: '/f1/enchant_book_piece.png', prob: 70.0, amount: 30, grade: 'normal' },
];

export const drawMythicReward = (): Reward => {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const reward of MYTHIC_REWARDS) {
    cumulative += reward.prob;
    if (rand <= cumulative) return reward;
  }
  return MYTHIC_REWARDS[MYTHIC_REWARDS.length - 1]; 
};