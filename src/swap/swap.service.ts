// noinspection GrazieInspection

import { Injectable } from "@nestjs/common";
import { selectSDK } from "../common/sdk";
import {
  adjustForSlippage,
  AggregatorResult,
  CetusClmmSDK,
  CoinProvider,
  PathProvider,
  Percentage,
  TransactionUtil
} from "@cetusprotocol/cetus-sui-clmm-sdk";
import { ConfigService } from "@nestjs/config";
import { getEndpointUrl, getKeySecret, getNetWork, getSenderAddress } from "../common/conf";
import { genKeypair } from "../common/utils";
import Decimal from "decimal.js";
import * as BN from "bn.js";
import * as fs from "fs";

@Injectable()
export class SwapService {
  private SDK: CetusClmmSDK;

  constructor(private config: ConfigService) {
    this.SDK = this.toChoseSdk();
    this.loadGraphByLocal("./pools.json");
  }

  toChoseSdk(): CetusClmmSDK {
    return selectSDK(getNetWork(this.config), getSenderAddress(this.config),getEndpointUrl(this.config));
  }


  async toSwap(poolId: string,
               a2b: boolean,
               byAmountIn: boolean,
               decimalsA: number,
               decimalsB: number,
               amountX: number,
               slippageLimit: number) {

    const d = a2b ? (byAmountIn ? decimalsA : decimalsB) : (byAmountIn ? decimalsB : decimalsA);
    const amount = String(amountX * 10 ** d);
    // byAmountIn: 固定输入量，true表示固定输入数量，false表示固定输出数量
    // const byAmountIn = true;

    const slippage = Percentage.fromDecimal(new Decimal(slippageLimit));
    // console.log(`slippage:${slippage}`);
    //获取Pool信息
    const pool = await this.SDK.Pool.getPool(poolId);
    //估计金额入金额出费用
    const res: {
      poolAddress: string;
      currentSqrtPrice: number;
      estimatedAmountIn: string;
      estimatedAmountOut: any;
      estimatedEndSqrtPrice: any;
      estimatedFeeAmount: any;
      isExceed: any;
      amount: string;
      aToB: boolean;
      byAmountIn: boolean;
    } = await this.SDK.Swap.preswap({
      a2b: a2b,
      amount: amount,
      byAmountIn: byAmountIn,
      coinTypeA: pool.coinTypeA,
      coinTypeB: pool.coinTypeB,
      currentSqrtPrice: pool.current_sqrt_price,
      decimalsA: decimalsA,
      decimalsB: decimalsB,
      pool: pool
    });
    // console.log(`res:${res.estimatedAmountOut}`);

    const toAmount = byAmountIn ? res.estimatedAmountOut : res.estimatedAmountIn;
    // the amount limit of coin what you get. There are two scenarios in amount limit, when by_amount_in eq
    //你得到的硬币的数量限制
    const amountLimit = adjustForSlippage(new BN(toAmount), slippage, !byAmountIn);
    // console.log(`senderAddress:${senderAddress}`);
    // build swap Payload
    const swapPayload = await this.SDK.Swap.createSwapTransactionPayload({
      a2b: a2b,
      amount: amount,
      amount_limit: amountLimit.toString(),
      by_amount_in: byAmountIn,
      coinTypeA: pool.coinTypeA,
      coinTypeB: pool.coinTypeB,
      pool_id: pool.poolAddress
    });

    swapPayload.setGasBudget(2000000);
    // console.log(`swapPayload:${swapPayload}`);
    const ks = getKeySecret(this.config);
    const keypair = genKeypair(ks);
    return await this.SDK.fullClient.sendTransaction(keypair, swapPayload);
  }

// 定义一个函数来同步读取和解析JSON
  loadGraphByLocal(filePath: string): any {
    try {
      const coinMap = new Map();
      const poolMap = new Map();
      // 同步读取文件内容
      const rawData = fs.readFileSync(filePath, { encoding: "utf-8" });
      // 解析JSON数据
      const poolsInfo = JSON.parse(rawData);
      if (poolsInfo.code === 200) {
        for (const pool of poolsInfo.data.lp_list) {
          if (pool.is_closed) {
            continue;
          }

          let coin_a = pool.coin_a.address;
          let coin_b = pool.coin_b.address;

          coinMap.set(coin_a, {
            address: pool.coin_a.address,
            decimals: pool.coin_a.decimals
          });
          coinMap.set(coin_b, {
            address: pool.coin_b.address,
            decimals: pool.coin_b.decimals
          });

          const pair = `${coin_a}-${coin_b}`;
          const pathProvider = poolMap.get(pair);
          if (pathProvider) {
            pathProvider.addressMap.set(Number(pool.fee) * 100, pool.address);
          } else {
            poolMap.set(pair, {
              base: coin_a,
              quote: coin_b,
              addressMap: new Map([[Number(pool.fee) * 100, pool.address]])
            });
          }
        }
      } else {
        console.log(`poolsInfo.code != 200 ${poolsInfo.code}`);
      }
      const coins: CoinProvider = {
        coins: Array.from(coinMap.values())
      };
      const paths: PathProvider = {
        paths: Array.from(poolMap.values())
      };
      this.SDK.Router.loadGraph(coins, paths);
    } catch (error) {
      console.error("Error reading or parsing JSON file:", error);
      throw error;
    }
  }

  async loadGraph() {
    // if (this.SDK.Router.pathProviders.length != 0) {
    //   console.log("grap 已经加载过了哈");
    //   return;
    // }
    const coinMap = new Map();
    const poolMap = new Map();
    const resp: any = await fetch("https://api-sui.cetus.zone/v2/sui/pools_info", { method: "GET" });
    const poolsInfo = resp.json();
    if (poolsInfo.code === 200) {
      for (const pool of poolsInfo.data.lp_list) {
        if (pool.is_closed) {
          continue;
        }

        let coin_a = pool.coin_a.address;
        let coin_b = pool.coin_b.address;

        coinMap.set(coin_a, {
          address: pool.coin_a.address,
          decimals: pool.coin_a.decimals
        });
        coinMap.set(coin_b, {
          address: pool.coin_b.address,
          decimals: pool.coin_b.decimals
        });

        const pair = `${coin_a}-${coin_b}`;
        const pathProvider = poolMap.get(pair);
        if (pathProvider) {
          pathProvider.addressMap.set(Number(pool.fee) * 100, pool.address);
        } else {
          poolMap.set(pair, {
            base: coin_a,
            quote: coin_b,
            addressMap: new Map([[Number(pool.fee) * 100, pool.address]])
          });
        }
      }
    } else {
      // console.log()
      console.log(` poolsInfo.code:${poolsInfo.code}`);
    }
    const coins: CoinProvider = {
      coins: Array.from(coinMap.values())
    };
    const paths: PathProvider = {
      paths: Array.from(poolMap.values())
    };

    this.SDK.Router.loadGraph(coins, paths);
  }

  async toSwapV2(from: string, to: string, amount: number, byAmountIn: boolean, slippage: number, orderSplit: boolean, externalRouter: boolean) {
    // console.log(` from:${from}`);
    // console.log(` to:${to}`);
    // console.log(` amount:${amount}`);
    // console.log(` byAmountIn:${byAmountIn}`);
    // console.log(` slippage:${slippage}`);
    // console.log(` orderSplit:${orderSplit}`);
    // console.log(` externalRouter:${externalRouter}`);

    const senderAddress = getSenderAddress(this.config);
    const res = (await this.SDK.RouterV2.getBestRouter(
      from,
      to,
      amount,
      byAmountIn,
      slippage,
      "",
      senderAddress,
      undefined,
      orderSplit,
      externalRouter,
      undefined
    )).result as AggregatorResult;


    // if find the best swap router, then send transaction.
    if (!res?.isExceed) {
      const allCoinAsset = await this.SDK.getOwnerCoinAssets(senderAddress);
      // If recipient not set, transfer objects move call will use ctx sender.
      const payload = await TransactionUtil.buildAggregatorSwapTransaction(this.SDK, res, allCoinAsset, "", 0.5);
      payload.setGasBudget(20000000);
      const keypair = genKeypair(getKeySecret(this.config));
      return await this.SDK.fullClient.sendTransaction(keypair, payload);
    } else {
      console.log(`res?.isExceed: ${res?.isExceed}`);
      return null;
    }
  }
}
