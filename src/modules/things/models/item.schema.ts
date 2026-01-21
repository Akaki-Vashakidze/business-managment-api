import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base/base.schema";
import mongoose, { Types } from "mongoose";

@Schema()
export class Item extends BaseSchema {

    @Prop({ required: true })
    name: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessBranch',
        required: true
    })
    branch: Types.ObjectId;

}

export const ItemSchema = SchemaFactory.createForClass(Item);
