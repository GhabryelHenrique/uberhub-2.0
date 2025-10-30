// src/agent/agent.module.ts
import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { AgentsModule } from 'src/agents/agents.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    AgentsModule
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}