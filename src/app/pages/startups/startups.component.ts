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
  fases: string[] = [];
  setores: string[] = [];

  constructor(private startupsService: StartupsService) {}

  ngOnInit(): void {
    this.startupsService.getStartups().subscribe(startups => {
      this.startups = startups;

      // Gera opções de filtros dinamicamente a partir dos dados
      const fasesSet = new Set<string>();
      const setoresSet = new Set<string>();

      startups.forEach(startup => {
        if (startup.fase_startup) {
          fasesSet.add(startup.fase_startup);
        }
        if (startup.segmento_copy || startup.setor_principal) {
          setoresSet.add(startup.segmento_copy || startup.setor_principal);
        }
      });

      this.fases = Array.from(fasesSet).sort();
      this.setores = Array.from(setoresSet).sort();

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
