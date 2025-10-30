// src/agent/schemas/conversation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { Content } from '@google/generative-ai';

// Este tipo é exportado para uso nos nossos serviços
export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true }) // timestamps adiciona createdAt e updatedAt automaticamente
export class Conversation {
  @Prop({ required: true, unique: true, index: true })
  sessionId: string;

  @Prop({ required: true, unique: true, index: true })
  agentId: string;

  // Armazenaremos o histórico completo aqui.
  // O tipo 'any' é usado porque a estrutura de Content é complexa,
  // mas o Mongoose lidará com o array de objetos corretamente.
  @Prop({ type: Array, required: true })
  history: Content[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);