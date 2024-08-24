import { Markup, Telegraf } from "telegraf";
import { Logger } from "@nestjs/common";

export function StartCommand(bot: Telegraf) {
    bot.command('start', (ctx) => {
        ctx.reply(
            'Hello!',
            Markup.inlineKeyboard([
                Markup.button.webApp('Open Web App', `https://safe-trade.swapy.tg/`),
                Markup.button.webApp('( tgbot.local )', `https://tgbot.local/`),
            ])
        );
    })
}