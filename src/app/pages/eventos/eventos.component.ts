import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventosService, Evento } from '../../services/eventos.service';

@Component({
  selector: 'app-eventos',
  imports: [CommonModule],
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.scss'
})
export class EventosComponent implements OnInit {
  categorias = ['Todos', 'Tecnologia', 'Inovação', 'Networking', 'Workshop', 'Palestra', 'Hackathon'];
  categoriaSelecionada: string = 'Todos';
  eventos: Evento[] = [];
  hoje = new Date();

  constructor(private eventosService: EventosService) {}

  ngOnInit(): void {
    this.eventosService.getAll().subscribe(eventos => {
      this.eventos = eventos.sort((a, b) =>
        new Date(a.data).getTime() - new Date(b.data).getTime()
      );
    });
  }

  get eventosFiltrados(): Evento[] {
    let filtrados = this.eventos;

    if (this.categoriaSelecionada !== 'Todos') {
      filtrados = filtrados.filter(evento =>
        evento.categoria === this.categoriaSelecionada
      );
    }

    return filtrados;
  }

  get eventosProximos(): Evento[] {
    return this.eventosFiltrados.filter(evento =>
      new Date(evento.data) >= this.hoje
    );
  }

  get eventosPassados(): Evento[] {
    return this.eventosFiltrados.filter(evento =>
      new Date(evento.data) < this.hoje
    );
  }

  selecionarCategoria(categoria: string): void {
    this.categoriaSelecionada = categoria;
  }

  abrirEvento(link?: string): void {
    if (link) {
      window.open(link, '_blank');
    }
  }

  isEventoProximo(data: Date): boolean {
    const dataEvento = new Date(data);
    const diffDias = Math.ceil((dataEvento.getTime() - this.hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diffDias <= 7 && diffDias >= 0;
  }

  formatarData(data: Date): string {
    const dataEvento = new Date(data);
    return dataEvento.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getDiaSemana(data: Date): string {
    const dataEvento = new Date(data);
    return dataEvento.toLocaleDateString('pt-BR', { weekday: 'long' });
  }
}
