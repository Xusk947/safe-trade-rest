import { TokenItem, FileItem, NftItem } from "@prisma/client"
import { TradeStatus } from "src/trade/utils/types"

export type Collection = {
    tokenItems: TokenItem[],
    nftItems: NftItem[],
    fileItems: FileItem[]
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