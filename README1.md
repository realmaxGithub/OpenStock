# OpenStock 项目构建与功能说明（面向全栈初学者）

本文档从「第一次用全栈框架」的视角，梳理 OpenStock 的目录结构、技术选型、请求链路和功能模块，便于理解整体构建与各部分的职责。

---

## 一、项目是什么？

**OpenStock** 是一个**开源股票/市场信息应用**：用户注册登录后可以查看市场概览、搜索股票、管理自选（Watchlist）、设置价格提醒（Alert），并收到 AI 个性化欢迎邮件、周报、再触达邮件等。数据来自 **Finnhub**，图表与部分展示使用 **TradingView** 嵌入式组件，后台任务由 **Inngest** 驱动。

- **前端**：Next.js 15（App Router）+ React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui（Radix）
- **后端**：同一 Next.js 应用中的 API Routes、Server Actions、Server Components
- **数据库**：MongoDB（Mongoose），Better Auth 用同一库做用户与会话
- **认证**：Better Auth（邮箱+密码，MongoDB 适配器）
- **后台任务与邮件**：Inngest（事件 + Cron）+ Nodemailer / Kit（ConvertKit）

---

## 二、技术栈一览

| 层次       | 技术 | 作用 |
|------------|------|------|
| 框架       | Next.js 15 (App Router) | 全栈 React 框架，服务端渲染、API、路由、中间件 |
| 语言       | TypeScript | 类型安全 |
| UI         | React 19, Tailwind v4, shadcn/ui, Radix, Lucide | 页面与组件 |
| 认证       | Better Auth | 注册/登录/会话，存 MongoDB |
| 数据库     | MongoDB + Mongoose | 用户、自选、提醒等持久化 |
| 市场数据   | Finnhub API | 行情、公司资料、新闻 |
| 图表/展示  | TradingView 嵌入式组件 | K 线、热力图、行情、新闻时间线等 |
| 后台任务   | Inngest | 注册后欢迎邮件、周报、价格提醒检测、不活跃用户再触达 |
| AI         | Google Gemini（主）+ Siray.ai（兜底） | 欢迎邮件/周报摘要生成 |
| 邮件       | Nodemailer（Gmail）/ Kit (ConvertKit) | 欢迎信、周报广播、再触达 |

---

## 三、目录结构说明

```
OpenStock/
├── app/                          # Next.js App Router：页面与 API
│   ├── layout.tsx                # 根布局（字体、Toaster、Analytics）
│   ├── globals.css               # 全局样式（Tailwind 等）
│   ├── (auth)/                   # 认证相关路由组（不共享主布局逻辑）
│   │   ├── layout.tsx
│   │   ├── sign-in/page.tsx      # 登录页
│   │   └── sign-up/page.tsx     # 注册页（含国家、目标、风险等问卷）
│   ├── (root)/                   # 需要登录后的主应用
│   │   ├── layout.tsx            # 校验 session，渲染 Header/Footer/DonatePopup
│   │   ├── page.tsx              # 首页：市场概览、热力图、行情、Top Stories
│   │   ├── watchlist/page.tsx    # 自选列表 + 提醒管理
│   │   ├── stocks/[symbol]/page.tsx  # 单只股票详情（TradingView 图表、自选按钮）
│   │   ├── help/page.tsx
│   │   ├── about/page.tsx
│   │   ├── terms/page.tsx
│   │   └── api-docs/page.tsx
│   └── api/
│       └── inngest/route.ts      # Inngest 入口：GET/POST/PUT 交给 Inngest serve
│
├── components/                   # 可复用 React 组件
│   ├── ui/                       # shadcn 基础组件（button, dialog, command, input…）
│   ├── forms/                    # 表单控件（InputField, SelectField, CountrySelectField, FooterLink）
│   ├── watchlist/                # 自选与提醒相关（WatchlistTable, CreateAlertModal, AlertsPanel…）
│   ├── Header.tsx, Footer.tsx
│   ├── SearchCommand.tsx         # Cmd+K 全局搜索（Finnhub 股票搜索）
│   ├── WatchlistButton.tsx       # 股票页「加自选」按钮
│   ├── TradingViewWidget.tsx     # TradingView 脚本嵌入封装
│   └── …
│
├── database/                     # 数据库连接与模型
│   ├── mongoose.ts               # 单例连接 MongoDB（含 DNS/IPv4 等配置）
│   └── models/
│       ├── watchlist.model.ts    # 自选：userId, symbol, company, addedAt
│       └── alert.model.ts        # 价格提醒：userId, symbol, targetPrice, condition(ABOVE/BELOW)…
│
├── lib/                          # 业务逻辑与第三方集成
│   ├── better-auth/auth.ts       # Better Auth 实例（MongoDB 适配器、邮箱密码配置）
│   ├── inngest/
│   │   ├── client.ts             # Inngest 客户端
│   │   ├── functions.ts          # 所有 Inngest 函数（见下）
│   │   └── prompts.ts            # AI 邮件/周报的 prompt 模板
│   ├── nodemailer/               # 发信（transporter、欢迎信/新闻摘要模板）
│   ├── kit.ts                    # ConvertKit/Kit API（订阅、广播、标签）
│   ├── actions/                  # Server Actions（供前端调用）
│   │   ├── auth.actions.ts       # 注册、登录、登出；注册后发 app/user.created
│   │   ├── watchlist.actions.ts  # 增删查自选、是否在自选
│   │   ├── alert.actions.ts      # 创建/查询/删除/切换提醒
│   │   ├── finnhub.actions.ts    # 行情、公司资料、新闻、搜索等
│   │   └── user.actions.ts       # 用户相关（如给周报用的列表）
│   ├── constants.ts              # 导航、表单项选项、TradingView 配置等
│   └── utils.ts                  # 日期、格式化等工具
│
├── middleware/                   # 中间件（注意：Next 默认只认根目录 middleware.ts）
│   └── index.ts                  # 校验 session cookie，无则重定向到 /sign-in
│
├── hooks/                        # 自定义 React Hooks
│   ├── useDebounce.ts
│   └── useTradingViewWidget.tsx
│
├── scripts/                      # 本地/运维脚本（非 Next 构建部分）
│   ├── test-db.mjs               # 测试 MongoDB 连接（pnpm test:db）
│   └── 其他（Kit、迁移、种子数据等）
│
├── types/                        # 全局类型（如 global.d.ts）
├── public/                       # 静态资源
├── next.config.ts                # Next 配置（图片域名、ESLint/TS 构建行为）
├── postcss.config.mjs            # PostCSS（Tailwind v4）
├── components.json               # shadcn 配置
├── docker-compose.yml            # 应用 + MongoDB 服务
├── Dockerfile                    # 构建 Node 镜像并运行 Next
└── package.json                  # 依赖与脚本
```

**要点：**

- **`app/`**：路由即文件；(auth) 与 (root) 是路由组，不影响 URL。(root) 下几乎所有页面都要登录。
- **`lib/actions/`**：用 `'use server'` 的 Server Actions，被前端表单或事件直接调用，内部会连数据库或调 Finnhub。
- **`database/`**：只负责连接与 Mongoose 模型；业务逻辑在 `lib/actions` 和 Inngest 里。
- **`middleware/`**：当前实现位于 `middleware/index.ts`。若 Next 未生效，需在项目根目录增加 `middleware.ts` 并 re-export 该函数，且 `config.matcher` 需覆盖需要保护的路由。

---

## 四、请求与数据流（简化）

1. **用户打开任意受保护页面（如 `/`、`/watchlist`）**
   - `middleware` 检查 session cookie → 无则重定向到 `/sign-in`。
   - 有 cookie 则进入 `(root)/layout.tsx`，那里用 `auth.api.getSession()` 再校验一次，无 session 则 `redirect('/sign-in')`。

2. **登录 / 注册**
   - 登录/注册页在 `(auth)` 下，表单调用 `lib/actions/auth.actions.ts` 的 `signInWithEmail` / `signUpWithEmail`。
   - Better Auth 负责创建/校验用户并写 MongoDB；登录成功会更新 `lastActiveAt`。
   - 注册成功后会 `inngest.send({ name: 'app/user.created', data: { … } })`，触发欢迎邮件流程。

3. **自选与提醒**
   - 自选：前端调用 `addToWatchlist` / `removeFromWatchlist`（watchlist.actions），读写 `database/models/watchlist.model.ts`。
   - 提醒：前端调用 `createAlert` / `getUserAlerts` / `deleteAlert` 等（alert.actions），读写 `alert.model.ts`。
   - Inngest 定时任务 `check-stock-alerts`（每 5 分钟）拉取未触发的提醒，用 Finnhub 查现价，满足条件则标记为已触发（并可在后续扩展通知）。

4. **市场数据与图表**
   - 行情、公司资料、新闻：由 `lib/actions/finnhub.actions.ts` 在服务端请求 Finnhub，部分结果带缓存。
   - 图表与市场概览：前端通过 `TradingViewWidget` 加载 TradingView 脚本，配置来自 `lib/constants.ts`。

5. **后台任务（Inngest）**
   - 入口：`app/api/inngest/route.ts` 使用 `serve({ client, functions })`。
   - 函数都在 `lib/inngest/functions.ts`：
     - **sign-up-email**：监听 `app/user.created`，用 Gemini（失败则 Siray）生成欢迎语，再通过 Nodemailer 发欢迎邮件。
     - **weekly-news-summary**：Cron 周一 9:00，拉 Finnhub 新闻 → AI 摘要 → 通过 Kit 发周报广播。
     - **check-stock-alerts**：Cron 每 5 分钟，查未触发提醒 → 拉价格 → 满足条件则更新 DB。
     - **check-inactive-users**：Cron 每天 10:00，找 30 天未活跃且一段时间未发再触达的用户，发「我们想你」类邮件并更新 `lastReengagementSentAt`。

---

## 五、功能与模块对应表

| 功能 | 主要涉及位置 |
|------|----------------|
| 注册/登录/登出 | `app/(auth)/sign-in|sign-up`，`lib/actions/auth.actions.ts`，`lib/better-auth/auth.ts` |
| 路由保护 | `middleware/index.ts`（session cookie），`(root)/layout.tsx`（session 校验） |
| 全局搜索（Cmd+K） | `components/SearchCommand.tsx`，Finnhub 搜索 API |
| 自选列表 | `app/(root)/watchlist/page.tsx`，`lib/actions/watchlist.actions.ts`，`database/models/watchlist.model.ts` |
| 价格提醒 | `lib/actions/alert.actions.ts`，`database/models/alert.model.ts`，`components/watchlist/CreateAlertModal.tsx`，Inngest `check-stock-alerts` |
| 首页市场概览 | `app/(root)/page.tsx`，`lib/constants.ts`（TradingView 配置），`components/TradingViewWidget.tsx` |
| 股票详情页 | `app/(root)/stocks/[symbol]/page.tsx`，TradingView 多组件，`WatchlistButton`，`isStockInWatchlist` |
| 欢迎邮件（AI） | 注册 → `app/user.created` → `lib/inngest/functions.ts` 的 `sendSignUpEmail`（Gemini/Siray + Nodemailer） |
| 周报邮件 | Inngest `sendWeeklyNewsSummary`（Cron），Finnhub 新闻 + AI 摘要 + Kit 广播 |
| 不活跃用户再触达 | Inngest `checkInactiveUsers`（Cron），Kit/邮件 + 更新 user 的 `lastReengagementSentAt` |

---

## 六、环境变量与运行（简要）

- **必配**：`MONGODB_URI`、`BETTER_AUTH_SECRET`、`BETTER_AUTH_URL`、`NEXT_PUBLIC_FINNHUB_API_KEY`。
- **邮件/AI/Inngest**：`NODEMAILER_EMAIL`、`NODEMAILER_PASSWORD`、`GEMINI_API_KEY`、`INNGEST_SIGNING_KEY`；周报/再触达用 Kit 时需 `KIT_API_KEY`、`KIT_API_SECRET`；Siray 兜底需 `SIRAY_API_KEY`。
- **本地开发**：  
  - `pnpm install` → 配置 `.env` → `pnpm test:db` 验证 DB → `pnpm dev` 起 Next；  
  - 需要 Inngest 时单独运行：`npx inngest-cli@latest dev`。
- **Docker**：`docker-compose.yml` 包含 `openstock` 与 `mongodb`，应用依赖 MongoDB；构建与启动见 README 的 Docker 部分。

---

## 七、和 README.md 的区别

- **README.md**：面向所有用户与贡献者，包含快速开始、Docker、环境变量、致谢、许可证等，偏「使用与参与」。
- **README1.md（本文档）**：面向**第一次用全栈框架**的开发者，侧重**项目是怎么搭的、请求怎么走、每个目录/模块负责什么**，便于从零理解整体构建与功能分布。

建议两篇一起看：先读本文建立心智模型，再按 README 做环境与运行。更多 API 与架构细节可参考项目中的 **API_DOCS.md**。
