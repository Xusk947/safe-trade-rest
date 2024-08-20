import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { StartCommand } from './commands/start';

@Injectable()
export class BotService implements OnModuleInit {
    private logger = new Logger(BotService.name)
    private bot: Telegraf;

    async onModuleInit() {
        this.bot = new Telegraf(process.env.BOT_TOKEN)
        const me = await this.bot.telegram.getMe();

        StartCommand(this.bot);

        this.bot.start(() => {
            this.logger.log(`Bot ${me.first_name} started`)
        })
    }
}
