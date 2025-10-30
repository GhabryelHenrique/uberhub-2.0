import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { Startup } from './startups.service';

// Interface para resposta de rota
export interface RouteResponse {
  route: RoutePoint[];
  description: string;
  totalDistance: string;
  estimatedTime: string;
  highlights: string[];
  optimizationCriteria: string;
}

export interface RoutePoint {
  startup: Startup;
  order: number;
  reason: string;
}

// Interface para a resposta da API (antes de mapear startupId para startup)
export interface RoutePointAPI {
  startupId: number;
  order: number;
  reason: string;
}

export interface RouteResponseAPI {
  route: RoutePointAPI[];
  description: string;
  totalDistance: string;
  estimatedTime: string;
  highlights: string[];
  optimizationCriteria: string;
}

// Interface para critérios de otimização
export interface RouteOptimizationCriteria {
  priority: 'distance' | 'sector' | 'phase' | 'balanced';
  sectors?: string[];
  phases?: string[];
  maxStops?: number;
  startLocation?: { lat: number; lng: number };
}

@Injectable({
  providedIn: 'root'
})
export class GeminiRoutesService {
  private apiKey: string;
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  constructor(private http: HttpClient) {
    this.apiKey = environment.GEMINI_API_KEY;
  }

  /**
   * Gera uma rota otimizada usando IA
   */
  generateOptimizedRoute(
    startups: Startup[],
    criteria: RouteOptimizationCriteria
  ): Observable<RouteResponse> {
    const prompt = this.buildRoutePrompt(startups, criteria);

    return from(this.callGeminiAPI(prompt));
  }

  /**
   * Sugere rotas temáticas baseadas em setores
   */
  suggestThematicRoutes(
    startups: Startup[],
    theme: string
  ): Observable<RouteResponse[]> {
    const prompt = this.buildThematicRoutePrompt(startups, theme);

    return from(this.callGeminiAPIForMultipleRoutes(prompt));
  }

  /**
   * Constrói o prompt para geração de rota otimizada
   */
  private buildRoutePrompt(
    startups: Startup[],
    criteria: RouteOptimizationCriteria
  ): string {
    const startupsData = startups.map((s, idx) => ({
      id: idx,
      nome: s.nome,
      setor: s.segmento_copy || s.setor_principal,
      fase: s.fase_startup,
      latitude: s.latitude,
      longitude: s.longitude,
      endereco: s.endereco,
      solucao: s.solucao,
      publico_alvo: s.publico_alvo
    }));

    let priorityDescription = '';
    switch (criteria.priority) {
      case 'distance':
        priorityDescription = 'Priorize a menor distância total entre as startups, criando uma rota geograficamente eficiente.';
        break;
      case 'sector':
        priorityDescription = `Priorize startups dos setores: ${criteria.sectors?.join(', ')}. Agrupe startups do mesmo setor quando possível.`;
        break;
      case 'phase':
        priorityDescription = `Priorize startups nas fases: ${criteria.phases?.join(', ')}. Crie uma jornada que mostre a evolução das startups.`;
        break;
      case 'balanced':
        priorityDescription = 'Crie uma rota balanceada considerando distância, diversidade de setores e fases das startups.';
        break;
    }

    return `Você é um especialista em criar rotas de visitação para ecossistemas de inovação. Sua tarefa é criar uma rota otimizada para visitar startups em Uberlândia.

**Contexto:**
- Estamos criando rotas interativas para o UberHub, mapa de inovação de Uberlândia
- As rotas devem ser educativas, eficientes e interessantes
- Cada rota deve contar uma história sobre o ecossistema de inovação local

**Dados das Startups:**
${JSON.stringify(startupsData, null, 2)}

**Critérios de Otimização:**
- ${priorityDescription}
- Número máximo de paradas: ${criteria.maxStops || 10}
${criteria.startLocation ? `- Ponto de partida: ${criteria.startLocation.lat}, ${criteria.startLocation.lng}` : ''}

**Instruções:**
1. Analise todas as startups disponíveis
2. Selecione as startups mais relevantes baseado nos critérios
3. Ordene as startups criando uma rota lógica e eficiente
4. Para cada startup na rota, explique por que ela foi incluída

**Formato de Resposta (JSON):**
{
  "route": [
    {
      "startupId": 0,
      "order": 1,
      "reason": "Razão para incluir esta startup nesta posição"
    }
  ],
  "description": "Descrição geral da rota e seu propósito",
  "totalDistance": "Estimativa de distância total (ex: '15 km')",
  "estimatedTime": "Tempo estimado de visitação (ex: '4 horas')",
  "highlights": [
    "Destaque 1 da rota",
    "Destaque 2 da rota"
  ],
  "optimizationCriteria": "Resumo do critério usado na otimização"
}

Responda APENAS com o JSON, sem texto adicional.`;
  }

  /**
   * Constrói prompt para rotas temáticas
   */
  private buildThematicRoutePrompt(
    startups: Startup[],
    theme: string
  ): string {
    const startupsData = startups.map((s, idx) => ({
      id: idx,
      nome: s.nome,
      setor: s.segmento_copy || s.setor_principal,
      fase: s.fase_startup,
      latitude: s.latitude,
      longitude: s.longitude,
      solucao: s.solucao
    }));

    return `Você é um curador de experiências de inovação. Crie 3 rotas temáticas diferentes para visitar startups em Uberlândia.

**Tema Solicitado:** ${theme}

**Dados das Startups:**
${JSON.stringify(startupsData, null, 2)}

**Instruções:**
Crie 3 rotas com diferentes abordagens:
1. Rota Iniciante: Para quem está começando a conhecer o ecossistema
2. Rota Especializada: Focada profundamente no tema
3. Rota Inovadora: Startups mais disruptivas e em estágio avançado

Para cada rota, use o mesmo formato JSON da função anterior.

**Formato de Resposta:**
{
  "routes": [
    { /* Rota 1 */ },
    { /* Rota 2 */ },
    { /* Rota 3 */ }
  ]
}

Responda APENAS com o JSON, sem texto adicional.`;
  }

  /**
   * Chama a API do Gemini
   */
  private async callGeminiAPI(prompt: string): Promise<RouteResponse> {
    try {
      console.log('🤖 [Gemini] Gerando rota otimizada...');

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API Gemini: ${response.statusText}`);
      }

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;

      // Remove markdown code blocks se existirem
      const cleanedResponse = textResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsedResponse = JSON.parse(cleanedResponse);

      console.log('✅ [Gemini] Rota gerada com sucesso!');

      return parsedResponse;
    } catch (error) {
      console.error('❌ [Gemini] Erro ao gerar rota:', error);
      throw error;
    }
  }

  /**
   * Chama a API para múltiplas rotas
   */
  private async callGeminiAPIForMultipleRoutes(prompt: string): Promise<RouteResponse[]> {
    try {
      console.log('🤖 [Gemini] Gerando rotas temáticas...');

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API Gemini: ${response.statusText}`);
      }

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;

      const cleanedResponse = textResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsedResponse = JSON.parse(cleanedResponse);

      console.log('✅ [Gemini] Rotas temáticas geradas com sucesso!');

      return parsedResponse.routes || [];
    } catch (error) {
      console.error('❌ [Gemini] Erro ao gerar rotas temáticas:', error);
      throw error;
    }
  }

  /**
   * Explica por que uma rota foi criada desta forma
   */
  async explainRoute(route: RouteResponse, startups: Startup[]): Promise<string> {
    const routeStartups = route.route.map(rp => {
      const startup = startups.find((s, idx) => idx === rp.order - 1);
      return {
        nome: startup?.nome,
        setor: startup?.segmento_copy || startup?.setor_principal,
        fase: startup?.fase_startup
      };
    });

    const prompt = `Explique de forma educativa e envolvente por que esta rota de visitação foi criada:

**Rota:**
${JSON.stringify(routeStartups, null, 2)}

**Descrição Original:**
${route.description}

**Instruções:**
- Explique a lógica por trás da ordem das visitas
- Destaque os aprendizados que o visitante terá
- Mencione as conexões entre as startups
- Use uma linguagem inspiradora e educativa
- Máximo de 3 parágrafos

Responda em texto corrido, não em JSON.`;

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Erro ao explicar rota:', error);
      return route.description;
    }
  }

  /**
   * Processa um prompt em linguagem natural e gera uma rota
   */
  async generateRouteFromPrompt(
    prompt: string,
    startups: Startup[]
  ): Promise<RouteResponseAPI> {
    const startupsData = startups.map((s, idx) => ({
      id: idx,
      nome: s.nome,
      setor: s.segmento_copy || s.setor_principal,
      fase: s.fase_startup,
      latitude: s.latitude,
      longitude: s.longitude,
      endereco: s.endereco,
      solucao: s.solucao,
      publico_alvo: s.publico_alvo,
      colaboradores: s.colaboradores
    }));

    const systemPrompt = `Você é um assistente especializado em criar rotas de visitação para o ecossistema de startups de Uberlândia.

**Sua tarefa:**
Analise o pedido do usuário e crie uma rota otimizada de visitação às startups.

**Dados das Startups Disponíveis:**
${JSON.stringify(startupsData, null, 2)}

**Pedido do Usuário:**
"${prompt}"

**Instruções:**
1. Interprete o pedido do usuário identificando:
   - Número de startups desejadas
   - Região/localização preferida (centro, bairro específico, etc)
   - Setor de interesse (se mencionado)
   - Fase das startups (se mencionado)
   - Qualquer outro critério específico

2. Selecione as startups mais adequadas baseado nos critérios identificados

3. Ordene as startups criando uma rota geograficamente eficiente

4. Se o usuário não especificar quantidade, sugira entre 5-7 startups

5. Se o usuário mencionar uma região mas você não tiver dados precisos de bairros,
   use as coordenadas para identificar startups próximas geograficamente

**Formato de Resposta (JSON):**
{
  "route": [
    {
      "startupId": 0,
      "order": 1,
      "reason": "Razão para incluir esta startup (mencione como atende ao critério do usuário)"
    }
  ],
  "description": "Descrição da rota explicando como ela atende ao pedido do usuário",
  "totalDistance": "Estimativa de distância total (ex: '8 km')",
  "estimatedTime": "Tempo estimado de visitação (ex: '3 horas')",
  "highlights": [
    "Destaque 1 da rota",
    "Destaque 2 da rota",
    "Destaque 3 da rota"
  ],
  "optimizationCriteria": "Resumo de como você interpretou e atendeu o pedido do usuário"
}

Responda APENAS com o JSON, sem texto adicional.`;

    try {
      console.log('🤖 [Gemini] Processando prompt do usuário:', prompt);

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API Gemini: ${response.statusText}`);
      }

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;

      // Remove markdown code blocks se existirem
      const cleanedResponse = textResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsedResponse = JSON.parse(cleanedResponse);

      console.log('✅ [Gemini] Rota gerada a partir do prompt!');

      return parsedResponse;
    } catch (error) {
      console.error('❌ [Gemini] Erro ao processar prompt:', error);
      throw error;
    }
  }
}
