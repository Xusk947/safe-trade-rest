import { HttpException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../../prisma/services/prisma/prisma.service";
import { Prisma, User } from "@prisma/client";

@Injectable()
export class UserService {
    private logger = new Logger(UserService.name)

    constructor(
        private readonly prisma: PrismaService
    ) {
    }

    async user(
        userWhereUniqueInput: Prisma.UserWhereUniqueInput
    ): Promise<User | null> {
        let user = this.prisma.user.findUnique({
            where: userWhereUniqueInput
        });

        this.logger.log(`Found user ${user}`)

        return user
    }

    async createUser(data: Prisma.UserCreateInput & { referral?: number | bigint }) {
        let hasUser = await this.prisma.user.findUnique({
            where: {
                id: data.id
            }
        })

        if (hasUser) {
            return new HttpException("User already exists", 409)
        }

        let newUser: { id: number | BigInt; firstname: string; lastname: string | null; username: string | null; language: string; is_premium: boolean; createdAt: Date; };

        try {
            newUser = await this.prisma.user.create(
                {
                    data: {
                        firstname: data.firstname,
                        lastname: data.lastname,
                        username: data.username,
                        language: data.language,
                        is_premium: data.is_premium,
                        id: data.id
                    },
                }
            );
        } catch (error) {
            Logger.error(`Error while creating user ${error} ${data.id} - ${data.firstname} ${data.username}`)
            return new HttpException(error, 500)
        }
        

        if (data.referral && data.referral != data.id) {
            let ref = data.referral

            await this.prisma.userReferrals.create({
                data: {
                    inviterId: Number(ref),
                    referralId: data.id
                }
            })
        }

        this.logger.log(`Created user ${newUser} ${(data.referral && data.referral != data.id) ? 'with referral ' + data.referral : ''}`)

        return newUser
    }

    async updateUser(params: {
        where: Prisma.UserWhereUniqueInput,
        data: Prisma.UserUpdateInput
    }): Promise<User> {
        const { where, data } = params;
        let updatedUser = this.prisma.user.update({
            data,
            where
        });

        this.logger.log(`Updated user ${updatedUser}`)

        return updatedUser
    }

    async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
        return this.prisma.user.delete({
            where
        });
    }
}
