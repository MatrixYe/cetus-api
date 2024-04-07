import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { PoolController } from "./pool/pool.controller";
import { LoggerMiddleware } from "./logger.middleware";
import { PoolService } from "./pool/pool.service";
import { LiquidityController } from "./liquidity/liquidity.controller";
import { LiquidityService } from "./liquidity/liquidity.service";
import { SwapController } from "./swap/swap.controller";
import { SwapService } from "./swap/swap.service";
import { SuiController } from "./sui/sui.controller";
import { SuiService } from "./sui/sui.service";
import { TicksController } from "./ticks/ticks.controller";
import { TicksService } from "./ticks/ticks.service";
import { ToolsService } from "./tools/tools.service";
import { ToolsController } from "./tools/tools.controller";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [
    PoolController,
    LiquidityController,
    SwapController,
    SuiController,
    TicksController,
    ToolsController
  ],
  providers: [PoolService, LiquidityService, SwapService, SuiService, TicksService, ToolsService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware) // 应用 LoggerMiddleware
      .forRoutes("*"); // 对所有路由生效
  }
}
