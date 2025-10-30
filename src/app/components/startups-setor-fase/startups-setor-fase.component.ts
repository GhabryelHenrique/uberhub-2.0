import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

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

interface StartupsSetorFaseData {
  fases: Fase[];
}

@Component({
  selector: 'app-startups-setor-fase',
  imports: [CommonModule],
  templateUrl: './startups-setor-fase.component.html',
  styleUrl: './startups-setor-fase.component.scss'
})
export class StartupsSetorFaseComponent implements OnInit {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  chart: Chart | undefined;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<StartupsSetorFaseData>('/assets/data/startups-setor-fase.json').subscribe(data => {
      this.createChart(data);
    });
  }

  createChart(data: StartupsSetorFaseData): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Agrupar setores únicos
    const setoresMap = new Map<string, { valores: number[], cor: string }>();

    data.fases.forEach(fase => {
      fase.setores.forEach(setor => {
        if (!setoresMap.has(setor.nome)) {
          setoresMap.set(setor.nome, { valores: [], cor: setor.cor });
        }
      });
    });

    // Preencher valores para cada setor em cada fase
    const setoresUnicos = Array.from(setoresMap.keys());
    data.fases.forEach(fase => {
      setoresUnicos.forEach(setorNome => {
        const setor = fase.setores.find(s => s.nome === setorNome);
        const valores = setoresMap.get(setorNome)!.valores;
        valores.push(setor ? setor.valor : 0);
      });
    });

    // Criar datasets
    const datasets = setoresUnicos.map(setorNome => {
      const setorData = setoresMap.get(setorNome)!;
      return {
        label: setorNome,
        data: setorData.valores,
        backgroundColor: setorData.cor,
        borderWidth: 0
      };
    });

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.fases.map(f => f.nome),
        datasets: datasets
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1500,
          easing: 'easeInOutQuart',
          delay: (context) => {
            let delay = 0;
            if (context.type === 'data') {
              delay = context.dataIndex * 100 + context.datasetIndex * 50;
            }
            return delay;
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: {
              display: true,
              color: '#f0f0f0'
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          y: {
            stacked: true,
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.x;
                return `${label}: ${value}`;
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
