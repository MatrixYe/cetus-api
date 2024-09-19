// noinspection SpellCheckingInspection

import { Injectable } from "@nestjs/common";
import CetusClmmSDK, { ClmmPoolUtil, Position, TickMath } from "@cetusprotocol/cetus-sui-clmm-sdk";
import * as BN from "bn.js";

import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { MIST_PER_SUI } from "@mysten/sui.js/utils";
import { ConfigService } from "@nestjs/config";
import { selectSDK } from "../common/sdk";
import { getAppName, getEndpointUrl, getNetWork, getSenderAddress } from "../common/conf";

@Injectable()
export class ToolsService {
  private SDK: CetusClmmSDK;

  constructor(private config: ConfigService) {
    this.SDK = this.toChoseSdk();
  }

  toChoseSdk(): CetusClmmSDK {

    return selectSDK(getNetWork(this.config), getSenderAddress(this.config),getEndpointUrl(this.config));
  }

  async calculateSwapFee(from: string, to: string, amount: number, byAmountIn: boolean, priceSplitPoint: number, partner: string) {
    /**
     * 如何计算收费比率?
     * 费用是指在交易过程中用于支付协议费率的币与执行智能合约所消耗的gas不同。不同的池有不同的费率。每个刻度间隔对应一个特定的费率。
     *
     * 对于单个路径，费用等于输入金额乘以费率。
     * 在多个路径或涉及中间币的路径的情况下，我们需要计算输入量乘以每个单独交换的费率。然后，将所有这些金额转换为输入硬币中相应的数量，并将其相加。
     * 在SDK中，我们提供了SDK . swap . calculateswapfee()方法。
     */
      // from: string, to: string, amount: number, byAmountIn: boolean, priceSplitPoint: number, partner: string
      // const from = "0x26b3bc67befc214058ca78ea9a2690298d731a2d4309485ec3d40198063c4abc::usdt::USDT";
      // const to = "0x26b3bc67befc214058ca78ea9a2690298d731a2d4309485ec3d40198063c4abc::cetus::CETUS";
      // const amount = 100000000;
      // const byAmountIn = true;
      // const priceSplitPoint = 5;
      // const partner = "";
    const res = await this.SDK.RouterV2.getBestRouter(from, to, amount, byAmountIn, priceSplitPoint, partner);
    // console.log("fee: ", fee);
    return this.SDK.Swap.calculateSwapFee(res.result.splitPaths);

  }

  async sqrtPriceX64ToPrice(sqrtPrice: string, decimalsA: number, decimalsB: number) {
    // console.log(price);
    return TickMath.sqrtPriceX64ToPrice(new BN(sqrtPrice), decimalsA, decimalsB);
  }

  async getNetwork() {
    return {
      "APP_NAME": getAppName(this.config),
      // "SECRET_KEY": getKeySecret(this.config),
      "NETWORK": getNetWork(this.config),
      "ADDRESS": getSenderAddress(this.config)
    };
    // return this.config.get("APP_NAME");
  }

  async requestSuiFromFaucetV0(address: string) {
// create a new SuiClient object pointing to the network you want to use
    const suiClient = new SuiClient({ url: getFullnodeUrl("devnet") });

// Convert MIST to Sui
    const balance = (balance) => {
      return Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI);
    };

    // store the JSON representation for the SUI the address owns after using faucet
    const suiAfter = await suiClient.getBalance({ "owner": address });
    const result = balance(suiAfter);
// Output result to console.
    console.log(
      ` Balance after: ${result} SUI. Hello, SUI!`
    );
    return result;
  }

  async retrievalPositionById(positionId: string): Promise<Position> {
    // console.log("get position by id", res);
    return await this.SDK.Position.getPositionById(positionId);
  }


//   getCoinAmountFromLiquidity
  async getCoinAmountFromLiquidity(current_sqrt_price: string, liquidity: string, tick_lower_index: number, tick_upper_index: number) {


    const lowerSqrtPrice = TickMath.tickIndexToSqrtPriceX64(tick_lower_index);
    const upperSqrtPrice = TickMath.tickIndexToSqrtPriceX64(tick_upper_index);

    const liquidityBN = new BN(liquidity);
    const curSqrtPrice = new BN(current_sqrt_price);
    const amounts = ClmmPoolUtil.getCoinAmountFromLiquidity(
      liquidityBN,
      curSqrtPrice,
      lowerSqrtPrice,
      upperSqrtPrice,
      false
    );

    const { coinA, coinB } = amounts;
    const coinANb = coinA.toNumber();
    const coinBNb = coinB.toNumber();
    return { coinANb, coinBNb };
  }


}
