import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base/base.schema";
import mongoose, { Types } from "mongoose";

@Schema()
export class User extends BaseSchema {

    @Prop({ required: true })
    password: string;

    @Prop({ required: false, unique: true })
    email: string;

    @Prop({ default: '', required:true })
    fullName: string;

    @Prop({ required: true, unique: true })
    mobileNumber: number;

    @Prop({ default: 0 })
    isManager: number;

    @Prop({ default: 0 })
    isOwner: number;

    @Prop({ required:false})
    isActiveAdmin: number;

    @Prop({ unique: true })
    qrCode: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    })
    business: Types.ObjectId;
}
export const UserSchema = SchemaFactory.createForClass(User);