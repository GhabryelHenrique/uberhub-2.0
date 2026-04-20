import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface EmpresaTech {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  total_ratings?: number;
  phone?: string;
  website?: string;
  types?: string;
  place_id?: string;
  maps_url?: string;
  opening_hours?: string;
  // Novos campos do merge
  solucao?: string;
  segmento_principal?: string;
  segmento_copy?: string;
  fase_atual?: string;
  colaboradores?: string;
  publico_alvo?: string;
  modelo_negocio?: string;
  recebeu_investimento?: string;
  investidor_local?: string;
  imagem?: string;
  data_source?: string;
  // Campos de categorização
  categoria?: string;
  categoria_emoji?: string;
  pin_color?: string;
  icon?: string;
}

export interface Startup {
  nome: string;
  logo: string;
  solucao?: string;
  setor_principal?: string;
  segmento_copy?: string;
  fase_startup?: string;
  colaboradores?: string;
  publico_alvo?: string;
  modelo_negocio?: string;
  recebeu_investimento?: string;
  investidor_origem?: string;
  endereco: string;
  site?: string;
  imagem?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  total_ratings?: number;
  phone?: string;
  types?: string;
  // Novos campos de categorização
  categoria?: string;
  categoria_emoji?: string;
  pin_color?: string;
  icon?: string;
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

  private inferirSetor(nome: string, types?: string): string {
    const nomeLC = nome.toLowerCase();
    const typesLC = types?.toLowerCase() || '';

    // Inferir setor baseado no nome e tipos
    if (nomeLC.includes('soft') || nomeLC.includes('tech') || nomeLC.includes('sistemas') || nomeLC.includes('dev')) {
      return 'Desenvolvimento de software';
    }
    if (nomeLC.includes('dados') || nomeLC.includes('data') || nomeLC.includes('analytics')) {
      return 'Análise de dados';
    }
    if (nomeLC.includes('academy') || nomeLC.includes('educa') || nomeLC.includes('escola') || nomeLC.includes('curso')) {
      return 'Edutech (Educação)';
    }
    if (nomeLC.includes('health') || nomeLC.includes('saúde') || nomeLC.includes('medical') || nomeLC.includes('clínica')) {
      return 'Healthtech (Saúde)';
    }
    if (nomeLC.includes('finance') || nomeLC.includes('bank') || nomeLC.includes('pagamento') || nomeLC.includes('fintech')) {
      return 'Fintech (Finanças)';
    }
    if (nomeLC.includes('ecommerce') || nomeLC.includes('loja') || nomeLC.includes('marketplace')) {
      return 'E-commerce';
    }
    if (nomeLC.includes('logística') || nomeLC.includes('transport') || nomeLC.includes('entrega')) {
      return 'Logística';
    }
    if (nomeLC.includes('marketing') || nomeLC.includes('publicidade') || nomeLC.includes('mídia')) {
      return 'Marketing digital';
    }

    return 'Tecnologia'; // Categoria padrão
  }

  private loadStartups(): void {
    this.http.get<EmpresaTech[]>('assets/data/empresas_tech_uberlandia.json')
      .subscribe(data => {
        const mappedStartups: Startup[] = data.map(item => {
          const nome = item.name?.trim() || '';

          // Usar setor do JSON ou inferir
          const setor = item.segmento_principal || item.segmento_copy || this.inferirSetor(nome, item.types);

          // Gera um logo usando UI Avatars ou usa a imagem do JSON
          const logo = item.imagem ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=random&color=fff&size=200&bold=true`;

          return {
            nome,
            logo,
            endereco: item.address?.trim() || '',
            site: item.website?.trim() || '',
            latitude: item.latitude,
            longitude: item.longitude,
            rating: item.rating,
            total_ratings: item.total_ratings,
            phone: item.phone,
            types: item.types,
            // Campos do merge
            solucao: item.solucao,
            setor_principal: item.segmento_principal || setor,
            segmento_copy: item.segmento_copy || setor,
            fase_startup: item.fase_atual,
            colaboradores: item.colaboradores,
            publico_alvo: item.publico_alvo,
            modelo_negocio: item.modelo_negocio,
            recebeu_investimento: item.recebeu_investimento,
            investidor_origem: item.investidor_local,
            imagem: item.imagem,
            // Campos de categorização
            categoria: item.categoria,
            categoria_emoji: item.categoria_emoji,
            pin_color: item.pin_color,
            icon: item.icon
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
        // Como não temos mais o campo publico_alvo, retornar distribuição vazia
        // ou baseada em outro campo (por exemplo, rating)
        if (startups.length === 0) return [];

        // Categorizar por rating se disponível
        const categorias = new Map<string, number>();
        startups.forEach(startup => {
          let categoria = 'Sem avaliação';
          if (startup.rating) {
            if (startup.rating >= 4.5) categoria = 'Altamente avaliadas (4.5+)';
            else if (startup.rating >= 4.0) categoria = 'Bem avaliadas (4.0-4.5)';
            else if (startup.rating >= 3.0) categoria = 'Avaliadas (3.0-4.0)';
            else categoria = 'Baixa avaliação (<3.0)';
          }
          categorias.set(categoria, (categorias.get(categoria) || 0) + 1);
        });

        const total = startups.length;
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

        return Array.from(categorias.entries())
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
        const categoriaSetorMap = new Map<string, Map<string, number>>();

        startups.forEach(startup => {
          const categoria = startup.fase_startup || 'Não informada';
          const setor = startup.segmento_copy || startup.setor_principal || 'Outros';

          if (!categoriaSetorMap.has(categoria)) {
            categoriaSetorMap.set(categoria, new Map());
          }

          const setorMap = categoriaSetorMap.get(categoria)!;
          setorMap.set(setor, (setorMap.get(setor) || 0) + 1);
        });

        const colors = [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
          '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
        ];

        const setorColorMap = new Map<string, string>();
        let colorIndex = 0;

        return Array.from(categoriaSetorMap.entries()).map(([categoria, setorMap]) => {
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
            nome: categoria,
            setores
          };
        });
      })
    );
  }
}
