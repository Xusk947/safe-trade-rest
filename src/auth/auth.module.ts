import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';
import { AuthService } from './services/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth/auth.controller';
import { TelegramBotService } from 'src/telegramBot/services/bot/bot.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';


@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const key = config.get<string>('JWT_SECRET');

                return {
                    secret: `${key}`,
                    signOptions: { expiresIn: '24h' },
                }
            }
        }),
    ],
    providers: [
        AuthGuard,
        PrismaService,
        JwtStrategy,
        TelegramBotService,
        AuthService,
    ],
    controllers: [AuthController]
})
export class AuthModule {}
