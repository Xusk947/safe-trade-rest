import { Items } from "../utils/types";

export class CreateTradeDto {
    creatorWallet: string;
    creatorId: number;
    items?: Items;
}