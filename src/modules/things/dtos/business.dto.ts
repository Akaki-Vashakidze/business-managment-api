import { IsEmail, IsString, Matches, MinLength } from "class-validator";

export class BusinessDto  {

    @IsString()
    name: string;

}