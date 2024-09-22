import { Body, Controller, Get, Logger, Param, Post } from "@nestjs/common";
import { UserService } from "../../services/user/user.service";
import { CreateUserDto } from "../../dto/create.user";
import { ReferralsService } from "src/user/services/referrals/referrals.service";
import { FarmingService } from "src/user/services/farming/farming.service";
import { StartFarmingDto } from "src/user/dto/start.farming";
import { TasksService } from "src/user/services/tasks/tasks.service";

@Controller("user")
export default class UserController {

    constructor(
        private readonly userService: UserService,
        private readonly referralsService: ReferralsService,
        private readonly farmingService: FarmingService,
        private readonly userTasksService: TasksService,
    ) {
    }

    @Post()
    async createUser(@Body() data: CreateUserDto) {
        return await this.userService.createUser({
            firstname: data.firstname,
            lastname: data.lastname,
            username: data.username,
            language: data.language,
            is_premium: data.is_premium,
            id: data.id,
            referral: data.referral,
            photo_url: data.photo_url
        });
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

    @Post("farming/start/:id")
    async startFarming(@Param('id') id: bigint, @Body() data: StartFarmingDto) {
        return await this.farmingService.startFarming(id, data.farmingTime)
    }

    @Get("farming/:id")
    async getFarming(@Param('id') id: bigint) {
        return await this.farmingService.getFarmingData(id)
    }

    @Get("tasks/all")
    async getAllTasks() {
        return await this.userTasksService.getAllTasks()
    }

    @Get("tasks/:id")
    async getUserTasks(@Param('id') id: bigint) {
        return await this.userTasksService.getUserTasks(id)
    }

    @Post("tasks/:userId/:taskId")
    async finishTask(@Param('userId') userId: bigint, @Param('taskId') taskId: number) {
        return await this.userTasksService.finishTask(userId, Number(taskId))
    }
}
