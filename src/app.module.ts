import { Logger, LoggerService, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { PrismaService } from "./prisma/services/prisma/prisma.service";
import { UserInfoModule } from "./user-info/user-info.module";
import { TradeModule } from './trade/trade.module';
import { FileModule } from './file/file.module';
import { CryptoModule } from './crypto/crypto.module';
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from "path";
import { SseService } from './sse/services/sse/sse/sse.service';
import { ScheduleModule } from "@nestjs/schedule";
import { DevtoolsModule } from "@nestjs/devtools-integration";
import { AuthModule } from './auth/auth.module';
import { TelegramBotModule } from './telegramBot/telegram.bot.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        DevtoolsModule.register({
            http: process.env.NODE_ENV == 'debug',
            port: Number(process.env.DEBUG_PORT)
        }),
        
        // ServeStaticModule.forRoot({
        //     rootPath: join(__dirname, '..', 'public'),
        //     exclude: ['/api/*'],
        // }),
        UserModule, UserInfoModule, TradeModule, FileModule, CryptoModule, AuthModule, TelegramBotModule],
    controllers: [AppController],
    providers: [AppService ]
})
export class AppModule implements NestModule {
    private readonly logger: Logger = new Logger(AppModule.name)
    
    configure(consumer: MiddlewareConsumer) {
        this.logger.log(`Configuring app module, ${process.env.NODE_ENV}`)    
    }
    
}
