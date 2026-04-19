import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  isDarkTheme = true;
  isDropdownOpen = false;
  private destroy$ = new Subject<void>();

  constructor(
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inscreve-se nas mudanças de tema
    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.isDarkTheme = theme === 'dark';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeDropdown();
  }

  logout(): void {
    this.closeDropdown();
    this.router.navigate(['/login']);
  }
}
