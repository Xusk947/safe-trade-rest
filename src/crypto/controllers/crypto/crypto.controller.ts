import { Controller, Get, Logger, Param } from '@nestjs/common';
import { TonApiClient } from 'src/crypto/client/tonApiClient';

@Controller('crypto')
export class CryptoController {
    private logger = new Logger(CryptoController.name)

    @Get("account/:id/jetton") 
    async getAccount(@Param('id') id: string) {
        this.logger.log(`Get account ${id} jettons balances`)    
        let response = await TonApiClient.accounts.getAccountJettonsBalances(id)


        return response.balances
    }
}
