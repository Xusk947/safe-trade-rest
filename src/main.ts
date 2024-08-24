import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { stringToHex } from "./trade/services/trade/trade.service";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: true,
        snapshot: true,
    });
    
    app.useStaticAssets(`${process.cwd()}/public`);
    app.enableCors({
        allowedHeaders: ['content-type', 'authorization'],
        origin: true,
        methods: "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD",
        credentials: true,
    })

    await app.listen(process.env.PORT || 3000);
}

async function main() {
    bootstrap();
    
}

main();