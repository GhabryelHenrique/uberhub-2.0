import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Vaga {
  id: number;
  titulo: string;
  empresa: string;
  tipo: string;
  descricao?: string;
  link: string;
  categorias: string[];
  destacada?: boolean;
  dataCriacao?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class VagasService {
  private readonly STORAGE_KEY = 'uberhub_vagas';
  private vagasSubject = new BehaviorSubject<Vaga[]>(this.loadFromStorage());
  public vagas$ = this.vagasSubject.asObservable();

  constructor() { }

  private loadFromStorage(): Vaga[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Dados iniciais
    return [
      {
        id: 1,
        titulo: '3442 Bolsas (Bootcamp Gratuito Modernização com GenAI)',
        empresa: 'TQI',
        tipo: 'Bootcamp',
        descricao: 'Participe da comunidade e acompanhe diariamente conteúdos sobre inovação em Uberlândia',
        link: 'https://lembre.se/bootcampgenai',
        categorias: ['Programação', 'Dados'],
        destacada: true,
        dataCriacao: new Date()
      },
      {
        id: 2,
        titulo: 'Dev Front React',
        empresa: 'B7',
        tipo: 'Devops',
        link: 'https://lembre.se/lKFcB',
        categorias: ['Programação'],
        dataCriacao: new Date()
      }
    ];
  }

  private saveToStorage(vagas: Vaga[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(vagas));
  }

  getAll(): Observable<Vaga[]> {
    return this.vagas$;
  }

  getById(id: number): Vaga | undefined {
    return this.vagasSubject.value.find(v => v.id === id);
  }

  add(vaga: Omit<Vaga, 'id' | 'dataCriacao'>): void {
    const vagas = this.vagasSubject.value;
    const newId = vagas.length > 0 ? Math.max(...vagas.map(v => v.id)) + 1 : 1;
    const newVaga: Vaga = {
      ...vaga,
      id: newId,
      dataCriacao: new Date()
    };
    const updatedVagas = [...vagas, newVaga];
    this.saveToStorage(updatedVagas);
    this.vagasSubject.next(updatedVagas);
  }

  update(id: number, vaga: Partial<Vaga>): void {
    const vagas = this.vagasSubject.value;
    const index = vagas.findIndex(v => v.id === id);
    if (index !== -1) {
      vagas[index] = { ...vagas[index], ...vaga };
      this.saveToStorage(vagas);
      this.vagasSubject.next([...vagas]);
    }
  }

  delete(id: number): void {
    const vagas = this.vagasSubject.value.filter(v => v.id !== id);
    this.saveToStorage(vagas);
    this.vagasSubject.next(vagas);
  }
}
