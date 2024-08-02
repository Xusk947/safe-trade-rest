import { Injectable, Logger } from '@nestjs/common';
import { TonApiClient } from 'src/crypto/client/tonApiClient';

@Injectable()
export class CryptoService {
    private logger = new Logger(CryptoService.name)
    
    async getAccountJettons(id: string) {
        return await TonApiClient.accounts.getAccountJettonsBalances(id)
    }

    async getAccountNfts(id: string) {
        return await TonApiClient.accounts.getAccountNftItems(id)
    }
}
