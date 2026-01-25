import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base/base.schema";
import mongoose, { Types } from "mongoose";

@Schema()
export class Visit extends BaseSchema {

    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    membershipId: string;

    @Prop({ required: true })
    scannedBy: string; // staff userId

    @Prop({ default: Date.now })
    scannedAt: Date;
}

export const VisitSchema =
    SchemaFactory.createForClass(Visit);
