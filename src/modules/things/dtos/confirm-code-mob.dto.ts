import { IsEmail, IsString } from "class-validator";

export class ConfirmCodeMobileDto {
    @IsString()
    mobileNumber: string;

    @IsString()
    code: string;
}