import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PageHeaderComponent } from './page-header.component';

describe('PageHeaderComponent', () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the title in .page-title', () => {
    component.title = 'Dashboard';
    fixture.detectChanges();
    expect(el.querySelector('.page-title')?.textContent?.trim()).toBe('Dashboard');
  });

  it('renders subtitle when provided', () => {
    component.subtitle = 'Visão geral do ecossistema';
    fixture.detectChanges();
    expect(el.querySelector('.page-subtitle')?.textContent?.trim()).toBe('Visão geral do ecossistema');
  });

  it('does not render subtitle element when not provided', () => {
    component.subtitle = undefined;
    fixture.detectChanges();
    expect(el.querySelector('.page-subtitle')).toBeNull();
  });

  it('does not render breadcrumb nav when breadcrumbs is empty', () => {
    component.breadcrumbs = [];
    fixture.detectChanges();
    expect(el.querySelector('.breadcrumb')).toBeNull();
  });

  it('renders breadcrumb items when breadcrumbs are provided', () => {
    component.breadcrumbs = [{ label: 'Home', route: '/' }, { label: 'Dashboard' }];
    fixture.detectChanges();
    const items = el.querySelectorAll('.breadcrumb-item');
    expect(items.length).toBe(2);
  });

  it('renders an <a> for breadcrumb items with a route', () => {
    component.breadcrumbs = [{ label: 'Home', route: '/' }, { label: 'Dashboard' }];
    fixture.detectChanges();
    expect(el.querySelector('a.breadcrumb-item')).toBeTruthy();
  });

  it('renders a <span> for the last breadcrumb item (no route)', () => {
    component.breadcrumbs = [{ label: 'Home', route: '/' }, { label: 'Dashboard' }];
    fixture.detectChanges();
    expect(el.querySelector('span.breadcrumb-item--active')?.textContent?.trim()).toBe('Dashboard');
  });
});
