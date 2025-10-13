import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoticiasService, Noticia } from '../../services/noticias.service';

@Component({
  selector: 'app-noticias',
  imports: [CommonModule],
  templateUrl: './noticias.component.html',
  styleUrl: './noticias.component.scss'
})
export class NoticiasComponent implements OnInit {
  categorias = ['Todas', 'Inovação', 'Tecnologia', 'Empreendedorismo', 'Eventos', 'Startups', 'Investimentos'];
  categoriaSelecionada: string = 'Todas';
  noticias: Noticia[] = [];

  constructor(private noticiasService: NoticiasService) {}

  ngOnInit(): void {
    this.noticiasService.getAll().subscribe(noticias => {
      this.noticias = noticias.sort((a, b) =>
        new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime()
      );
    });
  }

  get noticiasFiltradas(): Noticia[] {
    if (this.categoriaSelecionada === 'Todas') {
      return this.noticias;
    }
    return this.noticias.filter(noticia =>
      noticia.categoria === this.categoriaSelecionada
    );
  }

  get noticiaDestaque(): Noticia | undefined {
    return this.noticiasFiltradas.find(noticia => noticia.destaque);
  }

  get noticiasRegulares(): Noticia[] {
    return this.noticiasFiltradas.filter(noticia => !noticia.destaque);
  }

  selecionarCategoria(categoria: string): void {
    this.categoriaSelecionada = categoria;
  }

  abrirNoticia(link?: string): void {
    if (link) {
      window.open(link, '_blank');
    }
  }

  getTempoPublicacao(data: Date): string {
    const dataPublicacao = new Date(data);
    const hoje = new Date();
    const diffMs = hoje.getTime() - dataPublicacao.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias === 0) return 'Hoje';
    if (diffDias === 1) return 'Ontem';
    if (diffDias < 7) return `${diffDias} dias atrás`;
    if (diffDias < 30) return `${Math.floor(diffDias / 7)} semanas atrás`;
    if (diffDias < 365) return `${Math.floor(diffDias / 30)} meses atrás`;
    return `${Math.floor(diffDias / 365)} anos atrás`;
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
