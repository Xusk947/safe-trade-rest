import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { stringToHex } from "./trade/services/trade/trade.service";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: true,
    });

    app.enableCors({
        allowedHeaders: ['content-type', 'authorization'],
        origin: true,
        methods: "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD",
        credentials: true,
    })

    await app.listen(process.env.PORT || 3000);
}

bootstrap();
