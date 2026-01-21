import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base/base.schema";
import mongoose, { Types } from "mongoose";

@Schema()
export class ReservedTime extends BaseSchema {

    @Prop({ required: true })
    fromHour: number;

    @Prop({ required: true })
    fromMinute: number;

    @Prop({ required: true })
    toHour: number;

    @Prop({ required: true })
    toMinute: number;

    @Prop({ required: true })
    date: Date;

    @Prop({ default: false })
    paid: number;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    })
    item: Types.ObjectId;

}

export const ReservedTimeSchema = SchemaFactory.createForClass(ReservedTime);
