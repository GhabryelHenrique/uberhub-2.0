import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartupsService } from '../../services/startups.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { combineLatest } from 'rxjs';

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
export class PublicoAlvoChartComponent implements OnInit {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  chart: Chart | undefined;
  total: number = 0;

  constructor(private startupsService: StartupsService) {}

  ngOnInit(): void {
    combineLatest([
      this.startupsService.getTotalStartups(),
      this.startupsService.getPublicoAlvoDistribution()
    ]).subscribe(([total, segmentos]) => {
      this.total = total;

      // Destruir gráfico existente antes de criar um novo
      if (this.chart) {
        this.chart.destroy();
      }

      this.createChart({ total, segmentos });
    });
  }

  createChart(data: { total: number; segmentos: Segmento[] }): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: data.segmentos.map(s => s.nome),
        datasets: [{
          data: data.segmentos.map(s => s.valor),
          backgroundColor: data.segmentos.map(s => s.cor),
          borderWidth: 3,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1500,
          easing: 'easeInOutQuart',
          delay: (context) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default') {
              delay = context.dataIndex * 200;
            }
            return delay;
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: {
                size: 12,
                family: 'Roboto, sans-serif'
              },
              usePointStyle: true,
              generateLabels: (chart) => {
                const datasets = chart.data.datasets;
                const bgColors = datasets[0].backgroundColor as string[];
                return chart.data.labels!.map((label, i) => ({
                  text: `${label} (${data.segmentos[i].percentual.toFixed(1)}%)`,
                  fillStyle: bgColors[i],
                  hidden: false,
                  index: i,
                  pointStyle: 'circle'
                }));
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const percentage = data.segmentos[context.dataIndex].percentual;
                return `${label}: ${value} (${percentage.toFixed(1)}%)`;
              }
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
