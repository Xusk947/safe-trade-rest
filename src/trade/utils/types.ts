export type TradeParams = {
    creatorWallet: string,
    creatorId: number,
    items?: Items
}

export type TokenItem = {
    address: string
    name: string,
    symbol: string,
    amount: number,
    image: string
}

export type FileItem = {
    fileId: number
}

export type NftItem = {
    name: string;
    address: string;
    imageUrl: string;
    collection?: string;
    collectionImageUrl?: string;
}

export type Items = {
    tokenItems?: TokenItem[];
    fileItems?: FileItem[];
    nftItems?: NftItem[]
}

export enum TradeStatus {
    CREATED = "CREATED",
    CONFIRMED = "CONFIRMED",
    REJECTED = "REJECTED",
    CANCELED = "CANCELED",
    WAITING_FOR_ITEMS = "WAITING_FOR_ITEMS",
    DELIVERED = "DELIVERED"
}