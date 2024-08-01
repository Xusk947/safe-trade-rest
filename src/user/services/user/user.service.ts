import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/services/prisma/prisma.service";
import { Prisma, User } from "@prisma/client";

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService
    ) {
    }

    async user(
        userWhereUniqueInput: Prisma.UserWhereUniqueInput
    ): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: userWhereUniqueInput
        });
    }

    async createUser(data: Prisma.UserCreateInput) {
        let hasUser = await this.prisma.user.findUnique({
            where: {
                id: data.id
            }
        })

        if (hasUser) {
            return new HttpException("User already exists", 400)
        }

        return this.prisma.user.create(
            {
                data,
            }
        );
    }

    async updateUser(params: {
        where: Prisma.UserWhereUniqueInput,
        data: Prisma.UserUpdateInput
    }): Promise<User> {
        const { where, data } = params;
        return this.prisma.user.update({
            data,
            where
        });
    }

    async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
        return this.prisma.user.delete({
            where
        });
    }
}
