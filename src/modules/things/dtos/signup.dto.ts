import { IsEmail, IsMongoId, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class SignupDto  {

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsEmail()
    email: string;

    @IsString()
    code: string;

    @IsString()
    fullName: string;

    @IsOptional()
    business: string;

    @IsString()
    mobileNumber: string;

}