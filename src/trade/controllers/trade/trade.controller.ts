import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateTradeDto } from 'src/trade/dtos/create.trade.dto';
import { UpdateTradeDto } from 'src/trade/dtos/update.trade.dto';
import { TradeService } from 'src/trade/services/trade/trade.service';

@Controller('trade')
export class TradeController {
    constructor(
        private readonly tradeService: TradeService
    ) { }

    @Post()
    async createTrade(@Body() data: CreateTradeDto) {
        return await this.tradeService.createTrade(data)
    }

    @Post(":id/:userId/:status")
    async acceptTrade(@Param('id') id: number, @Param('userId') userId: number, @Param('status') status: number) {
        return await this.tradeService.acceptTrade(id, userId, status)
    }

    @Post(":id/:userId")
    async joinTrade(@Param('id') id: number, @Param('userId') userId: number) {
        
    }

    @Put()
    async updateTrade(@Body() data: UpdateTradeDto) {
        return await this.tradeService.updateTrade(data)
    }

    @Get(":id")
    async getTrade(@Param('id') id: number) {
        return await this.tradeService.getTrade(id)
    }

    @Get("user/:id")
    async getTrades(@Param('id') id: number) {
        return await this.tradeService.getTrades(id)
    }
}
