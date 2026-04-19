import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaInovacaoComponent } from './mapa-inovacao.component';
import { provideHttpClient } from '@angular/common/http';

describe('MapaInovacaoComponent', () => {
  let component: MapaInovacaoComponent;
  let fixture: ComponentFixture<MapaInovacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaInovacaoComponent],
      providers: [provideHttpClient()]

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
