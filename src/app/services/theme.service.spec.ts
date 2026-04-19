import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let html: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    html = document.documentElement;
  });

  afterEach(() => {
    html.classList.remove('dark-theme', 'light-theme');
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('defaults to dark theme when localStorage is empty', () => {
    expect(service.getCurrentTheme()).toBe('dark');
  });

  it('loads saved theme from localStorage', () => {
    localStorage.setItem('app-theme', 'light');
    const fresh = new ThemeService();
    expect(fresh.getCurrentTheme()).toBe('light');
  });

  it('isDarkTheme() returns true when theme is dark', () => {
    service.setTheme('dark');
    expect(service.isDarkTheme()).toBeTrue();
  });

  it('isDarkTheme() returns false when theme is light', () => {
    service.setTheme('light');
    expect(service.isDarkTheme()).toBeFalse();
  });

  it('setTheme("light") applies light-theme class to <html>', () => {
    service.setTheme('light');
    expect(html.classList).toContain('light-theme');
    expect(html.classList).not.toContain('dark-theme');
  });

  it('setTheme("dark") applies dark-theme class to <html>', () => {
    service.setTheme('dark');
    expect(html.classList).toContain('dark-theme');
    expect(html.classList).not.toContain('light-theme');
  });

  it('setTheme() persists the value to localStorage', () => {
    service.setTheme('light');
    expect(localStorage.getItem('app-theme')).toBe('light');
  });

  it('toggleTheme() switches dark → light', () => {
    service.setTheme('dark');
    service.toggleTheme();
    expect(service.getCurrentTheme()).toBe('light');
  });

  it('toggleTheme() switches light → dark', () => {
    service.setTheme('light');
    service.toggleTheme();
    expect(service.getCurrentTheme()).toBe('dark');
  });

  it('currentTheme$ emits the new value after toggleTheme()', (done) => {
    service.setTheme('dark');
    service.currentTheme$.subscribe(theme => {
      if (theme === 'light') {
        expect(theme).toBe('light');
        done();
      }
    });
    service.toggleTheme();
  });
});
