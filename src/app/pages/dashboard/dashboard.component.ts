import { Component } from '@angular/core';
import { StatsCardsComponent } from '../../components/stats-cards/stats-cards.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { EcossistemaTreemapComponent } from '../../components/ecossistema-treemap/ecossistema-treemap.component';
import { PublicoAlvoChartComponent } from '../../components/publico-alvo-chart/publico-alvo-chart.component';
import { StartupsSetorFaseComponent } from '../../components/startups-setor-fase/startups-setor-fase.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    StatsCardsComponent,
    EcossistemaTreemapComponent,
    PublicoAlvoChartComponent,
    StartupsSetorFaseComponent,
    PageHeaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
