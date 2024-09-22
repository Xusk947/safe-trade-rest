import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Task } from '@prisma/client';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';
import { ReferralsService } from '../referrals/referrals.service';
import { FarmingService } from '../farming/farming.service';

@Injectable()
export class TasksService {
    private logger: Logger = new Logger(TasksService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly referralsService: ReferralsService,
        private readonly farmingService: FarmingService,
    ) { }

    async getAllTasks() {
        return await this.prisma.task.findMany();
    }

    async getFinishedTasks(userId: bigint) {
        return await this.prisma.userTask.findMany({
            where: {
                userId: userId
            }
        })
    }

    async getUserTasks(userId: bigint) {
        const allTasks = await this.getAllTasks();
        const finishedTasks = await this.getFinishedTasks(userId);
        // sort tasks by category
        const tasks: Map<string, { finished: Array<Task>, unfinished: Array<Task> }> = new Map();

        for (let task of allTasks) {
            const finished = finishedTasks.filter((f) => f.taskId == task.id);

            if (tasks.has(task.category)) {
                const category = tasks.get(task.category);

                if (finished.length > 0) {
                    category.finished.push(task);
                } else {
                    category.unfinished.push(task);
                }
            } else {
                tasks.set(task.category, {
                    finished: finished.length > 0 ? [task] : [],
                    unfinished: finished.length == 0 ? [task] : []
                })
            }
        }

        return JSON.stringify(Array.from(tasks, ([category, tasks]) => ({ [category]: { ...tasks } })));
    }

    async finishTask(userId: bigint, taskId: number) {
        const task = await this.prisma.task.findUnique({
            where: {
                id: taskId
            }
        })

        if (task.condition.startsWith('r')) {
            const referrals = await this.referralsService.getReferralsByUserId(userId)
            const required = Number(task.condition.replace('r:', ''))

            if (referrals.length < required) {
                return {
                    success: false,
                    message: 'You need to have at least ' + required + ' referrals to complete this task',
                    status: HttpStatus.FORBIDDEN,
                    task: task
                };
            }
        }

        this.logger.log(`User ${userId} finished task ${taskId}`)

        await this.prisma.userTask.create({
            data: {
                userId: userId,
                taskId: taskId
            }
        })

        const points = task.points;
        await this.farmingService.incrementFarmingPoints(userId, points)

        return {
            success: true,
            message: 'Task completed',
            status: HttpStatus.OK,
            task: task
        }
    }
}
