// noinspection SpellCheckingInspection

import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { LiquidityService } from "./liquidity.service";
import { failed, isNotNull, success } from "../common/utils";

class OpenPositionDto {
  poolId: string;
  tickUp: number;
  tickLow: number;
  fix_amount_a: boolean;
  amount: number;
  decimalsA: number;
  decimalsB: number;
  slippage: number;
}

class OpenPositionDto2 {
  poolId: string;
  lowerTick: number;
  upperTick: number;
  fix_amount_a: boolean;
  amount: number;
  decimalsA: number;
  decimalsB: number;
  slippage: number;
}

class AddLiquidityDto {
  positionId: string;
  fix_amount_a: boolean;
  amount: number;
  decimalsA: number;
  decimalsB: number;
  slippage: number;
  collect_fee: boolean;

}

class RemoveLiquidityDto {
  positionId: string;
  liquidityOut: number;
  slippage: number;
}

class ClostLiquidityDto {
  positionId: string;
  slippage: number;
}

@Controller("liquidity")
export class LiquidityController {
  constructor(private liquidityService: LiquidityService) {
  }

  //1 查询仓位列表，by账户&池子id
  @Get("/retrievalPositions")
  async retrievalPositions(
    @Query("account") account: string,
    @Query("poolId") poolId: string
  ) {
    try {
      const result = await this.liquidityService.retrievalPositions(
        account,
        poolId
      );
      return success(result);
    } catch (error) {
      return failed(error);
    }
  }

  //  查询仓位列表，by池子id
  @Get("retrievalPositionOfOnePool")
  async retrievalPositionOfOnePool(@Query("poolId") poolId: string) {
    try {
      const result =
        await this.liquidityService.retrievalPositionOfOnePool(poolId);
      return success(result);
    } catch (error) {
      return failed(error);
    }
  }

  // 3、获取仓位信息 by仓位id
  @Get("/retrievalPositionById")
  async retrievalPositionById(@Query("positionId") positionId: string) {
    try {
      const res = await this.liquidityService.retrievalPositionById(positionId);
      return success(res);
    } catch (error) {
      return failed(error);
    }
  }

  @Get("/getCoinAmountFromLiquidity")
  async getCoinAmountFromLiquidity(@Query("pooId") pooId: string,
                                   @Query("liquidity") liquidity: string,
                                   @Query("tick_lower_index") tick_lower_index: number,
                                   @Query("tick_upper_index") tick_upper_index: number) {
    const {
      coinANb,
      coinBNb
    } = await this.liquidityService.getCoinAmountFromLiquidity(pooId, liquidity, tick_lower_index, tick_upper_index);
    const data = {
      "pooId": pooId,
      "liquidity": liquidity,
      "tick_lower_index": tick_lower_index,
      "tick_upper_index": liquidity,
      "coinA": coinANb,
      "coinB": coinBNb
    };
    return success(data);
  }

  @Post("/openPositionAndAddLiquidity")
  async openPositionAndAddLiquidity(@Body() args: OpenPositionDto) {
    // poolId: string, tickLow: number,tickUp: number,  fix_amount_a: boolean, amount: number, decimalsA: number, decimalsB: number, slippage: number
    const resp = await this.liquidityService.createAddLiquidityPayload(
      args.poolId,
      args.tickLow,
      args.tickUp,
      args.fix_amount_a,
      args.amount,
      args.decimalsA,
      args.decimalsB,
      args.slippage
    );
    return isNotNull(resp) ? success(resp) : failed("system error");
  }

  @Post("/openPositionAndAddLiquidity2")
  async openPositionAndAddLiquidity2(@Body() args: OpenPositionDto2) {
    //poolId: string, lowerTick: number, upperTick: number, fix_amount_a: boolean, amount: number, decimalsA: number, decimalsB: number, slippage: number) {
    // console.log(`poolId ${args.poolId}`)
    // console.log(`lowerTick ${args.lowerTick}`)
    // console.log(`upperTick ${args.upperTick}`)
    // console.log(`fix_amount_a ${args.fix_amount_a}`)
    // console.log(`amount ${args.amount}`)
    // console.log(`decimalsA ${args.decimalsA}`)
    // console.log(`decimalsB ${args.decimalsB}`)
    // console.log(`slippage ${args.slippage}`)
    const resp = await this.liquidityService.createAddLiquidityPayload2(
      args.poolId,
      args.lowerTick,
      args.upperTick,
      args.fix_amount_a,
      args.amount,
      args.decimalsA,
      args.decimalsB,
      args.slippage
    );
    return isNotNull(resp) ? success(resp) : failed("system error");
  }

  @Post("/addLiquidity")
  async addLiquidity(@Body() args: AddLiquidityDto) {
    const resp = await this.liquidityService.addLiquidityPayload(
      args.positionId,
      args.fix_amount_a,
      args.amount,
      args.decimalsA,
      args.decimalsB,
      args.slippage,
      args.collect_fee);
    return isNotNull(resp) ? success(resp) : failed("system error");
  }

  @Post("/removeLiquidity")
  async removeLiquidity(@Body() args: RemoveLiquidityDto) {
    const positionId = args.positionId;
    const liquidityOut = args.liquidityOut;
    const slippage = args.slippage;
    // console.log(`positionId ${positionId}`);
    // console.log(`liquidityOut ${liquidityOut}`);
    // console.log(`slippage ${slippage}`);

    const resp = await this.liquidityService.removeLiquidity(positionId, liquidityOut, slippage);
    return isNotNull(resp) ? success(resp) : failed("system error");

  }


  @Post("/clostPosition")
  async closePosition(@Body() args: ClostLiquidityDto) {
    const positionId = args.positionId;
    const slippage = args.slippage;
    const resp = await this.liquidityService.clostPosition(positionId, slippage);
    return isNotNull(resp) ? success(resp) : failed("system error");
  }
}

