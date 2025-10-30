import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcossistemaTreemapComponent } from './ecossistema-treemap.component';

describe('EcossistemaTreemapComponent', () => {
  let component: EcossistemaTreemapComponent;
  let fixture: ComponentFixture<EcossistemaTreemapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcossistemaTreemapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcossistemaTreemapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
