// src/agent/agent.controller.ts
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ChatService } from './chat.service';

// DTO (Data Transfer Object) para validação do corpo da requisição
class AgentPromptDto {
  prompt: string;
  sessionId?: string; // sessionId é opcional
  agentId: string;
}


@Controller('chat')
export class ChatController {
  constructor(private readonly agentService: ChatService) {}

@Post()
@HttpCode(HttpStatus.OK)
async handleAgentPrompt(@Body() agentPromptDto: AgentPromptDto) {
  const { prompt, agentId } = agentPromptDto; // <-- Pega o agentId
  const sessionId = agentPromptDto.sessionId || randomUUID();
  // Passa o agentId para o serviço
  const response = await this.agentService.run(prompt, sessionId, agentId);
  return { response, sessionId };
}
}