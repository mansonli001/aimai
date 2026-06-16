# 暧昧检测局

一款基于 AI 的聊天记录分析工具，帮助用户解读暧昧信号。

## ✨ 功能特性

- **暧昧类型分析**：支持 20 种暧昧类型识别，精准判断聊天关系状态
- **女生视角模式**：专为女性用户设计的分析视角，评估对方信号感知能力
- **行为数据分析**：量化分析聊天行为，提供客观数据支持
- **智能台词建议**：根据聊天内容生成个性化回复建议
- **类型解锁系统**：收集解锁全部 20 种暧昧类型
- **连续测试记录**：记录历史分析结果，支持温度对比

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 3
- **AI 服务**: DeepSeek API
- **状态管理**: React Hooks + localStorage

## 🚀 快速开始

### 环境要求

- Node.js >= 18.x
- npm >= 9.x

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入您的 API Key：

```env
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看效果。

### 构建生产版本

```bash
npm run build
npm run start
```

## 🔌 API 接口

### POST /api/detect

分析聊天记录中的暧昧信号

**请求体**:
```json
{
  "me": "用户代号",
  "her": "对方代号",
  "chatLog": "聊天记录内容",
  "gender": "male | female"
}
```

**响应**:
```json
{
  "ok": true,
  "result": {
    "pct": 68,
    "temperature": "38.5° 发烧了，你感觉到了吗？",
    "primary_type": "每次找你都有剧本型",
    "secondary_type": "只在深夜发癫型",
    "aha_moment": "你觉得怪怪的，是因为她一直在找借口。",
    "behavior_data": {...},
    "signals": [...],
    "xiaoai": "小暧的综合判断...",
    "bold_line": "建议回复台词",
    "safe_line": "稳一稳版回复",
    "sp_quote": "分享金句"
  }
}
```

## 📁 项目结构

```
aimai/
├── app/                    # Next.js App Router
│   ├── api/detect/         # API 接口
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页入口
│   └── globals.css         # 全局样式
├── components/             # UI 组件
│   ├── InputScreen.tsx     # 输入页面
│   ├── ResultScreen.tsx    # 结果页面
│   ├── LoadingScreen.tsx   # 加载动画
│   └── ShaderBackground.tsx # 背景效果
├── lib/                    # 工具函数
│   ├── constants.ts        # 常量定义
│   ├── deepseek.ts         # AI 客户端
│   └── prompt.ts           # Prompt 配置
├── tailwind.config.ts      # Tailwind 配置
└── next.config.mjs         # Next.js 配置
```

## 🔒 安全注意事项

1. **环境变量**: API Key 必须通过环境变量配置，切勿硬编码到代码中
2. **敏感信息**: `.env.local` 已加入 `.gitignore`，确保不会被提交到版本控制
3. **数据处理**: 用户聊天记录仅用于分析，不会存储到服务器
4. **HTTPS**: 生产环境请确保使用 HTTPS 协议

## 📦 部署

### Vercel 部署

1. 登录 Vercel，导入 GitHub 仓库
2. 在项目设置中添加环境变量：
   - `DEEPSEEK_API_KEY`
   - `DEEPSEEK_BASE_URL`
   - `DEEPSEEK_MODEL`
3. 点击 Deploy 完成部署

### Cloudflare CDN 配置（可选）

如需使用 Cloudflare CDN：

1. 在 Cloudflare 中添加域名
2. 配置 DNS 记录指向 Vercel 托管 IP
3. 启用 SSL/TLS（推荐 Full 模式）
4. 配置缓存规则优化静态资源

## 📄 License

MIT License

---

**小暧说**: 聊天记录我看完就忘，我嘴严的。
