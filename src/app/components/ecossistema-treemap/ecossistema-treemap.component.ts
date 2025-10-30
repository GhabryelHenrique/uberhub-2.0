import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { StartupsService } from '../../services/startups.service';
import { combineLatest } from 'rxjs';

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
export class EcossistemaTreemapComponent implements OnInit {
  totalStartups: number = 0;
  chartOption: EChartsOption = {};

  constructor(private startupsService: StartupsService) {}

  ngOnInit(): void {
    combineLatest([
      this.startupsService.getTotalStartups(),
      this.startupsService.getSetoresDistribution()
    ]).subscribe(([total, setores]) => {
      this.totalStartups = total;
      this.updateChart(setores);
    });
  }

  updateChart(setores: Setor[]): void {
    this.chartOption = {
      tooltip: {
        formatter: (info: any) => {
          const value = info.value;
          const treePathInfo = info.treePathInfo;
          const treePath = [];

          for (let i = 1; i < treePathInfo.length; i++) {
            treePath.push(treePathInfo[i].name);
          }

          return [
            '<div class="tooltip-title">' + treePath.join('/') + '</div>',
            'Startups: ' + value
          ].join('');
        }
      },
      series: [
        {
          type: 'treemap',
          data: setores.map(setor => ({
            name: setor.nome,
            value: setor.valor,
            itemStyle: {
              color: setor.cor
            }
          })),
          label: {
            show: true,
            formatter: '{b}\n{c}',
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff'
          },
          upperLabel: {
            show: false
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
            gapWidth: 2
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.3)'
            }
          },
          breadcrumb: {
            show: false
          },
          roam: false
        }
      ]
    };
  }
}
