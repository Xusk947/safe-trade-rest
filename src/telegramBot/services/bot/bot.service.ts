import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { StartCommand } from './commands/start';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

let launched = false;

@Injectable()
export class TelegramBotService implements OnModuleInit {
    private logger = new Logger(TelegramBotService.name)
    private bot: Telegraf;

    async onModuleInit() {
        this.bot = new Telegraf(process.env.BOT_TOKEN)
        const me = await this.bot.telegram.getMe();

        StartCommand(this.bot);

        if (!launched) {
            launched = true;
            this.bot.launch(() => {
                this.logger.log(`Bot ${me.first_name} started`)
            })
        } 
    }

    async sendMessage(userId: string, message: string) {
        try {
            this.bot.telegram.sendMessage(userId, message);
            return true;
        } catch (e) {
            this.logger.error(e)
            return false;
        }
    }

    async sendMessageWithInlineButtons(userId: string, message: string, buttons: InlineKeyboardButton[][]) {
        try {
            this.bot.telegram.sendMessage(userId, message, {
                reply_markup: {
                    inline_keyboard: buttons
                }
            });
            return true;
        } catch (e) {
            this.logger.error(e)
            return false;
        }
    }
}
