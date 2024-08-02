import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UserService } from "../../services/user/user.service";
import { CreateUserDto } from "../../dto/create.user";
import { ReferralsService } from "src/user/services/referrals/referrals.service";

@Controller("user")
export class UserController {

    constructor(
        private readonly userService: UserService,
        private readonly referralsService: ReferralsService
    ) {
    }

    @Post()
    async createUser(@Body() data: CreateUserDto) {
        return await this.userService.createUser(data);
    }

    @Get(":id")
    async getUser(@Param('id') id: number) {
        return await this.userService.user({
            id
        });
    }

    @Get("referrals/:id")
    async getReferrals(@Param('id') id: number) {
        return await this.referralsService.getReferralsByUserId(id)
    }
}
