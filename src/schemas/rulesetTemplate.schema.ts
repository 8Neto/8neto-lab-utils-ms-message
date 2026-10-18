import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class RulesetTemplate {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  content: Record<string, unknown>;
}

export const RulesetTemplateSchema =
  SchemaFactory.createForClass(RulesetTemplate);
