// noinspection SpellCheckingInspection

import { Controller, Get, Query } from "@nestjs/common";
import { TicksService } from "./ticks.service";
import { failed, isNotNull, success } from "../common/utils";

@Controller("ticks")
export class TicksController {
  constructor(private ticksService: TicksService) {

  }

  @Get("/fetchTicks")
  async fetchTicks(@Query("poolId") poolId: string,
                   @Query("coinTypeA") coinTypeA: string,
                   @Query("coinTypeB") coinTypeB: string) {
    try {
      return await this.ticksService.fetchTicks(poolId, coinTypeA, coinTypeB);
    } catch (error) {
      return failed(error);
    }
  }


  // 查询ticks信息by池子ID
  @Get("/betchRetrievalTicksByPoolID")
  async betchRetrievalTicksByPoolID(@Query("poolId") poolId: string) {
    try {
      let tickData = await this.ticksService.betchRetrievalTicksByPoolID(poolId);
      return isNotNull(tickData) ? success(tickData) : failed("tickdata is null");
    } catch (error) {
      return failed(error);
    }
  }

  @Get("/fetchTicksByRpc")
  async fetchTicksByRpc(@Query("ticks_handle") tickHandle: string) {
    try {
      const ticks = await this.ticksService.fetchTicksByRpc(tickHandle);
      return isNotNull(ticks) ? success(ticks) : failed("ticks is null");

    } catch (error) {
      return failed(error);
    }
  }

}
