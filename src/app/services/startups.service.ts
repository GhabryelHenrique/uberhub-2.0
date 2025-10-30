import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Startup {
  id: number;
  nome: string;
  logo: string;
  solucao: string;
  setor_principal: string;
  fase_startup: string;
  publico_alvo: string;
  modelo_negocio: string;
}

export interface StartupsData {
  startups: Startup[];
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
    this.http.get<StartupsData>('/assets/data/startups.json')
      .subscribe(data => {
        this.startupsSubject.next(data.startups);
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
          const setorMatch = !setor || startup.setor_principal === setor;

          return nomeMatch && faseMatch && setorMatch;
        });
      })
    );
  }
}
