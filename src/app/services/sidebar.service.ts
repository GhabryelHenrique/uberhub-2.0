import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private readonly SIDEBAR_STATE_KEY = 'uber4hub_sidebar_collapsed';
  private isCollapsedSubject = new BehaviorSubject<boolean>(this.loadState());
  public isCollapsed$ = this.isCollapsedSubject.asObservable();

  constructor() { }

  private loadState(): boolean {
    const savedState = localStorage.getItem(this.SIDEBAR_STATE_KEY);
    return savedState === 'true';
  }

  toggle(): void {
    const newState = !this.isCollapsedSubject.value;
    this.isCollapsedSubject.next(newState);
    localStorage.setItem(this.SIDEBAR_STATE_KEY, newState.toString());
  }

  getState(): boolean {
    return this.isCollapsedSubject.value;
  }
}
