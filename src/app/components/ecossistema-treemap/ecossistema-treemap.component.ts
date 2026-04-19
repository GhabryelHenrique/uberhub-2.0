import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { StartupsService } from '../../services/startups.service';
import { ThemeService } from '../../services/theme.service';
import { combineLatest, Subject, takeUntil } from 'rxjs';

interface Setor {
  nome: string;
  valor: number;
  cor: string;
}

@Component({
  selector: 'app-ecossistema-treemap',
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './ecossistema-treemap.component.html',
  styleUrl: './ecossistema-treemap.component.scss'
})
export class EcossistemaTreemapComponent implements OnInit, OnDestroy {
  totalStartups = 0;
  chartOption: EChartsOption = {};
  private setores: Setor[] = [];
  private isDark = true;
  private destroy$ = new Subject<void>();

  constructor(
    private startupsService: StartupsService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.startupsService.getTotalStartups(),
      this.startupsService.getSetoresDistribution(),
      this.themeService.currentTheme$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([total, setores, theme]) => {
        this.totalStartups = total;
        this.setores = setores;
        this.isDark = theme === 'dark';
        this.updateChart();
      });
  }

  private updateChart(): void {
    const labelColor = this.isDark ? '#f5f3ff' : '#1e1b4b';
    const borderColor = this.isDark ? '#0f0a1e' : '#ffffff';
    const tooltipBg = this.isDark ? '#1a1333' : '#ffffff';
    const tooltipText = this.isDark ? '#f5f3ff' : '#1e1b4b';

    this.chartOption = {
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: this.isDark ? '#3d2d6b' : '#e9d5ff',
        borderWidth: 1,
        textStyle: { color: tooltipText, fontSize: 13 },
        formatter: (info: any) => {
          const treePath = info.treePathInfo.slice(1).map((t: any) => t.name);
          return `<b>${treePath.join(' / ')}</b><br/>Organizações: ${info.value}`;
        }
      },
      series: [
        {
          type: 'treemap',
          data: this.setores.map(setor => ({
            name: setor.nome,
            value: setor.valor,
            itemStyle: { color: setor.cor }
          })),
          label: {
            show: true,
            formatter: '{b}\n{c}',
            fontSize: 13,
            fontWeight: 'bold',
            color: labelColor
          },
          upperLabel: { show: false },
          itemStyle: {
            borderColor: borderColor,
            borderWidth: 2,
            gapWidth: 2
          },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' }
          },
          breadcrumb: { show: false },
          roam: false
        }
      ]
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
