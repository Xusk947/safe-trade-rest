import { Module } from "@nestjs/common";
import { UserService } from "./services/user/user.service";
import { UserController } from "./controllers/user/user.controller";
import { PrismaService } from "../prisma/services/prisma/prisma.service";
import { ReferralsService } from './services/referrals/referrals.service';

@Module({
    providers: [UserService, PrismaService, ReferralsService],
    controllers: [UserController]
})
export class UserModule {
}
