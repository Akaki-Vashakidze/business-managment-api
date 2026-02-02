import { Type } from "class-transformer";
import { IsDate, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";

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

    @IsOptional()
    @IsMongoId()
    user?: string | null;

    @IsNumber()
    isPaid: number;

}