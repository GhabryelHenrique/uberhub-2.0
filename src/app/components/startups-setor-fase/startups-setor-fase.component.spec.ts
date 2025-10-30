import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartupsSetorFaseComponent } from './startups-setor-fase.component';

describe('StartupsSetorFaseComponent', () => {
  let component: StartupsSetorFaseComponent;
  let fixture: ComponentFixture<StartupsSetorFaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartupsSetorFaseComponent]
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
