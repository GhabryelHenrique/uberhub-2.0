import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StartupsService, Startup } from '../../services/startups.service';

@Component({
  selector: 'app-startups',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './startups.component.html',
  styleUrl: './startups.component.scss'
})
export class StartupsComponent implements OnInit {
  startups: Startup[] = [];
  filteredStartups: Startup[] = [];
  paginatedStartups: Startup[] = [];

  // Filtros
  filterNome: string = '';
  filterFase: string = '';
  filterSetor: string = '';

  // Paginação
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;

  // Opções de filtros
  fases: string[] = ['Ideação', 'Validação', 'Operação', 'Tração', 'Escala'];
  setores: string[] = [
    'Tecnologia da Informação',
    'HRtech (Recursos humanos)',
    'Eventstech (Eventos)',
    'Insurtech (seguros)',
    'Agronegócio',
    'Educação',
    'E-commerce / marketplace',
    'Meio ambiente',
    'Beauty Tech (moda e beleza)',
    'Indústria',
    'Desenvolvimento de software',
    'Finanças',
    'Retailtech (varejo)',
    'Logística e mobilidade urbana',
    'Foodtech (Alimentação)',
    'Cloud computing',
    'Greentech (gestão de resíduos)',
    'Salestech (vendas)',
    'Adtech (advertising)',
    'Pettech (animal)',
    'Autotech (Automotivo)',
    'Big data',
    'Casa e família',
    'Comunicação e mídia',
    'Construção civil',
    'CRM',
    'Entretenimento',
    'Games',
    'Gestão',
    'Govtech (gestão pública)',
    'Hardware',
    'Imobiliário',
    'Lawtech (direito)',
    'Óleo e gás',
    'Saúde e bem-estar',
    'Serviços profissionais',
    'Smart Cities',
    'Social tech (impacto social)',
    'Inteligência Artificial',
    'Outros'
  ];

  constructor(private startupsService: StartupsService) {}

  ngOnInit(): void {
    this.startupsService.getStartups().subscribe(startups => {
      this.startups = startups;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.startupsService
      .filterStartups(this.filterNome, this.filterFase, this.filterSetor)
      .subscribe(filtered => {
        this.filteredStartups = filtered;
        this.totalPages = Math.ceil(this.filteredStartups.length / this.itemsPerPage);
        this.currentPage = 1;
        this.updatePagination();
      });
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedStartups = this.filteredStartups.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  truncateText(text: string, maxLength: number = 120): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
