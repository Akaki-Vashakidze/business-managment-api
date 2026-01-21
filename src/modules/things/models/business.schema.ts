import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base/base.schema";
import mongoose, { Types } from "mongoose";

@Schema()
export class Business extends BaseSchema {

    @Prop({ required: true })
    name: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    })
    owner: Types.ObjectId;

}

export const BusinessSchema = SchemaFactory.createForClass(Business);
