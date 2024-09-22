import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';


const secondProgress = 0.0009
const referralSecondProgress = 0.0001
const maxFarmingTime = 60 * 60 * 8 // 8 hours

@Injectable()
export class FarmingService {
    private logger: Logger = new Logger(FarmingService.name);

    constructor(
        private readonly prisma: PrismaService
    ) { }

    private async getFarming(userId: bigint) {
        return await this.prisma.userFarming.upsert({
            where: {
                userId: userId
            },
            create: {
                userId: userId
            },
            update: {
                userId: userId
            }
        })
    }

    async incrementFarmingPoints(userId: bigint, points: number) {
        await this.prisma.userFarming.update({
            where: {
                userId: userId
            },
            data: {
                earnedPoints: {
                    increment: points
                }
            }
        })
    }

    async startFarming(userId: bigint, farmingTime: number) {
        let farmingData = await this.getFarming(userId);

        let points = farmingData.earnedPoints;
        const timeBefore = farmingData.lastFarmingTime.getTime();
        const timeNow = Date.now()

        const timeDiff = timeNow - timeBefore
        const time = Math.floor(timeDiff / 1000)
        const oldFarmingTime = farmingData.farmingTime
        // scale time to max 8 hours
        const timeScaled = Math.min(time, Math.min(oldFarmingTime, maxFarmingTime))


        const earnedPoints = timeScaled * secondProgress
        const referralEarnedPoints = timeScaled * referralSecondProgress

        points += earnedPoints

        this.logger.log(`Start farming for user ${userId} with time left: ${oldFarmingTime - timeScaled}`);

        const hasReferral = await this.addPointsToUserReferral(userId, referralEarnedPoints)

        await this.prisma.userFarming.update({
            where: {
                userId: userId
            },
            data: {
                earnedPoints: points,
                lastFarmingTime: new Date(Date.now()),
                farmingTime: Math.max(Math.min(farmingTime, maxFarmingTime), Math.min(farmingData.farmingTime + timeScaled, maxFarmingTime)),
                referralPoints: hasReferral ? farmingData.referralPoints + referralEarnedPoints : farmingData.referralPoints
            },
        })

        return {
            earnedPoints: Number(earnedPoints.toPrecision(5)),
            points: Number(points.toPrecision(5))
        }
    }

    async addPointsToUserReferral(userId: bigint, points: number) {
        const referral = await this.prisma.userReferrals.findUnique({
            where: {
                referralId: userId
            },
            select: {
                inviter: {
                    select: {
                        id: true,
                        UserFarming: {
                            select: {
                                earnedPoints: true
                            }
                        }
                    }
                }
            }
        })

        if (referral?.inviter) {
            await this.prisma.userFarming.upsert({
                where: {
                    userId: referral.inviter.id
                },
                create: {
                    userId: referral.inviter.id,
                    earnedPoints: points
                },
                update: {
                    earnedPoints: {
                        increment: points
                    }
                }
            })

            return true;
        }

        return false;
    }

    async getFarmingData(userId: bigint) {
        const farmingData = await this.getFarming(userId)

        const points = farmingData.earnedPoints
        const farmingTime = farmingData.farmingTime; // in seconds
        const timeBefore = farmingData.lastFarmingTime.getTime();
        const timeNow = Date.now()

        const timeDiff = timeNow - timeBefore
        const time = Math.floor(timeDiff / 1000)

        const timeScaled = Math.min(time, Math.min(farmingTime, maxFarmingTime))

        const earnedPoints = timeScaled * secondProgress
        const farmingProgress = (((farmingData.farmingTime / maxFarmingTime)) - (timeScaled / maxFarmingTime)) * 100

        this.logger.log(`Get farming data for user ${userId}, timeLeft ${farmingTime}`)

        return {
            farmingProgress: Number(farmingProgress.toPrecision(5)),
            earnedPoints: Number(earnedPoints.toPrecision(5)),
            points: Number(points.toPrecision(5))
        }
    }
}
