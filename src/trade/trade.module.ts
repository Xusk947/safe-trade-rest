import { Module } from '@nestjs/common';
import { TradeService } from './services/trade/trade.service';
import { TradeController } from './controllers/trade/trade.controller';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';

@Module({
    providers: [TradeService, PrismaService],
    controllers: [TradeController]
})
export class TradeModule { }
