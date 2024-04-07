import { Injectable } from "@nestjs/common";
import { selectSDK } from "../common/sdk";
import { adjustForSlippage, CetusClmmSDK, Percentage } from "@cetusprotocol/cetus-sui-clmm-sdk";
import { ConfigService } from "@nestjs/config";
import { getKeySecret, getNetWork, getSenderAddress } from "../common/conf";
import { genKeypair } from "../common/utils";
import Decimal from "decimal.js";
import * as BN from "bn.js";

@Injectable()
export class SwapService {
  private SDK: CetusClmmSDK;

  constructor(private config: ConfigService) {
    this.SDK = this.toChoseSdk();
  }

  toChoseSdk(): CetusClmmSDK {
    return selectSDK(getNetWork(this.config), getSenderAddress(this.config));
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
    // console.log(`swapPayload:${swapPayload}`);
    const ks = getKeySecret(this.config);
    const keypair = genKeypair(ks);
    return await this.SDK.fullClient.sendTransaction(keypair, swapPayload);
  }
}
