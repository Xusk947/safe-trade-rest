import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    private logger = new Logger(PrismaService.name)
    private attempts = 0;

    async onModuleInit() {
        await this.connectToDb();
    }

    async connectToDb() {
        this.$connect().catch(async (e) => {
            this.attempts++;
            this.logger.error(e);
            this.logger.log(`Prisma connection attempt ${this.attempts}`);
            if (this.attempts > 10) {
                this.logger.error('Connection attempts exceeded');
                process.exit(1);
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
            this.connectToDb();
        }).then(() => {
            this.logger.log('Prisma connected');
        })
    }

}
