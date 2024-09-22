import { Injectable, Logger } from '@nestjs/common';
import { FileItem, NftItem, Prisma, TokenItem, Trade } from '@prisma/client';
import { TonApiClient } from 'src/crypto/client/tonApiClient';
import { fromNano } from 'src/crypto/utils/converter';
import { Event, JettonsBalances, NftItems, Trace } from 'tonapi-sdk-js';
import { Collection, ItemsFees, NftItemStatus, OperationFees, SendTransactionParams, TokenItemStatus, TradeFees, TradeItems, TradeStatusData, TransactionNft, TransactionToken } from './utils/types';
import { Address } from '@ton/core';
import { TradeStatus } from 'src/trade/utils/types';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';
import { TracesBuilder, TransferTrace } from './utils/tracesBuilder';
import { GetNativeTonItem } from 'src/crypto/utils/nativeTon';
import { Cache } from '@nestjs/cache-manager';
import axios from 'axios';

const TON_TRANSFER_FEE = 0.01
const TRANSFER_TOKEN_FEE = 0.05
const TRANSFER_NFT_FEE = 0.1
const TRANSFER_FILE_FEE = 0.1
const EXTRA_FEE = 0.01

const HAS_TON_FEE = TRANSFER_TOKEN_FEE - TON_TRANSFER_FEE

@Injectable()
export class TradeStatusService {
    private logger = new Logger(TradeStatusService.name)
    private waitForResponse: Map<number, boolean> = new Map();

    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: Cache
    ) { }

    private async checkReceivedNftItems(walletItems: NftItems, items: NftItem[], collectionToCheck: Collection) {
        const nftItems = walletItems.nft_items;
        const collectionItems = collectionToCheck.NftItems;
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
        const collectionItems = collectionToCheck.TokenItems;
        const tokenItemsStatus: TokenItemStatus[] = [];
        const senderParsed = Address.parse(senderWallet).toRawString();

        const fees = this.getCollectionFees(collectionToCheck);

        // search for "TON" token
        const tonItem = collectionItems.find((item, index) => item.address == 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');
        const tonIndex = tonItem ? collectionItems.indexOf(tonItem) : -1;

        if (tonIndex != -1) {
            // push TON item at first 
            collectionItems[tonIndex].amount = tonItem.amount + fees.total;

            collectionItems.splice(tonIndex, 1);
            collectionItems.unshift(tonItem);
        } else {
            // create TON element
            const nativeItem = GetNativeTonItem()

            // put this item at first
            collectionItems.unshift({
                ...nativeItem,
                amount: fees.total,
                id: 0,
                collectionId: 0,
            })
        }

        for (let i = 0; i < collectionItems.length; i++) {
            const item = collectionItems[i];

            const { hasItem, value, transactions } = traces.countReceivedToken(item.address, senderParsed);
            const needItAmount = Number((item.amount).toPrecision(2))
            const amountDelivered = Number((value).toPrecision(2))

            const delivered = hasItem && transactions > 0 && amountDelivered >= needItAmount;

            tokenItemsStatus.push({
                address: item.address,
                delivered: delivered,
                neededAmount: needItAmount,
                amount: amountDelivered,
                imageUrl: item.image
            })
        }

        return tokenItemsStatus
    }

    private async getTradeWalletMnemonic(tradeId: number) {
        return await this.prisma.tradeWallet.findUnique({
            where: {
                id: tradeId
            },
            select: {
                mnemonics: true
            }
        })
    }

    public async getTradeStatus(
        trade: Trade,
        tradeWallet: string,
        creatorCollection: Collection,
        traderCollection: Collection
    ): Promise<TradeStatusData | null> {
        let status = trade.status;

        if (trade.status == TradeStatus.CONFIRMED) {
            const updatedTrade = await this.updateTradeStatus(trade, TradeStatus.WAIT_FOR_RESOURCES);
            status = updatedTrade.status;
        }

        const traceBuilder = await this.getTraces(tradeWallet).fetchTraces();

        const items = await this.getReceivedItems(trade, tradeWallet, traceBuilder, creatorCollection, traderCollection);


        switch (status) {
            case TradeStatus.WAIT_FOR_RESOURCES:

                let delivered = this.checkForDeliveredItems(
                    items.creatorItems.tokenItems,
                    items.traderItems.tokenItems,
                    items.creatorItems.nftItems,
                    items.traderItems.nftItems
                );

                if (delivered) {
                    await this.updateTradeStatus(trade, TradeStatus.VEREFICATION);
                }
                return { items, status };

            case TradeStatus.VEREFICATION:
                let deliveredVerification = this.checkForDeliveredItems(
                    items.creatorItems.tokenItems,
                    items.traderItems.tokenItems,
                    items.creatorItems.nftItems,
                    items.traderItems.nftItems
                );


                if (deliveredVerification) {
                    await this.updateTradeStatus(trade, TradeStatus.SENDING_ITEMS);
                }

                return { items, status };

            case TradeStatus.SENDING_ITEMS:
                const isSent = await this.cache.get(`sent-trade-${trade.id}`);
                if (isSent || trade.hash) {
                    if (trade.hash) {
                        await this.getSendedItems(trade.hash, trade, creatorCollection, traderCollection);
                    }
                    return { items, status };
                } else if (!trade.hash) {

                    const wallet = await this.getTradeWalletMnemonic(trade.tradeWalletId);

                    await this.cache.set(`sent-trade-${trade.id}`, true);
                    await this.sendTransaction(
                        trade.id,
                        tradeWallet,
                        wallet.mnemonics,
                        trade.creatorWallet,
                        trade.traderWallet,
                        creatorCollection,
                        traderCollection
                    );
                }

                break;

            case TradeStatus.DELIVERED:
                break;

            default:
                return null;
        }
    }

    private async sendTransaction(
        tradeId: number,
        tradeWallet: string,
        tradeWalletMnemonic: string,
        creatorWalletAddress: string,
        traderWalletAddress: string,
        creatorCollection: Collection,
        traderCollection: Collection
    ) {
        if (this.waitForResponse.has(tradeId)) return;

        const creatorTokens = creatorCollection.TokenItems.map((item) => {
            const transferItem: TransactionToken = {
                address: item.address,
                amount: item.amount.toString(),
                receiver: traderWalletAddress
            }

            return transferItem
        })

        const traderTokens = traderCollection.TokenItems.map((item) => {
            const transferItem: TransactionToken = {
                address: item.address,
                amount: item.amount.toString(),
                receiver: creatorWalletAddress
            }

            return transferItem
        })

        const creatorNfts = creatorCollection.NftItems.map((item) => {
            const transferItem: TransactionNft = {
                nftAddress: item.address,
                receiver: traderWalletAddress
            }

            return transferItem
        })

        const traderNfts = traderCollection.NftItems.map((item) => {
            const transferItem: TransactionNft = {
                nftAddress: item.address,
                receiver: creatorWalletAddress
            }

            return transferItem
        })

        const tokens = [];
        tokens.push(...creatorTokens);
        tokens.push(...traderTokens);

        const nfts = [];
        nfts.push(...creatorNfts);
        nfts.push(...traderNfts);

        const transactionTransfer: SendTransactionParams = {
            walletAddress: tradeWallet,
            walletMnemonic: tradeWalletMnemonic,
            tokens: tokens,
            nfts: nfts
        }


        this.waitForResponse.set(tradeId, true);
        const response = await axios.post(`${process.env.GO_SERVER_URL}/v1/ton/send/tokens/`, transactionTransfer)
            .then((response) => {
                this.waitForResponse.delete(tradeId);
                return response;
            })
            .catch((error) => {
                this.waitForResponse.delete(tradeId);
                throw error
            })

        const data = response.data as { hash: string };

        await this.prisma.trade.update({
            where: {
                id: tradeId
            },
            data: {
                hash: data.hash
            }
        })

        return data.hash;
    }

    private getCollectionFees(collection: Collection): OperationFees {
        if (!collection) null;

        const nftItems = collection.NftItems ?? [];
        const tokenItems = collection.TokenItems ?? [];
        const hasTonItem = tokenItems.find((item) => item.address == 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');
        const tonTransferFee = hasTonItem ? HAS_TON_FEE : 0

        const fileItems = collection.FileItems ?? [];

        const tokenItemsBlockchainFee = Number(((tokenItems.length * TRANSFER_TOKEN_FEE) - tonTransferFee).toPrecision(2));
        const nftItemsBlockchainFee = Number((nftItems.length * TRANSFER_NFT_FEE).toPrecision(2));
        const fileBlockchainFee = Number((fileItems.length * TRANSFER_FILE_FEE).toPrecision(2));

        const totalBlockchainFee = Number((tokenItemsBlockchainFee + nftItemsBlockchainFee + fileBlockchainFee).toPrecision(2));

        const tokenItemsTradeFee = Number((tokenItemsBlockchainFee * 1).toPrecision(2));
        const nftItemsTradeFee = Number((nftItemsBlockchainFee * 1.5).toPrecision(2));
        const fileTradeFee = Number((fileBlockchainFee * 1.5).toPrecision(2));

        const itemsTradeFee = Number((tokenItemsTradeFee + nftItemsTradeFee + fileTradeFee).toPrecision(2));

        const remainder = itemsTradeFee % 0.05;
        const totalTradeFee = Number((itemsTradeFee + (remainder > 0.025 ? 0.05 - remainder : 0)).toPrecision(2));

        const totalFees = Number((totalTradeFee + totalBlockchainFee).toPrecision(2));

        return {
            tradeFees: {
                TokenItems: tokenItemsTradeFee,
                NftItems: nftItemsTradeFee,
                FileItems: fileTradeFee,
                total: totalTradeFee
            },
            blockchainFees: {
                TokenItems: tokenItemsBlockchainFee,
                NftItems: nftItemsBlockchainFee,
                FileItems: fileBlockchainFee,
                total: totalBlockchainFee > 0 ? totalBlockchainFee : Number((totalBlockchainFee + EXTRA_FEE).toPrecision(2)),
            },
            total: totalFees
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
    private getTraces(tradeWallet: string) {
        return new TracesBuilder(tradeWallet);
    }

    async getReceivedItems(trade: Trade, tradeWallet: string, tracesBuilder: TracesBuilder, creatorCollection: Collection, traderCollection: Collection): Promise<TradeItems> {
        const nftResponse = await TonApiClient.accounts.getAccountNftItems(tradeWallet);

        const creatorTokenItemStatus = await this.checkReceivedTokenItems(tracesBuilder, trade.creatorWallet, creatorCollection);
        const traderTokenItemStatus = await this.checkReceivedTokenItems(tracesBuilder, trade.traderWallet, traderCollection);

        const creatorNftItemStatus = await this.checkReceivedNftItems(nftResponse, creatorCollection.NftItems, creatorCollection);
        const traderNftItemStatus = await this.checkReceivedNftItems(nftResponse, traderCollection.NftItems, traderCollection);

        return {
            creatorItems: {
                nftItems: creatorNftItemStatus,
                tokenItems: creatorTokenItemStatus,
            },
            traderItems: {
                nftItems: traderNftItemStatus,
                tokenItems: traderTokenItemStatus,
            }
        }
    }

    async getSendingStatus(trade: Trade, tradeWallet: string, creatorCollection: Collection, traderCollection: Collection) {
        const hash = trade.hash;

        if (hash) return;

    }

    private checkForDeliveredTokens(creatorItemsStatus: TokenItemStatus[], traderItemsStatus: TokenItemStatus[]) {
        // for each item if 1 is not delivered return false, else true
        const creatorDelivered = creatorItemsStatus.every((item) => item.delivered);
        const traderDelivered = traderItemsStatus.every((item) => item.delivered);

        return creatorDelivered && traderDelivered
    }

    private checkForDeliveredNftItems(creatorItems: NftItemStatus[], traderItems: NftItemStatus[]) {
        const creatorDelivered = creatorItems.every((item) => item.delivered);
        const traderDelivered = traderItems.every((item) => item.delivered);

        return creatorDelivered && traderDelivered
    }

    private checkForDeliveredItems(
        creatorTokenItems: TokenItemStatus[],
        traderTokenItems: TokenItemStatus[],
        creatorNftItems: NftItemStatus[],
        traderNftItems: NftItemStatus[],
    ) {
        const tokensDelivered = this.checkForDeliveredTokens(creatorTokenItems, traderTokenItems);
        const nftsDelivered = this.checkForDeliveredNftItems(creatorNftItems, traderNftItems);

        return tokensDelivered && nftsDelivered
    }

    public getTradeFees(creatorCollection: Collection, traderCollection: Collection): TradeFees {
        const creatorFees = creatorCollection ? this.getCollectionFees(creatorCollection) : null;
        const traderFees = traderCollection ? this.getCollectionFees(traderCollection) : null;

        return {
            creatorFees,
            traderFees
        }
    }


    public async getStatus(id: number | string) {
        const trade = await this.prisma.trade.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                creator: true,
                trader: true,
                tradeWallet: true,
                creatorCollection: {
                    include: {
                        FileItem: {
                            include: {
                                fileInput: true
                            }
                        },
                        NftItem: true,
                        TokenItem: true,
                    }
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
                    }
                }
            }
        });

        this.logger.log(`Get trade status for trade ${id}`)

        return this.getTradeStatus(trade, trade.tradeWallet.address, {
            FileItems: trade.creatorCollection.FileItem,
            NftItems: trade.creatorCollection.NftItem,
            TokenItems: trade.creatorCollection.TokenItem,
        }, {
            FileItems: trade.traderCollection.FileItem,
            NftItems: trade.traderCollection.NftItem,
            TokenItems: trade.traderCollection.TokenItem,
        });
    }

    private async getVerifiedItems(tradeWallet: string, creatorCollection: Collection, traderCollection: Collection) {
        return null;
    }
    private async getSendedItems(hash: string, trade: Trade, creatorCollection: Collection, traderCollection: Collection) {
        const traces = await TonApiClient.traces.getTrace(hash)

        if (!traces) {
            return null;
        }

        if (traces.transaction.success) {
            this.updateTradeStatus(trade, TradeStatus.DELIVERED)
        }

        return null;
    }
}
