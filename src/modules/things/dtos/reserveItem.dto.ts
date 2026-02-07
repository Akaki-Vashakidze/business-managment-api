import { Type } from "class-transformer";
import { IsDate, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";
import { ObjectId } from "mongodb";

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
    branchId: ObjectId;

    @IsOptional()
    @IsMongoId()
    user?: string | null;

    @IsNumber()
    isPaid: number;

}