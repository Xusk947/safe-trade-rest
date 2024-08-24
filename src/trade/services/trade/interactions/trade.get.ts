import { HttpException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { TradeStatus } from "src/trade/utils/types";
import { TradeStatusData, Collection, TradeFees } from "../../trade-status/utils/types";
import { TradeStatusService } from "../../trade-status/trade-status.service";
import { PrismaService } from "src/prisma/services/prisma/prisma.service";

export async function GetTrade(prisma: PrismaService, tradeId: number, tradeStatusService: TradeStatusService) {
    const query = Prisma.validator<Prisma.TradeFindUniqueArgs>()({
        where: { id: Number(tradeId) },
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

    const trade = await prisma.trade.findUnique(query)

    if (!trade) {
        throw new HttpException("Trade not found", 404)
    }

    const creatorCollection: Collection = {
        TokenItems: trade.creatorCollection.TokenItem,
        NftItems: trade.creatorCollection.NftItem,
        FileItems: trade.creatorCollection.FileItem,
    };

    const traderCollection: Collection = {
        TokenItems: trade.traderCollection?.TokenItem,
        NftItems: trade.traderCollection?.NftItem,
        FileItems: trade.traderCollection?.FileItem,
    };

    let tradeStatus: TradeStatusData = null;
    let tradeFees = await tradeStatusService.getTradeFees(creatorCollection, traderCollection);

    if (trade.status != TradeStatus.REJECTED && trade.tradeWallet && trade.tradeWallet.address) {
        const tradeWalletAddress = trade.tradeWallet.address;

        tradeStatus = await tradeStatusService.getTradeStatus(trade, tradeWalletAddress, creatorCollection, traderCollection);
    }

    return { ...trade, tradeStatus, tradeFees };
}