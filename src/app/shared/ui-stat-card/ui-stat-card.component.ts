import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-stat-card.component.html',
  styleUrl: './ui-stat-card.component.scss'
})
export class UiStatCardComponent {
  @Input() icon = '';
  @Input() value: string | number = 0;
  @Input() suffix = '';
  @Input() label = '';
  @Input() color = 'var(--primary-light)';
  @Input() trend?: { value: number; positive: boolean };
}
