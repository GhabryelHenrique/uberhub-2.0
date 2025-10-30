// src/agent/agent.service.ts
import {
  Content,
  GenerativeModel,
  GoogleGenerativeAI
} from '@google/generative-ai';
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';
import { AgentsService } from 'src/agents/agents.service';

@Injectable()
export class ChatService implements OnModuleInit {
  private generativeModel: GenerativeModel;

  // Remova a Map: private chatSessions = new Map<string, ChatSession>();

  constructor(
    private configService: ConfigService,
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    private agentsService: AgentsService, // <-- INJETADO!
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const genAI = new GoogleGenerativeAI(apiKey as string);
    this.generativeModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
  }

  async run(prompt: string, sessionId: string, agentId: string): Promise<string> {
    // 1. Buscar histórico do banco de dados (lógica existente)
    const conversation = await this.conversationModel.findOne({ sessionId }).exec();
    let history: Content[] = conversation ? conversation.history : [];

    // 2. Se for uma nova conversa, buscar a persona do agente e injetá-la
    if (history.length === 0) {
      const agent = await this.agentsService.findOne(agentId);
      if (!agent) {
        throw new NotFoundException(`Agente com ID "${agentId}" não encontrado.`);
      }

      history = [
        { role: 'user', parts: [{ text: agent.persona }] },
        { role: 'model', parts: [{ text: 'Entendido. Estou pronto para começar.' }] },
      ];
    }

    const chat = this.generativeModel.startChat({ history });
    const result = await chat.sendMessage(prompt);
    const updatedHistory = await chat.getHistory();

    await this.conversationModel.findOneAndUpdate(
      { sessionId, agentId }, // Você pode adicionar agentId ao schema de conversas também!
      { history: updatedHistory },
      { upsert: true, new: true },
    ).exec();

    const response = result.response;
    return response.text();
  }
}