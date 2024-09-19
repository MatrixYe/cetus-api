import { Injectable } from "@nestjs/common";
import { SuiClient } from "@mysten/sui.js/client";
import { ConfigService } from "@nestjs/config";
import { getEndpointUrl } from "../common/conf";

@Injectable()
export class SuiService {
  private client: SuiClient;

  constructor(private config: ConfigService) {

    const rpcUrl = getEndpointUrl(this.config);
    getEndpointUrl(this.config);
    this.client = new SuiClient({ url: rpcUrl });
  }

  async getAllBalances(owner: string) {
    // console.log(getAllBalances);
    return await this.client.getAllBalances({ owner: owner });
  }

  async getTotalSupply(coinType: string) {
    //     /** type name for the coin (e.g., 0x168da5bf1f48dafc111b0a488fa454aca95e0b5e::usdc::USDC) */
    return await this.client.getTotalSupply({ coinType });
  }

  async getCoinMetadata(coinType: string) {
    return await this.client.getCoinMetadata({ coinType });
  }
}
