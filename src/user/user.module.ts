import { Module } from "@nestjs/common";
import { UserService } from "./services/user/user.service";
import { UserController } from "./controllers/user/user.controller";
import { PrismaService } from "../prisma/services/prisma/prisma.service";

@Module({
    providers: [UserService, PrismaService],
    controllers: [UserController]
})
export class UserModule {
}
