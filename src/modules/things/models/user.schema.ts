import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base/base.schema";

@Schema()
export class User extends BaseSchema {

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ default: '', required:true })
    fullName: string;

    @Prop({ required: false, unique: true })
    mobileNumber: number;

    @Prop({ default: 0 })
    isManager: number;

    @Prop({ default: 0 })
    isOwner: number;
}
export const UserSchema = SchemaFactory.createForClass(User);