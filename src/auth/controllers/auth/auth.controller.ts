import { Controller, HttpStatus, Logger, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { JwtAuthGuard, Public } from 'src/auth/guards/jwt.auth.guard';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { TelegramBotService } from 'src/telegramBot/services/bot/bot.service';
import { stringToHex } from 'src/trade/services/trade/trade.service';
import { Markup } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { inlineKeyboard } from 'telegraf/typings/markup';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly telegramBotService: TelegramBotService

    ) { 
    }

    @Public()
    @Post('token/:userId')
    async getToken(@Param('userId') userId: string) {
        const user = await this.authService.validateUser(userId);
        if (!user) return {
            "status": HttpStatus.BAD_REQUEST,
            "statudCode": HttpStatus.BAD_REQUEST,
            "message": "User not found",
            "data": null
        };

        const data = await this.authService.sign(user);

        const link = stringToHex(`a-${data.access_token}-a`);

        const openAppButton = Markup.button.webApp('Login', `https://safe-trade.swapy.tg?tgWebAppStartParam=${link}`)
        const openAppButtonLocal = Markup.button.webApp('Login ( Local )', `https://tgbot.local?tgWebAppStartParam=${link}`)

        console.log(openAppButton.web_app)

        const sent = await this.telegramBotService.sendMessageWithInlineButtons(userId, "Verify your account", [[openAppButton, openAppButtonLocal]]);
        if (!sent) {
            return {
                "status": HttpStatus.CONFLICT,
                "statudCode": HttpStatus.CONFLICT,
                "message": "Telegram message not sent",
                "data": { error : "Telegram user blocked or bot has no permissions" }
            };
        }
        
        return {
            "status": HttpStatus.OK,
            "statudCode": HttpStatus.OK,
            "message": "Telegram message sent",
        }
    }

    @Post('verify')
    async verify(@Req() request: Request) {
        const token = this.extractTokenFromHeader(request);
        const isValid = await this.authService.verify(token);

        if (!isValid) {
            return {
                "status": HttpStatus.UNAUTHORIZED,
                "statudCode": HttpStatus.UNAUTHORIZED,
                "message": "Invalid token",
                "data": null
            };
        }

        return {
            "status": HttpStatus.OK,
            "statudCode": HttpStatus.OK,
            "message": "Token verified",
            "data": null
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
      }
}
