## Cetus-api

**把 Sui 链上的 Cetus CLMM SDK 封装成 REST API 的服务——仓位管理、流动性操作、Swap、
Tick 数据与池子元数据统一在一个 HTTP 接口后面。**

目的是给链下交易系统提供一套稳定的 Cetus 接口，而不是让每个策略组件自己去链接 SDK。

![language](https://img.shields.io/badge/TypeScript-5.1-3178c6) ![framework](https://img.shields.io/badge/NestJS-10-e0234e)

---
### 配置

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
### 运行

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

或者使用 docker 一键部署

```bash
docker build -t cetus-api .
docker run -d --name cetus-api --env-file .env -p 5009:5009 cetus-api
```

---

### 接口清单

所有响应统一使用 `src/common/utils.ts` 里的信封格式：

```json
{ "code": 1, "data": {}, "status": "success", "msg": null }
{ "code": 0, "data": null, "status": "failed", "msg": "..." }
```

#### `/pool`

| 方法 | 路径 | 参数 |
|---|---|---|
| GET | `/pool/retrieveOnePool` | `poolId`、`forceRefresh?` |
| GET | `/pool/retrievelAllPools` | — |
| POST | `/pool/create` | *未实现* |
| POST | `/pool/batchCreate` | *未实现* |

#### `/liquidity`

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

#### `/swap`

| 方法 | 路径 | Body |
|---|---|---|
| POST | `/swap/to` | `{poolId, a2b, byAmountIn, decimalsA, decimalsB, amountX, slippageLimit}` |
| POST | `/swap/toV2` | `{from, to, amount, byAmountIn, slippage, orderSplit, externalRouter}` —— 聚合器路由 |

#### `/ticks`

| 方法 | 路径 | 参数 |
|---|---|---|
| GET | `/ticks/fetchTicks` | `poolId`、`coinTypeA`、`coinTypeB` |
| GET | `/ticks/betchRetrievalTicksByPoolID` | `poolId` |
| GET | `/ticks/fetchTicksByRpc` | `ticks_handle` |

#### `/sui`

`/sui/getAllBalances?owner=`、`/sui/getTotalSupply?coinType=`、`/sui/getCoinMetadata?coinType=`、
`/sui/getWalletInfo`

#### `/tools`

`/tools/system`、`/tools/calculateSwapFee`、`/tools/sqrtPriceX64ToPrice`、
`/tools/getCoinAmountFromLiquidity`、`/tools/requestSuiFromFaucetV0`（devnet 水龙头）、
`/tools/verifySecretKey`

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.