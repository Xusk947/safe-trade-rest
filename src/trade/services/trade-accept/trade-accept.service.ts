import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Trade } from '@prisma/client';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV5R1 } from '@ton/ton';
import { generateWallet } from 'src/crypto/utils/walletGenerator';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';
import { TradeStatus } from 'src/trade/utils/types';
import { TradeStatusService } from '../trade-status/trade-status.service';

@Injectable()
export class TradeAcceptService {
    private logger = new Logger(TradeAcceptService.name)
    
    constructor (
        private readonly prisma: PrismaService,
        private readonly tradeStatusService: TradeStatusService,
    ) { }

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
                await this.tradeStatusService.updateTradeStatus(updatedTrade, TradeStatus.REJECTED)
            } else if (updatedTrade.traderConfirmed == 1 && updatedTrade.creatorConfirmed == 1) {
                await this.tradeStatusService.updateTradeStatus(updatedTrade, TradeStatus.CONFIRMED)
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
                await this.tradeStatusService.updateTradeStatus(updatedTrade, TradeStatus.REJECTED)
            } else if (updatedTrade.traderConfirmed == 1 && updatedTrade.creatorConfirmed == 1) {
                await this.tradeStatusService.updateTradeStatus(updatedTrade, TradeStatus.CONFIRMED)
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
        if (!(trade.status == TradeStatus.CONFIRMED)) return;

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

}
