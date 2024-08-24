import { HttpException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/services/prisma/prisma.service";
import { UpdateTradeDto } from "src/trade/dtos/update.trade.dto";
import { CollectionService } from "../../collection/collection.service";


export async function TradeUpdate(collectionService: CollectionService, prisma: PrismaService, userId: bigint, tradeId: number, data: UpdateTradeDto) {
    let trade = await prisma.trade.findUnique({
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
            const creatorCollectionId = await collectionService.createCollection(data.items);
            updateData = {
                creatorCollectionId: creatorCollectionId,
                creatorWallet: data.wallet ?? trade.creatorWallet,
            };
        } else {
            await collectionService.addItemsToCollection(data.items, trade.creatorCollectionId);
            updateData.creatorWallet = data.wallet ?? trade.creatorWallet;
        }
    } else if (trade.traderId === userId) {
        if (!trade.traderCollectionId) {
            const traderCollectionId = await collectionService.createCollection(data.items);
            updateData = {
                traderCollectionId: traderCollectionId,
                traderWallet: data.wallet ?? trade.traderWallet
            };
        } else {
            await collectionService.addItemsToCollection(data.items, trade.traderCollectionId);
            updateData.traderWallet = data.wallet ?? trade.traderWallet;
        }
    }

    trade = await prisma.trade.update({
        where: { id: Number(tradeId) },
        data: updateData
    });

    return {
        status: 200,
        message: "Trade updated",
    }
}
