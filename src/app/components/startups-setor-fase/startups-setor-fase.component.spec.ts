import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartupsSetorFaseComponent } from './startups-setor-fase.component';
import { provideHttpClient } from '@angular/common/http';

describe('StartupsSetorFaseComponent', () => {
  let component: StartupsSetorFaseComponent;
  let fixture: ComponentFixture<StartupsSetorFaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartupsSetorFaseComponent],
      providers: [provideHttpClient()]

    })
    .compileComponents();

    fixture = TestBed.createComponent(StartupsSetorFaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
