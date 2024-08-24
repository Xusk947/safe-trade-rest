import { TokenItem, FileItem, NftItem } from "@prisma/client"
import { TradeStatus } from "src/trade/utils/types"

export type Collection = {
    TokenItems: TokenItem[],
    NftItems: NftItem[],
    FileItems: FileItem[]
}

export type StatusItem = {
    address: string,
    delivered: boolean,
    imageUrl: string
}

export type Amountable = {
    amount: number,
    neededAmount: number
}

export type Progressable = {
    progress: number
}

export type ItemsFees = {
    TokenItems: number,
    NftItems: number,
    FileItems: number,
    total: number
}

export type OperationFees = {
    blockchainFees: ItemsFees
    tradeFees: ItemsFees
    total: number
}

export type TradeFees = {
    traderFees?: OperationFees,
    creatorFees?: OperationFees
}

export type NftItemStatus = StatusItem & Progressable;
export type TokenItemStatus = StatusItem & Amountable;

export type UserItems = {
    tokenItems: TokenItemStatus[],
    nftItems: NftItemStatus[],
}
export type TraderItems = {
    traderItems: UserItems
}

export type CreatorItems = {
    creatorItems: UserItems
}

export type TradeItems = CreatorItems & TraderItems

export type TradeStatusData = {
    status: TradeStatus,
    items: TradeItems
}


export type TransactionToken = {
    address: string,
    amount: string,
    receiver: string
}

export type TransactionNft = {
    nftAddress: string,
    receiver: string
}

export type SendTransactionParams = {
    walletAddress: string,
    walletMnemonic: string,
    tokens: TransactionToken[]
    nfts: TransactionNft[]
}