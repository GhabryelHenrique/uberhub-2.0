import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaInovacaoComponent } from './mapa-inovacao.component';

describe('MapaInovacaoComponent', () => {
  let component: MapaInovacaoComponent;
  let fixture: ComponentFixture<MapaInovacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaInovacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaInovacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
