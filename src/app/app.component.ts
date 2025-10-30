import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarService } from './services/sidebar.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'uberhub-dashboard';
  showLayout = false;
  sidebarCollapsed = false;
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private sidebarService: SidebarService
  ) {
    // Subscreve aos eventos de navegação
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: any) => {
        this.checkLayoutVisibility(event.url);
      })
    );
  }

  ngOnInit(): void {
    // Verifica a URL atual na inicialização (após o componente estar completamente inicializado)
    this.checkLayoutVisibility(this.router.url);

    // Subscrever ao estado da sidebar
    this.subscription.add(
      this.sidebarService.isCollapsed$.subscribe(
        collapsed => this.sidebarCollapsed = collapsed
      )
    );
  }

  private checkLayoutVisibility(url: string): void {
    // Hide layout for login and register pages
    const authRoutes = ['/login', '/register', 'login', 'register', '/', ''];
    const isAuthRoute = authRoutes.some(route => url === route || url.includes('/login') || url.includes('/register'));
    this.showLayout = !isAuthRoute;
    console.log('URL atual:', url, 'showLayout:', this.showLayout);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
