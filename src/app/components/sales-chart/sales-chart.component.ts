import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-sales-chart',
  imports: [BaseChartDirective],
  templateUrl: './sales-chart.component.html',
  styleUrl: './sales-chart.component.scss'
})
export class SalesChartComponent implements OnInit {
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [30, 45, 40, 55, 50, 60, 85, 60, 70, 65, 55, 50, 70, 80, 75, 90, 85, 75, 70, 80],
        label: 'Sales',
        backgroundColor: 'rgba(98, 0, 234, 0.1)',
        borderColor: '#6200ea',
        pointBackgroundColor: '#6200ea',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#6200ea',
        fill: true,
        tension: 0.4
      }
    ],
    labels: ['0k', '5k', '10k', '15k', '20k', '25k', '30k', '35k', '40k', '45k', '50k', '55k', '60k', '65k', '70k']
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#333',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#6200ea',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#999'
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#999',
          callback: function(value) {
            return value + '%';
          }
        },
        min: 0,
        max: 100
      }
    }
  };

  ngOnInit() {
    // Chart will be initialized automatically
  }
}
