import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  title: string;
  value: string;
  icon: string;
  trend: string;
  trendValue: string;
  isPositive: boolean;
  iconBg: string;
}

@Component({
  selector: 'app-stats-cards',
  imports: [CommonModule],
  templateUrl: './stats-cards.component.html',
  styleUrl: './stats-cards.component.scss'
})
export class StatsCardsComponent {
  stats: StatCard[] = [
    {
      title: 'Membros',
      value: '40,689',
      icon: 'fa-users',
      trend: 'Up from yesterday',
      trendValue: '8.5%',
      isPositive: true,
      iconBg: '#e3f2fd'
    },
    {
      title: 'Programação',
      value: '10293',
      icon: 'fa-code',
      trend: 'Up from past week',
      trendValue: '1.3%',
      isPositive: true,
      iconBg: '#fff8e1'
    },
    {
      title: 'Vagas',
      value: '$89,000',
      icon: 'fa-chart-line',
      trend: 'Down from yesterday',
      trendValue: '4.3%',
      isPositive: false,
      iconBg: '#fce4ec'
    },
    {
      title: 'Empresas',
      value: '2040',
      icon: 'fa-building',
      trend: 'Up from yesterday',
      trendValue: '1.8%',
      isPositive: true,
      iconBg: '#ffe0e6'
    }
  ];
}
