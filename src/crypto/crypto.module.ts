import { Module } from '@nestjs/common';
import { CryptoController } from './controllers/crypto/crypto.controller';
import { CryptoService } from './services/crypto/crypto.service';

@Module({
  controllers: [CryptoController],
  providers: [CryptoService]
})
export class CryptoModule {}
