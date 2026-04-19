import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiBadgeComponent, BadgeVariant } from './ui-badge.component';

describe('UiBadgeComponent', () => {
  let component: UiBadgeComponent;
  let fixture: ComponentFixture<UiBadgeComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UiBadgeComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the label text', () => {
    component.label = 'Entregue';
    fixture.detectChanges();
    expect(el.querySelector('.badge')?.textContent?.trim()).toBe('Entregue');
  });

  const variants: BadgeVariant[] = ['success', 'warning', 'danger', 'info', 'neutral', 'primary'];
  variants.forEach(variant => {
    it(`applies class badge--${variant} for variant "${variant}"`, () => {
      component.variant = variant;
      fixture.detectChanges();
      expect(el.querySelector(`.badge--${variant}`)).toBeTruthy();
    });
  });

  it('renders the dot element when [dot]="true"', () => {
    component.dot = true;
    fixture.detectChanges();
    expect(el.querySelector('.badge__dot')).toBeTruthy();
  });

  it('does not render the dot element when [dot]="false"', () => {
    component.dot = false;
    fixture.detectChanges();
    expect(el.querySelector('.badge__dot')).toBeNull();
  });

  it('applies custom inline color styles when variant is "custom"', () => {
    component.variant = 'custom';
    component.color = '#ff0000';
    fixture.detectChanges();
    const badge = el.querySelector<HTMLElement>('.badge--custom');
    expect(badge?.style.color).toBe('rgb(255, 0, 0)');
  });
});
