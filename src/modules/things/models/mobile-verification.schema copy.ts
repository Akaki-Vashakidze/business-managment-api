import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class MobileVerification {

    @Prop({ required: true })
    mobileNumber: string;

    @Prop({ required: true })
    code: string;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ required: false })
    passwordExpire: Date;

}
export const MobileVerificationSchema = SchemaFactory.createForClass(MobileVerification);