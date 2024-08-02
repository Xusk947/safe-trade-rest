import { Controller, Get, Param } from '@nestjs/common';
import { TonApiClient } from 'src/crypto/client/tonApiClient';

@Controller('crypto')
export class CryptoController {
    @Get("account/:id/jetton") 
    async getAccount(@Param('id') id: string) {
        return TonApiClient.accounts.getAccountJettonsBalances(id)
    }
}
