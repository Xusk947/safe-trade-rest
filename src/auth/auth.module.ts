import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';
import { AuthService } from './services/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '24h' }
        })
    ],
    providers: [
        PrismaService,
        AuthService
    ]
})
export class AuthModule {}
