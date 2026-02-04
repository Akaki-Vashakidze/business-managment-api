import { Type } from "class-transformer";
import { IsDate, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";

export class ReserveItemUserDto  {

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

    @IsNumber()
    isPaid: number;

}