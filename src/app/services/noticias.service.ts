import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Noticia {
  id: number;
  titulo: string;
  subtitulo?: string;
  conteudo: string;
  autor: string;
  dataPublicacao: Date;
  categoria: string;
  imagem?: string;
  link?: string;
  destaque?: boolean;
  dataCriacao?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NoticiasService {
  private readonly STORAGE_KEY = 'uber4hub_noticias';
  private noticiasSubject = new BehaviorSubject<Noticia[]>(this.loadFromStorage());
  public noticias$ = this.noticiasSubject.asObservable();

  constructor() { }

  private loadFromStorage(): Noticia[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Dados iniciais
    return [
      {
        id: 1,
        titulo: 'UBER4HUB lança novo hub de inovação',
        subtitulo: 'Espaço colaborativo promete impulsionar startups locais',
        conteudo: 'A plataforma UBER4HUB anunciou hoje o lançamento de um novo hub de inovação em Uberlândia, com foco em tecnologia e empreendedorismo.',
        autor: 'Redação UBER4HUB',
        dataPublicacao: new Date(),
        categoria: 'Inovação',
        destaque: true,
        dataCriacao: new Date()
      }
    ];
  }

  private saveToStorage(noticias: Noticia[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(noticias));
  }

  getAll(): Observable<Noticia[]> {
    return this.noticias$;
  }

  getById(id: number): Noticia | undefined {
    return this.noticiasSubject.value.find(n => n.id === id);
  }

  add(noticia: Omit<Noticia, 'id' | 'dataCriacao'>): void {
    const noticias = this.noticiasSubject.value;
    const newId = noticias.length > 0 ? Math.max(...noticias.map(n => n.id)) + 1 : 1;
    const newNoticia: Noticia = {
      ...noticia,
      id: newId,
      dataCriacao: new Date()
    };
    const updatedNoticias = [...noticias, newNoticia];
    this.saveToStorage(updatedNoticias);
    this.noticiasSubject.next(updatedNoticias);
  }

  update(id: number, noticia: Partial<Noticia>): void {
    const noticias = this.noticiasSubject.value;
    const index = noticias.findIndex(n => n.id === id);
    if (index !== -1) {
      noticias[index] = { ...noticias[index], ...noticia };
      this.saveToStorage(noticias);
      this.noticiasSubject.next([...noticias]);
    }
  }

  delete(id: number): void {
    const noticias = this.noticiasSubject.value.filter(n => n.id !== id);
    this.saveToStorage(noticias);
    this.noticiasSubject.next(noticias);
  }
}
