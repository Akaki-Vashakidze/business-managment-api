import { IsString}  from "class-validator";

export class BusinessDto  {

    @IsString()
    name: string;

}