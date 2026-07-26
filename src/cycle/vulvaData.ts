// 外阴解剖科普数据

export interface VulvaPart {
  name: string;
  color: string;
  desc: string;
}

export const VULVA_PARTS: VulvaPart[] = [
  {
    name: '阴阜',
    color: '#f2c09a',
    desc: '耻骨联合前方的脂肪垫，青春期后覆盖阴毛，起到缓冲保护作用',
  },
  {
    name: '大阴唇',
    color: '#e8a87c',
    desc: '外侧两片皮肤皱襞，含汗腺与皮脂腺，像大门一样保护内部结构',
  },
  {
    name: '小阴唇',
    color: '#f472b6',
    desc: '大阴唇内侧的薄皱襞，富含神经与血管。突出、不对称、颜色深都完全正常',
  },
  {
    name: '阴蒂',
    color: '#fb7185',
    desc: '人体唯一专为愉悦而生的器官。可见的“小珍珠”只是冰山一角，内部结构沿骨盆延伸近 10 cm',
  },
  {
    name: '尿道口',
    color: '#fbbf24',
    desc: '排尿出口，位于阴蒂与阴道口之间 —— 排尿和月经走的是两条不同的通道',
  },
  {
    name: '阴道口',
    color: '#a78bfa',
    desc: '经血流出与分娩的通道入口。阴道冠（处女膜）形态天然多样，不能用来证明任何事',
  },
  {
    name: '会阴',
    color: '#c4b5fd',
    desc: '阴道口与肛门之间的区域，分娩时可能需要特别保护',
  },
];

export interface VulvaFact {
  icon: string;
  title: string;
  content: string;
}

export const VULVA_FACTS: VulvaFact[] = [
  {
    icon: 'Eye',
    title: '外阴 ≠ 阴道',
    content:
      '外阴是眼睛能看到的全部外部结构；阴道是内部约 7–10 cm 的肌性管道。说“阴道痒”的时候，大多数时候其实是外阴。',
  },
  {
    icon: 'ShieldCheck',
    title: '阴道有自净功能，不需要冲洗',
    content:
      '乳酸杆菌维持 pH 3.8–4.5 的弱酸环境，自动抑制有害菌。阴道冲洗和私处洗液反而会破坏菌群 —— 日常用温水清洗外阴就够了。',
  },
  {
    icon: 'ArrowRight',
    title: '从前向后',
    content:
      '如厕后从前向后擦拭（尿道 → 阴道 → 肛门方向），避免肠道细菌进入尿道与阴道，能有效预防尿路感染。',
  },
  {
    icon: 'Droplets',
    title: '分泌物是健康晴雨表',
    content:
      '透明或乳白、随周期变化的分泌物是健康的标志（回想一下周期里的宫颈黏液变化）。出现黄绿色、腥臭、豆渣样或伴随瘙痒时，才需要就医。',
  },
  {
    icon: 'Heart',
    title: '每个人的外阴都不一样',
    content:
      '颜色从粉到深褐、小阴唇突出或内收、两侧不对称、阴毛分布不同 —— 都是正常的个体差异。外阴和脸一样，独一无二。',
  },
  {
    icon: 'Hand',
    title: '用镜子看看自己',
    content:
      '放一面小镜子观察自己的外阴，是认识自己身体最直接的方式。了解“平时的我”是什么样子，才能及时发现自己的变化。',
  },
];
