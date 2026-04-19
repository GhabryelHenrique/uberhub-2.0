import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface SideStat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-auth-side-panel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './auth-side-panel.component.html',
  styleUrl: './auth-side-panel.component.scss'
})
export class AuthSidePanelComponent {
  @Input() image = '';
  @Input() quote = 'A soma de todas as iniciativas, grupos e pessoas que fazem inovação em Uberlândia.';
  @Input() benefits: string[] = [];
  @Input() stats: SideStat[] = [
    { value: '619+', label: 'Organizações' },
    { value: '9', label: 'Categorias' },
    { value: '3.4k+', label: 'Vagas' },
  ];
}
