import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { Subject, takeUntil } from 'rxjs';

interface Particle {
  left: string;
  top: string;
  size: string;
  delay: string;
  duration: string;
  opacity: string;
}

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  icon: string;
  current: number;
  animated: boolean;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  navScrolled = false;
  menuOpen = false;
  isDarkTheme = true;

  particles: Particle[] = [];

  stats: StatItem[] = [
    {
      value: 619,
      suffix: '+',
      label: 'Empresas de Tecnologia',
      icon: 'business',
      current: 0,
      animated: false,
    },
    {
      value: 250,
      suffix: '+',
      label: 'Startups mapeadas',
      icon: 'rocket_launch',
      current: 0,
      animated: false,
    },
    {
      value: 70000,
      suffix: '+',
      label: 'Talentos no ensino superior',
      icon: 'school',
      current: 0,
      animated: false,
    },
    {
      value: 4,
      suffix: 'B+',
      label: 'Em exits e aportes (R$)',
      icon: 'trending_up',
      current: 0,
      animated: false,
    },
  ];

  personas = [
    {
      icon: 'rocket_launch',
      title: 'Startups',
      color: '#8540f5',
      items: [
        'Mentorias',
        'Networking',
        'Inovação aberta',
        'Programas de aceleração',
        'Conexão com o ecossistema',
      ],
    },
    {
      icon: 'attach_money',
      title: 'Investidores',
      color: '#10b981',
      items: [
        'Demodays',
        'Conexão com startups',
        'Visibilidade no ecossistema',
        'Conexão com investidores',
        'Conexão com o ecossistema',
      ],
    },
    {
      icon: 'corporate_fare',
      title: 'Corporates',
      color: '#3b82f6',
      items: [
        'Conexão com startups',
        'Apoio em inovação aberta',
        'Atração de talentos',
        'Visibilidade no ecossistema',
        'Acesso à soluções inovadoras',
      ],
    },
    {
      icon: 'groups',
      title: 'Talentos',
      color: '#f59e0b',
      items: [
        'Networking',
        'Acesso a todas as Vagas',
        'Eventos do ecossistema',
        'Cursos e capacitações',
        'E muito mais…',
      ],
    },
  ];

  categories = [
    { emoji: '🚀', name: 'Startups', count: 89 },
    { emoji: '💻', name: 'Empresas de Base Tecnológica', count: 212 },
    { emoji: '🏢', name: 'Coworkings & Espaços', count: 28 },
    { emoji: '🏛️', name: 'Polos de Tecnologia', count: 15 },
    { emoji: '🌱', name: 'Aceleradoras & Incubadoras', count: 18 },
    { emoji: '🤝', name: 'Entidades de Apoio', count: 31 },
    { emoji: '🎓', name: 'Academia & Educação', count: 42 },
    { emoji: '📚', name: 'Programas de Capacitação', count: 37 },
    { emoji: '⚡', name: 'Outros', count: 147 },
  ];

  cityStats = [
    {
      icon: '🏆',
      text: '1º do Brasil — ranking cidades com serviços inteligentes',
    },
    {
      icon: '🌿',
      text: '1º de Minas Gerais em saneamento básico e 3º do Brasil',
    },
    {
      icon: '🌾',
      text: '1º de MG, 4º do interior e 7º do Brasil em startups do agro',
    },
    {
      icon: '🏡',
      text: '1º de MG "melhores cidades para se morar" e 10º do Brasil',
    },
    { icon: '🌆', text: '2ª maior cidade do estado de Minas Gerais' },
    { icon: '🚀', text: '3º melhor comunidade de startups do Brasil em 2019' },
    { icon: '💡', text: '11º melhor ecossistema de inovação do Brasil' },
    {
      icon: '💰',
      text: '+R$4 bilhões em exits, aportes e aquisições de inovação',
    },
    {
      icon: '🚛',
      text: '"Capital nacional da logística" — maiores atacadistas do país',
    },
    {
      icon: '🎓',
      text: 'Polo universitário com +70 mil talentos no ensino superior',
    },
    {
      icon: '🌱',
      text: 'Agro forte com as principais empresas do setor na cidade',
    },
  ];

  memberAvatarColors = [
    '#6610f2',
    '#8540f5',
    '#10b981',
    '#3b82f6',
    '#f59e0b',
    '#ef4444',
    '#ec4899',
    '#14b8a6',
    '#8b5cf6',
    '#f97316',
    '#06b6d4',
    '#84cc16',
    '#a855f7',
    '#22c55e',
    '#fb923c',
  ];

  communities = [
    {
      name: 'UberHub Mulher',
      logo: 'assets/images/grupos/uberhub_Mulher.png',
      color: '#e91e8c',
      desc: 'Apoiar, inspirar e capacitar mulheres para promover inovação, empreendedorismo e tecnologia em Uberlândia.',
      link: 'http://bit.ly/uberhubmulher',
      featured: true,
    },
    {
      name: 'UberHub RH Tech',
      logo: null,
      color: '#3b82f6',
      desc: 'Principal referência para profissionais de RH e empreendedores — como encontrar, manter e desenvolver talentos em empresas de inovação.',
      link: null,
      featured: true,
    },
    {
      name: 'UberDev AI',
      logo: 'assets/images/grupos/uberhub_ia.jpg',
      color: '#8b5cf6',
      desc: 'Comunidade focada em Inteligência Artificial, LLMs e o futuro da tecnologia em Uberlândia.',
      link: 'https://chat.whatsapp.com/Ie5DlYkKoHC9JxmHczTSpT',
      featured: true,
    },
    {
      name: 'UberHub Startups',
      logo: 'assets/images/grupos/uberhub_startups.png',
      color: '#f59e0b',
      desc: 'Comunidade de líderes de startups para conectar, compartilhar e colaborar — Give First, Give Back.',
      link: null,
      featured: true,
    },
    {
      name: 'UberLAN',
      logo: 'assets/images/grupos/uberlan.jpg',
      color: '#06b6d4',
      desc: 'Comunidade de profissionais e entusiastas de redes de computadores, infraestrutura e conectividade — conectando quem mantém a tecnologia de Uberlândia funcionando.',
      link: null,
      featured: true,
    },
    {
      name: 'GDG Uberlândia',
      logo: 'assets/images/grupos/gdg.jpg',
      color: '#4285f4',
      desc: 'Google Developers Group — reunindo pessoas de mobile, front-end, backend, cloud, DevOps e muito mais.',
      link: 'https://chat.whatsapp.com/EaAqya1pTds2h7eqYT5V9R',
      featured: true,
    },
    {
      name: 'NASA Space Apps',
      logo: 'assets/images/grupos/nasa-spaceapps-logo.png',
      color: '#e03c31',
      desc: 'Hackathon global da NASA realizado em Uberlândia para resolver desafios reais do espaço e da Terra.',
      link: 'https://chat.whatsapp.com/Du87AQH2INh2vwCGcTjCBA',
      featured: true,
    },

    {
      name: 'AWS UG Mineiro',
      logo: 'assets/images/grupos/aws_user_group.jpg',
      color: '#ff9900',
      desc: 'AWS User Groups são grupos liderados pela comunidade em que builders se reúnem para discutir as novidades da Nuvem AWS',
      link: 'https://chat.whatsapp.com/Ie5DlYkKoHC9JxmHczTSpT',
      featured: true,
    },
    {
      name: 'WTM Uberlândia',
      logo: 'assets/images/grupos/wtm.png',
      color: '#ea4335',
      desc: 'Women Techmakers é um ecossistema de profissionais engajadas que defendem maior diversidade de gênero na área de tecnologia em todo o mundo, por meio de comunidade, visibilidade e recursos.',
      link: null,
      featured: true,
    },
    {
      name: 'Startups de Saúde MG',
      logo: null,
      color: '#10b981',
      desc: 'Saúde & Inovação',
      link: null,
      featured: false,
    },
    {
      name: 'Ads Performers Udi',
      logo: null,
      color: '#f97316',
      desc: 'Marketing & Performance',
      link: null,
      featured: false,
    },
  ];

  steps = [
    {
      num: '01',
      icon: 'my_location',
      title: 'Mapeie',
      desc: 'Explore todas as organizações do ecossistema num mapa interativo com filtros por categoria.',
    },
    {
      num: '02',
      icon: 'query_stats',
      title: 'Analise',
      desc: 'Dashboards com dados em tempo real sobre setores, fases e distribuição do ecossistema.',
    },
    {
      num: '03',
      icon: 'hub',
      title: 'Conecte',
      desc: 'Encontre vagas, eventos e use rotas com IA para visitar o ecossistema de Uberlândia.',
    },
  ];

  @ViewChild('heroVideo') heroVideoRef!: ElementRef<HTMLVideoElement>;

  private observers: IntersectionObserver[] = [];
  private intervals: ReturnType<typeof setInterval>[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private el: ElementRef,
    private themeService: ThemeService,
  ) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  ngOnInit(): void {
    this.generateParticles();
    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme) => {
        this.isDarkTheme = theme === 'dark';
      });
  }

  ngAfterViewInit(): void {
    this.setupScrollAnimations();
    this.setupCounterObserver();
    this.ensureVideoPlays();
  }

  private ensureVideoPlays(): void {
    const video = this.heroVideoRef?.nativeElement;
    if (!video) return;

    const tryPlay = () => {
      video.muted = true;
      video.play().catch(() => {
        // Se bloqueado, tenta novamente após interação do usuário
        const resume = () => {
          video.play().catch(() => {});
          document.removeEventListener('click', resume);
        };
        document.addEventListener('click', resume, { once: true });
      });
    };

    if (video.readyState >= 3) {
      tryPlay();
    } else {
      video.addEventListener('canplay', tryPlay, { once: true });
    }

    // Retoma ao voltar para a aba
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) video.play().catch(() => {});
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.navScrolled = window.scrollY > 80;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  scrollTo(id: string): void {
    this.closeMenu();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  private generateParticles(): void {
    for (let i = 0; i < 45; i++) {
      this.particles.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${Math.random() * 3 + 1}px`,
        delay: `${Math.random() * 10}s`,
        duration: `${Math.random() * 8 + 5}s`,
        opacity: `${Math.random() * 0.35 + 0.05}`,
      });
    }
  }

  private setupScrollAnimations(): void {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        }),
      { threshold: 0.08 },
    );
    this.el.nativeElement
      .querySelectorAll('.animate-on-scroll')
      .forEach((el: Element) => observer.observe(el));
    this.observers.push(observer);
  }

  private setupCounterObserver(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(
              (entry.target as HTMLElement).dataset['statIndex'] ?? '0',
            );
            this.animateCounter(idx);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    this.el.nativeElement
      .querySelectorAll('[data-stat-index]')
      .forEach((el: Element) => observer.observe(el));
    this.observers.push(observer);
  }

  private animateCounter(index: number): void {
    const stat = this.stats[index];
    if (stat.animated) return;
    stat.animated = true;
    const steps = 60;
    const increment = stat.value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= stat.value) {
        stat.current = stat.value;
        clearInterval(interval);
      } else {
        stat.current = Math.floor(current);
      }
    }, 1500 / steps);
    this.intervals.push(interval);
  }

  ngOnDestroy(): void {
    this.observers.forEach((o) => o.disconnect());
    this.intervals.forEach((i) => clearInterval(i));
    this.destroy$.next();
    this.destroy$.complete();
  }
}
