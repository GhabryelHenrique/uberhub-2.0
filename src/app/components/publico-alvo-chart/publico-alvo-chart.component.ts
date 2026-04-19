import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartupsService } from '../../services/startups.service';
import { ThemeService } from '../../services/theme.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { combineLatest, Subject, takeUntil } from 'rxjs';

Chart.register(...registerables);

interface Segmento {
  nome: string;
  valor: number;
  cor: string;
  percentual: number;
}

@Component({
  selector: 'app-publico-alvo-chart',
  imports: [CommonModule],
  templateUrl: './publico-alvo-chart.component.html',
  styleUrl: './publico-alvo-chart.component.scss'
})
export class PublicoAlvoChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  chart: Chart | undefined;
  total = 0;
  private lastData: { total: number; segmentos: Segmento[] } | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private startupsService: StartupsService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.startupsService.getTotalStartups(),
      this.startupsService.getPublicoAlvoDistribution(),
      this.themeService.currentTheme$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([total, segmentos, theme]) => {
        this.total = total;
        this.lastData = { total, segmentos };
        this.chart?.destroy();
        this.createChart(this.lastData, theme === 'dark');
      });
  }

  private createChart(data: { total: number; segmentos: Segmento[] }, isDark: boolean): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const legendColor = isDark ? '#d4b5fd' : '#1e1b4b';
    const borderColor = isDark ? '#1a1333' : '#ffffff';
    const tooltipBg = isDark ? '#1a1333' : '#ffffff';
    const tooltipText = isDark ? '#f5f3ff' : '#1e1b4b';
    const tooltipBorder = isDark ? '#4c3a82' : '#e9d5ff';

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: data.segmentos.map(s => s.nome),
        datasets: [{
          data: data.segmentos.map(s => s.valor),
          backgroundColor: data.segmentos.map(s => s.cor),
          borderWidth: 3,
          borderColor
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1200,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              color: legendColor,
              font: { size: 12, family: 'Inter, Roboto, sans-serif' },
              usePointStyle: true,
              generateLabels: (chart) => {
                const bgColors = (chart.data.datasets[0].backgroundColor as string[]);
                return chart.data.labels!.map((label, i) => ({
                  text: `${label} (${data.segmentos[i].percentual.toFixed(1)}%)`,
                  fillStyle: bgColors[i],
                  hidden: false,
                  index: i,
                  pointStyle: 'circle' as const
                }));
              }
            }
          },
          tooltip: {
            backgroundColor: tooltipBg,
            titleColor: tooltipText,
            bodyColor: tooltipText,
            borderColor: tooltipBorder,
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const pct = data.segmentos[context.dataIndex].percentual;
                return `${label}: ${value} (${pct.toFixed(1)}%)`;
              }
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
