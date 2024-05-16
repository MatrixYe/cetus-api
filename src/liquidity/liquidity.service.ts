// noinspection SpellCheckingInspection,DuplicatedCode

import { Injectable } from "@nestjs/common";
import CetusClmmSDK, {
  AddLiquidityFixTokenParams,
  adjustForCoinSlippage,
  ClmmPoolUtil,
  DataPage,
  Percentage,
  Position,
  RemoveLiquidityParams,
  TickMath
} from "@cetusprotocol/cetus-sui-clmm-sdk";
import { selectSDK } from "../common/sdk";
import { ConfigService } from "@nestjs/config";
import { getKeySecret, getNetWork, getSenderAddress } from "../common/conf";
import * as BN from "bn.js";
import { genKeypair } from "../common/utils";
import Decimal from "decimal.js";

@Injectable()
export class LiquidityService {
  private SDK: CetusClmmSDK;

  constructor(private config: ConfigService) {
    this.SDK = this.toChoseSdk();
  }

  toChoseSdk(): CetusClmmSDK {
    return selectSDK(getNetWork(this.config), getSenderAddress(this.config));
  }

  async retrievalPositions(accountAddress: string, poolId: string) {
    // console.log("get positions of one pool by owner address", res);
    return await this.SDK.Position.getPositionList(
      accountAddress,
      [poolId]
    );
  }

  async retrievalPositionOfOnePool(
    poolId: string
  ): Promise<DataPage<Position>> {
    const pool = await this.SDK.Pool.getPool(poolId);
    return await this.SDK.Pool.getPositionList(
      pool.position_manager.positions_handle
    );
  }

  async retrievalPositionById(positionId: string): Promise<Position> {
    // console.log("get position by id", res);
    return await this.SDK.Position.getPositionById(positionId);
  }


//   getCoinAmountFromLiquidity
  async getCoinAmountFromLiquidity(poolId: string, liquidity: string, tick_lower_index: number, tick_upper_index: number) {
    const pool = await this.SDK.Pool.getPool(poolId);

    // const position = await this.SDK.Position.getSimplePosition(positionAddress)

    const lowerSqrtPrice = TickMath.tickIndexToSqrtPriceX64(tick_lower_index);
    const upperSqrtPrice = TickMath.tickIndexToSqrtPriceX64(tick_upper_index);


    const liquidityBN = new BN(liquidity);
    const curSqrtPrice = new BN(pool.current_sqrt_price);


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

  //  开仓，创造一个新的仓位
  //add liquidity with a specified liquidity value
  async createAddLiquidityPayload(poolId: string, tickLow: number, tickUp: number, fix_amount_a: boolean, amount: number, decimalsA: number, decimalsB: number, slippage: number) {

    // token数量
    const coinAmount = new BN(fix_amount_a ? amount * 10 ** decimalsA : amount * 10 ** decimalsB);
    // 池子
    const pool = await this.SDK.Pool.getPool(poolId);
    const tickSpacing = Number(pool.tickSpacing);

    // 计算左区间
    let lowerTick = TickMath.getPrevInitializableTickIndex(
      new BN(pool.current_tick_index).toNumber(),
      new BN(pool.tickSpacing).toNumber()
    );

    // 计算右区间
    let upperTick = TickMath.getNextInitializableTickIndex(
      new BN(pool.current_tick_index).toNumber(),
      new BN(pool.tickSpacing).toNumber()
    );
    // 计算区间偏移
    upperTick = upperTick + tickSpacing * tickUp;
    lowerTick = lowerTick - tickSpacing * tickLow;
    // console.log(`lowerTick:${lowerTick} upperTick:${upperTick}`);

    // 当前curSqrtPrice价格
    const curSqrtPrice = new BN(pool.current_sqrt_price);
    // 计算输入流动性总量
    // lowerTick: number, upperTick: number, coinAmount: BN, iscoinA: boolean, roundUp: boolean, slippage: number, curSqrtPrice: BN
    const liquidityInput = ClmmPoolUtil.estLiquidityAndcoinAmountFromOneAmounts(
      lowerTick,
      upperTick,
      coinAmount,
      fix_amount_a,
      true,
      slippage,
      curSqrtPrice);
    // 计算代币A输入量
    const amount_a = fix_amount_a ? coinAmount.toNumber() : liquidityInput.tokenMaxA.toNumber();
    // 计算代币B输入量
    const amount_b = fix_amount_a ? liquidityInput.tokenMaxB.toNumber() : coinAmount.toNumber();
    // console.log(`fix_amount_a=${fix_amount_a} amount_a:${amount_a}  amount_b:${amount_b}`);

    const addLiquidityPayloadParams: AddLiquidityFixTokenParams = {
      coinTypeA: pool.coinTypeA,
      coinTypeB: pool.coinTypeB,
      pool_id: pool.poolAddress,
      tick_lower: lowerTick.toString(),
      tick_upper: upperTick.toString(),
      fix_amount_a: fix_amount_a,
      amount_a: amount_a,
      amount_b: amount_b,
      slippage: slippage,
      is_open: true,
      rewarder_coin_types: [],
      collect_fee: false,
      pos_id: ""
    };
    const createAddLiquidityTransactionPayload = await this.SDK.Position.createAddLiquidityFixTokenPayload(addLiquidityPayloadParams, {
      slippage: slippage,
      curSqrtPrice: curSqrtPrice
    });
    const keypair = genKeypair(getKeySecret(this.config));
    createAddLiquidityTransactionPayload.setGasBudget(20000000);

    // console.log("open_and_add_liquidity_fix_token: ", transferTxn);
    return await this.SDK.fullClient.sendTransaction(keypair, createAddLiquidityTransactionPayload);

  }

  //  开仓，创造一个新的仓位
  //add liquidity with a specified liquidity value
  async createAddLiquidityPayload2(poolId: string, lowerTick: number, upperTick: number, fix_amount_a: boolean, amount: number, decimalsA: number, decimalsB: number, slippage: number) {

    const coinAmount = new BN(fix_amount_a ? amount * 10 ** decimalsA : amount * 10 ** decimalsB);

    const pool = await this.SDK.Pool.getPool(poolId);
    // const tickSpacing = Number(pool.tickSpacing);

    // console.log(`lowerTick:${lowerTick} upperTick:${upperTick}`);

    // 当前curSqrtPrice价格
    const curSqrtPrice = new BN(pool.current_sqrt_price);
    // 计算输入流动性总量
    const liquidityInput = ClmmPoolUtil.estLiquidityAndcoinAmountFromOneAmounts(
      lowerTick,
      upperTick,
      coinAmount,
      fix_amount_a,
      true,
      slippage,
      curSqrtPrice);
    // 计算代币A输入量
    const amount_a = fix_amount_a ? coinAmount.toNumber() : liquidityInput.tokenMaxA.toNumber();
    // 计算代币B输入量
    const amount_b = fix_amount_a ? liquidityInput.tokenMaxB.toNumber() : coinAmount.toNumber();
    // console.log(`fix_amount_a=${fix_amount_a} amount_a:${amount_a}  amount_b:${amount_b}`);

    const addLiquidityPayloadParams: AddLiquidityFixTokenParams = {
      coinTypeA: pool.coinTypeA,
      coinTypeB: pool.coinTypeB,
      pool_id: pool.poolAddress,
      tick_lower: lowerTick.toString(),
      tick_upper: upperTick.toString(),
      fix_amount_a: fix_amount_a,
      amount_a: amount_a,
      amount_b: amount_b,
      slippage: slippage,
      is_open: true,
      rewarder_coin_types: [],
      collect_fee: false,
      pos_id: ""
    };
    const createAddLiquidityTransactionPayload = await this.SDK.Position.createAddLiquidityFixTokenPayload(addLiquidityPayloadParams, {
      slippage: slippage,
      curSqrtPrice: curSqrtPrice
    });
    const keypair = genKeypair(getKeySecret(this.config));
    createAddLiquidityTransactionPayload.setGasBudget(20000000);

    // console.log("open_and_add_liquidity_fix_token: ", transferTxn);
    return await this.SDK.fullClient.sendTransaction(keypair, createAddLiquidityTransactionPayload);

  }

  // 增加流动性
  async addLiquidityPayload(positonId: string, fix_amount_a: boolean, amount: number, decimalsA: number, decimalsB: number, slippage: number, collect_fee: boolean) {
    const position = await this.SDK.Position.getPositionById(positonId);
    const pool = await this.SDK.Pool.getPool(position.pool);
    const coinAmount = new BN(fix_amount_a ? amount * 10 ** decimalsA : amount * 10 ** decimalsB);
    const lowerTick = position.tick_lower_index;
    const upperTick = position.tick_upper_index;
    console.log(`lowerTick:${lowerTick} upperTick:${upperTick}`);

    // current sqrt price
    const curSqrtPrice = new BN(pool.current_sqrt_price);
    // cal liquidity Input
    const liquidityInput = ClmmPoolUtil.estLiquidityAndcoinAmountFromOneAmounts(
      lowerTick,
      upperTick,
      coinAmount,
      fix_amount_a,
      true,
      slippage,
      curSqrtPrice);
    // cal A amount
    const amount_a = fix_amount_a ? coinAmount.toNumber() : liquidityInput.tokenMaxA.toNumber();
    // cal B amount
    const amount_b = fix_amount_a ? liquidityInput.tokenMaxB.toNumber() : coinAmount.toNumber();
    // console.log(`fix_amount_a=${fix_amount_a} amount_a:${amount_a}  amount_b:${amount_b}`);

    const addLiquidityPayloadParams: AddLiquidityFixTokenParams = {
      coinTypeA: pool.coinTypeA,
      coinTypeB: pool.coinTypeB,
      pool_id: pool.poolAddress,
      tick_lower: lowerTick.toString(),
      tick_upper: upperTick.toString(),
      fix_amount_a: fix_amount_a,
      amount_a: amount_a,
      amount_b: amount_b,
      slippage: slippage,
      is_open: false,
      rewarder_coin_types: [],
      collect_fee: collect_fee,
      pos_id: positonId
    };
    const createAddLiquidityTransactionPayload = await this.SDK.Position.createAddLiquidityFixTokenPayload(addLiquidityPayloadParams, {
      slippage: slippage,
      curSqrtPrice: curSqrtPrice
    });
    createAddLiquidityTransactionPayload.setGasBudget(20000000);

    const keypair = genKeypair(getKeySecret(this.config));
    // console.log("open_and_add_liquidity_fix_token: ", transferTxn);
    return await this.SDK.fullClient.sendTransaction(keypair, createAddLiquidityTransactionPayload);
  }

  async removeLiquidity(positionId: string, liquidityOut: number, slippage: number) {
    // fetch position
    const position = await this.SDK.Position.getPositionById(positionId);
    // fetch pool
    const pool = await this.SDK.Pool.getPool(position.pool);
    // build tick data
    const lowerSqrtPrice = TickMath.tickIndexToSqrtPriceX64(position.tick_lower_index);
    const upperSqrtPrice = TickMath.tickIndexToSqrtPriceX64(position.tick_upper_index);
    const liquidity = new BN(liquidityOut);
    // slippage value
    const slippageTolerance = Percentage.fromDecimal(new Decimal(slippage));
    const curSqrtPrice = new BN(pool.current_sqrt_price);
    // Get token amount from liquidity.
    const coinAmounts = ClmmPoolUtil.getCoinAmountFromLiquidity(liquidity, curSqrtPrice, lowerSqrtPrice, upperSqrtPrice, false);
    const { tokenMaxA, tokenMaxB } = adjustForCoinSlippage(coinAmounts, slippageTolerance, false);
    // build remove liquidity params
    const removeLiquidityParams: RemoveLiquidityParams = {
      coinTypeA: pool.coinTypeA,
      coinTypeB: pool.coinTypeB,
      collect_fee: true,
      delta_liquidity: liquidity.toString(),
      min_amount_a: tokenMaxA.toString(),
      min_amount_b: tokenMaxB.toString(),
      pool_id: position.pool,
      pos_id: position.pos_object_id,
      rewarder_coin_types: []
    };
    //build palyLoad
    const removeLiquidityTransactionPayload = await this.SDK.Position.removeLiquidityTransactionPayload(removeLiquidityParams);
    removeLiquidityTransactionPayload.setGasBudget(20000000);

    // get singer
    const keypair = genKeypair(getKeySecret(this.config));
    // send tx
    return await this.SDK.fullClient.sendTransaction(keypair, removeLiquidityTransactionPayload);
  }

  async clostPosition(positionId: string, slippage: number) {
// Fetch position data
    const position = await this.SDK.Position.getPositionById(positionId);
    const poolId = position.pool;
// Fetch pool data
    const pool = await this.SDK.Pool.getPool(poolId);
// build tick data
    const lowerSqrtPrice = TickMath.tickIndexToSqrtPriceX64(position.tick_lower_index);
    const upperSqrtPrice = TickMath.tickIndexToSqrtPriceX64(position.tick_upper_index);
// input liquidity amount for remove
    const liquidity = new BN(position.liquidity);
// slippage value
    const slippageTolerance = new Percentage(new BN(slippage), new BN(100));
    const curSqrtPrice = new BN(pool.current_sqrt_price);
// Get token amount from liquidity.
    const coinAmounts = ClmmPoolUtil.getCoinAmountFromLiquidity(liquidity, curSqrtPrice, lowerSqrtPrice, upperSqrtPrice, false);
// adjust  token a and token b amount for slippage
    const { tokenMaxA, tokenMaxB } = adjustForCoinSlippage(coinAmounts, slippageTolerance, false);
// get all rewarders of position
    const rewards: any[] = await this.SDK.Rewarder.posRewardersAmount(poolId, pool.position_manager.positions_handle, positionId);
//     RewarderAmountOwed
    const rewardCoinTypes = rewards.filter((item) => Number(item.amount_owed) > 0).map((item) => item.coin_address);
// build close position payload
    const closePositionTransactionPayload = await this.SDK.Position.closePositionTransactionPayload({
      coinTypeA: pool.coinTypeA,
      coinTypeB: pool.coinTypeB,
      collect_fee: true,
      min_amount_a: tokenMaxA.toString(),
      min_amount_b: tokenMaxB.toString(),
      pool_id: poolId,
      pos_id: positionId,
      rewarder_coin_types: [...rewardCoinTypes]
    });
    closePositionTransactionPayload.setGasBudget(20000000);

    // get singer
    const keypair = genKeypair(getKeySecret(this.config));
    // send tx
    return await this.SDK.fullClient.sendTransaction(keypair, closePositionTransactionPayload);
  }


}
