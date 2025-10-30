import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-mapa-inovacao',
  imports: [CommonModule, RouterModule],
  templateUrl: './mapa-inovacao.component.html',
  styleUrl: './mapa-inovacao.component.scss'
})
export class MapaInovacaoComponent {
  mapUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    // URL do Google Maps embarcado do Uberhub
    const url = 'https://www.google.com/maps/d/embed?mid=1YKKSZiDIIUZdrQfCveCh7qTKDUKpxsM&hl=pt-BR&ehbc=2E312F';
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
