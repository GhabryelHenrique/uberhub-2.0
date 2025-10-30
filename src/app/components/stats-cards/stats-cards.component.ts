import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  title: string;
  value: string;
  icon: string;
  trend: string;
  trendValue: string | null;
  isPositive: boolean | null;
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
      value: '+ 20 mil',
      icon: 'fa-users',
      trend: 'e crescendo ainda mais',
      trendValue: null,
      isPositive: true,
      iconBg: '#e3f2fd'
    },
    {
      title: 'Programação Gratuita',
      value: '+ 5 mil',
      icon: 'fa-code',
      trend: 'jovens com acesso à programação',
      trendValue: null,
      isPositive: true,
      iconBg: '#fff8e1'
    },
    {
      title: 'Vagas',
      value: '+ 1.000',
      icon: 'fa-chart-line',
      trend: 'Sendo divulgadas semanalmente',
      trendValue: null,
      isPositive: true,
      iconBg: '#fce4ec'
    },
    {
      title: 'Empresas tech',
      value: '+ 500',
      icon: 'fa-building',
      trend: 'empresas de inovação na cidade',
      trendValue: null,
      isPositive: true,
      iconBg: '#ffe0e6'
    }
  ];
}
