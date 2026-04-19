import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiInputComponent } from './ui-input.component';

describe('UiInputComponent', () => {
  let component: UiInputComponent;
  let fixture: ComponentFixture<UiInputComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UiInputComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the label when provided', () => {
    component.label = 'Email';
    fixture.detectChanges();
    expect(el.querySelector('.field-label')?.textContent?.trim()).toBe('Email');
  });

  it('does not render a label element when label is empty', () => {
    component.label = '';
    fixture.detectChanges();
    expect(el.querySelector('.field-label')).toBeNull();
  });

  it('applies the placeholder to the native input', () => {
    component.placeholder = 'seu@email.com';
    fixture.detectChanges();
    expect(el.querySelector<HTMLInputElement>('input')?.placeholder).toBe('seu@email.com');
  });

  it('writeValue() updates the internal value', () => {
    component.writeValue('teste@email.com');
    expect(component.value).toBe('teste@email.com');
  });

  it('onInput() calls the registered onChange callback', () => {
    const changeSpy = jasmine.createSpy('onChange');
    component.registerOnChange(changeSpy);

    const input = el.querySelector<HTMLInputElement>('input')!;
    input.value = 'novo valor';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(changeSpy).toHaveBeenCalledWith('novo valor');
  });

  it('adds field-group--error class when [hasError]="true"', () => {
    component.hasError = true;
    fixture.detectChanges();
    expect(el.querySelector('.field-group--error')).toBeTruthy();
  });

  it('displays error message when [error] is set', () => {
    component.error = 'Campo obrigatório';
    fixture.detectChanges();
    expect(el.querySelector('.field-error')?.textContent?.trim()).toBe('Campo obrigatório');
  });

  describe('password toggle', () => {
    beforeEach(() => {
      component.type = 'password';
      component.showToggle = true;
      fixture.detectChanges();
    });

    it('starts with type="password"', () => {
      expect(el.querySelector<HTMLInputElement>('input')?.type).toBe('password');
    });

    it('toggles to type="text" after clicking the toggle button', () => {
      el.querySelector<HTMLButtonElement>('.toggle-pw')?.click();
      fixture.detectChanges();
      expect(el.querySelector<HTMLInputElement>('input')?.type).toBe('text');
    });

    it('toggles back to type="password" on second click', () => {
      const btn = el.querySelector<HTMLButtonElement>('.toggle-pw')!;
      btn.click();
      fixture.detectChanges();
      btn.click();
      fixture.detectChanges();
      expect(el.querySelector<HTMLInputElement>('input')?.type).toBe('password');
    });
  });
});
