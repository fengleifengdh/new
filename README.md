# Bayer 企业微信移动端前端

这是一个面向企业微信内置浏览器的移动端 H5 项目，当前实现的是“项目准入统计排行 / 准入详情”数据看板。

技术栈：

- React 19
- Vite
- TypeScript
- CSS
- lucide-react 图标

## 启动方式

```bash
npm install
npm run dev
```

本地访问：

```text
http://localhost:5173
```

构建：

```bash
npm run build
```

代码检查：

```bash
npm run lint
```

## 项目结构

```text
.
├── public/
│   └── api/
│       └── dashboard.json        # 本地模拟接口数据
├── src/
│   ├── api/
│   │   └── dashboard.ts          # 看板接口类型与 fetch 封装
│   ├── hooks/
│   │   └── useDashboardData.ts   # 看板数据请求 Hook
│   ├── wecom/
│   │   ├── auth.ts               # 企业微信 OAuth 地址生成与 code 读取
│   │   ├── sdk.ts                # 企业微信 JS-SDK 加载与初始化
│   │   └── types.ts              # 企业微信 JS-SDK 类型
│   ├── App.tsx                   # 页面、交互、组件
│   ├── main.tsx                  # React 入口
│   ├── styles.css                # 全局样式与页面样式
│   └── vite-env.d.ts             # Vite 环境变量类型
├── .env.example                  # 环境变量示例
├── package.json
└── vite.config.ts
```

## 页面架构

当前页面是单页应用，没有引入路由库。页面内部通过 React state 切换视图：

- `overview`：总览页
- `details`：准入详情页

主要组件都在 `src/App.tsx`：

- `App`：应用入口，读取数据并维护当前视图
- `DashboardScreen`：页面壳层，负责总览 / 详情视图切换
- `OverviewView`：总览页标题和看板内容
- `DashboardContent`：总览页主内容
- `DetailView`：准入详情页
- `TrendChart`：趋势折线图
- `DetailMetricsPanel`：详情页仪表盘和柱状图
- `DealerRankingPanel`：经销商准入率排名
- `BottomNav`：底部导航

## 数据流

当前数据流如下：

```text
public/api/dashboard.json
        ↓
fetchDashboardData()
        ↓
useDashboardData()
        ↓
App / DashboardScreen / 子组件
```

也就是说，页面组件不直接写死业务数据，而是从模拟接口读取。

## 模拟接口

模拟接口地址：

```text
/api/dashboard.json
```

本地文件：

```text
public/api/dashboard.json
```

数据包含：

- 用户与页面标题
- 统计周期 tab：`三期 / 总体`
- 准入数据
- 月度 / 累积趋势数据
- 项目排行
- 准入详情页数据
- 经销商排名
- 预警数量

后续接真实后端时，优先替换 `src/api/dashboard.ts` 里的接口地址和请求参数，不需要大面积改 UI。

## 主要交互

总览页：

- `三期 / 总体` 是 tab
- `总准入 / 正式准入` 是 tab
- `月度 / 累积` 是 tab
- 点击趋势图右下角 `查看更多` 进入准入详情页

详情页：

- 点击 `返回至总览` 回到总览页
- `三期 / 二期 / 一期 / 总体` 是 tab
- `总准入 / 正式准入` 是 tab
- 点击准入数据卡片底部下拉箭头，可展开 / 收起 `总准入率趋势`
- 展开后的趋势图支持 `月度 / 累积` 切换

## 接真实后端

建议后端提供一个看板聚合接口，例如：

```text
GET /api/dashboard
```

如果后续需要根据 tab 请求不同数据，可以把当前状态作为 query 参数：

```text
GET /api/dashboard?period=三期&admissionType=total&trendMode=cumulative
```

前端改动点：

1. 修改 `src/api/dashboard.ts` 的 `DASHBOARD_ENDPOINT`
2. 如果后端返回结构不同，调整 `DashboardData` 类型
3. 在 `useDashboardData` 里接入参数化请求

## 企业微信接入

企业微信相关代码在：

```text
src/wecom/
```

环境变量示例在 `.env.example`：

```env
VITE_APP_TITLE=Bayer移动端
VITE_API_BASE_URL=https://api.example.com
VITE_WECOM_CORP_ID=wwxxxxxxxxxxxxxxxx
VITE_WECOM_AGENT_ID=1000002
VITE_WECOM_SIGN_ENDPOINT=/wecom/jsapi-signature
```

正式环境需要后端提供 JS-SDK 签名接口，并在企业微信后台配置可信域名。

## 注意事项

- 当前是移动端优先布局，主要按企业微信内置浏览器场景设计。
- 底部导航目前是 UI 状态，没有接真实页面路由。
- 图表是自定义 SVG，后续如数据复杂度提高，可以替换为图表库。
- `public/api/dashboard.json` 只是模拟接口，生产环境不要直接依赖它。
