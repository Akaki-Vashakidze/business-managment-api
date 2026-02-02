import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base/base.schema";
import { Schema as MongooseSchema, Types } from 'mongoose';

@Schema()
export class ItemManagement extends BaseSchema {

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        required: false, // Changed from true to false
        default: null    // Explicitly set default to null
    })
    user?: Types.ObjectId | null;

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Item',
        required: true
    })
    item: Types.ObjectId;

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        required: true
    })
    acceptedBy: Types.ObjectId;

    @Prop({ required: true })
    startHour: number;

    @Prop({ required: true })
    startMinute: number;

    @Prop({ required: true })
    endHour: number;

    @Prop({ required: true })
    endMinute: number;

    @Prop({ type: Date, required: true })
    date: Date;

    @Prop({ default: 0 })
    isPaid: number;

    @Prop({ default: 0 })
    accepted: number;

}

export const ItemManagementSchema = SchemaFactory.createForClass(ItemManagement);
