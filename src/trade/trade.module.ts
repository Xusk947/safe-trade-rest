import { Module } from '@nestjs/common';
import { TradeService } from './services/trade/trade.service';
import { TradeController } from './controllers/trade/trade.controller';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';
import { SseService } from 'src/sse/services/sse/sse/sse.service';
import { TradeSseService } from './services/trade-sse/trade-sse.service';
import { TradeStatusService } from './services/trade-status/trade-status.service';
import { CollectionService } from './services/collection/collection.service';
import { TradeAcceptService } from './services/trade-accept/trade-accept.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        CacheModule.register(),
        ScheduleModule.forRoot(),
    ],
    providers: [TradeService, PrismaService, SseService, TradeSseService, TradeStatusService, CollectionService, TradeAcceptService],
    controllers: [TradeController]
})
export class TradeModule { }
