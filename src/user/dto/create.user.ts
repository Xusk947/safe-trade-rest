export class CreateUserDto {
    id: bigint | number;
    firstname: string;
    lastname?: string | null
    username?: string | null;
    language: string;
    is_premium: boolean;
    referral?: bigint | number;
}