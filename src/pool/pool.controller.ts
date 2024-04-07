// noinspection SpellCheckingInspection

import { Controller, Get, Post, Query } from "@nestjs/common";
import { PoolService } from "./pool.service";
import "../common/utils";
import { failed, isNotNull, success } from "../common/utils";

@Controller("pool")
export class PoolController {
  constructor(private poolService: PoolService) {
  }

  @Get("/retrieveOnePool")
  async retrieveOnePool(@Query("poolId") poolId: string, @Query("forceRefresh") forceRefresh?: boolean) {
    const result = await this.poolService.retrieveOnePool(poolId, forceRefresh);
    return isNotNull(result) ? success(result) : failed("unknown error");

  }

  @Get("/retrievelAllPools")
  async retrievelAllPools() {
    const result = await this.poolService.retrievelAllPools();
    return isNotNull(result) ? success(result) : failed("unknown error");
  }


  @Post("/create")
  async createOnePool() {
    return failed("developer<MatrixYe>:This function is not implemented");
  }

  @Post("/batchCreate")
  async batchCreatePools() {
    return failed("developer<MatrixYe>:This function is not implemented");
  }

}
