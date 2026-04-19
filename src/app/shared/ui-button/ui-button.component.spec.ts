import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiButtonComponent } from './ui-button.component';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [UiButtonComponent],
  template: `<app-ui-button [variant]="variant" [size]="size" [loading]="loading" [disabled]="disabled" [fullWidth]="fullWidth">Salvar</app-ui-button>`
})
class HostComponent {
  variant: any = 'primary';
  size: any = 'md';
  loading = false;
  disabled = false;
  fullWidth = false;
}

describe('UiButtonComponent', () => {
  let hostFixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let btn: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();

    hostFixture = TestBed.createComponent(HostComponent);
    host = hostFixture.componentInstance;
    hostFixture.detectChanges();
    btn = hostFixture.nativeElement.querySelector('button');
  });

  it('should create', () => {
    expect(btn).toBeTruthy();
  });

  it('renders projected content (ng-content)', () => {
    expect(btn.textContent?.trim()).toBe('Salvar');
  });

  it('applies btn--primary class by default', () => {
    expect(btn.classList).toContain('btn--primary');
  });

  it('applies correct variant class', () => {
    host.variant = 'outline';
    hostFixture.detectChanges();
    expect(btn.classList).toContain('btn--outline');
  });

  it('applies correct size class', () => {
    host.size = 'lg';
    hostFixture.detectChanges();
    expect(btn.classList).toContain('btn--lg');
  });

  it('applies btn--full when [fullWidth]="true"', () => {
    host.fullWidth = true;
    hostFixture.detectChanges();
    expect(btn.classList).toContain('btn--full');
  });

  it('applies btn--loading class and shows spinner when [loading]="true"', () => {
    host.loading = true;
    hostFixture.detectChanges();
    expect(btn.classList).toContain('btn--loading');
    expect(hostFixture.nativeElement.querySelector('.btn__spinner')).toBeTruthy();
  });

  it('disables the button when [disabled]="true"', () => {
    host.disabled = true;
    hostFixture.detectChanges();
    expect(btn.disabled).toBeTrue();
  });

  it('disables the button when [loading]="true"', () => {
    host.loading = true;
    hostFixture.detectChanges();
    expect(btn.disabled).toBeTrue();
  });
});
