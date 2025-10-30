import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VagasComponent } from './pages/vagas/vagas.component';
import { EventosComponent } from './pages/eventos/eventos.component';
import { NoticiasComponent } from './pages/noticias/noticias.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { AdminComponent } from './pages/admin/admin.component';
import { StartupsComponent } from './pages/startups/startups.component';
import { MapaInovacaoComponent } from './pages/mapa-inovacao/mapa-inovacao.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'startups', component: StartupsComponent },
  { path: 'mapa-inovacao', component: MapaInovacaoComponent },
  { path: 'vagas', component: VagasComponent },
  { path: 'eventos', component: EventosComponent },
  { path: 'noticias', component: NoticiasComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '/login' }
];
