import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { RouterModule } from '@angular/router';
import { GeminiRoutesService, RouteOptimizationCriteria, RouteResponse } from '../../services/gemini-routes.service';
import { Startup, StartupsService } from '../../services/startups.service';

@Component({
  selector: 'app-mapa-inovacao',
  imports: [CommonModule, RouterModule, FormsModule, GoogleMapsModule],
  templateUrl: './mapa-inovacao.component.html',
  styleUrl: './mapa-inovacao.component.scss'
})
export class MapaInovacaoComponent implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  @ViewChildren(MapMarker) markerComponents!: QueryList<MapMarker>;

  startups: Startup[] = [];
  filteredStartups: Startup[] = [];
  selectedSetores: string[] = [];
  selectedCategorias: string[] = [];
  setores: string[] = [];
  categorias: string[] = [];
  showSetorDropdown: boolean = false;
  showFaseDropdown: boolean = false;
  lastClickedMarkerIndex: number = -1;

  // Google Maps configuration
  isGoogleMapsLoaded = false;
  center: google.maps.LatLngLiteral = { lat: -18.9186, lng: -48.2772 };
  zoom = 13;
  mapOptions: google.maps.MapOptions = {};
  waitAttempts = 0;
  maxWaitAttempts = 50; // 5 segundos (50 * 100ms)

  markers: Array<{
    id: string;
    position: google.maps.LatLngLiteral;
    title: string;
    options: google.maps.MarkerOptions;
    startup: Startup;
  }> = [];

  selectedMarker: Startup | null = null;
  infoWindowPosition: google.maps.LatLngLiteral | null = null;

  // Mapeamento de cores por categoria
  getColorByCategory(categoria?: string, pinColor?: string): string {
    // Se tiver cor do pin definida, usar ela
    if (pinColor) return pinColor;

    // Cores padrão por categoria
    const categoryColors: { [key: string]: string } = {
      'Empresas de base tecnológica': '#4A90E2',
      'Startups': '#FF6B6B',
      'Coworkings, salas empresariais e espaços de inovação': '#FFA07A',
      'Polos de Tecnologia & ICT´s': '#9B59B6',
      'Aceleradoras, Incubadoras e ventures (VC, VB e outros)': '#E74C3C',
      'Entidades/iniciativas de representação e apoio': '#3498DB',
      'Academia/Instituições de ensino': '#2ECC71',
      'Programas de Capacitação / Formação de talentos': '#F39C12',
      'Corporates/Grandes empresas que relacionam com ecossistema': '#34495E'
    };

    return categoria ? (categoryColors[categoria] || '#999999') : '#999999';
  }

  // Rotas inteligentes
  showRoutesPanel: boolean = false;
  isGeneratingRoute: boolean = false;
  currentRoute: RouteResponse | null = null;
  routePriority: 'distance' | 'sector' | 'phase' | 'balanced' = 'balanced';
  maxStops: number = 5;
  directionsResult: google.maps.DirectionsResult | null = null;

  // Chat de prompts
  showChatMode: boolean = false;
  userPrompt: string = '';
  promptExamples: string[] = [
    'Quero visitar 4 startups no centro de Uberlândia',
    'Me mostre 5 startups de tecnologia',
    'Crie uma rota com startups em fase de operação',
    'Quero conhecer startups de educação e saúde'
  ];

  constructor(
    private startupsService: StartupsService,
    private geminiRoutesService: GeminiRoutesService
  ) {}

  ngOnInit(): void {
    console.log('🔵 [MapaInovacao] ngOnInit iniciado');
    console.log('🔵 [MapaInovacao] Verificando Google Maps API:', typeof google !== 'undefined');

    this.startupsService.getStartups().subscribe({
      next: (startups) => {
        console.log('🟢 [MapaInovacao] Startups recebidas:', startups.length);

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

        console.log('🟢 [MapaInovacao] Total startups com coordenadas válidas:', this.startups.length);
        if (this.startups.length > 0) {
          console.log('🟢 [MapaInovacao] Exemplo de startup:', {
            nome: this.startups[0].nome,
            lat: this.startups[0].latitude,
            lng: this.startups[0].longitude
          });
        } else {
          console.warn('⚠️ [MapaInovacao] Nenhuma startup com coordenadas válidas encontrada!');
        }

        // Extrair setores e categorias únicos
        const setoresSet = new Set<string>();
        const categoriasSet = new Set<string>();

        this.startups.forEach(startup => {
          if (startup.segmento_copy || startup.setor_principal) {
            setoresSet.add(startup.segmento_copy || startup.setor_principal || 'Outros');
          }

          // Adicionar categorias do ecossistema
          if (startup.categoria) {
            categoriasSet.add(startup.categoria);
          }
        });

        this.setores = Array.from(setoresSet).sort();
        this.categorias = Array.from(categoriasSet).sort();

        console.log('🟢 [MapaInovacao] Setores únicos:', this.setores.length);
        console.log('🟢 [MapaInovacao] Categorias únicas:', this.categorias.length);

        // Wait for Google Maps to load before creating markers
        if (this.startups.length > 0) {
          console.log('🔵 [MapaInovacao] Iniciando espera pelo Google Maps...');
          this.waitForGoogleMaps();
        } else {
          console.error('🔴 [MapaInovacao] Não há startups para exibir no mapa');
        }
      },
      error: (error) => {
        console.error('🔴 [MapaInovacao] Erro ao carregar startups:', error);
      }
    });
  }

  private waitForGoogleMaps(): void {
    this.waitAttempts++;
    console.log(`🔍 [MapaInovacao] waitForGoogleMaps - Tentativa ${this.waitAttempts}/${this.maxWaitAttempts}`);
    console.log('🔍 [MapaInovacao] typeof google:', typeof google);

    if (typeof google !== 'undefined') {
      console.log('🔍 [MapaInovacao] google existe');
      console.log('🔍 [MapaInovacao] google.maps:', !!google.maps);
      if (google.maps) {
        console.log('🔍 [MapaInovacao] google.maps.MapTypeId:', !!google.maps.MapTypeId);
        console.log('🔍 [MapaInovacao] google.maps.SymbolPath:', !!google.maps.SymbolPath);
      }
    }

    if (typeof google !== 'undefined' &&
        google.maps &&
        google.maps.MapTypeId &&
        google.maps.SymbolPath) {
      console.log('✅ [MapaInovacao] Google Maps totalmente carregado!');
      this.isGoogleMapsLoaded = true;
      console.log('✅ [MapaInovacao] isGoogleMapsLoaded definido como true');
      this.configureMapOptions();
      this.updateMarkers();
      console.log('✅ [MapaInovacao] Marcadores criados:', this.markers.length);
    } else {
      if (this.waitAttempts >= this.maxWaitAttempts) {
        console.error('🔴 [MapaInovacao] Timeout: Google Maps não foi carregado após 5 segundos');
        console.error('🔴 [MapaInovacao] Verifique se a API Key está correta e se o script foi carregado no index.html');
        return;
      }
      console.log(`⏳ [MapaInovacao] Google Maps ainda não está pronto. Tentando novamente em 100ms... (${this.waitAttempts}/${this.maxWaitAttempts})`);
      setTimeout(() => this.waitForGoogleMaps(), 100);
    }
  }

  private configureMapOptions(): void {
    console.log('⚙️ [MapaInovacao] Configurando opções do mapa...');
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
    console.log('⚙️ [MapaInovacao] Opções do mapa configuradas:', this.mapOptions);
  }

  private updateMarkers(): void {
    console.log('📍 [MapaInovacao] updateMarkers iniciado');
    console.log('📍 [MapaInovacao] isGoogleMapsLoaded:', this.isGoogleMapsLoaded);
    console.log('📍 [MapaInovacao] filteredStartups.length:', this.filteredStartups.length);

    if (!this.isGoogleMapsLoaded) {
      console.error('🔴 [MapaInovacao] Google Maps ainda não carregado - abortando updateMarkers');
      return;
    }

    try {
      console.log('📍 [MapaInovacao] Criando marcadores...');
      this.markers = this.filteredStartups.map((startup, index) => {
        const color = this.getColorByCategory(startup.categoria, startup.pin_color);
        // Criar ID único baseado no índice, nome e coordenadas
        const uniqueId = `${index}-${startup.nome.replace(/\s+/g, '-')}-${startup.latitude}-${startup.longitude}`;

        if (index < 3) {
          console.log(`📍 [MapaInovacao] Criando marcador ${index + 1}:`, {
            id: uniqueId,
            nome: startup.nome,
            lat: startup.latitude,
            lng: startup.longitude,
            categoria: startup.categoria,
            color: color
          });
        }

        return {
          id: uniqueId,
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

      console.log('✅ [MapaInovacao] Marcadores criados com sucesso!');
      console.log('✅ [MapaInovacao] Total de marcadores:', this.markers.length);
      if (this.markers.length > 0) {
        console.log('✅ [MapaInovacao] Primeiro marcador:', {
          position: this.markers[0].position,
          title: this.markers[0].title
        });
      }
    } catch (error) {
      console.error('🔴 [MapaInovacao] Erro ao criar marcadores:', error);
    }
  }

  openInfoWindow(index: number): void {
    const markerData = this.markers[index];

    console.log('🖱️ [MapaInovacao] Marcador clicado!', {
      index: index,
      startup: markerData.startup.nome,
      position: markerData.position
    });

    this.selectedMarker = markerData.startup;
    this.infoWindowPosition = markerData.position;
    this.lastClickedMarkerIndex = index;

    // Aguarda o próximo ciclo de detecção de mudanças para garantir que o InfoWindow existe
    setTimeout(() => {
      const markerComponent = this.markerComponents?.toArray()[index];

      if (this.infoWindow && markerComponent) {
        this.infoWindow.open(markerComponent);
        console.log('✅ [MapaInovacao] InfoWindow aberta para:', this.selectedMarker?.nome);
      } else {
        console.warn('⚠️ [MapaInovacao] InfoWindow ou Marker não encontrado', {
          infoWindow: !!this.infoWindow,
          markerComponent: !!markerComponent,
          totalMarkers: this.markerComponents?.length || 0
        });
      }
    }, 0);
  }

  closeInfoWindow(): void {
    console.log('❌ [MapaInovacao] Fechando InfoWindow');
    if (this.infoWindow) {
      this.infoWindow.close();
    }
    this.selectedMarker = null;
    this.infoWindowPosition = null;
  }

  toggleSetor(setor: string): void {
    const index = this.selectedSetores.indexOf(setor);
    if (index > -1) {
      this.selectedSetores.splice(index, 1);
    } else {
      this.selectedSetores.push(setor);
    }
    this.applyFilters();
  }

  toggleCategoria(categoria: string): void {
    const index = this.selectedCategorias.indexOf(categoria);
    if (index > -1) {
      this.selectedCategorias.splice(index, 1);
    } else {
      this.selectedCategorias.push(categoria);
    }
    this.applyFilters();
  }

  isSetorSelected(setor: string): boolean {
    return this.selectedSetores.includes(setor);
  }

  isCategoriaSelected(categoria: string): boolean {
    return this.selectedCategorias.includes(categoria);
  }

  applyFilters(): void {
    this.filteredStartups = this.startups.filter(startup => {
      const setorMatch = this.selectedSetores.length === 0 ||
        this.selectedSetores.includes(startup.setor_principal || '') ||
        this.selectedSetores.includes(startup.segmento_copy || '');

      // Filtrar por categoria do ecossistema
      const categoriaMatch = this.selectedCategorias.length === 0 ||
        this.selectedCategorias.includes(startup.categoria || '');

      return setorMatch && categoriaMatch;
    });

    this.updateMarkers();
  }

  resetFilters(): void {
    this.selectedSetores = [];
    this.selectedCategorias = [];
    this.filteredStartups = this.startups;
    this.updateMarkers();
  }

  toggleSetorDropdown(): void {
    this.showSetorDropdown = !this.showSetorDropdown;
    if (this.showSetorDropdown) {
      this.showFaseDropdown = false;
    }
  }

  toggleCategoriaDropdown(): void {
    this.showFaseDropdown = !this.showFaseDropdown;
    if (this.showFaseDropdown) {
      this.showSetorDropdown = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.multi-select-wrapper');

    if (!clickedInside) {
      this.showSetorDropdown = false;
      this.showFaseDropdown = false;
    }
  }

  getCategoriaColor(categoria: string): string {
    return this.getColorByCategory(categoria);
  }

  getCategoriaEmoji(categoria: string): string {
    // Encontrar o emoji da categoria
    const startup = this.startups.find(s => s.categoria === categoria);
    return startup?.categoria_emoji || '';
  }

  truncate(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // ============ MÉTODOS DE ROTAS INTELIGENTES ============

  toggleRoutesPanel(): void {
    this.showRoutesPanel = !this.showRoutesPanel;
    if (!this.showRoutesPanel) {
      this.clearRoute();
    }
  }

  async generateIntelligentRoute(): Promise<void> {
    if (this.isGeneratingRoute) return;

    this.isGeneratingRoute = true;
    console.log('🤖 [MapaInovacao] Gerando rota inteligente...');

    try {
      const criteria: RouteOptimizationCriteria = {
        priority: this.routePriority,
        maxStops: this.maxStops,
        sectors: this.selectedSetores.length > 0 ? this.selectedSetores : undefined,
        phases: this.selectedCategorias.length > 0 ? this.selectedCategorias : undefined
      };

      this.geminiRoutesService.generateOptimizedRoute(this.filteredStartups, criteria)
        .subscribe({
          next: async (route) => {
            console.log('✅ [MapaInovacao] Rota gerada:', route);
            this.currentRoute = route;

            // Mapear os IDs das startups para os objetos completos
            this.currentRoute.route = route.route.map(rp => ({
              ...rp,
              startup: this.filteredStartups[(rp as any).startupId]
            }));

            // Gerar direções no Google Maps
            await this.displayRouteOnMap();

            this.isGeneratingRoute = false;
          },
          error: (error) => {
            console.error('❌ [MapaInovacao] Erro ao gerar rota:', error);
            alert('Erro ao gerar rota. Por favor, tente novamente.');
            this.isGeneratingRoute = false;
          }
        });
    } catch (error) {
      console.error('❌ [MapaInovacao] Erro:', error);
      this.isGeneratingRoute = false;
    }
  }

  async displayRouteOnMap(): Promise<void> {
    if (!this.currentRoute || this.currentRoute.route.length < 2) {
      console.warn('⚠️ [MapaInovacao] Rota inválida para exibir');
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    const waypoints: google.maps.DirectionsWaypoint[] = [];

    // Primeira startup é a origem
    const origin = this.currentRoute.route[0].startup;
    // Última startup é o destino
    const destination = this.currentRoute.route[this.currentRoute.route.length - 1].startup;

    // Startups do meio são waypoints
    for (let i = 1; i < this.currentRoute.route.length - 1; i++) {
      const startup = this.currentRoute.route[i].startup;
      waypoints.push({
        location: { lat: startup.latitude!, lng: startup.longitude! },
        stopover: true
      });
    }

    try {
      const result = await directionsService.route({
        origin: { lat: origin.latitude!, lng: origin.longitude! },
        destination: { lat: destination.latitude!, lng: destination.longitude! },
        waypoints: waypoints,
        optimizeWaypoints: false, // Já otimizamos com IA
        travelMode: google.maps.TravelMode.DRIVING
      });

      this.directionsResult = result;
      console.log('✅ [MapaInovacao] Rota exibida no mapa');
    } catch (error) {
      console.error('❌ [MapaInovacao] Erro ao calcular direções:', error);
    }
  }

  clearRoute(): void {
    this.currentRoute = null;
    this.directionsResult = null;
    console.log('🗑️ [MapaInovacao] Rota limpa');
  }

  getRouteStartups(): Startup[] {
    if (!this.currentRoute) return [];
    return this.currentRoute.route.map(rp => rp.startup);
  }

  // Métodos do Chat
  toggleChatMode(): void {
    this.showChatMode = !this.showChatMode;
    if (this.showChatMode) {
      this.showRoutesPanel = true;
    }
  }

  selectPromptExample(example: string): void {
    this.userPrompt = example;
  }

  async generateRouteFromChat(): Promise<void> {
    if (!this.userPrompt.trim()) {
      return;
    }

    this.isGeneratingRoute = true;

    try {
      console.log('💬 [MapaInovacao] Gerando rota a partir do chat:', this.userPrompt);

      const routeResponse = await this.geminiRoutesService.generateRouteFromPrompt(
        this.userPrompt,
        this.filteredStartups
      );

      // Mapeia os IDs das startups para os objetos completos
      this.currentRoute = {
        ...routeResponse,
        route: routeResponse.route.map(point => ({
          ...point,
          startup: this.filteredStartups[point.startupId]
        }))
      };

      console.log('✅ [MapaInovacao] Rota gerada do chat:', this.currentRoute);

      // Exibe a rota no mapa
      await this.displayRouteOnMap();

      // Limpa o prompt e desativa o modo chat
      this.userPrompt = '';
      this.showChatMode = false;

    } catch (error) {
      console.error('❌ [MapaInovacao] Erro ao gerar rota do chat:', error);
      alert('Erro ao gerar rota. Por favor, tente novamente.');
    } finally {
      this.isGeneratingRoute = false;
    }
  }
}
