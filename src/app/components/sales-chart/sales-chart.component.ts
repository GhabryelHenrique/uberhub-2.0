import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ThemeService } from '../../services/theme.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sales-chart',
  imports: [BaseChartDirective],
  templateUrl: './sales-chart.component.html',
  styleUrl: './sales-chart.component.scss'
})
export class SalesChartComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private destroy$ = new Subject<void>();

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [30, 45, 40, 55, 50, 60, 85, 60, 70, 65, 55, 50, 70, 80, 75, 90, 85, 75, 70, 80],
        label: 'Organizações',
        backgroundColor: 'rgba(133, 64, 245, 0.12)',
        borderColor: '#8540f5',
        pointBackgroundColor: '#8540f5',
        pointBorderColor: 'transparent',
        pointHoverBackgroundColor: '#c4b5fd',
        pointHoverBorderColor: '#8540f5',
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.4
      }
    ],
    labels: ['0k', '5k', '10k', '15k', '20k', '25k', '30k', '35k', '40k', '45k', '50k', '55k', '60k', '65k', '70k']
  };

  public lineChartOptions: ChartConfiguration['options'] = {};

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.applyTheme(theme === 'dark');
        this.chart?.update();
      });
  }

  private applyTheme(isDark: boolean): void {
    const tickColor = isDark ? '#a78bfa' : '#4c1d95';
    const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
    const tooltipBg = isDark ? '#1a1333' : '#ffffff';
    const tooltipText = isDark ? '#f5f3ff' : '#1e1b4b';
    const tooltipBorder = isDark ? '#4c3a82' : '#e9d5ff';

    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: tooltipBg,
          padding: 12,
          titleColor: tooltipText,
          bodyColor: tooltipText,
          borderColor: tooltipBorder,
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: tickColor, font: { size: 11 } },
          border: { display: false }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: tickColor,
            font: { size: 11 },
            callback: (value) => value + '%'
          },
          border: { display: false },
          min: 0,
          max: 100
        }
      }
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
