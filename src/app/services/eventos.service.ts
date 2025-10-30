import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  data: Date;
  horario: string;
  local: string;
  link?: string;
  imagem?: string;
  categoria: string;
  organizador: string;
  vagas?: number;
  dataCriacao?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private readonly STORAGE_KEY = 'uberhub_eventos';
  private eventosSubject = new BehaviorSubject<Evento[]>(this.loadFromStorage());
  public eventos$ = this.eventosSubject.asObservable();

  constructor() { }

  private loadFromStorage(): Evento[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Dados iniciais
    return [
      {
        id: 1,
        titulo: 'Tech Innovation Summit 2025',
        descricao: 'Encontro de inovação e tecnologia em Uberlândia',
        data: new Date('2025-11-15'),
        horario: '14:00',
        local: 'Centro de Convenções',
        link: 'https://exemplo.com/evento1',
        categoria: 'Tecnologia',
        organizador: 'UBERHUB',
        vagas: 200,
        dataCriacao: new Date()
      }
    ];
  }

  private saveToStorage(eventos: Evento[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(eventos));
  }

  getAll(): Observable<Evento[]> {
    return this.eventos$;
  }

  getById(id: number): Evento | undefined {
    return this.eventosSubject.value.find(e => e.id === id);
  }

  add(evento: Omit<Evento, 'id' | 'dataCriacao'>): void {
    const eventos = this.eventosSubject.value;
    const newId = eventos.length > 0 ? Math.max(...eventos.map(e => e.id)) + 1 : 1;
    const newEvento: Evento = {
      ...evento,
      id: newId,
      dataCriacao: new Date()
    };
    const updatedEventos = [...eventos, newEvento];
    this.saveToStorage(updatedEventos);
    this.eventosSubject.next(updatedEventos);
  }

  update(id: number, evento: Partial<Evento>): void {
    const eventos = this.eventosSubject.value;
    const index = eventos.findIndex(e => e.id === id);
    if (index !== -1) {
      eventos[index] = { ...eventos[index], ...evento };
      this.saveToStorage(eventos);
      this.eventosSubject.next([...eventos]);
    }
  }

  delete(id: number): void {
    const eventos = this.eventosSubject.value.filter(e => e.id !== id);
    this.saveToStorage(eventos);
    this.eventosSubject.next(eventos);
  }
}
