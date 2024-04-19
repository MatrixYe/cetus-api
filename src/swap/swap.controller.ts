import { Body, Controller, Post } from "@nestjs/common";
import { SwapService } from "./swap.service";
import { failed, isNotNull, success } from "../common/utils";

class SwapParam {
  poolId: string;
  a2b: boolean;
  byAmountIn: boolean;
  decimalsA: number;
  decimalsB: number;
  amountX: number;
  slippageLimit: number;
}

class SwapParamV2 {
  from: string;
  to: string;
  amount: number;
  byAmountIn: boolean;
  slippage: number;
  orderSplit: boolean;
  externalRouter: boolean;
}

@Controller("swap")
export class SwapController {
  constructor(private swapService: SwapService) {
  }


  @Post("/to")
  async toSwap(@Body() args: SwapParam) {
    // poolId: string,
    //                a2b: boolean,
    //                byAmountIn: boolean,
    //                decimalsA: number,
    //                decimalsB: number,
    //                amountX: number,
    //                slippageLimit: number
    const resp = await this.swapService.toSwap(args.poolId, args.a2b, args.byAmountIn, args.decimalsA, args.decimalsB, args.amountX, args.slippageLimit);
    return isNotNull(resp) ? success(resp) : failed("system error");


  }

  @Post("/toV2")
  async toSwapV2(@Body() args: SwapParamV2) {
    // from: string, to: string, amount: number, byAmountIn: boolean, slippage: number, orderSplit: boolean, externalRouter: boolean
    // return resp
    return await this.swapService.toSwapV2(args.from, args.to, args.amount, args.byAmountIn, args.slippage, args.orderSplit, args.externalRouter)
  }
}

