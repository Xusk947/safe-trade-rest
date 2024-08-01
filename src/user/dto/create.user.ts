export class CreateUserDto {
    id: number;
    firstname: string;
    lastname?: string | null
    username?: string | null;
    language: string;
    is_premium: boolean;
}