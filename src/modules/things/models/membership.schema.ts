import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base/base.schema";
import mongoose, { Types } from "mongoose";

@Schema()
export class Membership extends BaseSchema {

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ required: true })
  type: string; // MONTHLY_8

  @Prop({ required: true })
  remainingVisits: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true
  })
  business: Types.ObjectId;

  @Prop({
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
      default: []
  })
  branches: Types.ObjectId[];
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);
