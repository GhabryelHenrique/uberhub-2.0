import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  bio?: string;
  avatar?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  cidade?: string;
  estado?: string;
  interesses?: string[];
}

export interface ContatoMensagem {
  id: number;
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
  data: Date;
  status: 'pendente' | 'respondido';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USER_STORAGE_KEY = 'uber4hub_user';
  private readonly MENSAGENS_STORAGE_KEY = 'uber4hub_mensagens';

  private userSubject = new BehaviorSubject<User | null>(this.loadUser());
  public user$ = this.userSubject.asObservable();

  private mensagensSubject = new BehaviorSubject<ContatoMensagem[]>(this.loadMensagens());
  public mensagens$ = this.mensagensSubject.asObservable();

  constructor() { }

  private loadUser(): User | null {
    const stored = localStorage.getItem(this.USER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Usuário padrão
    const defaultUser: User = {
      id: 1,
      nome: 'Usuário UBER4HUB',
      email: 'usuario@uber4hub.com',
      telefone: '(34) 99999-9999',
      empresa: 'UBER4HUB',
      cargo: 'Desenvolvedor',
      cidade: 'Uberlândia',
      estado: 'MG',
      bio: 'Apaixonado por tecnologia e inovação',
      interesses: ['Tecnologia', 'Inovação', 'Empreendedorismo']
    };
    this.saveUser(defaultUser);
    return defaultUser;
  }

  private saveUser(user: User): void {
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
  }

  private loadMensagens(): ContatoMensagem[] {
    const stored = localStorage.getItem(this.MENSAGENS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveMensagens(mensagens: ContatoMensagem[]): void {
    localStorage.setItem(this.MENSAGENS_STORAGE_KEY, JSON.stringify(mensagens));
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  updateProfile(userData: Partial<User>): void {
    const currentUser = this.userSubject.value;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      this.saveUser(updatedUser);
      this.userSubject.next(updatedUser);
    }
  }

  enviarMensagem(mensagem: Omit<ContatoMensagem, 'id' | 'data' | 'status'>): void {
    const mensagens = this.mensagensSubject.value;
    const newId = mensagens.length > 0 ? Math.max(...mensagens.map(m => m.id)) + 1 : 1;
    const novaMensagem: ContatoMensagem = {
      ...mensagem,
      id: newId,
      data: new Date(),
      status: 'pendente'
    };
    const updatedMensagens = [...mensagens, novaMensagem];
    this.saveMensagens(updatedMensagens);
    this.mensagensSubject.next(updatedMensagens);
  }

  getMensagens(): Observable<ContatoMensagem[]> {
    return this.mensagens$;
  }
}
