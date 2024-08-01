import { Items } from "../utils/types";

export class UpdateTradeDto {
    tradeId: number;

    creatorWallet?: string;
    creatorId?: number;
    creatorItems?: Items;

    traderWallet?: string;
    traderId?: number;
    traderItems?: Items;
}