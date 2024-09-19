// noinspection SpellCheckingInspection

import { Injectable } from "@nestjs/common";
import CetusClmmSDK, { TickData } from "@cetusprotocol/cetus-sui-clmm-sdk";
import { ConfigService } from "@nestjs/config";
import { selectSDK } from "../common/sdk";
import { getEndpointUrl, getNetWork, getSenderAddress } from "../common/conf";

@Injectable()
export class TicksService {
  private SDK: CetusClmmSDK;

  constructor(private config: ConfigService) {
    this.SDK = this.toChoseSdk();
  }

  toChoseSdk(): CetusClmmSDK {
    return selectSDK(getNetWork(this.config), getSenderAddress(this.config),getEndpointUrl(this.config));
  }

  async fetchTicks(poolId: string, coinTypeA: string, coinTypeB: string) {
    return await this.SDK.Pool.fetchTicks({
      pool_id: poolId,
      coinTypeA: coinTypeA,
      coinTypeB: coinTypeB
    });
  }

//   1. 检索刻度，by pool ID
  async betchRetrievalTicksByPoolID(poolId: string): Promise<TickData[]> {
    const pool = await this.SDK.Pool.getPool(poolId);
    // console.log("fetchTicks: ", tickdatas);
    return await this.SDK.Pool.fetchTicks({
      pool_id: poolId,
      coinTypeA: pool.coinTypeA,
      coinTypeB: pool.coinTypeB
    });
  }

  async fetchTicksByRpc(tickHandle: string) {
    // console.log("tick data:", tickdatas);
    return await this.SDK.Pool.fetchTicksByRpc(tickHandle);
  }


}
