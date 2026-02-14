import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Visitor extends Document {
  @Prop({ required: true, unique: true })
  fingerprint: string; // Hash of IP + UserAgent

  @Prop()
  ip: string;

  @Prop()
  browser: string;

  @Prop()
  os: string;

  @Prop()
  deviceType: string; // mobile, tablet, or desktop

  @Prop({ default: Date.now })
  lastVisit: Date;
}

export const VisitorSchema = SchemaFactory.createForClass(Visitor);