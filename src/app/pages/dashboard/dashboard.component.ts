import { Component } from '@angular/core';
import { StatsCardsComponent } from '../../components/stats-cards/stats-cards.component';
import { SalesChartComponent } from '../../components/sales-chart/sales-chart.component';
import { DealsTableComponent } from '../../components/deals-table/deals-table.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    StatsCardsComponent,
    SalesChartComponent,
    DealsTableComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
