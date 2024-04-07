// noinspection SpellCheckingInspection

import { Controller, Get, Query } from "@nestjs/common";
import { SuiService } from "./sui.service";
import { failed, success } from "../common/utils";

@Controller("sui")
export class SuiController {
  constructor(private suiServer: SuiService) {
  }

  @Get("/getAllBalances")
  async getAllBalances(@Query("owner") owner: string) {
    try {
      const allbanalce = await this.suiServer.getAllBalances(owner);
      return success(allbanalce);
    } catch (error) {
      return failed(error);
    }
  }

  @Get("/getTotalSupply")
  async getTotalSupply(@Query("coinType") coinType: string) {
    try {
      const totalSupply = await this.suiServer.getTotalSupply(coinType);
      return success(totalSupply);
    } catch (error) {
      return failed(error);
    }
  }

  @Get("/getCoinMetadata")
  async getCoinMetadata(@Query("coinType") coinType: string) {
    try {
      const coinMetadata = await this.suiServer.getCoinMetadata(coinType);
      return success(coinMetadata);
    } catch (error) {
      return failed(error);
    }
  }


}
