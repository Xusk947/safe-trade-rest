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
    TokenItem?: TokenItem[];
    FileItem?: FileItem[];
    NftItem?: NftItem[]
}

export enum TradeStatus {
    CREATED = "CREATED",
    REJECTED = "REJECTED",
    CONFIRMED = "CONFIRMED",
    WAIT_FOR_RESOURCES = "WAIT_FOR_RESOURCES",
    VEREFICATION = "VERIFICATION",
    SENDING_ITEMS = "SENDING_ITEMS",
    CANCELED = "CANCELED",
    DELIVERED = "DELIVERED"
}

export type TradeSseData = {
    type: TradeSseUpdate,
    data: TradeSseMessage,
}

export type TradeSseMessage = {
    message: string,
    trade: any
}

export enum TradeSseUpdate {
    CONNECTED = "CONNECTED",
    DISCONNECTED = "DISCONNECTED",
    USER_JOINED = "USER_JOINED",
    USER_FILLED_ITEMS = "USER_FILLED_ITEMS",
    CREATOR_ACCEPT_TRADE = "CREATOR_ACCEPT_TRADE",
    TRADER_ACCEPT_TRADE = "TRADER_ACCEPT_TRADE",
    CANCELED_BY_CREATOR = "CANCELED_BY_CREATOR",
    CANCELED_BY_TRADER = "CANCELED_BY_TRADER"
}