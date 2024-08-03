import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';

@Injectable()
export class ReferralsService {
    private logger = new Logger(ReferralsService.name)
    
    constructor(
        private readonly prisma: PrismaService
    ) { }

    public async getReferralsByUserId(userId: number) {
        let refs = await this.prisma.userReferrals.findMany({
            where: {
                inviterId: Number(userId)
            },
            orderBy: {
                inviter: {
                    createdAt: 'desc'
                }
            },
            include: {
                referral: true,
            }
        })

        // const referralIds = referrals.map((referral) => referral.referral.id);

        let trades = await this.prisma.trade.findMany({
            where: {
                creatorId: { in: refs.map((referral) => referral.inviterId) },
                refTaxDone: false
            },
            include: {
                creator: true,
            }
        })

        const referrals = refs.map((referral) => {
            const tradesByReferral = trades.filter((trade) => Number(trade.creatorId) === Number(referral.referral.id));
            return {
                ...referral.referral,
                id: Number(referral.referral.id),
                trades: tradesByReferral
            };
        });
    
        return referrals
    }
}
