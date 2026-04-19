import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { SidebarService } from './services/sidebar.service';
import { BehaviorSubject } from 'rxjs';

describe('AppComponent', () => {
  const collapsedSubject = new BehaviorSubject<boolean>(false);
  const sidebarServiceStub = { isCollapsed$: collapsedSubject.asObservable() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: SidebarService, useValue: sidebarServiceStub }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('checkLayoutVisibility()', () => {
    let app: AppComponent;

    beforeEach(() => {
      const fixture = TestBed.createComponent(AppComponent);
      app = fixture.componentInstance;
    });

    it('hides layout for /login', () => {
      (app as any).checkLayoutVisibility('/login');
      expect(app.showLayout).toBeFalse();
    });

    it('hides layout for /register', () => {
      (app as any).checkLayoutVisibility('/register');
      expect(app.showLayout).toBeFalse();
    });

    it('hides layout for / (landing)', () => {
      (app as any).checkLayoutVisibility('/');
      expect(app.showLayout).toBeFalse();
    });

    it('shows layout for /dashboard', () => {
      (app as any).checkLayoutVisibility('/dashboard');
      expect(app.showLayout).toBeTrue();
    });

    it('shows layout for /startups', () => {
      (app as any).checkLayoutVisibility('/startups');
      expect(app.showLayout).toBeTrue();
    });

    it('shows layout for /vagas', () => {
      (app as any).checkLayoutVisibility('/vagas');
      expect(app.showLayout).toBeTrue();
    });
  });

  it('updates sidebarCollapsed when SidebarService emits', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    collapsedSubject.next(true);
    expect(fixture.componentInstance.sidebarCollapsed).toBeTrue();
  });
});
