import { Markup, Telegraf } from "telegraf";
import { Logger } from "@nestjs/common";

export function StartCommand(bot: Telegraf) {
    bot.command('start', (ctx) => {
        ctx.reply(
            'Hello!',
            Markup.keyboard([
                Markup.button.webApp('Open Web App', `https://app.safe-trade-swapy.tg/`),
                Markup.button.webApp('( Local App )', `https://tgbot.local/`),
            ])
        );
    })
}