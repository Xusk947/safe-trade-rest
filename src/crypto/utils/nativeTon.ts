import { fromNano } from "@ton/core";
import { JettonBalance, JettonVerificationType } from "tonapi-sdk-js";
import { TonApiClient } from "../client/tonApiClient";
import { TokenItem } from "src/trade/utils/types";

export async function GetNativeTon(wallet: string): Promise<JettonBalance> {
    const account = await TonApiClient.accounts.getAccount(wallet);

    const balance: JettonBalance = {
        balance: fromNano(account.balance),
        jetton: {
            address: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
            decimals: 0,
            image: "https://ton.org/icons/custom/ton_logo.svg",
            name: "TON",
            symbol: "TON",
            verification: JettonVerificationType.Whitelist
        },
        wallet_address: {
            address: account.address,
            is_scam: account.is_scam,
            is_wallet: account.is_wallet,
            name: account.name,
            icon: account.icon
        },
    }

    return balance
}

export function GetNativeTonItem(): TokenItem {
    return {
        address: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
        amount: 0,
        image: "https://ton.org/icons/custom/ton_logo.svg",
        name: "TON",
        symbol: "TON",
    }
}