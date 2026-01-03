import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private currentThemeSubject: BehaviorSubject<Theme>;
  public currentTheme$: Observable<Theme>;

  constructor() {
    // Carrega o tema salvo ou usa 'dark' como padrão
    const savedTheme = this.getSavedTheme();
    this.currentThemeSubject = new BehaviorSubject<Theme>(savedTheme);
    this.currentTheme$ = this.currentThemeSubject.asObservable();

    // Aplica o tema inicial
    this.applyTheme(savedTheme);
  }

  /**
   * Obtém o tema atual
   */
  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  /**
   * Alterna entre tema claro e escuro
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentThemeSubject.value === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Define um tema específico
   */
  setTheme(theme: Theme): void {
    this.currentThemeSubject.next(theme);
    this.applyTheme(theme);
    this.saveTheme(theme);
  }

  /**
   * Verifica se o tema atual é escuro
   */
  isDarkTheme(): boolean {
    return this.currentThemeSubject.value === 'dark';
  }

  /**
   * Aplica o tema ao documento
   */
  private applyTheme(theme: Theme): void {
    const htmlElement = document.documentElement;

    if (theme === 'dark') {
      htmlElement.classList.add('dark-theme');
      htmlElement.classList.remove('light-theme');
    } else {
      htmlElement.classList.add('light-theme');
      htmlElement.classList.remove('dark-theme');
    }
  }

  /**
   * Salva o tema no localStorage
   */
  private saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch (error) {
      console.warn('Não foi possível salvar o tema:', error);
    }
  }

  /**
   * Obtém o tema salvo do localStorage
   */
  private getSavedTheme(): Theme {
    try {
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
    } catch (error) {
      console.warn('Não foi possível carregar o tema salvo:', error);
      return 'dark';
    }
  }
}
