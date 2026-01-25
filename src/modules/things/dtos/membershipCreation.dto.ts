import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MembershipType } from '../enums/membership.enum';

export class CreateMembershipDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsEnum(MembershipType)
  type: MembershipType;

  @IsNotEmpty()
  @IsString()
  business: string;

  @IsArray()
  branches:string[]
}
