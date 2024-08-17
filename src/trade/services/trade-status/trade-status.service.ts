import { Injectable } from '@nestjs/common';
import { FileItem, NftItem, TokenItem, Trade } from '@prisma/client';
import { TonApiClient } from 'src/crypto/client/tonApiClient';
import { fromNano } from 'src/crypto/utils/converter';
import { Event, JettonsBalances, NftItems, Trace } from 'tonapi-sdk-js';
import { Collection, NftItemStatus, TokenItemStatus, TradeItems, TradeStatusData } from './utils/types';
import { Address } from '@ton/core';
import { TradeStatus } from 'src/trade/utils/types';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';
import { TracesBuilder, TransferTrace } from './utils/tracesBuilder';

@Injectable()
export class TradeStatusService {

    constructor(
        private readonly prisma: PrismaService
    ) { }

    private async checkReceivedNftItems(walletItems: NftItems, items: NftItem[], collectionToCheck: Collection) {
        const nftItems = walletItems.nft_items;
        const collectionItems = collectionToCheck.nftItems;
        const nftItemsStatus: NftItemStatus[] = [];

        for (let i = 0; i < collectionItems.length; i++) {
            const item = collectionItems[i];

            const foundItem = nftItems.find((nftItem) => nftItem.address === item.address);
            const delivered = foundItem !== undefined
            const progress = delivered ? 1 : 0

            nftItemsStatus.push({
                address: item.address,
                imageUrl: item.imageUrl,
                progress: progress,
                delivered: delivered
            })
        }

        return nftItemsStatus
    }

    private async checkReceivedTokenItems(traces: TracesBuilder, senderWallet: string, collectionToCheck: Collection) {
        const collectionItems = collectionToCheck.tokenItems;
        const tokenItemsStatus: TokenItemStatus[] = [];
        const senderParsed = Address.parse(senderWallet).toRawString();

        for (let i = 0; i < collectionItems.length; i++) {
            const item = collectionItems[i];

            const { hasItem, value, transactions} = traces.countReceivedToken(item.address, senderParsed);

            tokenItemsStatus.push({
                address: item.address,
                delivered: hasItem,
                neededAmount: item.amount,
                amount: value,
                imageUrl: item.image
            })
        }

        return tokenItemsStatus
    }

    async getTradeStatus(trade: Trade, tradeWallet: string, creatorCollection: Collection, traderCollection: Collection): Promise<TradeStatusData | null> {
        let status = trade.status;

        if (trade.status == TradeStatus.CONFIRMED) {
            const updatedTrade = await this.updateTradeStatus(trade, TradeStatus.WAIT_FOR_RESOURCES);
            status = updatedTrade.status;
        }

        const traceBuilder = await this.getTraces(tradeWallet).fetchTraces();

        switch (status) {
            case TradeStatus.WAIT_FOR_RESOURCES:
                const items = await this.getReceivedItems(trade, tradeWallet, traceBuilder, creatorCollection, traderCollection);
                return { items, status };
            case TradeStatus.VEREFICATION:
                break;
            case TradeStatus.SENDING_ITEMS:
                break;
            case TradeStatus.DELIVERED:
                break;
            default:
                return null;
        }
    }

    async updateTradeStatus(trade: Trade, status: TradeStatus) {
        return await this.prisma.trade.update({
            where: {
                id: trade.id
            },
            data: {
                status: status.toString()
            }
        })
    }
    getTraces(tradeWallet: string) {
        return new TracesBuilder(tradeWallet);
    }

    async getReceivedItems(trade: Trade, tradeWallet: string, tracesBuilder: TracesBuilder, creatorCollection: Collection, traderCollection: Collection): Promise<TradeItems> {
        const nftResponse = await TonApiClient.accounts.getAccountNftItems(tradeWallet);

        const creatorTokenItemStatus = await this.checkReceivedTokenItems(tracesBuilder, trade.creatorWallet, creatorCollection);
        const traderTokenItemStatus = await this.checkReceivedTokenItems(tracesBuilder, trade.traderWallet, traderCollection);

        const creatorNftItemStatus = await this.checkReceivedNftItems(nftResponse, creatorCollection.nftItems, creatorCollection);
        const traderNftItemStatus = await this.checkReceivedNftItems(nftResponse, traderCollection.nftItems, traderCollection);

        return {
            creatorItems: {
                nftItems: creatorNftItemStatus,
                tokenItems: creatorTokenItemStatus
            },
            traderItems: {
                nftItems: traderNftItemStatus,
                tokenItems: traderTokenItemStatus
            }
        }
    }
    private async getVerifiedItems(tradeWallet: string, creatorCollection: Collection, traderCollection: Collection) {
        return null;
    }
    private async getSendedItems(tradeWallet: string, creatorCollection: Collection, traderCollection: Collection) {
        return null;
    }
}
