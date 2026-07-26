// 28 天月经周期的生理数学模型（科普示意，非医学精确值）

export const CYCLE_DAYS = 28;

export type PhaseId = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface Phase {
  id: PhaseId;
  name: string;
  english: string;
  range: [number, number];
  color: string;
  colorSoft: string;
  tagline: string;
  summary: string;
  details: string[];
  // 这个阶段：关注自己（观察什么、注意什么）
  watch: string[];
  // 这个阶段：关怀自己（自我照顾建议）
  care: string[];
  // 该阶段代表性的一天（点击阶段卡片时跳转）
  anchorDay: number;
  // 身体使用说明书（cycle syncing）：这个阶段适合的运动 / 饮食 / 工作 / 社交
  sync: { exercise: string; diet: string; work: string; social: string };
}

export const PHASES: Phase[] = [
  {
    id: 'menstrual',
    name: '月经期',
    english: 'Menstrual Phase',
    range: [1, 5],
    anchorDay: 2,
    color: '#f43f5e',
    colorSoft: 'rgba(244, 63, 94, 0.16)',
    tagline: '内膜剥落 · 经血生成',
    summary:
      '由于未受孕，黄体退化，雌激素与孕激素骤降，子宫内膜失去激素支持而剥脱出血 —— 这就是月经。',
    details: [
      '黄体退化 → 雌/孕激素水平断崖式下降',
      '子宫螺旋动脉痉挛收缩，内膜功能层缺血坏死',
      '内膜碎片 + 血液 + 宫颈黏液经阴道排出，即为经血（全程约 20–80 ml）',
      '前列腺素引起子宫收缩，可能伴随痛经',
      '与此同时，FSH 悄悄升高，新一批卵泡开始募集',
    ],
    watch: [
      '记录经期长度、经量与颜色，建立自己的“正常基线”',
      '卫生巾 / 棉条 2–4 小时更换一次，棉条不超过 8 小时',
      '痛经逐年加重或严重影响生活，值得就医排查（如子宫内膜异位症）',
    ],
    care: [
      '热敷小腹 15–20 分钟，比想象中更止痛',
      '温热饮食 + 充足睡眠，允许自己慢下来，这不是偷懒',
      '布洛芬在疼痛刚开始时服用效果最好（抑制前列腺素）',
      '月经不是“脏”，不必羞耻，也不必勉强自己硬撑',
    ],
    sync: {
      exercise: '散步、阴瑜伽、轻柔拉伸；量大的前 2 天避免高强度',
      diet: '温热好消化；红肉、深绿蔬菜补铁，黑巧克力补镁',
      work: '安排事务性、低决策的工作，允许节奏慢下来',
      social: '独处充电期；不想社交时拒绝，不需要愧疚',
    },
  },
  {
    id: 'follicular',
    name: '卵泡期',
    english: 'Follicular Phase',
    range: [6, 13],
    anchorDay: 9,
    color: '#34d399',
    colorSoft: 'rgba(52, 211, 153, 0.14)',
    tagline: '卵泡发育 · 内膜修复增厚',
    summary:
      '垂体分泌 FSH 刺激卵巢中多个卵泡发育，胜出的优势卵泡大量分泌雌激素，子宫内膜在经期后快速修复、增厚。',
    details: [
      'FSH 促进 5–10 个卵泡同时发育，通常只有 1 个成为优势卵泡',
      '卵泡分泌的雌激素持续攀升，在排卵前达到全周期最高峰',
      '子宫内膜从基底层增生修复，厚度从 ~1 mm 恢复到 ~8 mm',
      '宫颈黏液变得稀薄透明，为精子通过做准备',
      '雌激素高峰触发正反馈：诱发 LH 峰，排卵即将发生',
    ],
    watch: [
      '月经结束后 7–10 天，是乳房自查的最佳时机',
      '开始观察分泌物的变化，找到属于自己的排卵信号',
    ],
    care: [
      '这是精力最好的时候，适合运动、挑战和做重要决定',
      '皮肤状态好，注意防晒就够了',
      '提前备好经期用品，从容迎接下一次月经',
    ],
    sync: {
      exercise: '体能巅峰：HIIT、力量训练、学新运动都趁现在',
      diet: '清爽高蛋白；发酵食物、发芽种子，食欲最可控',
      work: '开新项目、头脑风暴、学新技能、做重大决定',
      social: '最适合约会、演讲、社交 —— 你的能量在发光',
    },
  },
  {
    id: 'ovulation',
    name: '排卵期',
    english: 'Ovulation',
    range: [14, 15],
    anchorDay: 14,
    color: '#fbbf24',
    colorSoft: 'rgba(251, 191, 36, 0.14)',
    tagline: 'LH 峰触发 · 卵子释放',
    summary:
      'LH（黄体生成素）骤然飙升形成“LH 峰”，约 24–36 小时后成熟卵泡破裂，卵子被排出卵巢，由输卵管伞端拾取。',
    details: [
      '雌激素高峰正反馈 → LH 在数小时内飙升至基值的 5–10 倍',
      'LH 峰触发卵泡壁破裂，次级卵母细胞（卵子）排出',
      '输卵管伞端的纤毛像手一样将卵子“捞”进输卵管',
      '卵子可存活 12–24 小时，受精多发生在输卵管壶腹部',
      '部分人会感到一侧下腹短暂隐痛（排卵痛）',
    ],
    watch: [
      '蛋清样拉丝分泌物 = 健康的排卵信号，不是“不干净”',
      '一侧下腹短暂隐痛（排卵痛）通常几小时内自行缓解',
      '无论备孕还是避孕，这几天都是关键窗口',
    ],
    care: [
      '分泌物增多时保持干爽，选择棉质透气的内裤',
      '这是雌激素给你的自信高光期，穿喜欢的衣服出门吧',
    ],
    sync: {
      exercise: '仍可高强度；若出现排卵痛，当天降回舒缓运动',
      diet: '多喝水 + 高纤维，帮身体代谢掉高峰的雌激素',
      work: '谈判、面试、公开表达的黄金 48 小时',
      social: '表达力与自信的巅峰，重要对话安排在这几天',
    },
  },
  {
    id: 'luteal',
    name: '黄体期',
    english: 'Luteal Phase',
    range: [15, 28],
    anchorDay: 21,
    color: '#a78bfa',
    colorSoft: 'rgba(167, 139, 250, 0.14)',
    tagline: '黄体分泌 · 等待着床',
    summary:
      '破裂的卵泡转化为黄体，大量分泌孕激素。子宫内膜转为分泌期、血管丰富，为受精卵着床做准备；若未受孕，黄体退化，周期重启。',
    details: [
      '卵泡残余组织形成黄体，分泌孕激素 + 雌激素',
      '孕激素使内膜进一步增厚至 ~10–12 mm，腺体分泌营养液',
      '基础体温升高约 0.3–0.5 ℃',
      '若受精：胚胎着床，hCG 维持黄体；若未受精：黄体于第 24–26 天退化',
      '黄体退化 → 激素水平下降 → 螺旋动脉痉挛 → 下一次月经开始',
    ],
    watch: [
      'PMS 情绪波动是激素变化的真实反应，不是“矫情”',
      '乳房胀痛、水肿会在月经来潮后自然缓解',
      '情绪症状严重到影响生活（PMDD），请寻求专业帮助',
    ],
    care: [
      '减少咖啡因、酒精和高盐食物，减轻水肿',
      '深绿色蔬菜和坚果补充镁，缓解焦虑与抽筋',
      '温和运动（散步、瑜伽）改善情绪和睡眠',
      '对自己温柔一点：这几天的低落不是你的错',
    ],
    sync: {
      exercise: '前半段维持强度，经前一周转散步、瑜伽、游泳',
      diet: '低盐防水肿；复合碳水稳血糖；坚果深绿菜补镁',
      work: '适合收尾、复盘、抠细节；重大谈判避开经前',
      social: '预留独处时间；情绪敏感是激素作用，不是矫情',
    },
  },
];

export function phaseAt(day: number): Phase {
  if (day <= 5.5) return PHASES[0];
  if (day < 13.6) return PHASES[1];
  if (day <= 15.2) return PHASES[2];
  return PHASES[3];
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);
const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
const gauss = (x: number, mu: number, sigma: number) =>
  Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma));

export interface Hormones {
  estrogen: number;
  progesterone: number;
  lh: number;
  fsh: number;
}

export function hormones(day: number): Hormones {
  return {
    estrogen: clamp01(0.1 + 0.85 * gauss(day, 13, 1.6) + 0.42 * gauss(day, 21, 3.0)),
    progesterone: clamp01(0.05 + 0.95 * gauss(day, 21, 3.4)),
    lh: clamp01(0.14 + 0.9 * gauss(day, 13.6, 0.75)),
    fsh: clamp01(0.1 + 0.3 * gauss(day, 4, 2.4) + 0.42 * gauss(day, 13.9, 1.0)),
  };
}

export const HORMONE_META = [
  { key: 'estrogen', name: '雌激素', english: 'Estrogen', color: '#34d399' },
  { key: 'progesterone', name: '孕激素', english: 'Progesterone', color: '#a78bfa' },
  { key: 'lh', name: '黄体生成素', english: 'LH', color: '#fbbf24' },
  { key: 'fsh', name: '促卵泡激素', english: 'FSH', color: '#60a5fa' },
] as const;

/** 子宫内膜厚度（0–1 归一化） */
export function endometriumThickness(day: number): number {
  if (day <= 5) return lerp(0.85, 0.12, smooth((day - 1) / 4));
  if (day <= 14) return lerp(0.12, 0.8, smooth((day - 5) / 9));
  if (day <= 22) return lerp(0.8, 1.0, smooth((day - 14) / 8));
  return lerp(1.0, 0.85, smooth((day - 22) / 6));
}

/** 估算的内膜厚度（mm，科普近似值） */
export function endometriumMM(day: number): number {
  return Math.round(1 + endometriumThickness(day) * 11);
}

/** 优势卵泡半径（排卵后为 0） */
export function follicleSize(day: number): number {
  if (day <= 5) return 0.09;
  if (day <= 14) return lerp(0.1, 0.27, (day - 5) / 9);
  return 0;
}

/** 黄体大小 */
export function corpusLuteumSize(day: number): number {
  if (day < 14.5) return 0;
  if (day <= 21) return lerp(0.17, 0.29, (day - 14.5) / 6.5);
  return lerp(0.29, 0.08, smooth((day - 21) / 7));
}

/** 卵子旅程：t < 0 表示还在卵泡里；0–1 表示沿输卵管移动；不可见表示已退化 */
export function eggJourney(day: number): { visible: boolean; t: number; opacity: number } {
  if (day < 14) return { visible: true, t: -1, opacity: 1 };
  if (day <= 18.5) return { visible: true, t: clamp01((day - 14) / 4.2), opacity: 1 };
  if (day <= 19.5) return { visible: true, t: 1, opacity: 1 - (day - 18.5) };
  return { visible: false, t: 1, opacity: 0 };
}

/** 经血流量强度 0–1 */
export function menstrualFlow(day: number): number {
  if (day <= 1.5) return lerp(0.4, 1, (day - 1) / 0.5);
  if (day <= 3) return 1;
  if (day <= 5.5) return lerp(1, 0, (day - 3) / 2.5);
  return 0;
}

/* ===================== 全身维度：完整科普扩展 ===================== */

/** 基础体温（℃）：排卵前低温相，排卵后升高 0.3–0.5℃，经前回落 */
export function basalBodyTemp(day: number): number {
  let t: number;
  if (day <= 13) t = 36.35 + 0.05 * Math.sin(day * 0.9);
  else if (day <= 14.5) t = 36.28; // 排卵日体温小幅骤降（经典 BBT 特征）
  else if (day <= 16.5) t = 36.28 + ((day - 14.5) / 2) * 0.45;
  else if (day <= 26) t = 36.74 + 0.04 * Math.sin(day * 1.3);
  else t = 36.74 - ((day - 26) / 2) * 0.35; // 黄体退化，体温回落
  return Math.round(t * 100) / 100;
}

/** 宫颈黏液状态（0–3） */
export interface MucusState {
  level: number; // 0 经期 / 1 干燥 / 2 湿润黏稠 / 3 蛋清样拉丝
  name: string;
  desc: string;
}

export function cervicalMucus(day: number): MucusState {
  if (day <= 5.5) return { level: 0, name: '经期', desc: '分泌物被经血遮蔽' };
  if (day <= 8) return { level: 1, name: '干燥期', desc: '几乎无分泌物，外阴干爽' };
  if (day <= 12) return { level: 2, name: '湿润期', desc: '乳白黏稠，类似乳液' };
  if (day <= 15.5) return { level: 3, name: '蛋清样', desc: '透明拉丝，最易受孕的征兆' };
  return { level: 2, name: '变稠', desc: '孕激素使黏液重新变稠、减少' };
}

export const MUCUS_LEVELS = ['经期', '干燥期', '湿润黏稠', '蛋清拉丝'];

/** 易孕期（排卵日前 3 天 + 后 2 天，精子可存活 3–5 天） */
export function isFertile(day: number): boolean {
  return day >= 11 && day <= 16;
}

/** 双周期视角：卵巢周期与子宫周期是两条并行的轨道 */
export function ovarianPhase(day: number): { name: string; color: string } {
  if (day <= 13.6) return { name: '卵泡期', color: '#34d399' };
  if (day <= 15.2) return { name: '排卵', color: '#fbbf24' };
  return { name: '黄体期', color: '#a78bfa' };
}

export function uterinePhase(day: number): { name: string; color: string } {
  if (day <= 5.5) return { name: '月经期', color: '#fb7185' };
  if (day <= 14) return { name: '增生期', color: '#38bdf8' };
  return { name: '分泌期', color: '#fb923c' };
}

/** 当日的身体感受信号 */
export interface BodySignal {
  icon: string; // lucide 图标名
  label: string;
  note?: string;
}

export function bodySignals(day: number): BodySignal[] {
  if (day <= 3)
    return [
      { icon: 'Flame', label: '痛经', note: '前列腺素引起子宫收缩' },
      { icon: 'BatteryLow', label: '乏力嗜睡' },
      { icon: 'CloudRain', label: '腰酸坠胀' },
    ];
  if (day <= 5.5)
    return [
      { icon: 'Droplet', label: '经量减少' },
      { icon: 'BatteryMedium', label: '体力回升' },
    ];
  if (day <= 9)
    return [
      { icon: 'Sparkles', label: '皮肤状态佳' },
      { icon: 'Zap', label: '精力回升' },
      { icon: 'Smile', label: '情绪平稳' },
    ];
  if (day <= 13)
    return [
      { icon: 'Zap', label: '精力充沛', note: '雌激素高峰' },
      { icon: 'Heart', label: '性欲增强' },
      { icon: 'Droplets', label: '分泌物变稀' },
    ];
  if (day <= 15.2)
    return [
      { icon: 'Activity', label: '排卵痛', note: '一侧下腹短暂隐痛（部分人有）' },
      { icon: 'Droplets', label: '蛋清样分泌物' },
      { icon: 'Thermometer', label: '体温即将上升' },
    ];
  if (day <= 21)
    return [
      { icon: 'ThermometerSun', label: '体温升高 0.3–0.5℃' },
      { icon: 'Cookie', label: '食欲增加' },
      { icon: 'HeartPulse', label: '乳房微胀' },
    ];
  return [
    { icon: 'CloudRain', label: '情绪波动', note: 'PMS 经前综合征' },
    { icon: 'Droplet', label: '水肿腹胀' },
    { icon: 'CircleDot', label: '易长痘' },
    { icon: 'Moon', label: '睡眠质量下降' },
  ];
}

