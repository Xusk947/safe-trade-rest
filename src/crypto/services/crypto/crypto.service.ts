import { Injectable, Logger } from '@nestjs/common';
import { TonApiClient, TonApiRawRequest } from 'src/crypto/client/tonApiClient';
import axios from 'axios'
import { JettonBalance, JettonsBalances, JettonVerificationType } from 'tonapi-sdk-js';
import { fromNano } from 'src/crypto/utils/converter';

@Injectable()
export class CryptoService {
    private logger = new Logger(CryptoService.name)

    async getAccountJettons(id: string) {
        try {
            const response = await TonApiClient.accounts.getAccountJettonsBalances(id, { currencies: ['usd'] })

            const balances = response.balances

            for (let i = 0; i < balances.length; i++) {
                const balance = balances[i]

                balances[i].balance = fromNano(balance.balance);
            }

            balances.sort((a, b) => b.price['prices'].USD - a.price['prices'].USD)

            // push native TON at first
            const nativeTon = await getNativeTon(id)
            balances.unshift(nativeTon)

            return balances;

        } catch (e) {
            this.logger.error(JSON.stringify(e))
            throw e
        }
    }

    async getAccountNfts(id: string) {
        return await TonApiClient.accounts.getAccountNftItems(id)
    }

    async getAccountVerify(id: string) {
        return await TonApiClient.accounts.getAccount(id)
            .then((data) => {
                return {walletExists: true};
            })
            .catch((e) => {
                return {walletExists: false};
            });
    }
}


async function getNativeTon(wallet: string): Promise<JettonBalance> {
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