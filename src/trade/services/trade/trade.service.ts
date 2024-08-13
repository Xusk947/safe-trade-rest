import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from "../../../prisma/services/prisma/prisma.service";
import { Prisma, Trade } from "@prisma/client";
import { Items, TradeParams, TradeStatus } from 'src/trade/utils/types';
import { UpdateTradeDto } from 'src/trade/dtos/update.trade.dto';
import { generateWallet } from 'src/crypto/utils/walletGenerator';
import { Address, WalletContractV5R1 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';

@Injectable()
export class TradeService {

    private logger = new Logger(TradeService.name)
    constructor(
        private readonly prisma: PrismaService
    ) {
    }

    private async addItemsToCollection(items: Items, collectionId: number) {
        if (items.FileItem) {
            await this.prisma.fileItem.createMany({
                data: items.FileItem.map((item) => {
                    return {
                        fileId: Number(item.fileId),
                        collectionId: collectionId
                    }
                })
            })
        }

        if (items.TokenItem) {
            await this.prisma.tokenItem.createMany({
                data: items.TokenItem.map((item) => {
                    console.log(item.image)
                    console.log(item.image.length)
                    return {
                        ...item,
                        amount: Number(item.amount),
                        collectionId: collectionId
                    }
                })
            })
        }

        if (items.NftItem) {
            await this.prisma.nftItem.createMany({
                data: items.NftItem.map((item) => {
                    return {
                        ...item,
                        collectionId: collectionId
                    }
                })
            })
        }
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
        if (items.FileItem) {
            await this.prisma.fileItem.createMany({
                data: items.FileItem.map((item) => {
                    return {
                        fileId: Number(item.fileId),
                        collectionId: collectionId
                    }
                })
            })
        }

        if (items.TokenItem) {
            await this.prisma.tokenItem.createMany({
                data: items.TokenItem.map((item) => {
                    return {
                        ...item,
                        image: item.image.length > 512 ? "" : item.image,
                        amount: Number(item.amount),
                        collectionId: collectionId
                    }
                })
            })
        }

        if (items.NftItem) {
            await this.prisma.nftItem.createMany({
                data: items.NftItem.map((item) => {
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

    async updateTrade(userId: bigint, tradeId: number, data: UpdateTradeDto) {
        let trade = await this.prisma.trade.findUnique({
            where: {
                id: Number(tradeId)
            },
        })


        if (!trade) {
            return new HttpException("Trade not found", 404)
        }

        const isCreator = trade.creatorId == userId

        let updateData: Prisma.TradeUpdateInput & { [key: string]: any } = {};

        if (isCreator) {
            if (!trade.creatorCollectionId) {
                const creatorCollectionId = await this.createCollection(data.items);
                updateData = {
                    creatorCollectionId: creatorCollectionId,
                    creatorWallet: data.wallet ?? trade.creatorWallet,
                };
            } else {
                await this.addItemsToCollection(data.items, trade.creatorCollectionId);
                updateData.creatorWallet = data.wallet ?? trade.creatorWallet;
            }
        } else if (trade.traderId === userId) {
            if (!trade.traderCollectionId) {
                const traderCollectionId = await this.createCollection(data.items);
                updateData = {
                    traderCollectionId: traderCollectionId,
                    traderWallet: data.wallet ?? trade.traderWallet
                };
            } else {
                await this.addItemsToCollection(data.items, trade.traderCollectionId);
                updateData.traderWallet = data.wallet ?? trade.traderWallet;
            }
        }

        trade = await this.prisma.trade.update({
            where: { id: Number(tradeId) },
            data: updateData
        });

        return {
            status: 200,
            message: "Trade updated",
        }
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
                traderId: Number(userId),
                status: TradeStatus.CONFIRMED
            }
        })

        this.logger.log(`User ${userId} joined trade ${tradeId}`)

        return {
            status: 200,
            message: "Trade joined"
        }
    }

    async getTrade(id: number) {
        const query = Prisma.validator<Prisma.TradeFindUniqueArgs>()({
            where: { id: Number(id) },
            include: {
                trader: true,
                creator: true,
                creatorCollection: {
                    include: {
                        FileItem: {
                            include: {
                                fileInput: true
                            }
                        },
                        NftItem: true,
                        TokenItem: true,
                    },
                },
                traderCollection: {
                    include: {
                        FileItem: {
                            include: {
                                fileInput: true
                            }
                        },
                        NftItem: true,
                        TokenItem: true,
                    },
                },
                tradeWallet: {
                    select: {
                        address: true
                    }
                },
            },
        })

        const trade = await this.prisma.trade.findUnique(query)

        if (!trade) {
            throw new HttpException("Trade not found", 404)
        }

        this.logger.log(`Get trade ${trade.id}`)
        return trade
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
            this.tradeIsAccepted(trade)

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

            this.logger.log(`User ${userId} accepted trade ${trade.id}`)

            this.tradeIsAccepted(trade)

            return {
                message: "Trade confirmed by trader",
                status: 200
            }
        }

        return new HttpException("User not authorized", 401)
    }

    async tradeIsAccepted(trade: Trade) {
        if (!trade.creatorConfirmed || !trade.traderConfirmed) return;

        const walletMnemonics = await generateWallet();

        const keyPair = await mnemonicToPrivateKey(walletMnemonics);

        const wallet = WalletContractV5R1.create({
            publicKey: keyPair.publicKey,
            workChain: 0
        })

        return await this.prisma.trade.update({
            where: {
                id: trade.id
            },
            data: {
                status: TradeStatus.CONFIRMED,
                tradeWallet: {
                    create: {
                        address: wallet.address.toString(),
                        mnemonics: walletMnemonics.map((m) => m.toString()).join(" "),
                    }
                }
            }
        });
    }

    async createTrade(params: TradeParams) {
        let collectionId: number | undefined = undefined

        if (params.items) {
            collectionId = await this.createCollection(params.items)
        }

        let trade = await this.prisma.trade.create({
            data: {
                creatorWallet: Address.parseRaw(params.creatorWallet).toString({ bounceable: true }),
                creatorId: params.creatorId,
                creatorCollectionId: collectionId
            }
        })

        const tradeKey = stringToHex(`t-${trade.id}-t`)
        const tradeLink = `https://t.me/safetrade_robot/safetrade?startapp=${tradeKey}`
        this.logger.log(`Created trade ${trade.id}`)
        this.logger.log(tradeLink)

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
            }
        })

        this.logger.log(`Get ${trades.length} trades for user ${userId}`)

        return trades
    }

    async getTradeStatus(userId: bigint, id: number) {
        const trade = await this.prisma.trade.findUnique({
            where: {
                id: id
            }
        })
    }
}

export function stringToHex(str: string) {
    return Buffer.from(str, 'utf8').toString('hex');
}

export function hexToString(hex: string) {
    return Buffer.from(hex, 'hex').toString();
}
