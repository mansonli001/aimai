// 八类型映射
export const TYPES: Record<string, string> = {
  "量子纠缠型": "表面聊正事，每句都带钩子",
  "窗户纸型": "就差最后一步，谁先捅破谁赢",
  "温水煮青蛙型": "聊了很久，从没断联，也没进展",
  "云雨欲来型": "每个问题都在试探，风雨要来了",
  "单方面起火型": "有一边明显在用力，另一边还没感觉",
  "柏拉图危险型": "字面上什么都没有，但你睡不着",
  "深水炸弹型": "某一句话信息量极大，你炸了吗",
  "暧昧绝缘体": "她真的只是把你当朋友，醒醒",
};

// 定调句映射
const TAGLINES: [number, number, string][] = [
  [0, 20, "她真的只是在问路，别多想了。"],
  [20, 40, "信号很弱，但不是完全没有。"],
  [40, 60, "有点意思，值得继续观察。"],
  [60, 75, "这锅热了，你感觉到了吗？"],
  [75, 88, "她在等你，你还在分析什么？"],
  [88, 101, "就差捅破那层纸了，今晚。"],
];

export function getTagline(pct: number): string {
  for (const [lo, hi, t] of TAGLINES) {
    if (pct >= lo && pct < hi) return t;
  }
  return TAGLINES[TAGLINES.length - 1][2];
}

// 配色系统：根据 pct 区间动态变色
export interface PctColor {
  main: string;
  bar: string;
  bg: string;
  text: string;
  avatarBg: string;
  avatarText: string;
}

export function getColor(pct: number): PctColor {
  if (pct <= 30)
    return {
      main: "#378add",
      bar: "#378add",
      bg: "rgba(55, 138, 221, 0.08)",
      text: "#7cbef5",
      avatarBg: "rgba(55, 138, 221, 0.15)",
      avatarText: "#7cbef5",
    };
  if (pct <= 60)
    return {
      main: "#d85a30",
      bar: "#d85a30",
      bg: "rgba(216, 90, 48, 0.08)",
      text: "#f0a080",
      avatarBg: "rgba(216, 90, 48, 0.15)",
      avatarText: "#f0a080",
    };
  if (pct <= 80)
    return {
      main: "#ff4d7e",
      bar: "#ff4d7e",
      bg: "rgba(255, 77, 126, 0.08)",
      text: "#ffb2be",
      avatarBg: "rgba(255, 77, 126, 0.15)",
      avatarText: "#ffb2be",
    };
  return {
    main: "#b91c1c",
    bar: "#e24b4a",
    bg: "rgba(185, 28, 28, 0.08)",
    text: "#f7a0a0",
    avatarBg: "rgba(185, 28, 28, 0.15)",
    avatarText: "#f7a0a0",
  };
}

// 示例 pill 数据
export interface ExamplePill {
  label: string;
  me: string;
  her: string;
  text: string;
}

export const EXAMPLES: ExamplePill[] = [
  {
    label: "她问我北京怎么看病",
    me: "我",
    her: "她",
    text: `她：北京看病是挂号软件好用还是直接去医院？
我：看什么科，三甲的话提前在京医通抢
她：哦好的，那你在北京多久了
我：七年了
她：哇那你很熟了，那北京哪里好玩
我：看你喜欢什么类型
她：我也不知道，你平时周末喜欢去哪`,
  },
  {
    label: '她说"哦好的"',
    me: "我",
    her: "她",
    text: `她：你在干嘛
我：刚下班
她：哦好的
我：？
她：没事 就是想问问
我：你呢
她：我在发呆 你有没有什么好玩的推荐
我：什么类型
她：你平时喜欢干嘛呀`,
  },
  {
    label: "聊了两小时量子力学",
    me: "我",
    her: "她",
    text: `她：你看量子纠缠那个实验了吗
我：看了，挺颠覆认知的
她：对！我就觉得……你平时看这种科普吗
我：偶尔
她：那我们可以多交流，我最近特别迷这个
我：行啊
她：你一般几点睡`,
  },
];

// 行为数据类型
export interface BehaviorData {
  her_initiative: string;
  your_initiative: string;
  unnecessary_questions: string;
  summary: string;
}

// AI 返回结果类型
export interface Signal {
  quote: string;
  layer1: string;
  layer2: string;
  layer3: string;
  proof: string;
}

export interface DetectResult {
  pct: number;
  type: string;
  behavior_data: BehaviorData;
  signals: Signal[];
  xiaoai: string;
  risk: string;
  bold_line: string;
  bold_reason: string;
  safe_line: string;
  sp_quote: string;
}

// 四钩子数据
export interface HookItem {
  name: string;
  url: string;
  color: string;
  desc: string;
  cta: string;
}

export const HOOKS: HookItem[] = [
  {
    name: "醒醒",
    url: "https://xingxing.starfluxes.com",
    color: "#7c6fcf",
    desc: "搞懂她之后，还得会开口。去醒醒练练台词。",
    cta: "去练习 →",
  },
  {
    name: "废话检测局",
    url: "https://feihua.starfluxes.com",
    color: "#d4537e",
    desc: "顺手测测你们的聊天废话含量，说不定她也在说废话。",
    cta: "去测测 →",
  },
  {
    name: "行吟山河",
    url: "https://su-shi.starfluxes.com",
    color: "#c4a45a",
    desc: "苏轼一生漂泊，从没纠结过她什么意思。",
    cta: "去看看 →",
  },
  {
    name: "周末余额",
    url: "https://weekends.starfluxes.com",
    color: "#3d9e6a",
    desc: "别把周末都用来猜她什么意思了，算算还剩几个。",
    cta: "去算算 →",
  },
];

// Loading 步骤（小暧口吻）
export const LOADING_STEPS = [
  "扫描谁先找谁说话",
  "看她的回复有几句话",
  "找她说了什么不必要说的",
  "想想她到底想要什么",
];

// API 失败时的默认降级结果
export const FALLBACK_RESULT: DetectResult = {
  pct: 52,
  type: "温水煮青蛙型",
  behavior_data: {
    her_initiative: "她主动3次",
    your_initiative: "你主动1次",
    unnecessary_questions: "她问了2个不必要问你的问题",
    summary: "她找你的次数是你的3倍，她需要一个理由跟你说话",
  },
  signals: [
    {
      quote: "那你在北京多久了",
      layer1: "只是随口问一句",
      layer2: "在试探你在这座城市的根有多深",
      layer3: "她在评估你们之间有没有现实的可能性",
      proof: "你们聊的是北京看病，和你待了多久没有关系",
    },
  ],
  xiaoai: "小暧暂时走神了，但凭直觉，这段聊天不简单。再试一次？",
  risk: "",
  bold_line: "你在这座城市多久了？够不够久到让我也留下来。",
  bold_reason: "她在问你的生活，不是在问路。",
  safe_line: "挺久的，挺习惯的。",
  sp_quote: "问路的人，不会问你在哪多久。",
};
