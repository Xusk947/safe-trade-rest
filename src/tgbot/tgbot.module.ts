import { Module } from '@nestjs/common';
import { BotService } from './services/bot/bot.service';

@Module({
  providers: [BotService]
})
export class TgbotModule {}
