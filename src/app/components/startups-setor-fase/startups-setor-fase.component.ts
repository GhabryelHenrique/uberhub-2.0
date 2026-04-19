import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartupsService } from '../../services/startups.service';
import { ThemeService } from '../../services/theme.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { combineLatest, Subject, takeUntil } from 'rxjs';

Chart.register(...registerables);

interface SetorValor {
  nome: string;
  valor: number;
  cor: string;
}

interface Fase {
  nome: string;
  setores: SetorValor[];
}

@Component({
  selector: 'app-startups-setor-fase',
  imports: [CommonModule],
  templateUrl: './startups-setor-fase.component.html',
  styleUrl: './startups-setor-fase.component.scss'
})
export class StartupsSetorFaseComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  chart: Chart | undefined;
  private lastFases: Fase[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private startupsService: StartupsService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.startupsService.getFasesPorSetor(),
      this.themeService.currentTheme$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([fases, theme]) => {
        this.lastFases = fases;
        this.chart?.destroy();
        this.createChart(fases, theme === 'dark');
      });
  }

  private createChart(fases: Fase[], isDark: boolean): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const tickColor = isDark ? '#a78bfa' : '#4c1d95';
    const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
    const tooltipBg = isDark ? '#1a1333' : '#ffffff';
    const tooltipText = isDark ? '#f5f3ff' : '#1e1b4b';
    const tooltipBorder = isDark ? '#4c3a82' : '#e9d5ff';

    const setoresMap = new Map<string, { valores: number[]; cor: string }>();
    fases.forEach(fase => {
      fase.setores.forEach(setor => {
        if (!setoresMap.has(setor.nome)) {
          setoresMap.set(setor.nome, { valores: [], cor: setor.cor });
        }
      });
    });

    const setoresUnicos = Array.from(setoresMap.keys());
    fases.forEach(fase => {
      setoresUnicos.forEach(nome => {
        const setor = fase.setores.find(s => s.nome === nome);
        setoresMap.get(nome)!.valores.push(setor ? setor.valor : 0);
      });
    });

    const datasets = setoresUnicos.map(nome => {
      const d = setoresMap.get(nome)!;
      return { label: nome, data: d.valores, backgroundColor: d.cor, borderWidth: 0 };
    });

    const config: ChartConfiguration = {
      type: 'bar',
      data: { labels: fases.map(f => f.nome), datasets },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1200,
          easing: 'easeInOutQuart',
          delay: (ctx) => ctx.type === 'data' ? ctx.dataIndex * 80 + ctx.datasetIndex * 40 : 0
        },
        scales: {
          x: {
            stacked: true,
            grid: { color: gridColor },
            ticks: { color: tickColor, font: { size: 11 } },
            border: { display: false }
          },
          y: {
            stacked: true,
            grid: { display: false },
            ticks: { color: tickColor, font: { size: 12, weight: 'bold' } },
            border: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: tooltipBg,
            titleColor: tooltipText,
            bodyColor: tooltipText,
            borderColor: tooltipBorder,
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.x}`
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
