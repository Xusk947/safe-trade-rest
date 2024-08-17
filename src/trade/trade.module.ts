import { Module } from '@nestjs/common';
import { TradeService } from './services/trade/trade.service';
import { TradeController } from './controllers/trade/trade.controller';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';
import { SseService } from 'src/sse/services/sse/sse/sse.service';
import { TradeSseService } from './services/trade-sse/trade-sse.service';
import { TradeStatusService } from './services/trade-status/trade-status.service';

@Module({
    providers: [TradeService, PrismaService, SseService, TradeSseService, TradeStatusService],
    controllers: [TradeController]
})
export class TradeModule { }
