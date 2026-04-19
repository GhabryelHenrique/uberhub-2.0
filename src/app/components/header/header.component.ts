import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ThemeService } from '../../services/theme.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isDropdownOpen = false;
  isDarkTheme = true;
  userName = 'Ghabryel';
  userEmail = 'usuario@uberhub.com';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private userService: UserService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    const user = this.userService.getCurrentUser();
    if (user) {
      this.userName = user.nome;
      this.userEmail = user.email || '';
    }
    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => this.isDarkTheme = theme === 'dark');
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.closeDropdown();
  }

  logout() {
    this.closeDropdown();
    this.router.navigate(['/login']);
  }
}
