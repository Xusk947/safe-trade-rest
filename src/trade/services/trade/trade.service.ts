import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from "../../../prisma/services/prisma/prisma.service";
import { Prisma, Trade } from "@prisma/client";
import { Items, TradeParams, TradeStatus } from 'src/trade/utils/types';
import { UpdateTradeDto } from 'src/trade/dtos/update.trade.dto';
import { generateWallet } from 'src/crypto/utils/walletGenerator';
import { Address, WalletContractV5R1 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { TradeStatusService } from '../trade-status/trade-status.service';
import { Collection, TradeStatusData } from '../trade-status/utils/types';
import { TonApiClient } from 'src/crypto/client/tonApiClient';
import { CollectionService } from '../collection/collection.service';
import { TradeUpdate } from './interactions/trade.update';
import { JoinTrade } from './interactions/trade.join';
import { GetTrade } from './interactions/trade.get';
import { Cache } from '@nestjs/cache-manager';
import { Cron } from '@nestjs/schedule';
@Injectable()
export class TradeService {

    private logger = new Logger(TradeService.name)
    constructor(
        private readonly prisma: PrismaService,
        private readonly tradeStatusService: TradeStatusService,
        private readonly collectionService: CollectionService,
        private readonly cacheManager: Cache
    ) {
    }

    private async updateTradeStatus(tradeId: number, status: TradeStatus) {
        return await this.prisma.trade.update({
            where: {
                id: tradeId
            },
            data: {
                status: status.toString()
            }
        })
    }

    async updateTrade( userId: bigint, tradeId: number, data: UpdateTradeDto) {
        const updatedTrade = await TradeUpdate(this.collectionService, this.prisma, userId, tradeId, data)

        return updatedTrade;
    }
    async joinTrade(tradeId: number, userId: BigInt) {
        const joinedTrade = await JoinTrade(this.prisma, tradeId, userId)

        return joinedTrade
    }

    async getTrade(id: number) {
        const tradeCached = await this.cacheManager.get(`trade-${id}`)
        
        if (tradeCached) {
            this.logger.log(`Get trade: ${id} from cache`)
            return tradeCached;
        }

        const trade = await GetTrade(this.prisma, id, this.tradeStatusService)

        // set for 10 seconds
        this.cacheManager.set(`trade-${id}`, trade, 1000)
        this.logger.log(`Get trade: ${id}`)

        return trade
    }
   
    async createTrade(params: TradeParams) {
        let collectionId: number | undefined = undefined

        if (params.items) {
            collectionId = await this.collectionService.createCollection(params.items)
        }

        let trade = await this.prisma.trade.create({
            data: {
                creatorWallet: params.creatorWallet,
                creatorId: params.creatorId,
                creatorCollectionId: collectionId
            }
        })

        const tradeKey = stringToHex(`t-${trade.id}-t`)
        const tradeLink = `https://t.me/safetrade_robot/safetrade?startapp=${tradeKey}`

        return {
            tradeId: trade.id,
            tradeLink: tradeLink
        }
    }

    async getTrades(userId: number) {
        let trades = await this.prisma.trade.findMany({
            where: {
                OR: [
                    {
                        creatorId: Number(userId)
                    },
                    {
                        traderId: Number(userId)
                    }
                ]
            },
            include: {
                creator: true,
                trader: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        this.logger.log(`Get ${trades.length} trades for user ${userId}`)

        return trades
    }

    // each 24 hours
    @Cron('0 */24 * * * *')
    async changeAllTradesStatus() {
        await this.prisma.trade.updateMany({
            where: {
                status: TradeStatus.CREATED.toString(),
                createdAt: {
                    lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // delete trades created 24 hours ago
                }
            },
            data: {
                status: TradeStatus.CANCELED.toString()
            }
        })

        this.logger.log('Changed all trades status to CANCELED')
    }


}

export function stringToHex(str: string) {
    return Buffer.from(str, 'utf8').toString('hex');
}

export function hexToString(hex: string) {
    return Buffer.from(hex, 'hex').toString();
}
