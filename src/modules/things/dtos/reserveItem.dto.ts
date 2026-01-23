import { Type } from "class-transformer";
import { IsDate, IsNumber, IsString } from "class-validator";

export class ReserveItemDto  {

    @IsNumber()
    startHour: number;

    @IsNumber()
    startMinute: number;

    @IsNumber()
    endHour: number;

    @IsNumber()
    endMinute: number;

    @IsDate()
    @Type(() => Date) 
    date: Date;

    @IsString()
    item: string;

    @IsString()
    user: string;

    @IsNumber()
    isPaid: number;

}