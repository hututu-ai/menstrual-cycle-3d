// 一生的月经周期：从初潮到绝经的激素地图（科普示意，非医学精确值）

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);

/** 图表年龄范围（岁） */
export const LIFE_AGE_MIN = 8;
export const LIFE_AGE_MAX = 62;

/**
 * 一生雌激素相对水平（0–1）：
 * 青春期快速上升 → 生育期高位平台（轻微波动代表每月周期）→
 * 围绝经期剧烈波动地下降（激素过山车）→ 绝经后低位平稳
 */
export function lifeEstrogen(age: number): number {
  let v: number;
  if (age < 9.5) v = lerp(0.03, 0.08, smooth((age - LIFE_AGE_MIN) / 1.5));
  else if (age < 15) v = lerp(0.08, 0.72, smooth((age - 9.5) / 5.5));
  else if (age < 38) v = 0.8 + 0.06 * Math.sin(age * 0.9) + 0.03 * Math.sin(age * 2.1);
  else if (age < 44) v = lerp(0.8, 0.66, smooth((age - 38) / 6)) + 0.05 * Math.sin(age * 1.7);
  else if (age < 53) {
    // 围绝经期：整体下降 + 越来越剧烈的波动 —— 不是直线下降，而是过山车
    const base = lerp(0.66, 0.16, smooth((age - 44) / 9));
    const vol = lerp(0.06, 0.17, smooth((age - 44) / 5));
    v = base + vol * Math.sin(age * 2.9) * Math.sin(age * 1.35);
  } else v = lerp(0.14, 0.07, smooth((age - 53) / 9));
  return clamp01(v);
}

export interface LifeStage {
  id: string;
  name: string;
  english: string;
  ageText: string;
  /** 在图表上的年龄跨度 */
  span: [number, number];
  /** 标记点所在年龄 */
  anchorAge: number;
  color: string;
  tagline: string;
  /** 身体在发生什么 */
  happening: string[];
  /** 激素形态一句话 */
  hormoneNote: string;
  /** 周期特点一句话 */
  cycleNote: string;
  /** 这个阶段，关怀自己 */
  care: string[];
}

export const LIFE_STAGES: LifeStage[] = [
  {
    id: 'puberty',
    name: '青春期 · 初潮',
    english: 'Puberty & Menarche',
    ageText: '约 9–15 岁',
    span: [9, 15],
    anchorAge: 13,
    color: '#38bdf8',
    tagline: '身体按下启动键',
    happening: [
      '下丘脑-垂体-卵巢轴（HPO 轴）苏醒，激素工厂开始运转',
      '雌激素上升：乳房发育、身高突增、开始出现分泌物',
      '初潮来临（平均 12–13 岁）—— 人生的第一次月经',
      '最初 1–2 年周期常常不规律：很多是无排卵周期，这是正常的',
    ],
    hormoneNote: '雌激素从低位快速爬升，HPO 轴还在「调试期」',
    cycleNote: '21–45 天一个周期都正常，最初几年不规律不必焦虑',
    care: [
      '书包里常备一片卫生巾 —— 初潮可能在学校突然到来',
      '开始记录周期，建立自己的数据档案',
      '初潮不是「脏」或羞耻的事，它意味着你健康地长大了',
    ],
  },
  {
    id: 'reproductive',
    name: '生育期 · 周期成熟',
    english: 'Reproductive Years',
    ageText: '约 15–45 岁',
    span: [15, 45],
    anchorAge: 28,
    color: '#fb7185',
    tagline: '每月一次的潮汐',
    happening: [
      'HPO 轴成熟，每月规律排卵，激素如潮汐般准时涨落',
      '子宫内膜按月生长 → 等待 → 剥脱，循环约 400–500 次',
      '怀孕与哺乳期间月经会暂停（身体的「节能模式」）',
      '压力、过度节食、剧烈运动都可能让月经暂时出走',
    ],
    hormoneNote: '雌激素高位平台期，每月与孕激素规律共舞',
    cycleNote: '21–35 天一个周期、经期 2–7 天，都在正常范围内',
    care: [
      '周期是最忠实的健康晴雨表：突然紊乱值得留意',
      '痛经逐年加重、非经期出血，请及时就医',
      '避孕与备孕都值得认真学习 —— 知识就是主动权',
    ],
  },
  {
    id: 'perimenopause',
    name: '围绝经期 · 过渡',
    english: 'Perimenopause',
    ageText: '约 45–55 岁',
    span: [45, 55],
    anchorAge: 48,
    color: '#a78bfa',
    tagline: '激素的过山车',
    happening: [
      '卵巢内卵泡所剩无几，排卵开始变得不稳定',
      '雌激素不是直线下降，而是忽高忽低地波动下降',
      '周期开始紊乱：变短、变长、经量忽多忽少',
      '潮热、盗汗、失眠、情绪波动 —— 都是激素波动的真实反应',
      '连续 12 个月没有月经 = 正式绝经（平均 49–52 岁）',
    ],
    hormoneNote: '剧烈波动地下降，所以症状总是一阵一阵地来',
    cycleNote: '从规律到紊乱再到停止，过渡期通常持续 4–8 年',
    care: [
      '这段时期值得被认真对待，症状严重可以就医评估（如激素替代治疗）',
      '负重运动 + 钙和维生素 D，提前保护骨骼',
      '情绪波动不是「脾气变差」，是身体正在经历巨大的变化',
    ],
  },
  {
    id: 'postmenopause',
    name: '绝经后 · 新篇章',
    english: 'Postmenopause',
    ageText: '55 岁以后',
    span: [55, 62],
    anchorAge: 58,
    color: '#fbbf24',
    tagline: '与月经告别之后',
    happening: [
      '卵泡耗尽，月经彻底成为回忆',
      '雌激素稳定在低水平，不再每月波动',
      '潮热等过渡期症状会逐渐减轻',
      '新的健康主题登场：骨密度、心血管、阴道干涩',
    ],
    hormoneNote: '低而平稳 —— 身体进入了一种新的稳态',
    cycleNote: '不再出血；若绝经后出血，必须尽快就医',
    care: [
      '定期检查骨密度，负重运动永远不晚',
      '心血管风险上升，关注血压与血脂',
      '阴道干涩可以用润滑剂或局部雌激素改善，不必忍着',
    ],
  },
];

/** 曲线上的人生事件标注 */
export const LIFE_EVENTS: { age: number; label: string; note?: string; pos: 'above' | 'below' }[] = [
  { age: 12.5, label: '初潮', note: '第一次月经', pos: 'below' },
  { age: 45.5, label: '周期开始紊乱', pos: 'above' },
  { age: 51, label: '绝经', note: '连续 12 个月无月经', pos: 'above' },
];
