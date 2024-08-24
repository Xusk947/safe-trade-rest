import { HttpException } from "@nestjs/common"
import { PrismaService } from "src/prisma/services/prisma/prisma.service"
import { TradeStatus } from "src/trade/utils/types"

export async function JoinTrade(prisma: PrismaService, tradeId: number, userId: BigInt) {
    let trade = await prisma.trade.findUnique({
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

    await prisma.trade.update({
        where: {
            id: Number(tradeId)
        },
        data: {
            traderId: Number(userId),
            status: TradeStatus.CONFIRMED
        }
    })

    return {
        status: 200,
        message: "Trade joined"
    }
}