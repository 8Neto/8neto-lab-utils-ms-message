import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GithubCredentialDocument = HydratedDocument<GithubCredential>;

@Schema()
export class GithubCredential {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  token: string;
}

export const GithubCredentialSchema =
  SchemaFactory.createForClass(GithubCredential);
