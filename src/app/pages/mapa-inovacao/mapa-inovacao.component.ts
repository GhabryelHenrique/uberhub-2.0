import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { StartupsService, Startup } from '../../services/startups.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mapa-inovacao',
  imports: [CommonModule, RouterModule, FormsModule, GoogleMapsModule],
  templateUrl: './mapa-inovacao.component.html',
  styleUrl: './mapa-inovacao.component.scss'
})
export class MapaInovacaoComponent implements OnInit {
  startups: Startup[] = [];
  filteredStartups: Startup[] = [];
  selectedSetor: string = '';
  selectedFase: string = '';
  setores: string[] = [];
  fases: string[] = [];

  // Google Maps configuration
  isGoogleMapsLoaded = false;
  center: google.maps.LatLngLiteral = { lat: -18.9186, lng: -48.2772 };
  zoom = 13;
  mapOptions: google.maps.MapOptions = {};

  markers: Array<{
    position: google.maps.LatLngLiteral;
    title: string;
    options: google.maps.MarkerOptions;
    startup: Startup;
  }> = [];

  selectedMarker: Startup | null = null;
  infoWindowPosition: google.maps.LatLngLiteral | null = null;

  // Mapeamento de cores por fase
  private faseColors: { [key: string]: string } = {
    'Ideação': '#FF6B6B',
    'Validação': '#4ECDC4',
    'Operação': '#45B7D1',
    'Tração': '#FFA07A',
    'Escala': '#98D8C8'
  };

  constructor(private startupsService: StartupsService) {}

  ngOnInit(): void {
    this.startupsService.getStartups().subscribe(startups => {
      // Filtrar startups com coordenadas válidas
      this.startups = startups.filter(s =>
        s.latitude &&
        s.longitude &&
        !isNaN(s.latitude) &&
        !isNaN(s.longitude) &&
        s.latitude !== 0 &&
        s.longitude !== 0
      );
      this.filteredStartups = this.startups;

      console.log('Total startups com coordenadas válidas:', this.startups.length);
      if (this.startups.length > 0) {
        console.log('Exemplo de startup:', {
          nome: this.startups[0].nome,
          lat: this.startups[0].latitude,
          lng: this.startups[0].longitude
        });
      }

      // Extrair setores e fases únicos
      const setoresSet = new Set<string>();
      const fasesSet = new Set<string>();

      this.startups.forEach(startup => {
        if (startup.segmento_copy || startup.setor_principal) {
          setoresSet.add(startup.segmento_copy || startup.setor_principal);
        }
        if (startup.fase_startup) {
          fasesSet.add(startup.fase_startup);
        }
      });

      this.setores = Array.from(setoresSet).sort();
      this.fases = Array.from(fasesSet).sort();

      // Wait for Google Maps to load before creating markers
      if (this.startups.length > 0) {
        this.waitForGoogleMaps();
      }
    });
  }

  private waitForGoogleMaps(): void {
    if (typeof google !== 'undefined' &&
        google.maps &&
        google.maps.MapTypeId &&
        google.maps.SymbolPath) {
      this.isGoogleMapsLoaded = true;
      this.configureMapOptions();
      this.updateMarkers();
      console.log('Google Maps carregado. Marcadores criados:', this.markers.length);
    } else {
      setTimeout(() => this.waitForGoogleMaps(), 100);
    }
  }

  private configureMapOptions(): void {
    this.mapOptions = {
      mapTypeId: 'roadmap',
      zoomControl: true,
      scrollwheel: true,
      disableDoubleClickZoom: false,
      maxZoom: 18,
      minZoom: 11,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    };
  }

  private updateMarkers(): void {
    if (!this.isGoogleMapsLoaded) {
      console.log('Google Maps ainda não carregado');
      return;
    }

    try {
      this.markers = this.filteredStartups.map(startup => {
        const color = this.faseColors[startup.fase_startup] || '#999999';

        return {
          position: {
            lat: startup.latitude!,
            lng: startup.longitude!
          },
          title: startup.nome,
          options: {
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: color,
              fillOpacity: 0.9,
              strokeColor: '#fff',
              strokeWeight: 2
            }
          },
          startup: startup
        };
      });

      console.log('Marcadores atualizados. Total:', this.markers.length);
      if (this.markers.length > 0) {
        console.log('Exemplo de marcador:', {
          position: this.markers[0].position,
          title: this.markers[0].title
        });
      }
    } catch (error) {
      console.error('Erro ao criar marcadores:', error);
    }
  }

  openInfoWindow(markerData: any): void {
    this.selectedMarker = markerData.startup;
    this.infoWindowPosition = markerData.position;
  }

  closeInfoWindow(): void {
    this.selectedMarker = null;
    this.infoWindowPosition = null;
  }

  applyFilters(): void {
    this.filteredStartups = this.startups.filter(startup => {
      const setorMatch = !this.selectedSetor ||
        startup.setor_principal === this.selectedSetor ||
        startup.segmento_copy === this.selectedSetor;

      const faseMatch = !this.selectedFase || startup.fase_startup === this.selectedFase;

      return setorMatch && faseMatch;
    });

    this.updateMarkers();
  }

  resetFilters(): void {
    this.selectedSetor = '';
    this.selectedFase = '';
    this.filteredStartups = this.startups;
    this.updateMarkers();
  }

  truncate(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
