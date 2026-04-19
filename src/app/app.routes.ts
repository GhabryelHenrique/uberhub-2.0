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
import { LandingComponent } from './pages/landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full', title: 'Início' },
  { path: 'login', component: LoginComponent, title: 'Entrar' },
  { path: 'register', component: RegisterComponent, title: 'Criar Conta' },
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard' },
  { path: 'startups', component: StartupsComponent, title: 'Startups' },
  { path: 'mapa-inovacao', component: MapaInovacaoComponent, title: 'Mapa de Inovação' },
  { path: 'vagas', component: VagasComponent, title: 'Vagas' },
  { path: 'eventos', component: EventosComponent, title: 'Eventos' },
  { path: 'noticias', component: NoticiasComponent, title: 'Notícias' },
  { path: 'perfil', component: PerfilComponent, title: 'Perfil' },
  { path: 'admin', component: AdminComponent, title: 'Admin' },
  { path: '**', redirectTo: '/dashboard' }
];
