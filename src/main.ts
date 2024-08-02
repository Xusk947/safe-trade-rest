import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
    console.log(process.env.PORT || 3000)
    
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
