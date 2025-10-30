import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartupsService } from '../../services/startups.service';
import { combineLatest } from 'rxjs';

interface Setor {
  nome: string;
  valor: number;
  cor: string;
}

@Component({
  selector: 'app-ecossistema-treemap',
  imports: [CommonModule],
  templateUrl: './ecossistema-treemap.component.html',
  styleUrl: './ecossistema-treemap.component.scss'
})
export class EcossistemaTreemapComponent implements OnInit {
  totalStartups: number = 0;
  setores: Setor[] = [];

  constructor(private startupsService: StartupsService) {}

  ngOnInit(): void {
    combineLatest([
      this.startupsService.getTotalStartups(),
      this.startupsService.getSetoresDistribution()
    ]).subscribe(([total, setores]) => {
      this.totalStartups = total;
      this.setores = setores;
    });
  }

  getSetorWidth(valor: number): string {
    const total = this.setores.reduce((sum, s) => sum + s.valor, 0);
    const percentage = (valor / total) * 100;
    return `${percentage}%`;
  }

  getSetorHeight(valor: number): string {
    // Ajusta altura baseado no valor
    if (valor > 40) return '100%';
    if (valor > 30) return '66%';
    if (valor > 20) return '50%';
    if (valor > 10) return '33%';
    return '25%';
  }

  shouldShowText(valor: number): boolean {
    return valor > 10;
  }
}
