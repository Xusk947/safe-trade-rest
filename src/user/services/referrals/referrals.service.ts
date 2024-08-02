import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';

@Injectable()
export class ReferralsService {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    public async getReferralsByUserId(userId: number) {
        let referrals = await this.prisma.userReferrals.findMany({
            where: {
                inviterId: userId
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

        const referralIds = referrals.map((referral) => referral.referral.id);

        let trades = await this.prisma.trade.findMany({
            where: {
                creatorId: { in: referrals.map((referral) => referral.inviterId) },
                refTaxDone: false
            },
            include: {
                creator: true,
            }
        })

        const processedReferrals = referrals.map((referral) => {
            const tradesByReferral = trades.filter((trade) => trade.creatorId === referral.referral.id);
            return {
                ...referral.referral,
                trades: tradesByReferral
            };
        });
    
        return processedReferrals
    }
}
