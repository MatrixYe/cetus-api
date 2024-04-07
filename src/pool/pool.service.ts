// noinspection SpellCheckingInspection

import { Injectable } from "@nestjs/common";
import CetusClmmSDK from "@cetusprotocol/cetus-sui-clmm-sdk";
import { ConfigService } from "@nestjs/config";
import { selectSDK } from "../common/sdk";
import { getNetWork, getSenderAddress } from "../common/conf";

@Injectable()
export class PoolService {
  private SDK: CetusClmmSDK;

  constructor(private config: ConfigService) {
    this.SDK = this.toChoseSdk();
  }

  toChoseSdk(): CetusClmmSDK {
    const network = getNetWork(this.config);
    console.log(`network:${network}`);
    return selectSDK(getNetWork(this.config), getSenderAddress(this.config));
  }

  async retrieveOnePool(poolId: string, forceRefresh: boolean) {
    return await this.SDK.Pool.getPool(poolId, forceRefresh);
  }

  async retrievelAllPools() {
    const pools = await this.SDK.Pool.getPoolsWithPage([]);
    console.log(`pool length: ${pools.length}`);
    const buff = [];
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      // console.log(`name:${pool.name} ${pool.poolAddress}`);
      buff.push({ "name": pool.name, "address": pool.poolAddress });
    }
    return buff;
  }


}
