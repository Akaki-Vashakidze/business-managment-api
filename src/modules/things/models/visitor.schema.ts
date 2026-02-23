import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Visitor extends Document {
  @Prop({ required: true, unique: true, index: true })
  visitorId: string; // The primary ID (Cookie ID or Fingerprint)

  @Prop()
  fingerprint: string; // Server-side fallback hash

  @Prop()
  ip: string;

  @Prop()
  browser: string;

  @Prop()
  os: string;

  @Prop()
  deviceType: string;

  @Prop({ default: 1 })
  totalVisits: number;

  @Prop({ default: Date.now })
  lastVisit: Date;
}

export const VisitorSchema = SchemaFactory.createForClass(Visitor);