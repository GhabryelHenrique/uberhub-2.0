import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isDropdownOpen = false;
  userName = 'Ghabryel';
  userEmail = 'usuario@uberhub.com';

  constructor(
    private router: Router,
    private userService: UserService
  ) {
    // Pegar dados do usuário do serviço
    const user = this.userService.getCurrentUser();
    if (user) {
      this.userName = user.nome;
      this.userEmail = user.email || '';
    }
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
