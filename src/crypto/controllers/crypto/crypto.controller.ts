import { Controller, Get, Logger, Param } from '@nestjs/common';
import { TonApiClient } from 'src/crypto/client/tonApiClient';
import { CryptoService } from 'src/crypto/services/crypto/crypto.service';

@Controller('crypto')
export class CryptoController {
    private logger = new Logger(CryptoController.name)

    constructor(
        private cryptoService: CryptoService
    ) { }

    @Get("account/:id/jetton") 
    async getAccount(@Param('id') id: string) {
        this.logger.log(`Get account ${id} jettons`)    
        return this.cryptoService.getAccountJettons(id)
    }

    @Get("account/:id/nfts")
    async getAccountNfts(@Param('id') id: string) {
        this.logger.log(`Get account ${id} nft items`)    
        return this.cryptoService.getAccountNfts(id)
    }
}
