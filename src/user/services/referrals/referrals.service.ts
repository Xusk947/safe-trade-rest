import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';
import '../../../extensions/bigintExtensions'

@Injectable()
export class ReferralsService {
    private logger = new Logger(ReferralsService.name)
    
    constructor(
        private readonly prisma: PrismaService
    ) { }

    public async getReferralsByUserId(userId: number | bigint) {
        let refs = await this.prisma.userReferrals.findMany({
            where: {
                inviterId: userId
            },
            orderBy: {
                inviter: {
                    createdAt: 'asc'
                }
            },
            include: {
                referral: {
                    include: {
                        UserFarming: true
                    }    
                },
            },
        })


        let trades = await this.prisma.trade.findMany({
            where: {
                creatorId: { in: refs.map((referral) => referral.inviterId) },
                NOT: [{ TradePayment: { none: {} } }]
            },
            include: {
                creator: true,
            },
        })

        const referrals = refs.map((referral) => {
            const tradesByReferral = trades.filter((trade) => {
                return trade.creatorId == referral.referral.id
            });
            return {
                ...referral.referral,
                id: referral.referral.id,
                trades: tradesByReferral,
                referralPoints: referral.referral.UserFarming?.referralPoints ?? 0
            };
        });

        this.logger.log(`Get ${referrals.length} referrals for user ${userId}`)

        // sort by amount of trades, then by amount of points to bottom
        return referrals.sort((a, b) => {
            if (a.trades.length < b.trades.length) {
                return 1
            }
            if (a.trades.length > b.trades.length) {
                return -1
            }
            if (a.referralPoints < b.referralPoints) {
                return 1
            }
            if (a.referralPoints > b.referralPoints) {
                return -1
            }
            return 0
        })
    }
}
