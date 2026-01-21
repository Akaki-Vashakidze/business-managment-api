import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base/base.schema";
import mongoose, { Types } from "mongoose";

@Schema()
export class BusinessBranch extends BaseSchema {

    @Prop({ required: true })
    name: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    })
    business: Types.ObjectId;

}

export const BusinessBranchSchema = SchemaFactory.createForClass(BusinessBranch);
