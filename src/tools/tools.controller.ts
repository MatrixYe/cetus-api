import { Controller, Get, Query } from "@nestjs/common";
import { failed, genKeypair, success } from "../common/utils";
import { ToolsService } from "./tools.service";

@Controller("tools")
export class ToolsController {
  constructor(private toolsService: ToolsService) {

  }

  @Get("/system")
  async getNetwork() {
    const result = await this.toolsService.getNetwork();
    return success(result);
  }

  @Get("/calculateSwapFee")
  async calculateSwapFee(@Query("from") from: string,
                         @Query("to") to: string,
                         @Query("amount") amount: number,
                         @Query("byAmountIn") byAmountIn: boolean,
                         @Query("priceSplitPoint") priceSplitPoint: number,
                         @Query("partner") partner: string) {
    // const from = "0x26b3bc67befc214058ca78ea9a2690298d731a2d4309485ec3d40198063c4abc::usdt::USDT";
    // const to = "0x26b3bc67befc214058ca78ea9a2690298d731a2d4309485ec3d40198063c4abc::cetus::CETUS";
    // const amount = 100000000;
    // const byAmountIn = true;
    // const priceSplitPoint = 5;
    // const partner = "";
    try {
      const result = await this.toolsService.calculateSwapFee(from, to, amount, byAmountIn, priceSplitPoint, partner);
      return success(result);

    } catch (error) {
      return failed(error);
    }
  }

  @Get("/sqrtPriceX64ToPrice")
  async sqrtPriceX64ToPrice(
    @Query("sqrtPrice") sqrtPrice: string,
    @Query("decimalsA") decimalsA: number,
    @Query("decimalsB") decimalsB: number) {
    try {
      const price = await this.toolsService.sqrtPriceX64ToPrice(sqrtPrice, decimalsA, decimalsB);
      return success(price);
    } catch (error) {
      return failed(error);
    }
  }

  // 获取测试币
  @Get("/requestSuiFromFaucetV0")
  async requestSuiFromFaucetV0(@Query("address") address: string) {
    try {
      const number = await this.toolsService.requestSuiFromFaucetV0(address);
      return number ? success(number) : failed("failed,number is None");
    } catch (error) {
      return failed(error.toString());
    }

  }

  @Get("/verifySecretKey")
  async verifySecretKey(@Query("sk") sk: string) {
    try {
      const keypair = genKeypair(sk);
      const publicKey = keypair.getPublicKey();
      const keyScheme = keypair.getKeyScheme();
      console.log(`publicKey:${publicKey.toSuiAddress()}\nkeyScheme:${keyScheme.toString()}`);
      const result = {
        "publicKey": publicKey.toSuiPublicKey(),
        "address": publicKey.toSuiAddress(),
        "secretKey": sk,
        "keyScheme": keyScheme
      };
      return success(result);
    } catch (error) {
      return failed(error);
    }
  }

  @Get("/getCoinAmountFromLiquidity")
  async getCoinAmountFromLiquidity(@Query("current_sqrt_price") current_sqrt_price: string,
                                   @Query("liquidity") liquidity: string,
                                   @Query("tick_lower_index") tick_lower_index: number,
                                   @Query("tick_upper_index") tick_upper_index: number) {
    const {
      coinANb,
      coinBNb
    } = await this.toolsService.getCoinAmountFromLiquidity(current_sqrt_price, liquidity, tick_lower_index, tick_upper_index);
    const data = {
      "current_sqrt_price": current_sqrt_price,
      "liquidity": liquidity,
      "tick_lower_index": tick_lower_index,
      "tick_upper_index": liquidity,
      "coinA": coinANb,
      "coinB": coinBNb
    };
    return success(data);
  }

}