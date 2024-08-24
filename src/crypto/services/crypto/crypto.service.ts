import { Injectable, Logger } from '@nestjs/common';
import { TonApiClient, TonApiRawRequest } from 'src/crypto/client/tonApiClient';
import axios from 'axios'
import { JettonBalance, JettonsBalances, JettonVerificationType } from 'tonapi-sdk-js';
import { fromNano } from 'src/crypto/utils/converter';
import { GetNativeTon } from 'src/crypto/utils/nativeTon';
import { Cache } from '@nestjs/cache-manager';

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
            const nativeTon = await GetNativeTon(id)
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


