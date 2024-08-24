import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { AuthService } from "../services/auth/auth.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    
    constructor (
        private readonly configService: ConfigService,
    ) { 
        const key = configService.get<string>('JWT_SECRET')

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: key
        })
    }

    async validate (payload: any) {
        return { 
            userId: payload.sub , 
            username: payload.username, 
            firstname: payload.firstname,
            createdAt: payload.createdAt
        };
    }
}