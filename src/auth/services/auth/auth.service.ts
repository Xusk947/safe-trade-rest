import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor (
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
    ) { }

    async validateUser(userId: string | number | bigint): Promise<User | null> {
        let user = await this.prisma.user.findUnique({
            where: {
                id: BigInt(userId)
            }
        });

        return user;
    }

    async verify(token: string) {
        return await this.jwtService.verify(token)
    }

    async sign(user: User) {
        const payload = {
            sub: user.id,
            firstname: user.firstname,
            createdAt: user.createdAt.toISOString(),
        };

        return {
            access_token: this.jwtService.sign(payload)
        }
    }
}
