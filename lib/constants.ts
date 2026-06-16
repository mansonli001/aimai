// 20类型映射
export const TYPES: Record<string, string> = {
  "量子纠缠型": "表面聊正事，每句都带钩子",
  "就差临门一脚型": "双方积极，但没人推进",
  "一句话emo三天型": "某句话信息量炸裂",
  "空气都甜了型": "每句话都带着一点什么",
  "每天都聊但原地踏步型": "频率高，话题日常，没推进",
  "细水长流渗透型": "不急不迫，每次多透露一点",
  "我在发电你在充电型": "一方用力，一方只回应",
  "每次找你都有剧本型": "理由和需求不符，她有更方便的渠道",
  "薛定谔的在线型": "不规律消失再出现，像在测试",
  "只在深夜发癫型": "深夜发日常，时间本身就是信号",
  "名义上朋友实际上不对劲型": "聊天内容和频率超出朋友范围",
  "分了但没散型": "名义分开，联系没变",
  "两个傻子互相等型": "双方信号明显，都在等对方先说",
  "你是备选还是备胎还不确定型": "有信号，但感觉她在维持多个联系",
  "普通朋友不会这样说话型": "最近某些话、某个时间点开始变了",
  "开始跟你说不必要说的事型": "透露了不必要告诉你的私人信息",
  "聊天里开始出现「以后」型": "出现以后/下次/改天，且是对方先说",
  "提起别人其实在看你反应型": "提到其他异性，话题转得不自然",
  "明明能自己解决偏要来找你型": "求助有更便捷渠道，找你是制造接触",
  "说了个地方但没说你来吗型": "提到地点/活动，没明确邀请",
};

// 温度隐喻句映射
const TEMPERATURE_MAP: [number, number, string][] = [
  [0, 20, "36.5° 正常体温，她真的只是在问路。"],
  [20, 40, "37.2° 微微有点热，但可能是天气。"],
  [40, 60, "37.8° 低烧，值得继续观察。"],
  [60, 75, "38.5° 发烧了，你感觉到了吗？"],
  [75, 88, "39.2° 已经很热，再不动手要退烧了。"],
  [88, 101, "40°  烫手，捅破窗户纸就完了，今晚。"],
];

export function getTemperature(pct: number): string {
  for (const [lo, hi, t] of TEMPERATURE_MAP) {
    if (pct >= lo && pct < hi) return t;
  }
  return TEMPERATURE_MAP[TEMPERATURE_MAP.length - 1][2];
}

// 保留旧函数名兼容
export function getTagline(pct: number): string {
  return getTemperature(pct);
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
  {
    label: "她深夜发来一个问号",
    me: "我",
    her: "她",
    text: `她：？
我：怎么了
她：没事 睡不着
我：我也是
她：哈哈 那聊会儿？
我：聊啥
她：随便 你先说`,
  },
  {
    label: "她说最近好累",
    me: "我",
    her: "她",
    text: `她：最近好累
我：怎么了
她：工作呗 还能怎么
我：要不要休息一下
她：你陪我聊会儿就不累了
我：行啊
她：那你讲个故事给我听`,
  },
];

// 行为数据类型
export interface BehaviorData {
  her_initiative: string;
  your_initiative: string;
  unnecessary_questions: string;
  reply_ratio?: string;
  time_signal?: string;
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
  temperature?: string;
  primary_type?: string;
  secondary_type?: string;
  type_desc?: string;
  aha_moment?: string;
  type?: string; // 兼容旧字段
  behavior_data: BehaviorData;
  signals: Signal[];
  xiaoai: string;
  risk: string;
  bold_line: string;
  bold_reason: string;
  safe_line: string;
  ending?: string;
  sp_quote: string;
  // 女生视角字段
  his_awareness?: number;
  signal_clarity?: string;
  female_suggestion?: string;
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
  pct: 68,
  temperature: "38.5° 发烧了，你感觉到了吗？",
  primary_type: "每次找你都有剧本型",
  secondary_type: "只在深夜发癫型",
  type_desc: "每次找你都有理由，但理由越来越牵强，还总在晚上。",
  aha_moment: "你觉得怪怪的，是因为她一直在找借口。",
  type: "每次找你都有剧本型",
  behavior_data: {
    her_initiative: "她主动4次",
    your_initiative: "你主动1次",
    unnecessary_questions: "她问了3个不必要问你的问题",
    reply_ratio: "她平均回复3句，你平均回复1句",
    time_signal: "深夜发消息",
    summary: "她在用力，你还没感觉到",
  },
  signals: [
    {
      quote: "那你平时周末一般干嘛",
      layer1: "她在关心你的日常",
      layer2: "她想知道你有没有空",
      layer3: "她在等你反问她——「你呢？」这句话她等着你问呢",
      proof: "这个问题和之前聊的话题没有关系，她主动转移了",
    },
  ],
  xiaoai: "她找你聊这个，不是因为她没有百度。\n是因为她想跟你说话，需要一个理由。\n注射器只是个敲门砖。\n你懂吗。",
  risk: "",
  bold_line: "你问了我这么多，是不是认真想来北京了？来的话我带你转转",
  bold_reason: "把她的话题接回来，自然，还给了她一个顺着聊的理由",
  safe_line: "感觉你对北京挺感兴趣的，有机会来玩吗",
  ending: "剩下的，看她接不接。",
  sp_quote: "她有百度，她为什么来问你？",
};
