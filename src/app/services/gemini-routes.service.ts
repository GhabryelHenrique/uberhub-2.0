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
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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
    const maxStops = criteria.maxStops || 10;

    // Limit startups sent to AI to control token count — prefer variety by setor
    const capped = startups.slice(0, 150);
    const startupsData = capped.map((s, idx) => ({
      id: idx,
      n: s.nome,
      st: s.segmento_copy || s.setor_principal || '',
      lat: s.latitude,
      lng: s.longitude
    }));

    const priorityMap: Record<string, string> = {
      distance: 'Minimize total travel distance.',
      sector: `Focus on sectors: ${criteria.sectors?.join(', ')}.`,
      phase: `Focus on phases: ${criteria.phases?.join(', ')}.`,
      balanced: 'Balance distance, sector diversity and startup phases.'
    };

    return `Crie uma rota otimizada de visitação com ${maxStops} startups do ecossistema de inovação de Uberlândia.

Prioridade: ${priorityMap[criteria.priority]}
Startups (id,nome,setor,lat,lng): ${JSON.stringify(startupsData)}

Responda APENAS com JSON válido, sem markdown, em português do Brasil:
{"route":[{"startupId":0,"order":1,"reason":"motivo breve em pt-BR"}],"description":"resumo da rota em pt-BR","totalDistance":"X km","estimatedTime":"X horas","highlights":["destaque 1","destaque 2"],"optimizationCriteria":"critério utilizado em pt-BR"}`;
  }

  /**
   * Constrói prompt para rotas temáticas
   */
  private buildThematicRoutePrompt(
    startups: Startup[],
    theme: string
  ): string {
    const capped = startups.slice(0, 150);
    const startupsData = capped.map((s, idx) => ({
      id: idx,
      n: s.nome,
      st: s.segmento_copy || s.setor_principal || '',
      lat: s.latitude,
      lng: s.longitude
    }));

    return `Crie 3 rotas temáticas de visitação às startups de Uberlândia sobre o tema: "${theme}".

Startups (id,nome,setor,lat,lng): ${JSON.stringify(startupsData)}

Rotas: 1=Iniciante (5 paradas), 2=Especializada (6 paradas), 3=Inovadora (5 paradas).

Responda APENAS com JSON válido em português do Brasil:
{"routes":[{rota com mesmo schema da rota individual},{...},{...}]}`;
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
            maxOutputTokens: 4096,
            thinkingConfig: { thinkingBudget: 0 }
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
    const capped = startups.slice(0, 150);
    const startupsData = capped.map((s, idx) => ({
      id: idx,
      n: s.nome,
      st: s.segmento_copy || s.setor_principal || '',
      lat: s.latitude,
      lng: s.longitude
    }));

    const systemPrompt = `Crie uma rota de visitação às startups de Uberlândia com base no pedido do usuário.

Pedido: "${prompt}"
Startups (id,nome,setor,lat,lng): ${JSON.stringify(startupsData)}

Selecione 5-7 startups (ou a quantidade pedida), ordene geograficamente e responda APENAS com JSON válido em português do Brasil:
{"route":[{"startupId":0,"order":1,"reason":"motivo em pt-BR"}],"description":"resumo da rota em pt-BR","totalDistance":"X km","estimatedTime":"X horas","highlights":["destaque 1","destaque 2","destaque 3"],"optimizationCriteria":"como o pedido foi interpretado em pt-BR"}`;

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
            maxOutputTokens: 4096,
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
