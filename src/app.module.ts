import { Module } from "@nestjs/common";
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

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        // ServeStaticModule.forRoot({
        //     rootPath: join(__dirname, '..', 'public'),
        //     exclude: ['/api/*'],
        // }),
        ScheduleModule.forRoot(),
        UserModule, UserInfoModule, TradeModule, FileModule, CryptoModule],
    controllers: [AppController],
    providers: [AppService, PrismaService, SseService]
})
export class AppModule {
}
