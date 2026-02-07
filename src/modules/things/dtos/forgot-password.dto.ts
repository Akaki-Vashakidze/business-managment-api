import { IsNumber } from "class-validator";

export class ForgotPasswordDto {
    @IsNumber()
    mobileNumber: string;
}