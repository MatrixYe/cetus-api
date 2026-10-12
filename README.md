# cetus-api

**把 Sui 链上的 Cetus CLMM SDK 封装成 REST API 的服务——仓位管理、流动性操作、Swap、
Tick 数据与池子元数据统一在一个 HTTP 接口后面。**

目的是给链下交易系统提供一套稳定的 Cetus 接口，而不是让每个策略组件自己去链接 SDK。

![language](https://img.shields.io/badge/TypeScript-5.1-3178c6) ![framework](https://img.shields.io/badge/NestJS-10-e0234e)

---

## 为什么做成服务而不是库

这个 SDK 是一个有状态的对象图（网络配置、池子缓存、sender 地址、gas 设置）。
把它内联到每个调用方里，意味着配置重复、fullnode 流量重复、升级时需要协调所有调用点。
放到 HTTP 后面可以换来：

- **单一配置面** —— 网络、RPC 端点、签名者、SDK 里的包地址全部集中在一个 `.env`。
- **单一池子/币种缓存** —— 多个策略重复调 `getPool` 时打的是这个服务，而不是 fullnode。
- **语言边界** —— Python 或 Rust 写的策略可以通过 JSON 消费 Cetus SDK，
  不必自己重新实现 CLMM 数学。

---

## 架构

```
   HTTP 客户端（策略 / 机器人 / 看板）
            │
            ▼
   ┌───────────────────────────────────────────────────────────────┐
   │  NestJS                                                       │
   │  LoggerMiddleware  →  "<METHOD> <path> <status> <ip>"         │
   │                                                               │
   │  Controller                      Service                      │
   │  ─────────────────────          ───────────────────────────   │
   │  /pool        ──────────────▶   PoolService                   │
   │  /liquidity   ──────────────▶   LiquidityService              │
   │  /swap        ──────────────▶   SwapService                   │
   │  /ticks       ──────────────▶   TicksService                  │
   │  /sui         ──────────────▶   SuiService                    │
   │  /tools       ──────────────▶   ToolsService                  │
   └───────────────────────────────┬───────────────────────────────┘
                                   │
                    ┌──────────────┴───────────────┐
                    ▼                              ▼
       selectSDK(network, sender, endpoint)   genKeypair(SECRET_KEY)
       → CetusClmmSDK                         → Ed25519Keypair
         （主网配置内置：
          cetus_config / clmm_pool /
          integrate / deepbook 的包 id）
                    │                              │
                    └──────────────┬───────────────┘
                                   ▼
                  SDK.fullClient.sendTransaction(keypair, payload)
                                   │
                                   ▼
                            Sui fullnode（RPC）

   静态数据：pools.json（约 1.9 MB 的 Cetus LP 快照：symbol、fee、tick_spacing、
                           coin_a/coin_b 地址与元数据、rewarder 标记）
```

---

## 接口清单

所有响应统一使用 `src/common/utils.ts` 里的信封格式：

```json
{ "code": 1, "data": {}, "status": "success", "msg": null }
{ "code": 0, "data": null, "status": "failed", "msg": "..." }
```

### `/pool`

| 方法 | 路径 | 参数 |
|---|---|---|
| GET | `/pool/retrieveOnePool` | `poolId`、`forceRefresh?` |
| GET | `/pool/retrievelAllPools` | — |
| POST | `/pool/create` | *未实现* |
| POST | `/pool/batchCreate` | *未实现* |

### `/liquidity`

| 方法 | 路径 | Body / Query |
|---|---|---|
| GET | `/liquidity/retrievalPositions` | `account`、`poolId` |
| GET | `/liquidity/retrievalPositionOfOnePool` | `poolId` |
| GET | `/liquidity/retrievalPositionById` | `positionId` |
| GET | `/liquidity/getCoinAmountFromLiquidity` | `pooId`、`liquidity`、`tick_lower_index`、`tick_upper_index` |
| POST | `/liquidity/openPositionAndAddLiquidity` | `{poolId, tickLow, tickUp, fix_amount_a, amount, decimalsA, decimalsB, slippage}` |
| POST | `/liquidity/openPositionAndAddLiquidity2` | `{poolId, lowerTick, upperTick, ...}`（绝对 tick） |
| POST | `/liquidity/addLiquidity` | `{positionId, fix_amount_a, amount, decimalsA, decimalsB, slippage, collect_fee}` |
| POST | `/liquidity/removeLiquidity` | `{positionId, liquidityOut, slippage}` |
| POST | `/liquidity/clostPosition` | `{positionId, slippage}` |

### `/swap`

| 方法 | 路径 | Body |
|---|---|---|
| POST | `/swap/to` | `{poolId, a2b, byAmountIn, decimalsA, decimalsB, amountX, slippageLimit}` |
| POST | `/swap/toV2` | `{from, to, amount, byAmountIn, slippage, orderSplit, externalRouter}` —— 聚合器路由 |

### `/ticks`

| 方法 | 路径 | 参数 |
|---|---|---|
| GET | `/ticks/fetchTicks` | `poolId`、`coinTypeA`、`coinTypeB` |
| GET | `/ticks/betchRetrievalTicksByPoolID` | `poolId` |
| GET | `/ticks/fetchTicksByRpc` | `ticks_handle` |

### `/sui`

`/sui/getAllBalances?owner=`、`/sui/getTotalSupply?coinType=`、`/sui/getCoinMetadata?coinType=`、
`/sui/getWalletInfo`

### `/tools`

`/tools/system`、`/tools/calculateSwapFee`、`/tools/sqrtPriceX64ToPrice`、
`/tools/getCoinAmountFromLiquidity`、`/tools/requestSuiFromFaucetV0`（devnet 水龙头）、
`/tools/verifySecretKey`

---

## 关键工程决策

| 决策 | 理由 |
|---|---|
| **每个业务域一对 controller/service** | 池子读取、流动性写入、Swap 路由和纯数学计算的失败语义完全不同。把 Swap payload 构造从 `LiquidityService` 里独立出来，才能让数量与精度的处理是可审计的。 |
| **`selectSDK()` 每个请求重建 SDK** | SDK 会就地修改模块级对象上的 `fullRpcUrl` 和 `simulationAccount`。跨并发请求共享同一个实例，会让调用方之间的 sender 地址互相串。 |
| **`ClmmPoolUtil` / `TickMath` 通过 `/tools` 暴露** | `sqrtPriceX64ToPrice` 和 `getCoinAmountFromLiquidity` 是每个调用方都需要的两个换算。暴露出来，调用方就不再有动机自己重新推导 CLMM 数学、把 tick/精度处理搞错。 |
| **金额运算用 `bn.js`** | `adjustForSlippage` 得到的 `amount_limit` 必须精确。对 10^18 量级的整数用浮点运算，精度会静默丢失。 |
| **静态 `pools.json` 快照** | 构造 payload 需要 `tick_spacing` 和精度；每次调用都从 SDK 拉池子元数据又慢又容易触发限流。快照是快路径，`forceRefresh` 是逃生口。 |
| **全局 `ConfigModule`** | 配置通过访问函数（`getNetWork`、`getKeySecret` 等）读取，而不是到处注入。这样同一份 `.env` 契约在 service 和模块级辅助函数里都适用。 |
| **Dockerfile 在镜像内构建** | `npm run build` 在镜像内执行；部署产物是自包含的 `node dist/main`。 |

---

## 配置

在项目根目录创建 `.env`：

```dotenv
# ---- 应用 ----
APP_NAME="cetus-api"
APP_PORT=5009

# ---- Sui 网络 ----
NETWORK="mainnet"                 # mainnet | devnet
ENDPOINT_URL="https://your-sui-rpc-endpoint"
NODE_URL="https://your-sui-rpc-endpoint"

# ---- 签名者 ----
SENDER_ADDRESS="0x..."
SECRET_KEY="suiprivkey1..."       # 提交交易时使用的签名密钥
WALLET_ADDRESS="0x..."
WALLET_PRIVATE_KEY=""

# ---- 请求签名（见下方"信任模型"）----
SERVER_VERIFY=false
SERVER_API_KEY=""
SERVER_SECRET_KEY=""
SERVER_TIMESTAMP_LIMIT=10
```

---

## 信任模型——对外暴露之前请先读这一节

这个服务**持有签名密钥，并以自己的身份提交交易**。它不是"构造未签名交易再交还给调用方"的
payload builder；`LiquidityService` 和 `SwapService` 都直接调用
`SDK.fullClient.sendTransaction(keypair, payload)`。

由此产生的结论：

- 这个进程必须被当作**托管签名者**对待。目前唯一真正的控制手段是网络层隔离
  （私有网络、无公网入口，或者带 mTLS 的反向代理）。
- `getServerVerify()` / `getServerSecretKey()` / `getServerTimestampLimit()` 在
  `src/config.ts` 里已实现，但 **HMAC 请求签名守卫尚未接入路由**。
  `SERVER_VERIFY` 当前没有任何实际作用。
- `/tools/verifySecretKey?sk=...` 把私钥作为**查询字符串参数**接收，并在响应体里原样返回。
  这是调试端点；任何部署之前都应该删除或严格收紧。另外查询字符串会被
  `LoggerMiddleware` 记录到访问日志里。
- `src/config.ts` 顶部的注释块里曾有示例凭据值。它已经被清理，请保持这种状态。

---

## 运行

```bash
npm install

# 开发
npm run start:dev

# 生产
npm run build
npm run start:prod          # node dist/main

# 通过 make
make prod
```

`APP_PORT` 未设置时默认端口为 **5009**。

### Docker

```bash
docker build -t cetus-api .
docker run -d --name cetus-api --env-file .env -p 5009:5009 cetus-api
```

### 测试

```bash
npm run test        # jest（目前只有 NestJS 脚手架自带的 spec）
npm run test:e2e
```

---

## 技术栈

```
语言       TypeScript 5.1
框架       NestJS 10（@nestjs/common、/core、/platform-express、/config）
Sui / DEX  @cetusprotocol/cetus-sui-clmm-sdk 5.1、@mysten/sui 1.12、@mysten/sui keypairs
数学       bn.js、decimal.js
工具链     ESLint + Prettier、Jest + Supertest、ts-node、nest-cli
运行时     Node.js 21.6（Docker）、dotenv
```

---

## 局限与已知缺口

- **请求鉴权守卫未生效。** HMAC 方案只存在于配置文件里。
- **单一签名者，没有密钥隔离。** 一个 `.env` 里的密钥服务于所有调用方。
  长期正确的形态是每调用方一把密钥，或者把写接口改成只返回未签名 payload。
- **`/tools/verifySecretKey` 会泄露传给它的内容。** 应删除。
- **没有限流，也没有请求校验。** DTO 是普通类，没有 `class-validator` /
  `ValidationPipe`，所以畸形的精度或 tick 会一路传到 SDK。
- **只有内存态。** 没有持久化；重启就丢掉池子缓存。
- **两个接口直接返回 `failed("not implemented")`**（`/pool/create`、`/pool/batchCreate`）。
- **没有结构化的错误分类。** 错误被字符串化后塞进信封的 `msg`。
- **测试覆盖只有脚手架**（`app.e2e-spec.ts`）。`LiquidityService` 里的滑点和精度处理
  是风险最高、却完全没测的部分。
- **没有 LICENSE 文件。**

### 后续计划

1. 接入 HMAC 守卫（或替换成每调用方 API key），并删除 `verifySecretKey`。
2. 所有写接口加 `ValidationPipe` + DTO 装饰器。
3. 把写接口改为返回**未签名的 base64 payload**，另外提供一个可选的
   服务端代提交接口——这样就能彻底去掉托管私钥。
4. 把 SDK 的池子缓存持久化到 Redis，让重启后缓存是热的。
