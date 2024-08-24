import { Body, Controller, Get, Param, Post, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { SseService } from 'src/sse/services/sse/sse/sse.service';
import { CreateTradeDto } from 'src/trade/dtos/create.trade.dto';
import { UpdateTradeDto } from 'src/trade/dtos/update.trade.dto';
import { TradeAcceptService } from 'src/trade/services/trade-accept/trade-accept.service';
import { TradeSseService } from 'src/trade/services/trade-sse/trade-sse.service';
import { TradeStatusService } from 'src/trade/services/trade-status/trade-status.service';
import { TradeService } from 'src/trade/services/trade/trade.service';

@Controller('trade')
export class TradeController {
    constructor(
        private readonly tradeService: TradeService,
        private readonly tradeStatusService: TradeStatusService,
        private readonly tradeSseService: TradeSseService,
        private readonly tradeAcceptService: TradeAcceptService
    ) { }

    @Post()
    async createTrade(@Body() data: CreateTradeDto) {
        return await this.tradeService.createTrade(data)
    }

    @Put(":id/:userId/:status")
    async acceptTrade(@Param('id') id: number, @Param('userId') userId: number, @Param('status') status: number) {
        return await this.tradeAcceptService.acceptTrade(id, userId, status)
    }

    @Get(":id/status")
    async getTradeStatus(@Param('id') id: number) {
        return await this.tradeStatusService.getStatus(id)
    }

    @Post(":id/:userId") 
    async updateItems(@Param('id') id: number, @Param('userId') userId: string, @Body() data: UpdateTradeDto) {
        return await this.tradeService.updateTrade(BigInt(userId), id, data)
    }

    @Put(":id/:userId")
    async joinTrade(@Param('id') id: number, @Param('userId') userId: string) {
        return await this.tradeService.joinTrade(id, BigInt(userId))
    }
    
    @Get(":id")
    async getTrade(@Param('id') id: number) {
        return await this.tradeService.getTrade(id)
    }

    @Get("user/:id")
    async getTrades(@Param('id') id: number) {
        return await this.tradeService.getTrades(id)
    }

    // @Get("sse/:userId")
    // async getTradeStatusSSE(@Param('userId') userId: string, @Res() response: Response) {
    //     return this.tradeSseService.registerTradeSSE(userId, response)
    // }
}
