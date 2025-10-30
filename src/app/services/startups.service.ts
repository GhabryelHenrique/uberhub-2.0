import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AirtableStartup {
  STARTUP: string;
  SOLUÇÃO: string;
  'Segmento principal': string;
  'Segmento principal copy': string;
  'Fase atual da sua startup': string;
  Colaboradores: string;
  'Público-alvo': string;
  'Modelo de negócio da startup': string;
  'A startup já recebeu investimento?': string;
  'O investidor foi de Uberlândia ou de fora?': string;
  'Qual o local ou endereço da sua startup?': string;
  Site: string;
  Imagem: string;
  latitude?: number;
  longitude?: number;
}

export interface Startup {
  nome: string;
  logo: string;
  solucao: string;
  setor_principal: string;
  segmento_copy: string;
  fase_startup: string;
  colaboradores: string;
  publico_alvo: string;
  modelo_negocio: string;
  recebeu_investimento: string;
  investidor_origem: string;
  endereco: string;
  site: string;
  imagem: string;
  latitude?: number;
  longitude?: number;
}

@Injectable({
  providedIn: 'root'
})
export class StartupsService {
  private startupsSubject = new BehaviorSubject<Startup[]>([]);
  public startups$ = this.startupsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStartups();
  }

  private loadStartups(): void {
    this.http.get<AirtableStartup[]>('/assets/data/airtable_startups.json')
      .subscribe(data => {
        const mappedStartups: Startup[] = data.map(item => {
          const nome = item.STARTUP?.trim() || '';
          const imagem = item.Imagem?.trim() || '';

          // Gera um logo usando UI Avatars caso não tenha imagem
          const logo = imagem || `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=random&color=fff&size=200&bold=true`;

          return {
            nome,
            logo,
            solucao: item.SOLUÇÃO?.trim() || '',
            setor_principal: item['Segmento principal']?.trim() || '',
            segmento_copy: item['Segmento principal copy']?.trim() || '',
            fase_startup: item['Fase atual da sua startup']?.trim() || '',
            colaboradores: item.Colaboradores?.trim() || '',
            publico_alvo: item['Público-alvo']?.trim() || '',
            modelo_negocio: item['Modelo de negócio da startup']?.trim() || '',
            recebeu_investimento: item['A startup já recebeu investimento?']?.trim() || '',
            investidor_origem: item['O investidor foi de Uberlândia ou de fora?']?.trim() || '',
            endereco: item['Qual o local ou endereço da sua startup?']?.trim() || '',
            site: item.Site?.trim() || '',
            imagem,
            latitude: item.latitude,
            longitude: item.longitude
          };
        }).filter(startup => startup.nome); // Remove entradas sem nome

        this.startupsSubject.next(mappedStartups);
      });
  }

  getStartups(): Observable<Startup[]> {
    return this.startups$;
  }

  filterStartups(nome?: string, fase?: string, setor?: string): Observable<Startup[]> {
    return this.startups$.pipe(
      map(startups => {
        return startups.filter(startup => {
          const nomeMatch = !nome || startup.nome.toLowerCase().includes(nome.toLowerCase());
          const faseMatch = !fase || startup.fase_startup === fase;
          const setorMatch = !setor ||
            startup.setor_principal === setor ||
            startup.segmento_copy === setor;

          return nomeMatch && faseMatch && setorMatch;
        });
      })
    );
  }

  getTotalStartups(): Observable<number> {
    return this.startups$.pipe(
      map(startups => startups.length)
    );
  }

  getSetoresDistribution(): Observable<{ nome: string; valor: number; cor: string }[]> {
    return this.startups$.pipe(
      map(startups => {
        const setorCount = new Map<string, number>();

        startups.forEach(startup => {
          const setor = startup.segmento_copy || startup.setor_principal || 'Outros';
          setorCount.set(setor, (setorCount.get(setor) || 0) + 1);
        });

        // Cores para os setores
        const colors = [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
          '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
          '#FFB6C1', '#87CEEB', '#DDA15E', '#BC6C25', '#8B4513'
        ];

        return Array.from(setorCount.entries())
          .map(([nome, valor], index) => ({
            nome,
            valor,
            cor: colors[index % colors.length]
          }))
          .sort((a, b) => b.valor - a.valor);
      })
    );
  }

  getPublicoAlvoDistribution(): Observable<{ nome: string; valor: number; cor: string; percentual: number }[]> {
    return this.startups$.pipe(
      map(startups => {
        const publicoCount = new Map<string, number>();

        startups.forEach(startup => {
          const publico = startup.publico_alvo || 'Não especificado';
          publicoCount.set(publico, (publicoCount.get(publico) || 0) + 1);
        });

        const total = startups.length;
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

        return Array.from(publicoCount.entries())
          .map(([nome, valor], index) => ({
            nome,
            valor,
            percentual: (valor / total) * 100,
            cor: colors[index % colors.length]
          }))
          .sort((a, b) => b.valor - a.valor);
      })
    );
  }

  getFasesPorSetor(): Observable<{ nome: string; setores: { nome: string; valor: number; cor: string }[] }[]> {
    return this.startups$.pipe(
      map(startups => {
        const faseSetorMap = new Map<string, Map<string, number>>();

        startups.forEach(startup => {
          const fase = startup.fase_startup || 'Não especificado';
          const setor = startup.segmento_copy || startup.setor_principal || 'Outros';

          if (!faseSetorMap.has(fase)) {
            faseSetorMap.set(fase, new Map());
          }

          const setorMap = faseSetorMap.get(fase)!;
          setorMap.set(setor, (setorMap.get(setor) || 0) + 1);
        });

        const colors = [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
          '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
        ];

        const setorColorMap = new Map<string, string>();
        let colorIndex = 0;

        return Array.from(faseSetorMap.entries()).map(([fase, setorMap]) => {
          const setores = Array.from(setorMap.entries()).map(([setor, valor]) => {
            if (!setorColorMap.has(setor)) {
              setorColorMap.set(setor, colors[colorIndex % colors.length]);
              colorIndex++;
            }

            return {
              nome: setor,
              valor,
              cor: setorColorMap.get(setor)!
            };
          });

          return {
            nome: fase,
            setores
          };
        });
      })
    );
  }
}
