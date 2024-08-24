import { Module } from '@nestjs/common';
import { TelegramBotService } from './services/bot/bot.service';

@Module({
  providers: [TelegramBotService]
})
export class TelegramBotModule {}
