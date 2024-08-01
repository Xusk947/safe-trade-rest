import { Module } from "@nestjs/common";
import { UserInfoService } from "./services/user-info/user-info.service";
import { UserInfoController } from "./controllers/user-info/user-info.controller";

@Module({
    providers: [UserInfoService],
    controllers: [UserInfoController]
})
export class UserInfoModule {
}
