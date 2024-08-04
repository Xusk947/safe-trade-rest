import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from "../../../prisma/services/prisma/prisma.service";
import { Prisma, Trade } from "@prisma/client";
import { Items, TradeParams, TradeStatus } from 'src/trade/utils/types';
import { UpdateTradeDto } from 'src/trade/dtos/update.trade.dto';

@Injectable()
export class TradeService {
    private logger = new Logger(TradeService.name)
    constructor(
        private readonly prisma: PrismaService
    ) {
    }

    private async createCollection(items: Items, lastCollectionId?: number) {
        let collectionId = lastCollectionId

        if (!collectionId) {
            const collection = await this.prisma.itemsCollection.create({})
            collectionId = collection.id
        } else {
            const collection = await this.prisma.itemsCollection.findUnique({
                where: {
                    id: collectionId
                },
                include: {
                    FileItem: true,
                    NftItem: true,
                    TokenItem: true
                }
            })
            // Delete old items
            if (collection) {
                if (collection.FileItem) {
                    await this.prisma.fileItem.deleteMany({
                        where: {
                            collectionId
                        }
                    })
                }

                if (collection.NftItem) {
                    await this.prisma.nftItem.deleteMany({
                        where: {
                            collectionId
                        }
                    })
                }

                if (collection.TokenItem) {
                    await this.prisma.tokenItem.deleteMany({
                        where: {
                            collectionId
                        }
                    })
                }
            }
        }

        // Create Items 
        if (items.fileItems) {
            await this.prisma.fileItem.createMany({
                data: items.fileItems.map((item) => {
                    return {
                        fileId: Number(item.fileId),
                        collectionId: collectionId
                    }
                })
            })
        }

        if (items.tokenItems) {
            await this.prisma.tokenItem.createMany({
                data: items.tokenItems.map((item) => {
                    return {
                        ...item,
                        amount: Number(item.amount),
                        collectionId: collectionId
                    }
                })
            })
        }

        if (items.nftItems) {
            await this.prisma.nftItem.createMany({
                data: items.nftItems.map((item) => {
                    return {
                        ...item,
                        collectionId: collectionId
                    }
                })
            })
        }

        return collectionId
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

    async updateTrade(data: UpdateTradeDto) {
        let trade = await this.prisma.trade.findUnique({
            where: {
                id: Number(data.tradeId)
            },
        })


        if (!trade) {
            return new HttpException("Trade not found", 404)
        }

        let creatorCollectionId = trade.creatorCollectionId
        let traderCollectionId = trade.traderCollectionId

        if (data.creatorItems) {
            creatorCollectionId = await this.createCollection(data.creatorItems, creatorCollectionId)
        }

        if (data.traderItems && !traderCollectionId) {
            traderCollectionId = await this.createCollection(data.traderItems, traderCollectionId)
        }

        let tradeUpdated = await this.prisma.trade.update({
            where: {
                id: Number(data.tradeId)
            },
            data: {
                creatorWallet: data.creatorWallet,
                creatorId: Number(data.creatorId),
                traderWallet: data.traderWallet,
                traderId: Number(data.traderId),
                creatorCollectionId: creatorCollectionId,
                traderCollectionId: traderCollectionId
            }
        })

        this.logger.log(`Updated trade ${tradeUpdated.id}`)

        return tradeUpdated
    }

    async joinTrade(tradeId: number, userId: BigInt) {
        let trade = await this.prisma.trade.findUnique({
            where: {
                id: Number(tradeId)
            }
        })

        if (!trade) {
            return new HttpException("Trade not found", 404)
        }

        if (trade.traderId == userId) {
            return new HttpException("You can't join your own trade", 403)
        }

        if (trade.traderId) {
            return new HttpException("Trade already joined", 409)
        }

        await this.prisma.trade.update({
            where: {
                id: Number(tradeId)
            },
            data: {
                traderId: Number(userId)
            }
        })

        return {
            status: 200,
            message: "Trade joined"
        }
    }

    async getTrade(id: number) {
        let trade = await this.prisma.trade.findUnique({
            where: {
                id: Number(id)
            },
        })

        const creatorCollection = await this.prisma.itemsCollection.findUnique({
            where: {
                id: Number(trade.creatorCollectionId)
            },
            include: {
                FileItem: true,
                NftItem: true,
                TokenItem: true
            }
        })

        let traderCollection = null

        if (trade.traderCollectionId) {
            traderCollection = await this.prisma.itemsCollection.findUnique({
                where: {
                    id: Number(trade.traderCollectionId)
                },
                include: {
                    FileItem: true,
                    NftItem: true,
                    TokenItem: true
                }
            })
        }

        this.logger.log(`Get trade ${trade.id}`)

        return {
            createdAt: trade.createdAt,
            creatorCollection: creatorCollection,
            creatorCollectionId: trade.creatorCollectionId,
            creatorConfirmed: trade.creatorConfirmed,
            creatorId: Number(trade.creatorId),
            creatorWallet: trade.creatorWallet,
            id: Number(trade.id),
            refTaxDone: trade.refTaxDone,
            status: trade.status,
            traderCollection: traderCollection,
            traderCollectionId: trade.traderCollectionId,
            traderConfirmed: trade.traderConfirmed,
            traderId: Number(trade.traderId),
            traderWallet: trade.traderWallet
        }
    }

    async acceptTrade(id: number, userId: number, status: number) {
        let trade = await this.prisma.trade.findUnique({
            where: {
                id: Number(id)
            },
        })

        if (!trade) {
            return new HttpException("Trade not found", 404)
        }

        let creatorStatus = BigInt(trade.creatorId) === BigInt(userId)

        if (creatorStatus) {
            const updatedTrade = await this.prisma.trade.update({
                where: {
                    id: Number(id)
                },
                data: {
                    creatorConfirmed: Number(status)
                }
            })

            if (updatedTrade.creatorConfirmed == 0) {
                await this.updateTradeStatus(updatedTrade.id, TradeStatus.REJECTED)
            } else if (updatedTrade.traderConfirmed == 1 && updatedTrade.creatorConfirmed == 1) {
                await this.updateTradeStatus(updatedTrade.id, TradeStatus.CONFIRMED)
            }

            return {
                message: "Trade confirmed by creator"
            }
        }

        let traderStatus = BigInt(trade.traderId) === BigInt(userId)

        if (traderStatus) {
            let updatedTrade = await this.prisma.trade.update({
                where: {
                    id: Number(id)
                },
                data: {
                    traderConfirmed: Number(status)
                }
            })

            if (updatedTrade.traderConfirmed == 0) {
                await this.updateTradeStatus(updatedTrade.id, TradeStatus.REJECTED)
            } else if (updatedTrade.traderConfirmed == 1 && updatedTrade.creatorConfirmed == 1) {
                await this.updateTradeStatus(updatedTrade.id, TradeStatus.CONFIRMED)
            }

            return {
                message: "Trade confirmed by trader"
            }
        }

        return new HttpException("User not authorized", 401)
    }

    async createTrade(params: TradeParams) {
        let collectionId: number | undefined = undefined

        if (params.items) {
            collectionId = await this.createCollection(params.items)
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

        this.logger.log(`Created trade ${trade.id}`)

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
                creatorCollection: true,
                traderCollection: true,
                creator: true,
                trader: true,
            }
        })

        this.logger.log(`Get trades ${trades.length} for user ${userId}`)

        return trades
    }
}

export function stringToHex(str: string) {
    return Buffer.from(str, 'utf8').toString('hex');
}

export function hexToString(hex: string) {
    return Buffer.from(hex, 'hex').toString();
}
